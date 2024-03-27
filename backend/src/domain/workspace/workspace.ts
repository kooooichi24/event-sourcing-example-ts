import type { Aggregate } from "event-store-adapter-js";
import { WorkspaceCreated } from "./workspace-events";
import type { WorkspaceId } from "./workspace-id";
import type { WorkspaceName } from "./workspace-name";

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
}
