export interface DomainError {
	type: string;
	message: string;
	detail: Record<string, unknown>;
}
