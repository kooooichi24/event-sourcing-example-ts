import { validate as uuidValidate, v4 as uuidv4 } from "uuid";

export const MemberIdTypeSymbol = Symbol("MemberId");

export class MemberId {
	readonly symbol: typeof MemberIdTypeSymbol = MemberIdTypeSymbol;

	private constructor(readonly value: string) {
		if (!uuidValidate(value)) {
			throw new Error(`Invalid MemberId: ${value}`);
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

	equals(anotherId: MemberId): boolean {
		return this.value === anotherId.value;
	}

	static of(value: string): MemberId {
		return new MemberId(value);
	}

	static generate(): MemberId {
		return new MemberId(uuidv4());
	}
}
