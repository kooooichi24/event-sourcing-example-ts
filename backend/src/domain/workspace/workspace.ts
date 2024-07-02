import type { Aggregate } from "event-store-adapter-js";
import {
	WorkspaceCreated,
	WorkspaceCreatedTypeSymbol,
	type WorkspaceEvent,
} from "./workspace-events";
import { convertJSONToWorkspaceId, type WorkspaceId } from "./workspace-id";
import {
	convertJSONToWorkspaceName,
	type WorkspaceName,
} from "./workspace-name";

export const WorkspaceTypeSymbol = Symbol("Workspace");

interface WorkspaceParams {
	id: WorkspaceId;
	name: WorkspaceName;
	sequenceNumber: number;
	version: number;
}

export class Workspace implements Aggregate<Workspace, WorkspaceId> {
	readonly symbol: typeof WorkspaceTypeSymbol = WorkspaceTypeSymbol;
	readonly typeName = "Workspace";

	readonly id: WorkspaceId;
	readonly name: WorkspaceName;
	readonly sequenceNumber: number;
	readonly version: number;

	private constructor(params: WorkspaceParams) {
		this.id = params.id;
		this.name = params.name;
		this.sequenceNumber = params.sequenceNumber;
		this.version = params.version;
	}

	static create(
		id: WorkspaceId,
		name: WorkspaceName,
	): [Workspace, WorkspaceCreated] {
		const sequenceNumber = 1;
		const version = 1;

		return [
			new Workspace({ id, name, sequenceNumber, version }),
			WorkspaceCreated.of(id, name, sequenceNumber),
		];
	}

	static of(params: WorkspaceParams): Workspace {
		return new Workspace(params);
	}

	static replay(events: WorkspaceEvent[], snapshot: Workspace): Workspace {
		return events.reduce(
			(project, event) => project.applyEvent(event),
			snapshot,
		);
	}

	private applyEvent(event: WorkspaceEvent): Workspace {
		switch (event.symbol) {
			case WorkspaceCreatedTypeSymbol:
				throw new Error("WorkspaceCreated event should not be applied");
		}
	}

	withVersion(version: number): Workspace {
		return new Workspace({ ...this, version });
	}

	updateVersion(versionF: (value: number) => number): Workspace {
		return new Workspace({ ...this, version: versionF(this.version) });
	}

	equals(other: Workspace): boolean {
		return (
			this.id.equals(other.id) &&
			this.name.equals(other.name) &&
			this.sequenceNumber === other.sequenceNumber &&
			this.version === other.version
		);
	}

	toJSON(): Record<string, unknown> {
		return {
			id: this.id.toJSON(),
			name: this.name.toJSON(),
			sequenceNumber: this.sequenceNumber,
			version: this.version,
		};
	}

	toString(): string {
		return `Workspace(${this.id.toString()}, ${this.name.toString()}, ${
			this.sequenceNumber
		}, ${this.version})`;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToWorkspace(json: any): Workspace {
	const id = convertJSONToWorkspaceId(json.data.id);
	const name = convertJSONToWorkspaceName(json.data.name);
	return Workspace.of({
		id,
		name,
		sequenceNumber: json.data.sequenceNumber,
		version: json.data.version,
	});
}
