import { faker } from "@faker-js/faker";
import { WorkspaceName } from "../workspace-name";

describe("workspace-name", () => {
	describe("of", () => {
		it("happy path", () => {
			// Given
			const value = faker.internet.domainWord();

			// When
			const workspaceName = WorkspaceName.of(value);

			// Then
			expect(workspaceName.value).toEqual(value);
		});

		it("should throw an error when the value is empty", () => {
			// Given
			const value = "";

			// When
			const act = () => WorkspaceName.of(value);

			// Then
			expect(act).toThrow("WorkspaceName cannot be empty");
		});

		it("should throw an error when the value is longer than 20 characters", () => {
			// Given
			const value = faker.lorem.words(21);

			// When
			const act = () => WorkspaceName.of(value);

			// Then
			expect(act).toThrow("WorkspaceName cannot be longer than 20 characters");
		});

		it.each`
			invalidValue
			${"-domain"}
			${"domain-"}
		`(
			"should throw an error when the value is not a valid domain format: $invalidValue",
			({ invalidValue }) => {
				// Given
				const value = invalidValue;

				// When
				const act = () => WorkspaceName.of(value);

				// Then
				expect(act).toThrow("Invalid domain format");
			},
		);
	});
});
