import * as E from "fp-ts/Either";

export const ProjectNameTypeSymbol = Symbol("ProjectName");

export class ProjectName {
	readonly symbol: typeof ProjectNameTypeSymbol = ProjectNameTypeSymbol;

	private constructor(readonly value: string) {
		if (this.value.length === 0) {
			throw new Error("ProjectName cannot be empty");
		}

		if (this.value.length > 80) {
			throw new Error("ProjectName cannot be longer than 80 characters");
		}
	}

	static of(value: string): ProjectName {
		return new ProjectName(value);
	}

	static validate(value: string): E.Either<string, ProjectName> {
		try {
			return E.right(ProjectName.of(value));
		} catch (e) {
			if (e instanceof Error) {
				return E.left(e.message);
			}
			throw e;
		}
	}

	equals(other: ProjectName): boolean {
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
		return `${ProjectName.name}(${this.value})`;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToProjectName(json: any): ProjectName {
	return ProjectName.of(json.value);
}
