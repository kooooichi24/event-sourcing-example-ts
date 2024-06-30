import { type EventStore, OptimisticLockError } from "event-store-adapter-js";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/lib/Option";
import { Account } from "../../../domain/account/account";
import type { AccountEvent } from "../../../domain/account/account-events";
import type { AccountId } from "../../../domain/account/account-id";
import {
	AccountRepositoryError,
	type IAccountRepository,
} from "../../../domain/account/account-repository";

type SnapshotDecider = (event: AccountEvent, snapshot: Account) => boolean;

export class AccountRepository implements IAccountRepository {
	private constructor(
		readonly eventStore: EventStore<AccountId, Account, AccountEvent>,
		private readonly snapshotDecider: SnapshotDecider | undefined,
	) {}

	store(
		event: AccountEvent,
		snapshot: Account,
	): TE.TaskEither<AccountRepositoryError, void> {
		if (event.isCreated || this.snapshotDecider?.(event, snapshot)) {
			return this.storeEventAndSnapshot(event, snapshot);
		}
		return this.storeEvent(event, snapshot.version);
	}

	private storeEvent(
		event: AccountEvent,
		version: number,
	): TE.TaskEither<AccountRepositoryError, void> {
		return TE.tryCatch(
			async () => await this.eventStore.persistEvent(event, version),
			(reason) => {
				if (reason instanceof OptimisticLockError) {
					return new AccountRepositoryError(
						"Failed to store event and snapshot due to optimistic lock error",
						reason,
					);
				}
				if (reason instanceof Error) {
					return new AccountRepositoryError(
						"Failed to store event and snapshot due to error",
						reason,
					);
				}
				return new AccountRepositoryError(String(reason));
			},
		);
	}

	private storeEventAndSnapshot(
		event: AccountEvent,
		snapshot: Account,
	): TE.TaskEither<AccountRepositoryError, void> {
		return TE.tryCatch(
			async () =>
				await this.eventStore.persistEventAndSnapshot(event, snapshot),
			(reason) => {
				if (reason instanceof OptimisticLockError) {
					return new AccountRepositoryError(
						"Failed to store event and snapshot due to optimistic lock error",
						reason,
					);
				}
				if (reason instanceof Error) {
					return new AccountRepositoryError(
						"Failed to store event and snapshot due to error",
						reason,
					);
				}
				return new AccountRepositoryError(String(reason));
			},
		);
	}

	findById(
		id: AccountId,
	): TE.TaskEither<AccountRepositoryError, O.Option<Account>> {
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
				return O.some(Account.replay(events, snapshot));
			},
			(reason: unknown) => {
				console.log("reason", reason);
				if (reason instanceof Error) {
					return new AccountRepositoryError(
						"Failed to find by id to error",
						reason,
					);
				}
				return new AccountRepositoryError(String(reason));
			},
		);
	}

	static of(
		eventStore: EventStore<AccountId, Account, AccountEvent>,
		snapshotDecider: SnapshotDecider | undefined = undefined,
	): AccountRepository {
		return new AccountRepository(eventStore, snapshotDecider);
	}

	withRetention(numberOfEvents: number): AccountRepository {
		return new AccountRepository(
			this.eventStore,
			AccountRepository.retentionCriteriaOf(numberOfEvents),
		);
	}

	static retentionCriteriaOf(numberOfEvents: number): SnapshotDecider {
		return (event: AccountEvent, _: Account) =>
			event.sequenceNumber % numberOfEvents === 0;
	}
}
