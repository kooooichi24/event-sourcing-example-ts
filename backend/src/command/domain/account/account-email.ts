import * as EmailValidator from "email-validator";
import * as E from "fp-ts/Either";

export const AccountEmailTypeSymbol = Symbol("AccountEmail");

export class AccountEmail {
	readonly symbol: typeof AccountEmailTypeSymbol = AccountEmailTypeSymbol;

	private constructor(readonly value: string) {
		if (!EmailValidator.validate(value)) {
			throw new Error(`Invalid AccountEmail: ${value}`);
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
		return `${AccountEmail.name}(${this.value})`;
	}

	equals(anotherEmail: AccountEmail): boolean {
		return this.value === anotherEmail.value;
	}

	static validate(value: string): E.Either<string, AccountEmail> {
		try {
			return E.right(AccountEmail.of(value));
		} catch (e) {
			if (e instanceof Error) {
				return E.left(e.message);
			}
			throw e;
		}
	}

	static of(value: string): AccountEmail {
		return new AccountEmail(value);
	}
}
