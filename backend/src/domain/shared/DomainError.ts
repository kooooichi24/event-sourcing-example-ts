export interface DomainErrorParams {
	message: string;
	cause?: Error;
	detail?: Record<string, unknown>;
}

export abstract class DomainError extends Error {
	readonly detail?: Record<string, unknown>;

	constructor(params: DomainErrorParams) {
		super(params.message);
		this.name = this.constructor.name;
		this.cause = params.cause;
		this.detail = params.detail;
	}
}
