import * as E from "fp-ts/Either";

export const SprintGoalTypeSymbol = Symbol("SprintGoal");

export class SprintGoal {
	readonly symbol: typeof SprintGoalTypeSymbol = SprintGoalTypeSymbol;

	private constructor(readonly value: string) {
		if (this.value.length === 0) {
			throw new Error("SprintGoal cannot be empty");
		}
	}

	static of(value: string): SprintGoal {
		return new SprintGoal(value);
	}

	static validate(value: string): E.Either<string, SprintGoal> {
		try {
			return E.right(SprintGoal.of(value));
		} catch (e) {
			if (e instanceof Error) {
				return E.left(e.message);
			}
			throw e;
		}
	}

	equals(other: SprintGoal): boolean {
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
		return `${SprintGoal.name}(${this.value})`;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToSprintGoal(json: any): SprintGoal {
	return SprintGoal.of(json.value);
}
