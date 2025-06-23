import { ErrorResponses } from "types/errorResponses";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ApiError, BodyError } from "types/apiError";


export async function bodyControl<T extends object>(
	dtoClass: new (...args: any[]) => T,
	body: object,
): Promise<T> {
	let instance;

	if (!body) {
		throw new ApiError(ErrorResponses.INVALID_BODY);
	}

	try {
		instance = plainToInstance(dtoClass, body);
	} catch {
		throw new ApiError(ErrorResponses.INVALID_BODY);
	}

	const errors = await validate(instance);

	if (errors.length > 0) {
		const fieldErrors = {
			errors: errors.map((err) => ({
				property: err.property,
				constraints: err.constraints,
			})),
		};
		throw new BodyError({
			message: ErrorResponses.INVALID_BODY.message,
			statusCode: ErrorResponses.INVALID_BODY.statusCode,
			internalCode: ErrorResponses.INVALID_BODY.internalCode,
			fieldErrors: fieldErrors.errors,
		});
	};

	return instance;
}
