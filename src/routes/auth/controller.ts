import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { SuccessResponses } from "types/successResponses";
import { LoginDTO, RegisterDTO } from "routes/auth/schema";
import { serviceLogin, serviceRegister } from "./services";

const router: Router = Router();

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
     // Body control
    const controlledBody: RegisterDTO = await bodyControl(RegisterDTO, req.body);

    // Call service to handle registration
    try {
        const result = await serviceRegister(controlledBody);
        res.status(SuccessResponses.USER_REGISTERED.statusCode).json({
            data: {
                internalCode: SuccessResponses.USER_REGISTERED.internalCode,
                message: SuccessResponses.USER_REGISTERED.message,
                user: result,
            },
        });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    // Body control
    const controlledBody: LoginDTO = await bodyControl(LoginDTO, req.body);

    // Call service to handle login
    try {
        const result = await serviceLogin(controlledBody);
        res.status(SuccessResponses.USER_LOGGED_IN.statusCode).json({
            data: {
                internalCode: SuccessResponses.USER_LOGGED_IN.internalCode,
                message: SuccessResponses.USER_LOGGED_IN.message,
                user: result,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;