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