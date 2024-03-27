import * as E from "fp-ts/Either";

export const AccountNameTypeSymbol = Symbol("AccountName");

export class AccountName {
	readonly symbol: typeof AccountNameTypeSymbol = AccountNameTypeSymbol;

	private constructor(readonly value: string) {
		if (this.value.length === 0) {
			throw new Error("AccountName cannot be empty");
		}
		if (this.value.length > 30) {
			throw new Error("AccountName cannot be longer than 30 characters");
		}
	}

	toJSON() {
		return {
			value: this.value,
		};
	}

	asString() {
		return this.value;
	}

	toString() {
		return `${AccountName.name}(${this.value})`;
	}

	equals(anotherName: AccountName): boolean {
		return this.value === anotherName.value;
	}

	static validate(value: string): E.Either<string, AccountName> {
		try {
			return E.right(AccountName.of(value));
		} catch (e) {
			if (e instanceof Error) {
				return E.left(e.message);
			}
			throw e;
		}
	}

	static of(value: string): AccountName {
		return new AccountName(value);
	}
}
