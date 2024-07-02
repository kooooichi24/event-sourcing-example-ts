import type { AggregateId } from "event-store-adapter-js";
import * as E from "fp-ts/Either";
import { validate as uuidValidate, v4 as uuidv4 } from "uuid";

const PROJECT_PREFIX = "Project";
export const ProjectIdTypeSymbol = Symbol("ProjectId");

export class ProjectId implements AggregateId {
	readonly symbol: typeof ProjectIdTypeSymbol = ProjectIdTypeSymbol;
	readonly typeName = PROJECT_PREFIX;

	private constructor(readonly value: string) {
		if (!uuidValidate(value)) {
			throw new Error(`Invalid ProjectId: ${value}`);
		}
	}

	static of(value: string): ProjectId {
		return new ProjectId(value);
	}

	static generate(): ProjectId {
		return new ProjectId(uuidv4());
	}

	static validate(value: string): E.Either<string, ProjectId> {
		try {
			return E.right(ProjectId.of(value));
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
		return `${ProjectId.name}(${this.value})`;
	}

	equals(other: ProjectId): boolean {
		return this.value === other.value;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToProjectId(json: any): ProjectId {
	return ProjectId.of(json.value);
}
