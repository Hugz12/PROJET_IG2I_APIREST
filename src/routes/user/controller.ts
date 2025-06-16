import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { SuccessResponses } from "types/successResponses";
import { UpdateUserDTO, UserResponseDTO } from "routes/user/schema";
import { serviceGetUser, serviceUpdateUser, serviceDeleteUser } from "routes/user/services";
import { authHandler } from "middlewares/auth";

const router: Router = Router();

// GET /user - Fetch user data
router.get("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Enhance user
        const user = res.locals.user;
        // Service call
        const result: UserResponseDTO = await serviceGetUser(user.idUtilisateur);
        // Response
        res.status(SuccessResponses.USER_FETCHED.statusCode).json({
            data: {
                result
            }
        });
    } catch (error) {
        next(error);
    }
});

// PUT /user - Edit user data
router.put("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Enhance user
        const user = res.locals.user;
        // Body control
        const controlledBody: UpdateUserDTO = await bodyControl(UpdateUserDTO, req.body);
        // Service call
        const result: UserResponseDTO = await serviceUpdateUser(user.idUtilisateur, controlledBody);
        // Response
        res.status(SuccessResponses.USER_UPDATED.statusCode).json({
            data: {
                user: result
            },
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /user - Delete user data
router.delete("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Enhance user
        const user = res.locals.user;
        // Service call
        await serviceDeleteUser(user.idUtilisateur);
        // Response
        res.status(SuccessResponses.USER_DELETED.statusCode)
    } catch (error) {
        next(error);
    }
});

export default router;
