import type { Event } from "event-store-adapter-js";
import { v4 as uuidv4 } from "uuid";
import {
	type AccountId,
	convertJSONToAccountId,
} from "../../account/account-id";
import { type Member, type MemberRole, convertJSONToMember } from "../member";
import { type Members, convertJSONToMembers } from "../members";
import { type ProjectId, convertJSONToProjectId } from "../project-id";
import { type ProjectName, convertJSONToProjectName } from "../project-name";
import { type Sprint, convertJSONToSprint } from "../sprint";
import { type SprintId, convertJSONToSprintId } from "../sprint-id";

type ProjectEventTypeSymbol =
	| typeof ProjectCreatedTypeSymbol
	| typeof ProjectDeletedTypeSymbol
	| typeof ProjectSprintAddedTypeSymbol
	| typeof ProjectSprintEditedTypeSymbol
	| typeof ProjectSprintStartedTypeSymbol
	| typeof ProjectSprintCompletedTypeSymbol
	| typeof ProjectMemberAddedTypeSymbol
	| typeof ProjectMemberRemovedTypeSymbol
	| typeof ProjectMemberRoleChangedTypeSymbol;

export interface ProjectEvent extends Event<ProjectId> {
	symbol: ProjectEventTypeSymbol;
	toString: () => string;
}

/**
 * ProjectCreated
 */
export const ProjectCreatedTypeSymbol = Symbol("ProjectCreated");
export class ProjectCreated implements ProjectEvent {
	readonly symbol: typeof ProjectCreatedTypeSymbol = ProjectCreatedTypeSymbol;
	readonly typeName = "ProjectCreated";
	readonly isCreated = true;

	private constructor(
		readonly id: string,
		readonly aggregateId: ProjectId,
		readonly name: ProjectName,
		readonly members: Members,
		readonly sequenceNumber: number,
		readonly occurredAt: Date,
	) {}

	static of(
		aggregateId: ProjectId,
		name: ProjectName,
		members: Members,
		sequenceNumber: number,
	): ProjectCreated {
		return new ProjectCreated(
			uuidv4(),
			aggregateId,
			name,
			members,
			sequenceNumber,
			new Date(),
		);
	}

	toString() {
		return `ProjectCreated(${this.id.toString()}, ${this.aggregateId.toString()}, ${this.name.toString()}, ${this.members.toString()}, ${
			this.sequenceNumber
		}, ${this.occurredAt.toISOString()})`;
	}
}

/**
 * ProjectDeleted
 */
export const ProjectDeletedTypeSymbol = Symbol("ProjectDeleted");
export class ProjectDeleted implements ProjectEvent {
	readonly symbol: typeof ProjectDeletedTypeSymbol = ProjectDeletedTypeSymbol;
	readonly typeName = "ProjectDeleted";
	readonly isCreated = false;

	private constructor(
		readonly id: string,
		readonly aggregateId: ProjectId,
		readonly sequenceNumber: number,
		readonly occurredAt: Date,
	) {}

	static of(aggregateId: ProjectId, sequenceNumber: number): ProjectDeleted {
		return new ProjectDeleted(
			uuidv4(),
			aggregateId,
			sequenceNumber,
			new Date(),
		);
	}

	toString() {
		return `ProjectDeleted(${this.id.toString()}, ${this.aggregateId.toString()}, ${
			this.sequenceNumber
		}, ${this.occurredAt.toISOString()})`;
	}
}

/**
 * ProjectSprintAdded
 */
export const ProjectSprintAddedTypeSymbol = Symbol("ProjectSprintAdded");
export class ProjectSprintAdded implements ProjectEvent {
	readonly symbol: typeof ProjectSprintAddedTypeSymbol =
		ProjectSprintAddedTypeSymbol;
	readonly typeName = "ProjectSprintAdded";
	readonly isCreated = false;

	private constructor(
		readonly id: string,
		readonly aggregateId: ProjectId,
		readonly sprint: Sprint,
		readonly sequenceNumber: number,
		readonly occurredAt: Date,
	) {}

	static of(
		aggregateId: ProjectId,
		sprint: Sprint,
		sequenceNumber: number,
	): ProjectSprintAdded {
		return new ProjectSprintAdded(
			uuidv4(),
			aggregateId,
			sprint,
			sequenceNumber,
			new Date(),
		);
	}

	toString() {
		return `ProjectSprintAdded(${this.id.toString()}, ${this.aggregateId.toString()}, ${this.sprint.toString()}, ${
			this.sequenceNumber
		}, ${this.occurredAt.toISOString()})`;
	}
}

/**
 * ProjectSprintEdited
 */
export const ProjectSprintEditedTypeSymbol = Symbol("ProjectSprintEdited");
export class ProjectSprintEdited implements ProjectEvent {
	readonly symbol: typeof ProjectSprintEditedTypeSymbol =
		ProjectSprintEditedTypeSymbol;
	readonly typeName = "ProjectSprintEdited";
	readonly isCreated = false;

	private constructor(
		readonly id: string,
		readonly aggregateId: ProjectId,
		readonly sprint: Sprint,
		readonly sequenceNumber: number,
		readonly occurredAt: Date,
	) {}

	static of(
		aggregateId: ProjectId,
		sprint: Sprint,
		sequenceNumber: number,
	): ProjectSprintEdited {
		return new ProjectSprintEdited(
			uuidv4(),
			aggregateId,
			sprint,
			sequenceNumber,
			new Date(),
		);
	}

	toString() {
		return `ProjectSprintEdited(${this.id.toString()}, ${this.aggregateId.toString()}, ${this.sprint.toString()}, ${
			this.sequenceNumber
		}, ${this.occurredAt.toISOString()})`;
	}
}

/**
 * ProjectSprintStarted
 */
export const ProjectSprintStartedTypeSymbol = Symbol("ProjectSprintStarted");
export class ProjectSprintStarted implements ProjectEvent {
	readonly symbol: typeof ProjectSprintStartedTypeSymbol =
		ProjectSprintStartedTypeSymbol;
	readonly typeName = "ProjectSprintStarted";
	readonly isCreated = false;

	private constructor(
		readonly id: string,
		readonly aggregateId: ProjectId,
		readonly sprintId: SprintId,
		readonly sequenceNumber: number,
		readonly occurredAt: Date,
	) {}

	static of(
		aggregateId: ProjectId,
		sprintId: SprintId,
		sequenceNumber: number,
	): ProjectSprintStarted {
		return new ProjectSprintStarted(
			uuidv4(),
			aggregateId,
			sprintId,
			sequenceNumber,
			new Date(),
		);
	}

	toString() {
		return `ProjectSprintStarted(${this.id.toString()}, ${this.aggregateId.toString()}, ${this.sprintId.toString()}, ${
			this.sequenceNumber
		}, ${this.occurredAt.toISOString()})`;
	}
}

/**
 * ProjectSprintCompleted
 */
export const ProjectSprintCompletedTypeSymbol = Symbol(
	"ProjectSprintCompleted",
);
export class ProjectSprintCompleted implements ProjectEvent {
	readonly symbol: typeof ProjectSprintCompletedTypeSymbol =
		ProjectSprintCompletedTypeSymbol;
	readonly typeName = "ProjectSprintCompleted";
	readonly isCreated = false;

	private constructor(
		readonly id: string,
		readonly aggregateId: ProjectId,
		readonly sprintId: SprintId,
		readonly sequenceNumber: number,
		readonly occurredAt: Date,
	) {}

	static of(
		aggregateId: ProjectId,
		sprintId: SprintId,
		sequenceNumber: number,
	): ProjectSprintCompleted {
		return new ProjectSprintCompleted(
			uuidv4(),
			aggregateId,
			sprintId,
			sequenceNumber,
			new Date(),
		);
	}

	toString() {
		return `ProjectSprintCompleted(${this.id.toString()}, ${this.aggregateId.toString()}, ${this.sprintId.toString()}, ${
			this.sequenceNumber
		}, ${this.occurredAt.toISOString()})`;
	}
}

/**
 * ProjectMemberAdded
 */
export const ProjectMemberAddedTypeSymbol = Symbol("ProjectMemberAdded");
export class ProjectMemberAdded implements ProjectEvent {
	readonly symbol: typeof ProjectMemberAddedTypeSymbol =
		ProjectMemberAddedTypeSymbol;
	readonly typeName = "ProjectMemberAdded";
	readonly isCreated = false;

	private constructor(
		readonly id: string,
		readonly aggregateId: ProjectId,
		readonly member: Member,
		readonly sequenceNumber: number,
		readonly occurredAt: Date,
	) {}

	static of(
		aggregateId: ProjectId,
		member: Member,
		sequenceNumber: number,
	): ProjectMemberAdded {
		return new ProjectMemberAdded(
			uuidv4(),
			aggregateId,
			member,
			sequenceNumber,
			new Date(),
		);
	}

	toString() {
		return `ProjectMemberAdded(${this.id.toString()}, ${this.aggregateId.toString()}, ${this.member.toString()}, ${
			this.sequenceNumber
		}, ${this.occurredAt.toISOString()})`;
	}
}

/**
 * ProjectMemberRemoved
 */
export const ProjectMemberRemovedTypeSymbol = Symbol("ProjectMemberRemoved");
export class ProjectMemberRemoved implements ProjectEvent {
	readonly symbol: typeof ProjectMemberRemovedTypeSymbol =
		ProjectMemberRemovedTypeSymbol;
	readonly typeName = "ProjectMemberRemoved";
	readonly isCreated = false;

	private constructor(
		readonly id: string,
		readonly aggregateId: ProjectId,
		readonly accountId: AccountId,
		readonly sequenceNumber: number,
		readonly occurredAt: Date,
	) {}

	static of(
		aggregateId: ProjectId,
		accountId: AccountId,
		sequenceNumber: number,
	): ProjectMemberRemoved {
		return new ProjectMemberRemoved(
			uuidv4(),
			aggregateId,
			accountId,
			sequenceNumber,
			new Date(),
		);
	}

	toString() {
		return `ProjectMemberRemoved(${this.id.toString()}, ${this.aggregateId.toString()}, ${this.accountId.toString()}, ${
			this.sequenceNumber
		}, ${this.occurredAt.toISOString()})`;
	}
}

/**
 * ProjectMemberRoleChanged
 */
export const ProjectMemberRoleChangedTypeSymbol = Symbol(
	"ProjectMemberRoleChanged",
);
export class ProjectMemberRoleChanged implements ProjectEvent {
	readonly symbol: typeof ProjectMemberRoleChangedTypeSymbol =
		ProjectMemberRoleChangedTypeSymbol;
	readonly typeName = "ProjectMemberRoleChanged";
	readonly isCreated = false;

	private constructor(
		readonly id: string,
		readonly aggregateId: ProjectId,
		readonly accountId: AccountId,
		readonly memberRole: MemberRole,
		readonly sequenceNumber: number,
		readonly occurredAt: Date,
	) {}

	static of(
		aggregateId: ProjectId,
		accountId: AccountId,
		memberRole: MemberRole,
		sequenceNumber: number,
	): ProjectMemberRoleChanged {
		return new ProjectMemberRoleChanged(
			uuidv4(),
			aggregateId,
			accountId,
			memberRole,
			sequenceNumber,
			new Date(),
		);
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToProjectEvent(json: any): ProjectEvent {
	const id = convertJSONToProjectId(json.data.aggregateId);
	switch (json.type) {
		case "ProjectCreated": {
			const name = convertJSONToProjectName(json.data.name);
			const members = convertJSONToMembers(json.data.members);
			return ProjectCreated.of(id, name, members, json.data.sequenceNumber);
		}
		case "ProjectDeleted": {
			return ProjectDeleted.of(id, json.data.sequenceNumber);
		}
		case "ProjectSprintAdded": {
			const sprint = convertJSONToSprint(json.data.sprint);
			return ProjectSprintAdded.of(id, sprint, json.data.sequenceNumber);
		}
		case "ProjectSprintEdited": {
			const sprint = convertJSONToSprint(json.data.sprint);
			return ProjectSprintEdited.of(id, sprint, json.data.sequenceNumber);
		}
		case "ProjectSprintStarted": {
			const sprintId = convertJSONToSprintId(json.data.sprintId);
			return ProjectSprintStarted.of(id, sprintId, json.data.sequenceNumber);
		}
		case "ProjectSprintCompleted": {
			const sprintId = convertJSONToSprintId(json.data.sprintId);
			return ProjectSprintCompleted.of(id, sprintId, json.data.sequenceNumber);
		}
		case "ProjectMemberAdded": {
			const member = convertJSONToMember(json.data.member);
			return ProjectMemberAdded.of(id, member, json.data.sequenceNumber);
		}
		case "ProjectMemberRemoved": {
			const accountId = convertJSONToAccountId(json.data.accountId);
			return ProjectMemberRemoved.of(id, accountId, json.data.sequenceNumber);
		}
		case "ProjectMemberRoleChanged": {
			const accountId = convertJSONToAccountId(json.data.accountId);
			const memberRole = json.data.memberRole;
			return ProjectMemberRoleChanged.of(
				id,
				accountId,
				memberRole,
				json.data.sequenceNumber,
			);
		}
		default:
			throw new Error(`Unknown type: ${json.type}`);
	}
}
