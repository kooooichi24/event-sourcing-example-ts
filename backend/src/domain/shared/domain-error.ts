export interface DomainError {
	readonly symbol: symbol;
	readonly message: string;
	readonly detail: Record<string, unknown>;
}
