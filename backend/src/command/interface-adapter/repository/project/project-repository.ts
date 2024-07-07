import { type EventStore, OptimisticLockError } from "event-store-adapter-js";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/lib/Option";
import type { ProjectEvent } from "../../../domain/project/events/project-events";
import { Project } from "../../../domain/project/project";
import type { ProjectId } from "../../../domain/project/project-id";
import {
	type IProjectRepository,
	ProjectRepositoryError,
} from "../../../domain/project/project-repository";

type SnapshotDecider = (event: ProjectEvent, snapshot: Project) => boolean;

export class ProjectRepository implements IProjectRepository {
	private constructor(
		readonly eventStore: EventStore<ProjectId, Project, ProjectEvent>,
		private readonly snapshotDecider: SnapshotDecider | undefined,
	) {}

	store(
		event: ProjectEvent,
		snapshot: Project,
	): TE.TaskEither<ProjectRepositoryError, void> {
		if (event.isCreated || this.snapshotDecider?.(event, snapshot)) {
			return this.storeEventAndSnapshot(event, snapshot);
		}
		return this.storeEvent(event, snapshot.version);
	}

	private storeEvent(
		event: ProjectEvent,
		version: number,
	): TE.TaskEither<ProjectRepositoryError, void> {
		return TE.tryCatch(
			() => this.eventStore.persistEvent(event, version),
			(reason) => {
				if (reason instanceof OptimisticLockError) {
					return new ProjectRepositoryError(
						"Failed to store event and snapshot due to optimistic lock error",
						reason,
					);
				}
				if (reason instanceof Error) {
					return new ProjectRepositoryError(
						"Failed to store event and snapshot due to error",
						reason,
					);
				}
				return new ProjectRepositoryError(String(reason));
			},
		);
	}

	private storeEventAndSnapshot(
		event: ProjectEvent,
		snapshot: Project,
	): TE.TaskEither<ProjectRepositoryError, void> {
		return TE.tryCatch(
			() => this.eventStore.persistEventAndSnapshot(event, snapshot),
			(reason) => {
				if (reason instanceof OptimisticLockError) {
					return new ProjectRepositoryError(
						"Failed to store event and snapshot due to optimistic lock error",
						reason,
					);
				}
				if (reason instanceof Error) {
					return new ProjectRepositoryError(
						"Failed to store event and snapshot due to error",
						reason,
					);
				}
				return new ProjectRepositoryError(String(reason));
			},
		);
	}

	findById(
		id: ProjectId,
	): TE.TaskEither<ProjectRepositoryError, O.Option<Project>> {
		return TE.tryCatch(
			async () => {
				const snapshot = await this.eventStore.getLatestSnapshotById(id);
				if (snapshot === undefined) {
					return O.none;
				}
				const events = await this.eventStore.getEventsByIdSinceSequenceNumber(
					id,
					snapshot.sequenceNumber + 1,
				);
				return O.some(Project.replay(events, snapshot));
			},
			(reason: unknown) => {
				if (reason instanceof Error) {
					return new ProjectRepositoryError(
						"Failed to find by id to error",
						reason,
					);
				}
				return new ProjectRepositoryError(String(reason));
			},
		);
	}

	static of(
		eventStore: EventStore<ProjectId, Project, ProjectEvent>,
		snapshotDecider: SnapshotDecider | undefined = undefined,
	): ProjectRepository {
		return new ProjectRepository(eventStore, snapshotDecider);
	}

	withRetention(numberOfEvents: number): ProjectRepository {
		return new ProjectRepository(
			this.eventStore,
			ProjectRepository.retentionCriteriaOf(numberOfEvents),
		);
	}

	static retentionCriteriaOf(numberOfEvents: number): SnapshotDecider {
		return (event: ProjectEvent, _: Project) =>
			event.sequenceNumber % numberOfEvents === 0;
	}
}
