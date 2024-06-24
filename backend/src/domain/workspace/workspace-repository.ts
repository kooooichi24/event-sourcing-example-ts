import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/lib/Option";
import { WorkspaceId } from "./workspace-id";
import { Workspace } from "./workspace";
import { WorkspaceEvent } from "./workspace-events";

export interface IWorkspaceRepository {
	store(event: WorkspaceEvent, snapshot: Workspace): TE.TaskEither<never, void>;
	findById(id: WorkspaceId): TE.TaskEither<never, O.Option<Workspace>>;
}
