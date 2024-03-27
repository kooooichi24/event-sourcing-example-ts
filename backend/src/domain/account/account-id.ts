import type { AggregateId } from "event-store-adapter-js";
import * as E from "fp-ts/Either";
import { validate as uuidValidate, v4 as uuidv4 } from "uuid";

const ACCOUNT_PREFIX: string = "Account";
export const AccountIdTypeSymbol = Symbol("AccountId");

export class AccountId implements AggregateId {
	readonly symbol: typeof AccountIdTypeSymbol = AccountIdTypeSymbol;
	readonly typeName = ACCOUNT_PREFIX;

	private constructor(readonly value: string) {
		if (!uuidValidate(value)) {
			throw new Error(`Invalid AccountId: ${value}`);
		}
	}

	toJSON() {
		return {
			value: this.value,
		};
	}

	asString() {
		return `${ACCOUNT_PREFIX}-${this.value}`;
	}

	toString() {
		return `${AccountId.name}-${this.value}`;
	}

	equals(anotherId: AccountId): boolean {
		return this.value === anotherId.value;
	}

	static validate(value: string): E.Either<string, AccountId> {
		try {
			return E.right(AccountId.of(value));
		} catch (e) {
			if (e instanceof Error) {
				return E.left(e.message);
			}
			throw e;
		}
	}

	static of(value: string): AccountId {
		const uuid = value.startsWith(`${ACCOUNT_PREFIX}-`)
			? value.slice(ACCOUNT_PREFIX.length + 1)
			: value;
		return new AccountId(uuid);
	}

	static generate(): AccountId {
		return new AccountId(uuidv4());
	}
}
