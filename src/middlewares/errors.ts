import { ErrorRequestHandler, Request, Response } from "express";
import { ApiError, BodyError } from "types/apiError";
import { ErrorResponses } from "types/errorResponses";

export const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response) => {
    if (err instanceof BodyError) {
        res.status(err.statusCode).json({
            error: {
                internalCode: err.internalCode,
                message: err.message,
                fieldErrors: err.fieldErrors,
            }
        });
    } else if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            error: {
                internalCode: err.internalCode,
                message: err.message,
            }
        });
    } else {
        console.error("Unexpected error:", err);
        res.status(ErrorResponses.SERVER_ERROR.statusCode).json({
            error: {
                internalCode: ErrorResponses.SERVER_ERROR.internalCode,
                message: ErrorResponses.SERVER_ERROR.message,
            }
        });
    }
};
