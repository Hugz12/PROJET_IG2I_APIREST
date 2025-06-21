import { Request, Response, NextFunction } from 'express';
import { errorHandler } from 'middlewares/errors';
import { ApiError, BodyError } from 'types/apiError';
import { ErrorResponses } from 'types/errorResponses';

describe('Error Handler Middleware', () => {
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

    it('should handle ApiError correctly', () => {
        // Create a sample ApiError
        const apiError = new ApiError({
            message: 'Test error message',
            statusCode: 400,
            internalCode: 'TEST_ERROR'
        });

        // Execute the middleware
        errorHandler(apiError, mockRequest as Request, mockResponse as Response, nextFunction);

        // Assertions
        expect(mockResponse.status).toHaveBeenCalledWith(apiError.statusCode);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: {
                internalCode: apiError.internalCode,
                message: apiError.message
            }
        });
    });

    it('should handle BodyError correctly with field errors', () => {
        // Create field errors
        const fieldErrors = [
            { property: 'email', constraints: { isEmail: 'Invalid email format' } },
            { property: 'password', constraints: { minLength: 'Password is too short' } }
        ];

        // Create a sample BodyError
        const bodyError = new BodyError({
            message: 'Validation failed',
            statusCode: 400,
            internalCode: 'VALIDATION_ERROR',
            fieldErrors: fieldErrors
        });

        // Execute the middleware
        errorHandler(bodyError, mockRequest as Request, mockResponse as Response, nextFunction);

        // Assertions
        expect(mockResponse.status).toHaveBeenCalledWith(bodyError.statusCode);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: {
                internalCode: bodyError.internalCode,
                message: bodyError.message,
                fieldErrors: bodyError.fieldErrors
            }
        });
    });

    it('should handle unknown errors as server errors', () => {
        // Create a generic Error
        const genericError = new Error('Something went wrong');

        // Execute the middleware
        errorHandler(genericError, mockRequest as Request, mockResponse as Response, nextFunction);

        // Assertions
        expect(mockResponse.status).toHaveBeenCalledWith(ErrorResponses.SERVER_ERROR.statusCode);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: {
                internalCode: ErrorResponses.SERVER_ERROR.internalCode,
                message: ErrorResponses.SERVER_ERROR.message
            }
        });
    });
});
