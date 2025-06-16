import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { SuccessResponses } from "types/successResponses";
import { LoginDTO, RegisterDTO } from "routes/auth/schema";
import { serviceLogin, serviceRegister } from "./services";

const router: Router = Router();

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Body control
        const controlledBody: RegisterDTO = await bodyControl(RegisterDTO, req.body);
        // Service call
        const result = await serviceRegister(controlledBody);
        // Response
        res.status(SuccessResponses.USER_REGISTERED.statusCode).json({
            data: {
                token: result.token,
            },
        });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Body control
        const controlledBody: LoginDTO = await bodyControl(LoginDTO, req.body);
        // Service call
        const result = await serviceLogin(controlledBody);
        // Response
        res.status(SuccessResponses.USER_LOGGED_IN.statusCode).json({
            data: {
                token: result.token,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;