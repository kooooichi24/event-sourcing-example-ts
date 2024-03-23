import { Aggregate } from "event-store-adapter-js";
import { WorkspaceId } from "./workspace-id";
import { WorkspaceName } from "./workspace-name";
import { WorkspaceCreated } from "./workspace-events";

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
    name: WorkspaceName
  ): [Workspace, WorkspaceCreated] {
    const sequenceNumber = 1;
    const version = 1;

    return [
      new Workspace({ id, name, sequenceNumber, version }),
      WorkspaceCreated.of(id, name, sequenceNumber),
    ];
  }

  withVersion(version: number): Workspace {
    return new Workspace({ ...this, version });
  }

  updateVersion(versionF: (value: number) => number): Workspace {
    return new Workspace({ ...this, version: versionF(this.version) });
  }
}
