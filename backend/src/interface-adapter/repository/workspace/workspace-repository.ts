import { EventStore, OptimisticLockError } from "event-store-adapter-js";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/lib/Option";
import { Workspace } from "../../../domain/workspace/workspace";
import { WorkspaceEvent } from "../../../domain/workspace/workspace-events";
import {
	IWorkspaceRepository,
	WorkspaceRepositoryError,
} from "../../../domain/workspace/workspace-repository";
import { WorkspaceId } from "../../../domain/workspace/workspace-id";

type SnapshotDecider = (event: WorkspaceEvent, snapshot: Workspace) => boolean;

export class WorkspaceRepository implements IWorkspaceRepository {
	private constructor(
		readonly eventStore: EventStore<WorkspaceId, Workspace, WorkspaceEvent>,
		private readonly snapshotDecider: SnapshotDecider | undefined,
	) {}

	store(
		event: WorkspaceEvent,
		snapshot: Workspace,
	): TE.TaskEither<WorkspaceRepositoryError, void> {
		if (
			event.isCreated ||
			(this.snapshotDecider !== undefined &&
				this.snapshotDecider(event, snapshot))
		) {
			return this.storeEventAndSnapshot(event, snapshot);
		} else {
			return this.storeEvent(event, snapshot.version);
		}
	}

	private storeEvent(
		event: WorkspaceEvent,
		version: number,
	): TE.TaskEither<WorkspaceRepositoryError, void> {
		return TE.tryCatch(
			() => this.eventStore.persistEvent(event, version),
			(reason) => {
				if (reason instanceof OptimisticLockError) {
					return new WorkspaceRepositoryError(
						"Failed to store event and snapshot due to optimistic lock error",
						reason,
					);
				} else if (reason instanceof Error) {
					return new WorkspaceRepositoryError(
						"Failed to store event and snapshot due to error",
						reason,
					);
				}
				return new WorkspaceRepositoryError(String(reason));
			},
		);
	}

	private storeEventAndSnapshot(
		event: WorkspaceEvent,
		snapshot: Workspace,
	): TE.TaskEither<WorkspaceRepositoryError, void> {
		return TE.tryCatch(
			() => this.eventStore.persistEventAndSnapshot(event, snapshot),
			(reason) => {
				if (reason instanceof OptimisticLockError) {
					return new WorkspaceRepositoryError(
						"Failed to store event and snapshot due to optimistic lock error",
						reason,
					);
				} else if (reason instanceof Error) {
					return new WorkspaceRepositoryError(
						"Failed to store event and snapshot due to error",
						reason,
					);
				}
				return new WorkspaceRepositoryError(String(reason));
			},
		);
	}

	findById(
		id: WorkspaceId,
	): TE.TaskEither<WorkspaceRepositoryError, O.Option<Workspace>> {
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
				return O.some(Workspace.replay(events, snapshot));
			},
			(reason: unknown) => {
				if (reason instanceof Error) {
					return new WorkspaceRepositoryError(
						"Failed to find by id to error",
						reason,
					);
				}
				return new WorkspaceRepositoryError(String(reason));
			},
		);
	}

	static of(
		eventStore: EventStore<WorkspaceId, Workspace, WorkspaceEvent>,
		snapshotDecider: SnapshotDecider | undefined = undefined,
	): WorkspaceRepository {
		return new WorkspaceRepository(eventStore, snapshotDecider);
	}

	withRetention(numberOfEvents: number): WorkspaceRepository {
		return new WorkspaceRepository(
			this.eventStore,
			WorkspaceRepository.retentionCriteriaOf(numberOfEvents),
		);
	}

	static retentionCriteriaOf(numberOfEvents: number): SnapshotDecider {
		return (event: WorkspaceEvent, _: Workspace) =>
			event.sequenceNumber % numberOfEvents == 0;
	}
}
