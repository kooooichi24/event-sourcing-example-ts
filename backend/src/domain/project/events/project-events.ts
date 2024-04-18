import type { Event } from "event-store-adapter-js";
import { v4 as uuidv4 } from "uuid";
import type { Members } from "../members";
import type { ProjectId } from "../project-id";
import type { ProjectName } from "../project-name";
import type { Sprints } from "../sprints";

type ProjectEventTypeSymbol = typeof ProjectCreatedTypeSymbol;

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
		readonly sprints: Sprints,
		readonly sequenceNumber: number,
		readonly occurredAt: Date,
	) {}

	toString() {
		return `ProjectCreated(${this.id.toString()}, ${this.aggregateId.toString()}, ${this.name.toString()}, ${this.members.toString()}, ${this.sprints.toString()}, ${
			this.sequenceNumber
		}, ${this.occurredAt.toISOString()})`;
	}

	static of(
		aggregateId: ProjectId,
		name: ProjectName,
		members: Members,
		sprints: Sprints,
		sequenceNumber: number,
	): ProjectCreated {
		return new ProjectCreated(
			uuidv4(),
			aggregateId,
			name,
			members,
			sprints,
			sequenceNumber,
			new Date(),
		);
	}
}
