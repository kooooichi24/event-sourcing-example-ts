import * as E from "fp-ts/Either";
import { validate as uuidValidate, v4 as uuidv4 } from "uuid";

export const MemberIdTypeSymbol = Symbol("MemberId");

export class MemberId {
	readonly symbol: typeof MemberIdTypeSymbol = MemberIdTypeSymbol;

	private constructor(readonly value: string) {
		if (!uuidValidate(value)) {
			throw new Error(`Invalid MemberId: ${value}`);
		}
	}

	static of(value: string): MemberId {
		return new MemberId(value);
	}

	static generate(): MemberId {
		return new MemberId(uuidv4());
	}

	static validate(value: string): E.Either<string, MemberId> {
		try {
			return E.right(MemberId.of(value));
		} catch (e) {
			if (e instanceof Error) {
				return E.left(e.message);
			}
			throw e;
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
		return `${MemberId.name}(${this.value})`;
	}

	equals(other: MemberId): boolean {
		return this.value === other.value;
	}
}
