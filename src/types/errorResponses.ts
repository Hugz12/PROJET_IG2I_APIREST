export const ErrorResponses = {
	BAD_REQUEST: {
		statusCode: 400,
		internalCode: "BAD_REQUEST",
		message: "The request was invalid or cannot be served.",
	},
	DUPLICATE_EMAIL: {
		statusCode: 409,
		internalCode: "DUPLICATE_EMAIL",
		message: "The email already exists.",
	},
	DUPLICATE_ENTRY: {
		statusCode: 409,
		internalCode: "DUPLICATE_ENTRY",
		message: "The resource already exists.",
	},
	SERVER_ERROR: {
		statusCode: 500,
		internalCode: "SERVER_ERROR",
		message: "An unexpected error occurred. Please try again later.",
	},
	INVALID_BODY: {
		statusCode: 400,
		internalCode: "INVALID_BODY",
		message: "The request body is invalid.",
	},
	INVALID_CREDENTIALS: {
		statusCode: 401,
		internalCode: "INVALID_CREDENTIALS",
		message: "Invalid username or password.",
	},
	INVALID_JSON: {
		statusCode: 400,
		internalCode: "INVALID_JSON",
		message: "The JSON payload is invalid.",
	},
	INVALID_PARAMS: {
		statusCode: 400,
		internalCode: "INVALID_PARAMS",
		message: "The request parameters are invalid.",
	},
	INVALID_TOKEN: {
		statusCode: 401,
		internalCode: "INVALID_TOKEN",
		message: "The token is missing or invalid.",
	},
	NOT_FOUND: {
		statusCode: 404,
		internalCode: "NOT_FOUND",
		message: "The requested resource was not found.",
	},
	UNAUTHORIZED: {
		statusCode: 401,
		internalCode: "UNAUTHORIZED",
		message: "You are not authorized to access this resource.",
	},
	ROUTE_NOT_FOUND: {
		statusCode: 404,
		internalCode: "ROUTE_NOT_FOUND",
		message: "The requested route does not exist.",
	},
	USER_NOT_FOUND: {
		statusCode: 404,
		internalCode: "USER_NOT_FOUND",
		message: "The user was not found.",
	},
	ACCOUNT_CREATION_FAILED: {
		statusCode: 500,
		internalCode: "ACCOUNT_CREATION_FAILED",
		message: "Failed to create the account. Please try again later.",
	},
	INVALID_ACCOUNT_ID: {
		statusCode: 400,
		internalCode: "INVALID_ACCOUNT_ID",
		message: "The account ID is invalid.",
	},
	CATEGORY_NOT_FOUND: {
		statusCode: 404,
		internalCode: "CATEGORY_NOT_FOUND",
		message: "The specified category was not found.",
	},
	INVALID_PARAM: {
		statusCode: 400,
		internalCode: "INVALID_PARAM",
		message: "The provided parameter is invalid.",
	},
};
    
