import type { Event } from "event-store-adapter-js";
import { v4 as uuidv4 } from "uuid";
import type { Members } from "../members";
import type { ProjectId } from "../project-id";
import type { ProjectName } from "../project-name";
import type { Sprint } from "../sprint";

type ProjectEventTypeSymbol =
	| typeof ProjectCreatedTypeSymbol
	| typeof ProjectSprintAddedTypeSymbol;

interface ProjectEvent extends Event<ProjectId> {
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
