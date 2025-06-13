import { Request, NextFunction, Response} from "express";

export const headersHandler = (req: Request, res: Response, next: NextFunction) => {
    // Set security-related headers
    next();
}
