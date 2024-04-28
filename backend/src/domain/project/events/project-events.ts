import type { Event } from "event-store-adapter-js";
import { v4 as uuidv4 } from "uuid";
import type { AccountId } from "../../account/account-id";
import type { Member, MemberRole } from "../member";
import type { Members } from "../members";
import type { ProjectId } from "../project-id";
import type { ProjectName } from "../project-name";
import type { Sprint } from "../sprint";

type ProjectEventTypeSymbol =
	| typeof ProjectCreatedTypeSymbol
	| typeof ProjectSprintAddedTypeSymbol
	| typeof ProjectSprintEditedTypeSymbol
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
