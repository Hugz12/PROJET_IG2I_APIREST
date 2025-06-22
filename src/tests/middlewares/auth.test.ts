import { Request, Response } from "express";
import { authHandler } from "middlewares/auth";
import * as jwtService from "lib/services/jwt";
import { ErrorResponses } from "types/errorResponses";

describe("Auth Middleware", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: jest.Mock;

	beforeEach(() => {
		// Reset mocks
		mockRequest = {};
		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
			locals: {}
		};
		nextFunction = jest.fn();
	});

	it("should call next() when a valid token is provided", () => {
		// Mock data
		const mockUser = { idUtilisateur: 1, login: "user@example.com" };
		mockRequest.headers = {
			authorization: "Bearer valid-token"
		};

		// Mock token verification
		jest.spyOn(jwtService, "verifyToken").mockReturnValue(mockUser);

		// Execute the middleware
		authHandler(mockRequest as Request, mockResponse as Response, nextFunction);

		// Assertions
		expect(jwtService.verifyToken).toHaveBeenCalledWith("valid-token");
		expect(mockResponse.locals!.user).toEqual(mockUser);
		expect(nextFunction).toHaveBeenCalled();
		expect(mockResponse.status).not.toHaveBeenCalled();
		expect(mockResponse.json).not.toHaveBeenCalled();
	});

	it("should return an error when no token is provided", () => {
		// Mock no authorization header
		mockRequest.headers = {};

		// Execute the middleware
		authHandler(mockRequest as Request, mockResponse as Response, nextFunction);

		// Assertions
		expect(mockResponse.status).toHaveBeenCalledWith(ErrorResponses.INVALID_TOKEN.statusCode);
		expect(mockResponse.json).toHaveBeenCalledWith({
			error: {
				internalCode: ErrorResponses.INVALID_TOKEN.internalCode,
				message: ErrorResponses.INVALID_TOKEN.message
			}
		});
		expect(nextFunction).not.toHaveBeenCalled();
	});

	it("should return an error when an invalid token is provided", () => {
		// Mock data with invalid token
		mockRequest.headers = {
			authorization: "Bearer invalid-token"
		};

		// Mock token verification to return null (invalid token)
		jest.spyOn(jwtService, "verifyToken").mockReturnValue(null);

		// Execute the middleware
		authHandler(mockRequest as Request, mockResponse as Response, nextFunction);

		// Assertions
		expect(jwtService.verifyToken).toHaveBeenCalledWith("invalid-token");
		expect(mockResponse.status).toHaveBeenCalledWith(ErrorResponses.INVALID_TOKEN.statusCode);
		expect(mockResponse.json).toHaveBeenCalledWith({
			error: {
				internalCode: ErrorResponses.INVALID_TOKEN.internalCode,
				message: ErrorResponses.INVALID_TOKEN.message
			}
		});
		expect(nextFunction).not.toHaveBeenCalled();
	});
});
