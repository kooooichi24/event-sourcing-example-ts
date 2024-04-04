import type dayjs from "dayjs";
import type { SprintGoal } from "./sprint-goal";
import { SprintId } from "./sprint-id";
import type { SprintName } from "./sprint-name";

type SprintState = "Future" | "Active" | "Done";

const SprintTypeSymbol = Symbol("Sprint");

interface SprintParams {
  id: SprintId;
  name: SprintName;
  goal: SprintGoal;
  state: SprintState;
  startDateTime: dayjs.Dayjs;
  endDateTime: dayjs.Dayjs;
}

export class Sprint {
  readonly symbol: typeof SprintTypeSymbol = SprintTypeSymbol;

  readonly id: SprintId;
  readonly name: SprintName;
  readonly goal: SprintGoal;
  readonly state: SprintState;
  readonly startDateTime: dayjs.Dayjs;
  readonly endDateTime: dayjs.Dayjs;

  private constructor(params: SprintParams) {
    if (params.startDateTime.isAfter(params.endDateTime)) {
      throw new Error("Sprint start date must be before end date.");
    }

    this.id = params.id;
    this.name = params.name;
    this.goal = params.goal;
    this.state = params.state;
    this.startDateTime = params.startDateTime;
    this.endDateTime = params.endDateTime;
  }

  static create(params: Omit<SprintParams, "id" | "state">): Sprint {
    return new Sprint({
      ...params,
      id: SprintId.generate(),
      state: "Future",
    });
  }

  static of(params: SprintParams): Sprint {
    return new Sprint(params);
  }

  withName(name: SprintName): Sprint {
    return new Sprint({ ...this, name });
  }

  withGoal(goal: SprintGoal): Sprint {
    return new Sprint({ ...this, goal });
  }

  isFuture(): boolean {
    return this.state === "Future";
  }

  isActive(): boolean {
    return this.state === "Active";
  }

  isDone(): boolean {
    return this.state === "Done";
  }

  withActive(): Sprint {
    if (this.state === "Active") {
      throw new Error("Cannot set state to Active for an Active sprint.");
    }

    if (this.state === "Done") {
      throw new Error("Cannot set state to Active for a Done sprint.");
    }

    return new Sprint({ ...this, state: "Active" });
  }

  withDone(): Sprint {
    if (this.state === "Future") {
      throw new Error("Cannot set state to Done for a Future sprint.");
    }

    if (this.state === "Done") {
      throw new Error("Cannot set state to Done for a Done sprint.");
    }

    return new Sprint({ ...this, state: "Done" });
  }

  withStartDateTime(startDateTime: dayjs.Dayjs): Sprint {
    return new Sprint({ ...this, startDateTime });
  }

  withEndDateTime(endDateTime: dayjs.Dayjs): Sprint {
    return new Sprint({ ...this, endDateTime });
  }

  equals(other: Sprint): boolean {
    return (
      this.id.equals(other.id) &&
      this.name.equals(other.name) &&
      this.goal.equals(other.goal) &&
      this.state === other.state &&
      this.startDateTime.isSame(other.startDateTime) &&
      this.endDateTime.isSame(other.endDateTime)
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toJSON(),
      name: this.name.toJSON(),
      goal: this.goal.toJSON(),
      state: this.state,
      startDateTime: this.startDateTime.toISOString(),
      endDateTime: this.endDateTime.toISOString(),
    };
  }

  toString(): string {
    return `${
      Sprint.name
    }(${this.id.toString()}, ${this.name.toString()}, ${this.goal.toString()}, ${
      this.state
    }, ${this.startDateTime.toString()}, ${this.endDateTime.toString()})`;
  }
}
