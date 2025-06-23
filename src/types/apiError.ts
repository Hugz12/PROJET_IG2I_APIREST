export class ApiError extends Error {
	statusCode: number;
	internalCode: string;
	constructor({ message, statusCode, internalCode }: { message: string; statusCode: number; internalCode: string }) {
    	super(message);
    	this.statusCode = statusCode;
    	this.internalCode = internalCode;
    	this.name = this.constructor.name;
    	Error.captureStackTrace(this, this.constructor);
	}
}

export class BodyError extends ApiError {
	fieldErrors: any[];
	constructor({ message, statusCode, internalCode, fieldErrors }: { message: string; statusCode: number; internalCode: string; fieldErrors: any[] }) {
    	super({ message, statusCode, internalCode });
    	this.fieldErrors = fieldErrors;
    	this.name = this.constructor.name;
    	Error.captureStackTrace(this, this.constructor);
	}
}
