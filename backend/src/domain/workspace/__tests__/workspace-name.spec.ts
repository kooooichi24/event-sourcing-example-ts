import { faker } from "@faker-js/faker";
import { WorkspaceName } from "../workspace-name";

describe("workspace-name", () => {
	describe("of", () => {
		it("happy path", () => {
			// Given
			const value = faker.internet.userName();

			// When
			const workspaceName = WorkspaceName.of(value);

			// Then
			expect(workspaceName.value).toEqual(value);
		});

		it("should trim the value", () => {
			// Given
			const value = faker.internet.userName();

			// When
			const workspaceName = WorkspaceName.of(` ${value} `);

			// Then
			expect(workspaceName.value).toEqual(value);
		});
	});
});
