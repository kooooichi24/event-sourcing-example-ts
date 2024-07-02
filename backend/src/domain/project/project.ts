import type { Aggregate } from "event-store-adapter-js";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import type { AccountId } from "../account/account-id";
import {
	MemberNotFoundError,
	ProjectAlreadyDeletedError,
	SprintNotFoundError,
} from "./errors/project-errors";
import {
	ProjectCreated,
	ProjectCreatedTypeSymbol,
	ProjectDeleted,
	ProjectDeletedTypeSymbol,
	type ProjectEvent,
	ProjectMemberAdded,
	ProjectMemberAddedTypeSymbol,
	ProjectMemberRemoved,
	ProjectMemberRemovedTypeSymbol,
	ProjectMemberRoleChanged,
	ProjectMemberRoleChangedTypeSymbol,
	ProjectSprintAdded,
	ProjectSprintAddedTypeSymbol,
	ProjectSprintCompleted,
	ProjectSprintCompletedTypeSymbol,
	ProjectSprintEdited,
	ProjectSprintEditedTypeSymbol,
	ProjectSprintStarted,
	ProjectSprintStartedTypeSymbol,
} from "./events/project-events";
import type { Member, MemberRole } from "./member";
import { Members, convertJSONToMembers } from "./members";
import { ProjectId, convertJSONToProjectId } from "./project-id";
import { type ProjectName, convertJSONToProjectName } from "./project-name";
import type { Sprint } from "./sprint";
import type { SprintId } from "./sprint-id";
import { Sprints, convertJSONToSprints } from "./sprints";

export const ProjectTypeSymbol = Symbol("Project");

interface ProjectParams {
	id: ProjectId;
	name: ProjectName;
	members: Members;
	sprints: Sprints;
	deleted: boolean;
	sequenceNumber: number;
	version: number;
}

export class Project implements Aggregate<Project, ProjectId> {
	readonly symbol: typeof ProjectTypeSymbol = ProjectTypeSymbol;
	readonly typeName = "Project";

	readonly id: ProjectId;
	readonly name: ProjectName;
	readonly members: Members;
	readonly sprints: Sprints;
	readonly deleted: boolean;
	readonly sequenceNumber: number;
	readonly version: number;

	private constructor(params: ProjectParams) {
		this.id = params.id;
		this.name = params.name;
		this.members = params.members;
		this.sprints = params.sprints;
		this.deleted = params.deleted;
		this.sequenceNumber = params.sequenceNumber;
		this.version = params.version;
	}

	static create(
		executorId: AccountId,
		name: ProjectName,
	): [Project, ProjectCreated] {
		const id = ProjectId.generate();
		const members = Members.ofSingle(executorId);
		const sprints = Sprints.ofEmpty();
		const deleted = false;
		const sequenceNumber = 1;
		const version = 1;

		return [
			new Project({
				id,
				name,
				members,
				sprints,
				deleted,
				sequenceNumber,
				version,
			}),
			ProjectCreated.of(id, name, members, sequenceNumber),
		];
	}

	static of(params: ProjectParams): Project {
		return new Project(params);
	}

	static replay(events: ProjectEvent[], snapshot: Project): Project {
		return events.reduce(
			(project, event) => project.applyEvent(event),
			snapshot,
		);
	}

	delete(): E.Either<ProjectAlreadyDeletedError, [Project, ProjectDeleted]> {
		if (this.deleted) {
			return E.left(ProjectAlreadyDeletedError.of({ projectId: this.id }));
		}
		const newSequenceNumber = this.sequenceNumber + 1;
		const newProject = new Project({
			...this,
			deleted: true,
			sequenceNumber: newSequenceNumber,
		});
		const event = ProjectDeleted.of(this.id, newSequenceNumber);
		return E.right([newProject, event]);
	}

	addSprint(
		sprint: Sprint,
	): E.Either<ProjectAlreadyDeletedError, [Project, ProjectSprintAdded]> {
		if (this.deleted) {
			return E.left(ProjectAlreadyDeletedError.of({ projectId: this.id }));
		}
		const newSprints = this.sprints.add(sprint);
		const newSequenceNumber = this.sequenceNumber + 1;
		const newProject = new Project({
			...this,
			sprints: newSprints,
			sequenceNumber: newSequenceNumber,
		});
		const event = ProjectSprintAdded.of(this.id, sprint, newSequenceNumber);
		return E.right([newProject, event]);
	}

	editSprint(
		sprint: Sprint,
	): E.Either<
		ProjectAlreadyDeletedError | SprintNotFoundError,
		[Project, ProjectSprintEdited]
	> {
		if (this.deleted) {
			return E.left(ProjectAlreadyDeletedError.of({ projectId: this.id }));
		}

		return pipe(
			this.sprints.edit(sprint),
			O.fold(
				() =>
					E.left(
						SprintNotFoundError.of({ projectId: this.id, sprintId: sprint.id }),
					),
				([newSprints, _editedSprint]) => {
					const newSequenceNumber = this.sequenceNumber + 1;
					const newProject = new Project({
						...this,
						sprints: newSprints,
						sequenceNumber: newSequenceNumber,
					});
					const event = ProjectSprintEdited.of(
						this.id,
						sprint,
						newSequenceNumber,
					);
					return E.right([newProject, event]);
				},
			),
		);
	}

	startSprint(
		sprintId: SprintId,
	): E.Either<
		ProjectAlreadyDeletedError | SprintNotFoundError,
		[Project, ProjectSprintStarted]
	> {
		if (this.deleted) {
			return E.left(ProjectAlreadyDeletedError.of({ projectId: this.id }));
		}

		return pipe(
			this.sprints.start(sprintId),
			O.fold(
				() => E.left(SprintNotFoundError.of({ projectId: this.id, sprintId })),
				([newSprints, _startedSprint]) => {
					const newSequenceNumber = this.sequenceNumber + 1;
					const newProject = new Project({
						...this,
						sprints: newSprints,
						sequenceNumber: newSequenceNumber,
					});
					const event = ProjectSprintStarted.of(
						this.id,
						sprintId,
						newSequenceNumber,
					);
					return E.right([newProject, event]);
				},
			),
		);
	}

	completeSprint(
		sprintId: SprintId,
	): E.Either<
		ProjectAlreadyDeletedError | SprintNotFoundError,
		[Project, ProjectSprintCompleted]
	> {
		if (this.deleted) {
			return E.left(ProjectAlreadyDeletedError.of({ projectId: this.id }));
		}

		return pipe(
			this.sprints.done(sprintId),
			O.fold(
				() => E.left(SprintNotFoundError.of({ projectId: this.id, sprintId })),
				([newSprints, _completedSprint]) => {
					const newSequenceNumber = this.sequenceNumber + 1;
					const newProject = new Project({
						...this,
						sprints: newSprints,
						sequenceNumber: newSequenceNumber,
					});
					const event = ProjectSprintCompleted.of(
						this.id,
						sprintId,
						newSequenceNumber,
					);
					return E.right([newProject, event]);
				},
			),
		);
	}

	addMember(
		member: Member,
	): E.Either<ProjectAlreadyDeletedError, [Project, ProjectMemberAdded]> {
		if (this.deleted) {
			return E.left(ProjectAlreadyDeletedError.of({ projectId: this.id }));
		}
		const newMembers = this.members.addMember(member);
		const newSequenceNumber = this.sequenceNumber + 1;
		const newProject = new Project({
			...this,
			members: newMembers,
			sequenceNumber: newSequenceNumber,
		});
		const event = ProjectMemberAdded.of(this.id, member, newSequenceNumber);
		return E.right([newProject, event]);
	}

	removeMember(
		accountId: AccountId,
	): E.Either<
		ProjectAlreadyDeletedError | MemberNotFoundError,
		[Project, ProjectMemberRemoved]
	> {
		if (this.deleted) {
			return E.left(ProjectAlreadyDeletedError.of({ projectId: this.id }));
		}
		if (!this.members.containsByAccountId(accountId)) {
			return E.left(MemberNotFoundError.of({ projectId: this.id, accountId }));
		}

		const newMembersOpt = this.members.removeMemberByAccountId(accountId);
		if (O.isNone(newMembersOpt)) {
			return E.left(MemberNotFoundError.of({ projectId: this.id, accountId }));
		}
		const [newMembers, _removedMember] = newMembersOpt.value;

		const newSequenceNumber = this.sequenceNumber + 1;
		const newProject = new Project({
			...this,
			members: newMembers,
			sequenceNumber: newSequenceNumber,
		});
		const event = ProjectMemberRemoved.of(
			this.id,
			accountId,
			newSequenceNumber,
		);
		return E.right([newProject, event]);
	}

	changeMemberRole(
		accountId: AccountId,
		memberRole: MemberRole,
	): E.Either<
		ProjectAlreadyDeletedError | MemberNotFoundError,
		[Project, ProjectMemberRoleChanged]
	> {
		if (this.deleted) {
			return E.left(ProjectAlreadyDeletedError.of({ projectId: this.id }));
		}
		if (!this.members.containsByAccountId(accountId)) {
			return E.left(MemberNotFoundError.of({ projectId: this.id, accountId }));
		}

		const newMembersOpt = this.members.changeRole(accountId, memberRole);
		if (O.isNone(newMembersOpt)) {
			return E.left(MemberNotFoundError.of({ projectId: this.id, accountId }));
		}

		const [newMembers, _changedMember] = newMembersOpt.value;
		const newSequenceNumber = this.sequenceNumber + 1;
		const newProject = new Project({
			...this,
			members: newMembers,
			sequenceNumber: newSequenceNumber,
		});
		const event = ProjectMemberRoleChanged.of(
			this.id,
			accountId,
			memberRole,
			newSequenceNumber,
		);
		return E.right([newProject, event]);
	}

	private applyEvent(event: ProjectEvent): Project {
		switch (event.symbol) {
			case ProjectDeletedTypeSymbol: {
				const result = this.delete();
				if (E.isLeft(result)) {
					throw new Error(result.left.message);
				}
				return result.right[0];
			}
			case ProjectSprintAddedTypeSymbol: {
				const typedEvent = event as ProjectSprintAdded;
				const result = this.addSprint(typedEvent.sprint);
				if (E.isLeft(result)) {
					throw new Error(result.left.message);
				}
				return result.right[0];
			}
			case ProjectMemberAddedTypeSymbol: {
				const typedEvent = event as ProjectMemberAdded;
				const result = this.addMember(typedEvent.member);
				if (E.isLeft(result)) {
					throw new Error(result.left.message);
				}
				return result.right[0];
			}
			case ProjectSprintEditedTypeSymbol: {
				const typedEvent = event as ProjectSprintEdited;
				const result = this.editSprint(typedEvent.sprint);
				if (E.isLeft(result)) {
					throw new Error(result.left.message);
				}
				return result.right[0];
			}
			case ProjectSprintStartedTypeSymbol: {
				const typedEvent = event as ProjectSprintStarted;
				const result = this.startSprint(typedEvent.sprintId);
				if (E.isLeft(result)) {
					throw new Error(result.left.message);
				}
				return result.right[0];
			}
			case ProjectSprintCompletedTypeSymbol: {
				const typedEvent = event as ProjectSprintCompleted;
				const result = this.completeSprint(typedEvent.sprintId);
				if (E.isLeft(result)) {
					throw new Error(result.left.message);
				}
				return result.right[0];
			}
			case ProjectMemberRemovedTypeSymbol: {
				const typedEvent = event as ProjectMemberRemoved;
				const result = this.removeMember(typedEvent.accountId);
				if (E.isLeft(result)) {
					throw new Error(result.left.message);
				}
				return result.right[0];
			}
			case ProjectMemberRoleChangedTypeSymbol: {
				const typedEvent = event as ProjectMemberRoleChanged;
				const result = this.changeMemberRole(
					typedEvent.accountId,
					typedEvent.memberRole,
				);
				if (E.isLeft(result)) {
					throw new Error(result.left.message);
				}
				return result.right[0];
			}
			case ProjectCreatedTypeSymbol: {
				throw new Error("ProjectCreated event should not be applied");
			}
		}
	}

	withVersion(version: number): Project {
		return new Project({ ...this, version });
	}

	updateVersion(versionF: (value: number) => number): Project {
		return new Project({ ...this, version: versionF(this.version) });
	}

	equals(other: Project): boolean {
		return (
			this.id.equals(other.id) &&
			this.name.equals(other.name) &&
			this.members.equals(other.members) &&
			this.sprints.equals(other.sprints) &&
			this.deleted === other.deleted &&
			this.sequenceNumber === other.sequenceNumber &&
			this.version === other.version
		);
	}

	toJSON(): Record<string, unknown> {
		return {
			id: this.id.toJSON(),
			name: this.name.toJSON(),
			members: this.members.toJSON(),
			sprints: this.sprints.toJSON(),
			deleted: this.deleted,
			sequenceNumber: this.sequenceNumber,
			version: this.version,
		};
	}

	toString(): string {
		return `${Project.name}(${this.id.toString()}, ${
			this.deleted
		}, ${this.name.toString()}, ${this.members.toString()}, ${this.sprints.toString()}, ${
			this.sequenceNumber
		}, ${this.version})`;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToProject(json: any): Project {
	const id = convertJSONToProjectId(json.data.id);
	const name = convertJSONToProjectName(json.data.name);
	const members = convertJSONToMembers(json.data.members);
	const sprints = convertJSONToSprints(json.data.sprints);

	return Project.of({
		id,
		name,
		members,
		sprints,
		deleted: json.data.deleted,
		sequenceNumber: json.data.sequenceNumber,
		version: json.data.version,
	});
}
