import type { Event } from "event-store-adapter-js";
import { v4 as uuidv4 } from "uuid";
import type { AccountRole } from "./account";
import { type AccountId, convertJSONToAccountId } from "./account-id";
import { type AccountName, convertJSONToAccountName } from "./account-name";

type AccountEventTypeSymbol = typeof AccountCreatedTypeSymbol;

export interface AccountEvent extends Event<AccountId> {
	symbol: AccountEventTypeSymbol;
	toString: () => string;
}

/**
 * AccountCreated
 */
export const AccountCreatedTypeSymbol = Symbol("AccountCreated");

export class AccountCreated implements AccountEvent {
	readonly symbol: typeof AccountCreatedTypeSymbol = AccountCreatedTypeSymbol;
	readonly typeName = "AccountCreated";
	readonly isCreated = true;

	private constructor(
		public readonly id: string,
		public readonly aggregateId: AccountId,
		public readonly name: AccountName,
		public readonly role: AccountRole,
		public readonly sequenceNumber: number,
		public readonly occurredAt: Date,
	) {}

	toString() {
		return `AccountCreated(${this.id.toString()}, ${this.aggregateId.toString()}, ${this.name.toString()}, ${this.role.toString()}, ${
			this.sequenceNumber
		}, ${this.occurredAt.toISOString()})`;
	}

	static of(
		aggregateId: AccountId,
		name: AccountName,
		role: AccountRole,
		sequenceNumber: number,
	): AccountCreated {
		return new AccountCreated(
			uuidv4(),
			aggregateId,
			name,
			role,
			sequenceNumber,
			new Date(),
		);
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToAccountEvent(json: any): AccountEvent {
	const id = convertJSONToAccountId(json.data.aggregateId);
	switch (json.type) {
		case "AccountCreated": {
			const name = convertJSONToAccountName(json.data.name);
			return AccountCreated.of(
				id,
				name,
				json.data.role,
				json.data.sequenceNumber,
			);
		}
		default:
			throw new Error(`Unknown type: ${json.type}`);
	}
}
