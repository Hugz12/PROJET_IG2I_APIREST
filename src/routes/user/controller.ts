import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { SuccessResponses } from "types/successResponses";
import { UpdateUserDTO, UserResponseDTO } from "routes/user/schema";
import { serviceGetUser, serviceUpdateUser, serviceDeleteUser } from "routes/user/services";
import { authHandler as auth } from "middlewares/auth";

const router: Router = Router();

// GET /user - Fetch user data
router.get("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = res.locals.user.idUtilisateur;
        const user: UserResponseDTO = await serviceGetUser(userId);
        res.status(SuccessResponses.USER_FETCHED.statusCode).json({
            internalCode: SuccessResponses.USER_FETCHED.internalCode,
            user: user,
            message: SuccessResponses.USER_FETCHED.message
        });
    } catch (error) {
        next(error);
    }
});

// PUT /user - Edit user data
router.put("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = res.locals.user.idUtilisateur;
        const controlledBody: UpdateUserDTO = await bodyControl(UpdateUserDTO, req.body);
        const updatedUser: UserResponseDTO = await serviceUpdateUser(userId, controlledBody);

        res.status(SuccessResponses.USER_UPDATED.statusCode).json({
            internalCode: SuccessResponses.USER_UPDATED.internalCode,
            user: updatedUser,
            message: SuccessResponses.USER_UPDATED.message
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /user - Delete user data
router.delete("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = res.locals.user.idUtilisateur;
        await serviceDeleteUser(userId);

        res.status(SuccessResponses.USER_DELETED.statusCode).json({
            internalCode: SuccessResponses.USER_DELETED.internalCode,
            message: SuccessResponses.USER_DELETED.message
        });
    } catch (error) {
        next(error);
    }
});

export default router;
