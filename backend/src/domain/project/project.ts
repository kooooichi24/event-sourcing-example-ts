import type { Aggregate } from "event-store-adapter-js";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import type { AccountId } from "../account/account-id";
import {
	ProjectCreated,
	ProjectCreatedTypeSymbol,
	type ProjectEvent,
	ProjectMemberAdded,
	ProjectMemberAddedTypeSymbol,
	ProjectMemberRemoved,
	ProjectMemberRemovedTypeSymbol,
	ProjectSprintAdded,
	ProjectSprintAddedTypeSymbol,
} from "./events/project-events";
import type { Member } from "./member";
import { Members } from "./members";
import { ProjectId } from "./project-id";
import type { ProjectName } from "./project-name";
import type { Sprint } from "./sprint";
import { Sprints } from "./sprints";

export const ProjectTypeSymbol = Symbol("Project");

interface ProjectParams {
	id: ProjectId;
	name: ProjectName;
	members: Members;
	sprints: Sprints;
	sequenceNumber: number;
	version: number;
}

export class Project implements Aggregate<Project, ProjectId> {
	readonly symbol: typeof ProjectTypeSymbol = ProjectTypeSymbol;
	readonly typeName = "Project";

	readonly id: ProjectId;
	readonly name: ProjectName;
	readonly members: Members;
	readonly sprints: Sprints;
	readonly sequenceNumber: number;
	readonly version: number;

	private constructor(params: ProjectParams) {
		this.id = params.id;
		this.name = params.name;
		this.members = params.members;
		this.sprints = params.sprints;
		this.sequenceNumber = params.sequenceNumber;
		this.version = params.version;
	}

	static create(
		executorId: AccountId,
		name: ProjectName,
	): [Project, ProjectCreated] {
		const id = ProjectId.generate();
		const members = Members.ofSingle(executorId);
		const sprints = Sprints.ofEmpty();
		const sequenceNumber = 1;
		const version = 1;

		return [
			new Project({
				id,
				name,
				members,
				sprints,
				sequenceNumber,
				version,
			}),
			ProjectCreated.of(id, name, members, sequenceNumber),
		];
	}

	static of(params: ProjectParams): Project {
		return new Project(params);
	}

	static replay(events: ProjectEvent[], snapshot: Project): Project {
		return events.reduce(
			(project, event) => project.applyEvent(event),
			snapshot,
		);
	}

	addSprint(sprint: Sprint): E.Either<never, [Project, ProjectSprintAdded]> {
		const newSprints = this.sprints.add(sprint);
		const newSequenceNumber = this.sequenceNumber + 1;
		const newProject = new Project({
			...this,
			sprints: newSprints,
			sequenceNumber: newSequenceNumber,
		});
		const event = ProjectSprintAdded.of(this.id, sprint, newSequenceNumber);
		return E.right([newProject, event]);
	}

	addMember(member: Member): E.Either<never, [Project, ProjectMemberAdded]> {
		const newMembers = this.members.addMember(member);
		const newSequenceNumber = this.sequenceNumber + 1;
		const newProject = new Project({
			...this,
			members: newMembers,
			sequenceNumber: newSequenceNumber,
		});
		const event = ProjectMemberAdded.of(this.id, member, newSequenceNumber);
		return E.right([newProject, event]);
	}

	removeMember(accountId: AccountId): E.Either<never, [Project, ProjectMemberRemoved]> {
		if (!this.members.containsByAccountId(accountId)) {
			throw new Error("The userAccountId is not the member of the project.");
		}

		const newMembersOpt = this.members.removeMemberByAccountId(accountId);
		if (O.isNone(newMembersOpt)) {
			throw new Error("The userAccountId is not the member of the project.");
		}
		const [newMembers, _removedMember] = newMembersOpt.value;

		const newSequenceNumber = this.sequenceNumber + 1;
		const newProject = new Project({
			...this,
			members: newMembers,
			sequenceNumber: newSequenceNumber,
		});
		const event = ProjectMemberRemoved.of(this.id, accountId, newSequenceNumber);
		return E.right([newProject, event]);
	}

	private applyEvent(event: ProjectEvent): Project {
		switch (event.symbol) {
			case ProjectSprintAddedTypeSymbol: {
				const typedEvent = event as ProjectSprintAdded;
				const result = this.addSprint(typedEvent.sprint);
				if (E.isLeft(result)) {
					throw new Error(result.left);
				}
				return result.right[0];
			}
			case ProjectMemberAddedTypeSymbol: {
				const typedEvent = event as ProjectMemberAdded;
				const result = this.addMember(typedEvent.member);
				if (E.isLeft(result)) {
					throw new Error(result.left);
				}
				return result.right[0];
			}
			case ProjectMemberRemovedTypeSymbol: {
				const typedEvent = event as ProjectMemberRemoved;
				const result = this.removeMember(typedEvent.accountId);
				if (E.isLeft(result)) {
					throw new Error(result.left);
				}
				return result.right[0];
			}
			case ProjectCreatedTypeSymbol: {
				throw new Error("ProjectCreated event should not be applied");
			}
		}
	}

	withVersion(version: number): Project {
		return new Project({ ...this, version });
	}

	updateVersion(versionF: (value: number) => number): Project {
		return new Project({ ...this, version: versionF(this.version) });
	}

	equals(other: Project): boolean {
		return (
			this.id.equals(other.id) &&
			this.name.equals(other.name) &&
			this.members.equals(other.members) &&
			this.sprints.equals(other.sprints) &&
			this.sequenceNumber === other.sequenceNumber &&
			this.version === other.version
		);
	}

	toJSON(): Record<string, unknown> {
		return {
			id: this.id.toJSON(),
			name: this.name.toJSON(),
			members: this.members.toJSON(),
			sprints: this.sprints.toJSON(),
			sequenceNumber: this.sequenceNumber,
			version: this.version,
		};
	}

	toString(): string {
		return `${
			Project.name
		}(${this.id.toString()}, ${this.name.toString()}, ${this.members.toString()}, ${this.sprints.toString()}, ${
			this.sequenceNumber
		}, ${this.version})`;
	}
}
