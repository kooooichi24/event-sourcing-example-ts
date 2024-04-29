import * as O from "fp-ts/lib/Option";
import type { Sprint } from "./sprint";
import type { SprintId } from "./sprint-id";

const SprintsTypeSymbol = Symbol("Sprints");

export class Sprints {
	readonly symbol: typeof SprintsTypeSymbol = SprintsTypeSymbol;

	private constructor(readonly values: Map<SprintId, Sprint>) {
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
		return new Sprints(new Map([[sprint.id, sprint]]));
	}

	static fromArray(values: Sprint[]): Sprints {
		return new Sprints(new Map(values.map((m) => [m.id, m])));
	}

	static fromMap(values: Map<SprintId, Sprint>): Sprints {
		return new Sprints(values);
	}

	add(sprint: Sprint): Sprints {
		if (this.containsById(sprint.id)) {
			throw new Error("Sprint already exists");
		}
		return new Sprints(new Map(this.values).set(sprint.id, sprint));
	}

	edit(sprint: Sprint): O.Option<[Sprints, Sprint]> {
		if (!this.containsById(sprint.id)) return O.none;

		const newMap = new Map(this.values);
		newMap.set(sprint.id, sprint);
		return O.some([new Sprints(newMap), sprint]);
	}

	start(sprintId: SprintId): O.Option<[Sprints, Sprint]> {
		const sprintOpt = this.findById(sprintId);
		if (O.isNone(sprintOpt)) return O.none;
		const sprint = sprintOpt.value;

		const newSprint = sprint.withActive();
		const newMap = new Map(this.values);
		newMap.set(sprintId, newSprint);
		return O.some([new Sprints(newMap), newSprint]);
	}

	done(sprintId: SprintId): O.Option<[Sprints, Sprint]> {
		const sprintOpt = this.findById(sprintId);
		if (O.isNone(sprintOpt)) return O.none;
		const sprint = sprintOpt.value;

		const newSprint = sprint.withDone();
		const newMap = new Map(this.values);
		newMap.set(sprintId, newSprint);
		return O.some([new Sprints(newMap), newSprint]);
	}

	findById(sprintId: SprintId): O.Option<Sprint> {
		return O.fromNullable(this.values.get(sprintId));
	}

	containsById(sprintId: SprintId): boolean {
		return this.values.has(sprintId);
	}

	equals(other: Sprints): boolean {
		const values = this.toMap();
		const otherValues = other.toMap();
		if (values.size !== otherValues.size) {
			return false;
		}
		for (const [key, value] of values) {
			const otherValue = otherValues.get(key);
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
		return this.values;
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
