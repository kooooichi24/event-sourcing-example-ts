import type { AggregateId } from "event-store-adapter-js";
import * as E from "fp-ts/Either";
import { validate as uuidValidate, v4 as uuidv4 } from "uuid";

const WORKSPACE_PREFIX: string = "Workspace";
export const WorkspaceIdTypeSymbol = Symbol("WorkspaceId");

export class WorkspaceId implements AggregateId {
	readonly symbol: typeof WorkspaceIdTypeSymbol = WorkspaceIdTypeSymbol;
	readonly typeName = WORKSPACE_PREFIX;

	private constructor(readonly value: string) {
		if (!uuidValidate(value)) {
			throw new Error(`Invalid WorkspaceId: ${value}`);
		}
	}

	toJSON() {
		return {
			value: this.value,
		};
	}

	asString() {
		return `${WORKSPACE_PREFIX}-${this.value}`;
	}

	toString() {
		return `${WorkspaceId.name}-${this.value}`;
	}

	equals(anotherId: WorkspaceId): boolean {
		return this.value === anotherId.value;
	}

	static validate(value: string): E.Either<string, WorkspaceId> {
		try {
			return E.right(WorkspaceId.of(value));
		} catch (e) {
			if (e instanceof Error) {
				return E.left(e.message);
			}
			throw e;
		}
	}

	static of(value: string): WorkspaceId {
		const uuid = value.startsWith(`${WORKSPACE_PREFIX}-`)
			? value.slice(WORKSPACE_PREFIX.length + 1)
			: value;
		return new WorkspaceId(uuid);
	}

	static generate(): WorkspaceId {
		return new WorkspaceId(uuidv4());
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToWorkspaceId(json: any): WorkspaceId {
	return WorkspaceId.of(json.value);
}
