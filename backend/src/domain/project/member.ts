import { type AccountId, convertJSONToAccountId } from "../account/account-id";
import { type MemberId, convertJSONToMemberId } from "./member-id";

export type MemberRole = "Lead" | "Admin" | "Normal" | "Readonly";

const MemberTypeSymbol = Symbol("Member");

interface MemberParams {
	id: MemberId;
	accountId: AccountId;
	memberRole: MemberRole;
}

export class Member {
	readonly symbol: typeof MemberTypeSymbol = MemberTypeSymbol;

	readonly id: MemberId;
	readonly accountId: AccountId;
	readonly memberRole: MemberRole;

	private constructor(params: MemberParams) {
		this.id = params.id;
		this.accountId = params.accountId;
		this.memberRole = params.memberRole;
	}

	static of(params: MemberParams): Member {
		return new Member(params);
	}

	isLead(): boolean {
		return this.memberRole === "Lead";
	}

	isAdmin(): boolean {
		return this.memberRole === "Admin";
	}

	isNormal(): boolean {
		return this.memberRole === "Normal";
	}

	isReadonly(): boolean {
		return this.memberRole === "Readonly";
	}

	withRole(role: MemberRole): Member {
		return new Member({ ...this, memberRole: role });
	}

	equals(other: Member): boolean {
		return this.accountId.equals(other.accountId);
	}

	toJSON(): Record<string, unknown> {
		return {
			id: this.id.toJSON(),
			accountId: this.accountId.toJSON(),
			memberRole: this.memberRole,
		};
	}

	toString(): string {
		return `${
			Member.name
		}(${this.id.toString()}, ${this.accountId.toString()}, ${this.memberRole})`;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to match the type of the JSON object
export function convertJSONToMember(json: any): Member {
	const id = convertJSONToMemberId(json.id);
	const accountId = convertJSONToAccountId(json.accountId);

	return Member.of({
		id,
		accountId,
		memberRole: json.memberRole,
	});
}
