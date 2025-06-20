import { Request, Response, NextFunction } from "express";
import { TokenPayload, verifyToken } from "lib/services/jwt";
import { ErrorResponses } from "types/errorResponses";

export function authHandler(req: Request, res: Response, next: NextFunction): void {
    // Check token presence
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        res.status(ErrorResponses.INVALID_TOKEN.statusCode).json({
            error: {
                internalCode: ErrorResponses.INVALID_TOKEN.internalCode,
                message: ErrorResponses.INVALID_TOKEN.message
            }
        });
        return;
    }

    // Check token validity
    const decoded = verifyToken(token) as TokenPayload | null;
    if (!decoded) {
        res.status(ErrorResponses.INVALID_TOKEN.statusCode).json({
            error: {
                internalCode: ErrorResponses.INVALID_TOKEN.internalCode,
                message: ErrorResponses.INVALID_TOKEN.message
            }
        });
        return;
    }

    res.locals.user = decoded;
    next();
}
