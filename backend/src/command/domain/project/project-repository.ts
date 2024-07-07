import type * as TE from "fp-ts/TaskEither";
import type * as O from "fp-ts/lib/Option";
import type { ProjectEvent } from "./events/project-events";
import type { Project } from "./project";
import type { ProjectId } from "./project-id";

export class ProjectRepositoryError extends Error {
	constructor(message: string, cause?: Error) {
		super(message);
		this.name = "RepositoryError";
		this.cause = cause;
	}
}

export interface IProjectRepository {
	store(
		event: ProjectEvent,
		snapshot: Project,
	): TE.TaskEither<ProjectRepositoryError, void>;
	findById(
		id: ProjectId,
	): TE.TaskEither<ProjectRepositoryError, O.Option<Project>>;
}
