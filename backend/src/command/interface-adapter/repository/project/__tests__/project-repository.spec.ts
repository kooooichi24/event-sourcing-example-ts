import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { faker } from "@faker-js/faker";
import { type EventStore, EventStoreFactory } from "event-store-adapter-js";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { AccountId } from "../../../../domain/account/account-id";
import {
	type ProjectEvent,
	convertJSONToProjectEvent,
} from "../../../../domain/project/events/project-events";
import { Member } from "../../../../domain/project/member";
import { MemberId } from "../../../../domain/project/member-id";
import {
	Project,
	convertJSONToProject,
} from "../../../../domain/project/project";
import type { ProjectId } from "../../../../domain/project/project-id";
import { ProjectName } from "../../../../domain/project/project-name";
import { ProjectRepository } from "../project-repository";

describe("ProjectRepository", () => {
	const JOURNAL_TABLE_NAME = "journal";
	const SNAPSHOT_TABLE_NAME = "snapshot";
	const JOURNAL_AID_INDEX_NAME = "journal-aid-index";
	const SNAPSHOTS_AID_INDEX_NAME = "snapshots-aid-index";

	const dynamodbClient = new DynamoDBClient({
		region: "ap-northeast-1",
		endpoint: "http://127.0.0.1:18000",
		credentials: {
			accessKeyId: "dummy",
			secretAccessKey: "dummy",
		},
	});
	const eventStore: EventStore<ProjectId, Project, ProjectEvent> =
		EventStoreFactory.ofDynamoDB<ProjectId, Project, ProjectEvent>(
			dynamodbClient,
			JOURNAL_TABLE_NAME,
			SNAPSHOT_TABLE_NAME,
			JOURNAL_AID_INDEX_NAME,
			SNAPSHOTS_AID_INDEX_NAME,
			32,
			convertJSONToProjectEvent,
			convertJSONToProject,
		);

	describe("store", () => {
		it("happy path", async () => {
			// Arrange
			const target = ProjectRepository.of(eventStore);

			const accountId = AccountId.of(faker.string.uuid());
			const name = ProjectName.of(faker.lorem.word());
			const [project, projectCreated] = Project.create(accountId, name);
			await target.store(projectCreated, project)();

			// Act
			const otherMember = Member.of({
				id: MemberId.generate(),
				accountId: AccountId.of(faker.string.uuid()),
				memberRole: "Normal",
			});
			const addedMemberEither = project.addMember(otherMember);
			if (E.isLeft(addedMemberEither))
				throw new Error(addedMemberEither.left.message);
			const [updatedProject, projectMemberAdded] = addedMemberEither.right;
			await target.store(projectMemberAdded, updatedProject)();

			// Assert
			const actualEither = await target.findById(project.id)();
			if (E.isLeft(actualEither)) throw new Error(actualEither.left.message);
			const actualOption = actualEither.right;
			if (O.isNone(actualOption)) throw new Error("Project not found");
			const actual = actualOption.value;
			expect(actual).toStrictEqual(updatedProject.updateVersion((v) => v + 1));
		});
	});

	describe.skip("findById", () => {});
});
