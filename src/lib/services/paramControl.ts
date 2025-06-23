import { ErrorResponses } from "types/errorResponses";
import { ApiError } from "types/apiError";

export function paramControl(
	param: string
): number {

	if (!/^\d+$/.test(param)) {
		throw new ApiError(ErrorResponses.INVALID_PARAM);
	}

	const parsedParam = parseInt(param, 10);

	if (isNaN(parsedParam) || parsedParam <= 0) {
		throw new ApiError(ErrorResponses.INVALID_PARAM);
	}

	return parsedParam;
}
