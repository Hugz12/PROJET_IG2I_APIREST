import { Request, Response } from "express";
import { jsonErrorHandler } from "middlewares/json-errors";
import { ErrorResponses } from "types/errorResponses";

describe("JSON Error Middleware", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: jest.Mock;

	beforeEach(() => {
		// Reset mocks
		mockRequest = {};
		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		};
		nextFunction = jest.fn();
	});

	it("should handle JSON syntax errors correctly", () => {
		// Create a SyntaxError that would be thrown by Express JSON parser
		const syntaxError = new SyntaxError("Unexpected token in JSON");
		// Add the property that Express adds to identify it as a body parsing error
		(syntaxError as any).body = "{ \"malformed: \"json\" }";

		// Execute the middleware
		jsonErrorHandler(syntaxError, mockRequest as Request, mockResponse as Response, nextFunction);

		// Assertions
		expect(mockResponse.status).toHaveBeenCalledWith(ErrorResponses.INVALID_BODY.statusCode);
		expect(mockResponse.json).toHaveBeenCalledWith({
			error: {
				internalCode: ErrorResponses.INVALID_BODY.internalCode,
				message: ErrorResponses.INVALID_BODY.message
			}
		});
		expect(nextFunction).not.toHaveBeenCalled();
	});

	it("should pass non-JSON errors to the next middleware", () => {
		// Create a generic error
		const genericError = new Error("Some other error");

		// Execute the middleware
		jsonErrorHandler(genericError, mockRequest as Request, mockResponse as Response, nextFunction);

		// Assertions
		expect(nextFunction).toHaveBeenCalledWith(genericError);
		expect(mockResponse.status).not.toHaveBeenCalled();
		expect(mockResponse.json).not.toHaveBeenCalled();
	});

	it("should pass SyntaxErrors without body property to next middleware", () => {
		// Create a SyntaxError without the body property
		const syntaxError = new SyntaxError("Some other syntax error");

		// Execute the middleware
		jsonErrorHandler(syntaxError, mockRequest as Request, mockResponse as Response, nextFunction);

		// Assertions
		expect(nextFunction).toHaveBeenCalledWith(syntaxError);
		expect(mockResponse.status).not.toHaveBeenCalled();
		expect(mockResponse.json).not.toHaveBeenCalled();
	});
});
