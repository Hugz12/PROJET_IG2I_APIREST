import { Request, Response } from 'express';
import { notFoundHandler } from 'middlewares/not-found';
import { ErrorResponses } from 'types/errorResponses';

describe('Not Found Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        // Reset mocks
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('should return 404 status with correct error format', () => {
        // Execute the middleware
        notFoundHandler(mockRequest as Request, mockResponse as Response);

        // Assertions
        expect(mockResponse.status).toHaveBeenCalledWith(ErrorResponses.ROUTE_NOT_FOUND.statusCode);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: {
                internalCode: ErrorResponses.ROUTE_NOT_FOUND.internalCode,
                message: ErrorResponses.ROUTE_NOT_FOUND.message
            }
        });
    });
});
