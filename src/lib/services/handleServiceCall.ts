import { ErrorResponses } from 'types/errorResponses';
import { ApiError } from 'types/apiError';
import { Response } from 'express';

export async function handleServiceCall<T>(
    res: Response,
    serviceFn: () => Promise<T>,
    successResponse: { statusCode: number; internalCode: string; message: string },
    mapData: (result: T) => any = () => ({})
) {
    try {
        const result = await serviceFn();
        return res.status(successResponse.statusCode).json({
            data: {
                internalCode: successResponse.internalCode,
                message: successResponse.message,
                ...mapData(result),
            },
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                error: {
                    internalCode: error.internalCode,
                    message: error.message,
                },
            });
        }
        return res.status(ErrorResponses.SERVER_ERROR.statusCode).json({
            error: {
                internalCode: ErrorResponses.SERVER_ERROR.internalCode,
                message: ErrorResponses.SERVER_ERROR.message,
            },
        });
    }
}
