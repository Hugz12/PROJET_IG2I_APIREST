import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { SuccessResponses } from "types/successResponses";
import { CreateTransferDTO } from "./schema";
import { serviceCreateTransfer, serviceFetchTransfersByAccountId } from "./services";
import { authHandler } from "middlewares/auth";
import { paramControl } from "lib/services/paramControl";

const router: Router = Router({ mergeParams: true });

// GET /account/:idAccount/transfer - Fetch transfers for a specific account
router.get("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Enhance user
		const user = res.locals.user;
		// Param control
		const idAccount = paramControl(req.params.idAccount);
		// Service call
		const transfers = await serviceFetchTransfersByAccountId(idAccount, user.idUtilisateur);
		// Response
		res.status(SuccessResponses.TRANSFERS_FETCHED.statusCode).json({
			data: transfers,
		});
	} catch (error) {
		next(error);
	}
});

// POST /account/:idAccount/transfer - Create a transfer
router.post("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Enhance user
		const user = res.locals.user;
		// Param control
		const idAccount = paramControl(req.params.idAccount);
		// Body control
		const controlledBody: CreateTransferDTO = await bodyControl(CreateTransferDTO, req.body);
		// Service call
		const result = await serviceCreateTransfer(controlledBody, idAccount, user.idUtilisateur);
		// Response
		res.status(SuccessResponses.TRANSFER_DONE.statusCode).json({
			data: result,
		});
	} catch (error) {
		next(error);
	}
});

export default router;
