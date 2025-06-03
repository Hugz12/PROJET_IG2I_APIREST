import { Router, Request, Response } from "express";
import { checkRequestBody } from "lib/services/checkRequestBody";
import { SuccessResponses } from "types/successResponses";
import { LoginDTO, RegisterDTO } from "routes/auth/schema";
import { handleServiceCall } from "lib/services/handleServiceCall";
import { serviceLogin, serviceRegister } from "./services";

const router: Router = Router();

router.post("/register", async (req: Request, res: Response) => {
     // Body control
    const controlledBody: RegisterDTO | null = await checkRequestBody(RegisterDTO, req, res);
    if (!controlledBody) return;

    // Call service to handle registration
    handleServiceCall(
        res,
        () => serviceRegister(controlledBody),
        SuccessResponses.USER_REGISTERED,
    );
});

router.post("/login", async (req: Request, res: Response) => {
    // Body control
    const controlledBody: LoginDTO | null = await checkRequestBody(LoginDTO, req, res);
    if (!controlledBody) return;

    // Call service to handle login
    handleServiceCall(
        res,
        () => serviceLogin(controlledBody),
        SuccessResponses.USER_LOGGED_IN,
        ({ token }) => ({ token })
    );
});

export default router;