import * as E from "fp-ts/Either";
import isValidDomain from "is-valid-domain";

export const WorkspaceNameTypeSymbol = Symbol("WorkspaceName");

export class WorkspaceName {
	readonly symbol: typeof WorkspaceNameTypeSymbol = WorkspaceNameTypeSymbol;

	private constructor(readonly value: string) {
		if (this.value.length === 0) {
			throw new Error("WorkspaceName cannot be empty");
		}
		if (this.value.length > 30) {
			throw new Error("WorkspaceName cannot be longer than 30 characters");
		}
		if (!isValidDomain(`${this.value}.example.com`)) {
			throw new Error("Invalid domain format");
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
		return `${WorkspaceName.name}(${this.value})`;
	}

	equals(anotherName: WorkspaceName): boolean {
		return this.value === anotherName.value;
	}

	static validate(value: string): E.Either<string, WorkspaceName> {
		try {
			return E.right(WorkspaceName.of(value));
		} catch (e) {
			if (e instanceof Error) {
				return E.left(e.message);
			}
			throw e;
		}
	}

	static of(value: string): WorkspaceName {
		return new WorkspaceName(value);
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToWorkspaceName(json: any): WorkspaceName {
	return WorkspaceName.of(json.value);
}
