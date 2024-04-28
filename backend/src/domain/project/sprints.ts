import * as O from "fp-ts/lib/Option";
import type { Sprint } from "./sprint";
import { SprintId } from "./sprint-id";

const SprintsTypeSymbol = Symbol("Srpints");

export class Sprints {
	readonly symbol: typeof SprintsTypeSymbol = SprintsTypeSymbol;

	private constructor(readonly values: Map<string, Sprint>) {
		const activeSprintCount = Array.from(values.values()).filter((sprint) =>
			sprint.isActive(),
		).length;
		if (activeSprintCount > 1) {
			throw new Error("Active sprint must be only one");
		}
	}

	static ofEmpty(): Sprints {
		return new Sprints(new Map());
	}

	static ofSingle(sprint: Sprint): Sprints {
		return new Sprints(new Map([[sprint.id.value, sprint]]));
	}

	static fromArray(values: Sprint[]): Sprints {
		return new Sprints(new Map(values.map((m) => [m.id.value, m])));
	}

	static fromMap(values: Map<SprintId, Sprint>): Sprints {
		return new Sprints(
			new Map(
				Array.from(values.entries()).map(([sprintId, member]) => [
					sprintId.value,
					member,
				]),
			),
		);
	}

	add(sprint: Sprint): Sprints {
		if (this.containsById(sprint.id)) {
			throw new Error("Sprint already exists");
		}
		return new Sprints(new Map(this.values).set(sprint.id.value, sprint));
	}

	edit(sprint: Sprint): Sprints {
		if (!this.containsById(sprint.id)) {
			throw new Error("Sprint not found");
		}
		return new Sprints(new Map(this.values).set(sprint.id.value, sprint));
	}

	findById(sprintId: SprintId): O.Option<Sprint> {
		return O.fromNullable(this.values.get(sprintId.value));
	}

	containsById(sprintId: SprintId): boolean {
		return this.values.has(sprintId.value);
	}

	equals(other: Sprints): boolean {
		const values = this.toMap();
		if (values.size !== other.values.size) {
			return false;
		}
		for (const [key, value] of values) {
			const otherValue = this.values.get(key.value);
			if (otherValue === undefined || !value.equals(otherValue)) {
				return false;
			}
		}
		return true;
	}

	toArray(): Sprint[] {
		return Array.from(this.values.values());
	}

	toMap(): Map<SprintId, Sprint> {
		return new Map(
			Array.from(this.values.entries()).map(([key, value]) => [
				SprintId.of(key),
				value,
			]),
		);
	}

	toJSON(): Record<string, unknown> {
		return {
			values: this.toArray().map((m) => m.toJSON()),
		};
	}

	toString(): string {
		return `${Sprints.name}(${JSON.stringify(
			this.toArray().map((m) => m.toString()),
		)})`;
	}
}