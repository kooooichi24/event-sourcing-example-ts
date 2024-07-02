import * as E from "fp-ts/Either";

export const SprintNameTypeSymbol = Symbol("SprintName");

export class SprintName {
	readonly symbol: typeof SprintNameTypeSymbol = SprintNameTypeSymbol;

	private constructor(readonly value: string) {
		if (this.value.length === 0) {
			throw new Error("SprintName cannot be empty");
		}

		if (this.value.length > 30) {
			throw new Error("SprintName cannot be longer than 30 characters");
		}
	}

	static of(value: string): SprintName {
		return new SprintName(value);
	}

	static validate(value: string): E.Either<string, SprintName> {
		try {
			return E.right(SprintName.of(value));
		} catch (e) {
			if (e instanceof Error) {
				return E.left(e.message);
			}
			throw e;
		}
	}

	equals(other: SprintName): boolean {
		return this.value === other.value;
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
		return `${SprintName.name}(${this.value})`;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToSprintName(json: any): SprintName {
	return SprintName.of(json.value);
}
