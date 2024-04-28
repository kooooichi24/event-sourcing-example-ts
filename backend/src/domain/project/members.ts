import * as O from "fp-ts/lib/Option";
import { AccountId } from "../account/account-id";
import { Member, type MemberRole } from "./member";
import { MemberId } from "./member-id";

const MembersTypeSymbol = Symbol("Members");

export class Members {
	readonly symbol: typeof MembersTypeSymbol = MembersTypeSymbol;

	private constructor(readonly values: Map<string, Member>) {
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
					accountId.value,
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
		return new Members(
			new Map(
				Array.from(values.entries()).map(([accountId, member]) => [
					accountId.value,
					member,
				]),
			),
		);
	}

	static fromArray(values: Member[]): Members {
		return new Members(new Map(values.map((m) => [m.accountId.value, m])));
	}

	addMember(member: Member): Members {
		return new Members(
			new Map(this.values).set(member.accountId.value, member),
		);
	}

	removeMemberByAccountId(accountId: AccountId): O.Option<[Members, Member]> {
		const member = this.values.get(accountId.value);
		if (member === undefined) return O.none;

		const newMap = new Map(this.values);
		newMap.delete(accountId.value);
		return O.some([new Members(newMap), member]);
	}

	changeRole(
		accountId: AccountId,
		role: MemberRole,
	): O.Option<[Members, Member]> {
		const member = this.values.get(accountId.value);
		if (member === undefined) return O.none;

		const newMember = member.withRole(role);
		return O.some([
			new Members(new Map(this.values).set(accountId.value, newMember)),
			newMember,
		]);
	}

	findById(memberId: MemberId): O.Option<Member> {
		return O.fromNullable(
			Array.from(this.values.values()).find((m) => m.id.equals(memberId)),
		);
	}

	findByAccountId(accountId: AccountId): O.Option<Member> {
		return O.fromNullable(this.values.get(accountId.value));
	}

	containsByAccountId(accountId: AccountId): boolean {
		return this.values.has(accountId.value);
	}

	isLead(accountId: AccountId): boolean {
		const member = this.values.get(accountId.value);
		return member?.isLead() ?? false;
	}

	isAdmin(accountId: AccountId): boolean {
		const member = this.values.get(accountId.value);
		return member?.isAdmin() ?? false;
	}

	isNormal(accountId: AccountId): boolean {
		const member = this.values.get(accountId.value);
		return member?.isNormal() ?? false;
	}

	isReadonly(accountId: AccountId): boolean {
		const member = this.values.get(accountId.value);
		return member?.isReadonly() ?? false;
	}

	equals(other: Members): boolean {
		const values = this.toMap();
		if (values.size !== other.values.size) {
			return false;
		}
		for (const [key, value] of values) {
			const otherValue = this.values.get(key.value);
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
		return new Map(
			Array.from(this.values.entries()).map(([key, value]) => [
				AccountId.of(key),
				value,
			]),
		);
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
