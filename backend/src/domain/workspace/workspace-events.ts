import type { Event } from "event-store-adapter-js";
import { v4 as uuidv4 } from "uuid";
import { type WorkspaceId, convertJSONToWorkspaceId } from "./workspace-id";
import {
	type WorkspaceName,
	convertJSONToWorkspaceName,
} from "./workspace-name";

type WorkspaceEventTypeSymbol = typeof WorkspaceCreatedTypeSymbol;

export interface WorkspaceEvent extends Event<WorkspaceId> {
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

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToWorkspaceEvent(json: any): WorkspaceEvent {
	const id = convertJSONToWorkspaceId(json.data.aggregateId);
	switch (json.type) {
		case "WorkspaceCreated": {
			const name = convertJSONToWorkspaceName(json.data.name);
			return WorkspaceCreated.of(id, name, json.data.sequenceNumber);
		}
		default:
			throw new Error(`Unknown type: ${json.type}`);
	}
}
