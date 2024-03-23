import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import * as E from "fp-ts/Either";
import { AggregateId } from "event-store-adapter-js";

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
      } else {
        throw e;
      }
    }
  }

  static of(value: string): WorkspaceId {
    const uuid = value.startsWith(WORKSPACE_PREFIX + "-")
      ? value.slice(WORKSPACE_PREFIX.length + 1)
      : value;
    return new WorkspaceId(uuid);
  }

  static generate(): WorkspaceId {
    return new WorkspaceId(uuidv4());
  }
}
