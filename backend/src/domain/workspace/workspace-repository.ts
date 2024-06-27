import type * as TE from "fp-ts/TaskEither";
import type * as O from "fp-ts/lib/Option";
import type { Workspace } from "./workspace";
import type { WorkspaceEvent } from "./workspace-events";
import type { WorkspaceId } from "./workspace-id";

export class WorkspaceRepositoryError extends Error {
	constructor(message: string, cause?: Error) {
		super(message);
		this.name = "RepositoryError";
		this.cause = cause;
	}
}

export interface IWorkspaceRepository {
	store(
		event: WorkspaceEvent,
		snapshot: Workspace,
	): TE.TaskEither<WorkspaceRepositoryError, void>;
	findById(
		id: WorkspaceId,
	): TE.TaskEither<WorkspaceRepositoryError, O.Option<Workspace>>;
}
