import type * as TE from "fp-ts/TaskEither";
import type * as O from "fp-ts/lib/Option";
import type { Workspace } from "./workspace";
import type { WorkspaceEvent } from "./workspace-events";
import type { WorkspaceId } from "./workspace-id";

export interface IWorkspaceRepository {
	store(event: WorkspaceEvent, snapshot: Workspace): TE.TaskEither<never, void>;
	findById(id: WorkspaceId): TE.TaskEither<never, O.Option<Workspace>>;
}
