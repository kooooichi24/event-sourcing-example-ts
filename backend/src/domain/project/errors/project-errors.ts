import type { AccountId } from "../../account/account-id";
import type { DomainError } from "../../shared/domain-error";
import type { ProjectId } from "../project-id";
import type { SprintId } from "../sprint-id";

export class ProjectAlreadyDeletedError implements DomainError {
	readonly symbol = Symbol("ProjectAlreadyDeletedError");
	readonly message = "The project has already been deleted.";

	private constructor(readonly detail: { projectId: ProjectId }) {}

	static of(detail: { projectId: ProjectId }): ProjectAlreadyDeletedError {
		return new ProjectAlreadyDeletedError(detail);
	}
}

export class SprintNotExistError implements DomainError {
	readonly symbol = Symbol("SprintNotExistError");
	readonly message = "The sprint does not exist in the project.";

	private constructor(
		readonly detail: { projectId: ProjectId; sprintId: SprintId },
	) {}

	static of(detail: {
		projectId: ProjectId;
		sprintId: SprintId;
	}): SprintNotExistError {
		return new SprintNotExistError(detail);
	}
}

export class MemberNotFoundError implements DomainError {
	readonly symbol = Symbol("MemberNotFoundError");
	readonly message = "The member was not found.";

	private constructor(
		readonly detail: { projectId: ProjectId; accountId: AccountId },
	) {}

	static of(detail: {
		projectId: ProjectId;
		accountId: AccountId;
	}): MemberNotFoundError {
		return new MemberNotFoundError(detail);
	}
}
