import { faker } from "@faker-js/faker";
import { WorkspaceId } from "../workspace-id";
import { WorkspaceName } from "../workspace-name";
import { Workspace } from "../workspace";

describe("workspace", () => {
  it("Create", () => {
    // Given
    const id = WorkspaceId.generate();
    const name = WorkspaceName.of(faker.internet.userName());

    // When
    const [workspace, workspaceCreated] = Workspace.create(id, name);

    // Then
    expect(workspace.id).toEqual(id);
    expect(workspace.name).toEqual(name);

    expect(workspaceCreated.aggregateId).toEqual(id);
    expect(workspaceCreated.name).toEqual(name);
  });
});
