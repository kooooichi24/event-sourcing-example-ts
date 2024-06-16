import type { DomainError } from "../../shared/domain-error";
import type { ProjectId } from "../project-id";
import type { SprintId } from "../sprint-id";

export interface SprintNotExistError extends DomainError {
	type: "SprintNotExistError";
	detail: { projectId: ProjectId; sprintId: SprintId };
}
export const genSprintNotExistError = (detail: {
	projectId: ProjectId;
	sprintId: SprintId;
}): SprintNotExistError => ({
	type: "SprintNotExistError",
	message: "The sprint does not exist in the project.",
	detail,
});
