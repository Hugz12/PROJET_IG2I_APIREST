import { Request, Response } from "express";
import { ErrorResponses } from "types/errorResponses";

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(ErrorResponses.ROUTE_NOT_FOUND.statusCode).json({
        error: {
            internalCode: ErrorResponses.ROUTE_NOT_FOUND.internalCode,
            message: ErrorResponses.ROUTE_NOT_FOUND.message,
        }
    });
};
