import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { faker } from "@faker-js/faker";
import { type EventStore, EventStoreFactory } from "event-store-adapter-js";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import {
	Account,
	convertJSONToAccount,
} from "../../../../domain/account/account";
import {
	type AccountEvent,
	convertJSONToAccountEvent,
} from "../../../../domain/account/account-events";
import type { AccountId } from "../../../../domain/account/account-id";
import { AccountName } from "../../../../domain/account/account-name";
import { AccountRepository } from "../account-repository";

describe("AccountRepository", () => {
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

	describe("store", () => {
		it("happy path", async () => {
			// Arrange
			const name = AccountName.of(faker.internet.domainWord());
			const [account, accountCreated] = Account.create(name, "Normal");

			// Act
			const target = AccountRepository.of(eventStore);
			await target.store(accountCreated, account)();

			// Assert
			const actualEither = await target.findById(account.id)();
			if (E.isLeft(actualEither)) throw new Error(actualEither.left.message);
			const actualOption = actualEither.right;
			if (O.isNone(actualOption)) throw new Error("Account not found");
			const actual = actualOption.value;
			expect(actual).toStrictEqual(account);
		});
	});

	describe.skip("findById", () => {});
});
