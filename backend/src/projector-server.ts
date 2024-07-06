import type { DynamoDBStreamEvent, DynamoDBStreamHandler } from "aws-lambda";

export const handler: DynamoDBStreamHandler = async (
	event: DynamoDBStreamEvent,
) => {
	try {
		console.log("######################");
		console.log("projector is started!");
		console.log("######################");

		console.log({
			message: "DynamoDB Stream Event:",
			event: JSON.stringify(event, null, 2),
		});

		console.log("######################");
		console.log("projector is end!");
		console.log("######################");
	} catch (e: unknown) {
		console.error({ message: "Error processing DynamoDB Stream", error: e });
	}
};
