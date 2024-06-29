import type * as TE from "fp-ts/TaskEither";
import type * as O from "fp-ts/lib/Option";
import type { Account } from "./account";
import type { AccountEvent } from "./account-events";
import type { AccountId } from "./account-id";

export class AccountRepositoryError extends Error {
	constructor(message: string, cause?: Error) {
		super(message);
		this.name = "RepositoryError";
		this.cause = cause;
	}
}

export interface IAccountRepository {
	store(
		event: AccountEvent,
		snapshot: Account,
	): TE.TaskEither<AccountRepositoryError, void>;
	findById(
		id: AccountId,
	): TE.TaskEither<AccountRepositoryError, O.Option<Account>>;
}
