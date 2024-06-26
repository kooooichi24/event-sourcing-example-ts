import * as E from "fp-ts/Either";
import { validate as uuidValidate, v4 as uuidv4 } from "uuid";

export const SprintIdTypeSymbol = Symbol("SprintId");

export class SprintId {
	readonly symbol: typeof SprintIdTypeSymbol = SprintIdTypeSymbol;

	private constructor(readonly value: string) {
		if (!uuidValidate(value)) {
			throw new Error(`Invalid SprintId: ${value}`);
		}
	}

	static of(value: string): SprintId {
		return new SprintId(value);
	}

	static generate(): SprintId {
		return new SprintId(uuidv4());
	}

	static validate(value: string): E.Either<string, SprintId> {
		try {
			return E.right(SprintId.of(value));
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
		return `${SprintId.name}(${this.value})`;
	}

	equals(other: SprintId): boolean {
		return this.value === other.value;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToSprintId(json: any): SprintId {
	return SprintId.of(json.value);
}
