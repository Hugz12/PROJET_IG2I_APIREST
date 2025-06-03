import { Request, Response } from "express";
import { ErrorResponses } from "types/errorResponses";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export async function checkRequestBody<T>(dto: any, req: Request, res: Response): Promise<T | null> {
    const controlledBody = await bodyControl(dto, req.body);
    if (!controlledBody.success) {
        res.status(ErrorResponses.INVALID_BODY.statusCode).json({
            error: {
                internalCode: ErrorResponses.INVALID_BODY.internalCode,
                message: ErrorResponses.INVALID_BODY.message,
                fieldErrors: controlledBody.errors,
            }
        });
        return null;
    }
    return controlledBody.data as T;
}

async function bodyControl<T extends object>(
    dtoClass: new (...args: any[]) => T,
    body: object,
): Promise<{ success: true; data: T } | { success: false; errors: any[] }> {
    let instance;

    if (!body) {
        return {
            success: false,
            errors: [{ message: "Body is required" }],
        };
    }

    try {
        instance = plainToInstance(dtoClass, body);
    } catch (error) {
        return {
            success: false,
            errors: [{ message: "Invalid body" }],
        };
    }

    const errors = await validate(instance);

    if (errors.length > 0) {
        return {
            success: false,
            errors: errors.map((err) => ({
                property: err.property,
                constraints: err.constraints,
            })),
        };
    }

    return {
        success: true,
        data: instance,
    };
}
