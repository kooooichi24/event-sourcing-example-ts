import { ApolloServer } from "@apollo/server";
import {
	handlers,
	startServerAndCreateLambdaHandler,
} from "@as-integrations/aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { type EventStore, EventStoreFactory } from "event-store-adapter-js";
import {
	Account,
	type AccountRole,
	convertJSONToAccount,
} from "./command/domain/account/account";
import {
	type AccountEvent,
	convertJSONToAccountEvent,
} from "./command/domain/account/account-events";
import type { AccountId } from "./command/domain/account/account-id";
import { AccountName } from "./command/domain/account/account-name";
import { AccountRepository } from "./command/interface-adapter/repository/account/account-repository";

const JOURNAL_TABLE_NAME = "journal";
const SNAPSHOT_TABLE_NAME = "snapshot";
const JOURNAL_AID_INDEX_NAME = "journal-aid-index";
const SNAPSHOTS_AID_INDEX_NAME = "snapshots-aid-index";

const dynamodbClient = new DynamoDBClient({
	region: "ap-northeast-1",
	endpoint: "http://127.0.0.1:18000",
	credentials: {
		accessKeyId: "dummy",
		secretAccessKey: "dummy",
	},
});
const eventStore: EventStore<AccountId, Account, AccountEvent> =
	EventStoreFactory.ofDynamoDB<AccountId, Account, AccountEvent>(
		dynamodbClient,
		JOURNAL_TABLE_NAME,
		SNAPSHOT_TABLE_NAME,
		JOURNAL_AID_INDEX_NAME,
		SNAPSHOTS_AID_INDEX_NAME,
		32,
		convertJSONToAccountEvent,
		convertJSONToAccount,
	);
const accountRepository = AccountRepository.of(eventStore).withRetention(10);

// The GraphQL schema
const typeDefs = `#graphql
  type Query {
    hello: String
  }
	type Mutation {
    createAccount(name: String, role: String): String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
	Query: {
		hello: () => "world",
	},
	Mutation: {
		createAccount: async (
			_: unknown,
			{ name, role }: { name: string; role: AccountRole },
		) => {
			const [account, accountEvent] = Account.create(
				AccountName.of(name),
				role,
			);
			const result = await accountRepository.store(accountEvent, account)();
			return result.toString();
		},
	},
};

// Set up Apollo Server
const server = new ApolloServer({
	typeDefs,
	resolvers,
});

// This final export is important!
export const graphqlHandler = startServerAndCreateLambdaHandler(
	server,
	// We will be using the Proxy V2 handler
	handlers.createAPIGatewayProxyEventV2RequestHandler(),
);
