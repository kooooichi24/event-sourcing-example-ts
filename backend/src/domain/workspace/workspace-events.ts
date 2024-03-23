import type { Event } from "event-store-adapter-js";
import { v4 as uuidv4 } from "uuid";
import type { WorkspaceId } from "./workspace-id";
import type { WorkspaceName } from "./workspace-name";

type WorkspaceEventTypeSymbol = typeof WorkspaceCreatedTypeSymbol;

interface WorkspaceEvent extends Event<WorkspaceId> {
	symbol: WorkspaceEventTypeSymbol;
	toString: () => string;
}

/**
 * WorkspaceCreated
 */
export const WorkspaceCreatedTypeSymbol = Symbol("WorkspaceCreated");

export class WorkspaceCreated implements WorkspaceEvent {
	readonly symbol: typeof WorkspaceCreatedTypeSymbol =
		WorkspaceCreatedTypeSymbol;
	readonly typeName = "WorkspaceCreated";
	readonly isCreated = true;

	private constructor(
		public readonly id: string,
		public readonly aggregateId: WorkspaceId,
		public readonly name: WorkspaceName,
		public readonly sequenceNumber: number,
		public readonly occurredAt: Date,
	) {}

	toString() {
		return `WorkspaceCreated(${this.id.toString()}, ${this.aggregateId.toString()}, ${this.name.toString()}, ${
			this.sequenceNumber
		}, ${this.occurredAt.toISOString()})`;
	}

	static of(
		aggregateId: WorkspaceId,
		name: WorkspaceName,
		sequenceNumber: number,
	): WorkspaceCreated {
		return new WorkspaceCreated(
			uuidv4(),
			aggregateId,
			name,
			sequenceNumber,
			new Date(),
		);
	}
}
