import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { SuccessResponses } from "types/successResponses";
import { CreateAccountDTO } from "routes/account/schema";
import { serviceCreateAccount } from "routes/account/services";
import transferRoutes from "routes/account/transfer/controller";
import { authHandler } from "middlewares/auth";

const router: Router = Router();

router.post("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	// Enhance user
    const user = res.locals.user;
	// Body control
	const controlledBody: CreateAccountDTO = await bodyControl(CreateAccountDTO, req.body);
	// Service call
	const result = await serviceCreateAccount(controlledBody, user.idUtilisateur);
	// Send response
	res.status(201).json({
		account: result.account,
	});
});

// Add subroutes
router.use("/:idAccount/transfer", transferRoutes);

export default router;
