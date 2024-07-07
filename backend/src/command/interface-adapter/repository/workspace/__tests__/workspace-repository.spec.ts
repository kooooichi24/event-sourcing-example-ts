import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { faker } from "@faker-js/faker";
import { type EventStore, EventStoreFactory } from "event-store-adapter-js";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import {
	Workspace,
	convertJSONToWorkspace,
} from "../../../../domain/workspace/workspace";
import {
	type WorkspaceEvent,
	convertJSONToWorkspaceEvent,
} from "../../../../domain/workspace/workspace-events";
import { WorkspaceId } from "../../../../domain/workspace/workspace-id";
import { WorkspaceName } from "../../../../domain/workspace/workspace-name";
import { WorkspaceRepository } from "../workspace-repository";

describe("WorkspaceRepository", () => {
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
	const eventStore: EventStore<WorkspaceId, Workspace, WorkspaceEvent> =
		EventStoreFactory.ofDynamoDB<WorkspaceId, Workspace, WorkspaceEvent>(
			dynamodbClient,
			JOURNAL_TABLE_NAME,
			SNAPSHOT_TABLE_NAME,
			JOURNAL_AID_INDEX_NAME,
			SNAPSHOTS_AID_INDEX_NAME,
			32,
			convertJSONToWorkspaceEvent,
			convertJSONToWorkspace,
		);

	describe("store", () => {
		it("happy path", async () => {
			// Arrange
			const id = WorkspaceId.generate();
			const name = WorkspaceName.of(faker.internet.domainWord());
			const [workspace, workspaceCreated] = Workspace.create(id, name);

			// Act
			const target = WorkspaceRepository.of(eventStore);
			await target.store(workspaceCreated, workspace)();

			// Assert
			const actualEither = await target.findById(workspace.id)();
			if (E.isLeft(actualEither)) throw new Error(actualEither.left.message);
			const actualOption = actualEither.right;
			if (O.isNone(actualOption)) throw new Error("Workspace not found");
			const actual = actualOption.value;
			expect(actual).toStrictEqual(workspace);
		});
	});

	describe.skip("findById", () => {});
});
