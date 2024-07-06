import type { DynamoDBStreamEvent, DynamoDBStreamHandler } from "aws-lambda";

export const handler: DynamoDBStreamHandler = async (
  event: DynamoDBStreamEvent
) => {
  console.log("######################");
  console.log("projector is started!");
  console.log("######################");

  console.log("DynamoDB Stream Event:", JSON.stringify(event, null, 2));

  console.log("######################");
  console.log("projector is end!");
  console.log("######################");
};
