import * as O from "fp-ts/lib/Option";
import type { AccountId } from "../account/account-id";
import { Member, type MemberRole, convertJSONToMember } from "./member";
import { MemberId } from "./member-id";

const MembersTypeSymbol = Symbol("Members");

export class Members {
	readonly symbol: typeof MembersTypeSymbol = MembersTypeSymbol;

	private constructor(readonly values: Map<AccountId, Member>) {
		if (values.size === 0) {
			throw new Error("Members must not be empty");
		}

		// Ensure that there is only one lead
		const leadCount = Array.from(values.values()).filter((member) =>
			member.isLead(),
		).length;
		if (leadCount !== 1) {
			throw new Error("Members must have exactly one lead");
		}
	}

	static ofSingle(accountId: AccountId): Members {
		return new Members(
			new Map([
				[
					accountId,
					Member.of({
						id: MemberId.generate(),
						accountId,
						memberRole: "Lead",
					}),
				],
			]),
		);
	}

	static fromMap(values: Map<AccountId, Member>): Members {
		return new Members(values);
	}

	static fromArray(values: Member[]): Members {
		return new Members(new Map(values.map((m) => [m.accountId, m])));
	}

	addMember(member: Member): Members {
		return new Members(new Map(this.values).set(member.accountId, member));
	}

	removeMemberByAccountId(accountId: AccountId): O.Option<[Members, Member]> {
		const member = this.values.get(accountId);
		if (member === undefined) return O.none;

		const newMap = new Map(this.values);
		newMap.delete(accountId);
		return O.some([new Members(newMap), member]);
	}

	changeRole(
		accountId: AccountId,
		role: MemberRole,
	): O.Option<[Members, Member]> {
		const member = this.values.get(accountId);
		if (member === undefined) return O.none;

		const newMember = member.withRole(role);
		return O.some([
			new Members(new Map(this.values).set(accountId, newMember)),
			newMember,
		]);
	}

	findById(memberId: MemberId): O.Option<Member> {
		return O.fromNullable(
			Array.from(this.values.values()).find((m) => m.id.equals(memberId)),
		);
	}

	findByAccountId(accountId: AccountId): O.Option<Member> {
		return O.fromNullable(this.values.get(accountId));
	}

	containsByAccountId(accountId: AccountId): boolean {
		return this.values.has(accountId);
	}

	isLead(accountId: AccountId): boolean {
		const member = this.values.get(accountId);
		return member?.isLead() ?? false;
	}

	isAdmin(accountId: AccountId): boolean {
		const member = this.values.get(accountId);
		return member?.isAdmin() ?? false;
	}

	isNormal(accountId: AccountId): boolean {
		const member = this.values.get(accountId);
		return member?.isNormal() ?? false;
	}

	isReadonly(accountId: AccountId): boolean {
		const member = this.values.get(accountId);
		return member?.isReadonly() ?? false;
	}

	equals(other: Members): boolean {
		const values = this.toMap();
		const otherValues = other.toMap();
		if (values.size !== otherValues.size) {
			return false;
		}
		for (const [key, value] of values) {
			const otherValue = otherValues.get(key);
			if (otherValue === undefined || !value.equals(otherValue)) {
				return false;
			}
		}
		return true;
	}

	toArray(): Member[] {
		return Array.from(this.values.values());
	}

	toMap(): Map<AccountId, Member> {
		return this.values;
	}

	toJSON(): Record<string, unknown> {
		return {
			values: this.toArray().map((m) => m.toJSON()),
		};
	}

	toString(): string {
		return `${Members.name}(${JSON.stringify(
			this.toArray().map((m) => m.toString()),
		)})`;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToMembers(json: any): Members {
	// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
	return Members.fromArray(json.values.map((v: any) => convertJSONToMember(v)));
}
