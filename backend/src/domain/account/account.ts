import type { Aggregate } from "event-store-adapter-js";
import {
	AccountCreated,
	AccountCreatedTypeSymbol,
	type AccountEvent,
} from "./account-events";
import { AccountId, convertJSONToAccountId } from "./account-id";
import { type AccountName, convertJSONToAccountName } from "./account-name";

export type AccountRole = "Admin" | "Normal";

export const AccountTypeSymbol = Symbol("Account");

interface AccountParams {
	id: AccountId;
	name: AccountName;
	role: AccountRole;
	sequenceNumber: number;
	version: number;
}

export class Account implements Aggregate<Account, AccountId> {
	readonly symbol: typeof AccountTypeSymbol = AccountTypeSymbol;
	readonly typeName = "Account";

	readonly id: AccountId;
	readonly name: AccountName;
	readonly role: AccountRole;
	readonly sequenceNumber: number;
	readonly version: number;

	private constructor(params: AccountParams) {
		this.id = params.id;
		this.name = params.name;
		this.role = params.role;
		this.sequenceNumber = params.sequenceNumber;
		this.version = params.version;
	}

	static create(
		name: AccountName,
		role: AccountRole,
	): [Account, AccountCreated] {
		const id = AccountId.generate();
		const sequenceNumber = 1;
		const version = 1;

		return [
			new Account({ id, name, role, sequenceNumber, version }),
			AccountCreated.of(id, name, role, sequenceNumber),
		];
	}

	static of(params: AccountParams): Account {
		return new Account(params);
	}

	static replay(events: AccountEvent[], snapshot: Account): Account {
		return events.reduce(
			(project, event) => project.applyEvent(event),
			snapshot,
		);
	}

	private applyEvent(event: AccountEvent): Account {
		switch (event.symbol) {
			case AccountCreatedTypeSymbol:
				throw new Error("AccountCreated event should not be applied");
		}
	}

	withVersion(version: number): Account {
		return new Account({ ...this, version });
	}

	updateVersion(versionF: (value: number) => number): Account {
		return new Account({ ...this, version: versionF(this.version) });
	}

	equals(other: Account): boolean {
		return (
			this.id.equals(other.id) &&
			this.name.equals(other.name) &&
			this.role === other.role &&
			this.sequenceNumber === other.sequenceNumber &&
			this.version === other.version
		);
	}

	toJSON(): Record<string, unknown> {
		return {
			id: this.id.toJSON(),
			name: this.name.toJSON(),
			role: this.role,
			sequenceNumber: this.sequenceNumber,
			version: this.version,
		};
	}

	toString(): string {
		return `Account(${this.id.toString()}, ${this.name.toString()}, ${
			this.role
		}, ${this.sequenceNumber}, ${this.version})`;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToAccount(json: any): Account {
	const id = convertJSONToAccountId(json.data.id);
	const name = convertJSONToAccountName(json.data.name);
	return Account.of({
		id,
		name,
		role: json.data.role,
		sequenceNumber: json.data.sequenceNumber,
		version: json.data.version,
	});
}
