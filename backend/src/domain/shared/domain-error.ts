export interface DomainError {
	readonly symbol: Symbol;
	readonly message: string;
	readonly detail: Record<string, unknown>;
}
