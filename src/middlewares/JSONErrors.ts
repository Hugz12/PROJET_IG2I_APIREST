import { ErrorRequestHandler, Request, NextFunction, Response} from "express";
import { ErrorResponses } from "types/errorResponses";

export const jsonErrorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
        res.status(ErrorResponses.INVALID_BODY.statusCode).json({
            error: {
                internalCode: ErrorResponses.INVALID_BODY.internalCode,
                message: ErrorResponses.INVALID_BODY.message,
            }
        });
    } else {
        next(err);
    }
};