import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { SuccessResponses } from "types/successResponses";
import { CreateTransferDTO, TransferResponseDTO, FetchTransfersByAccountIdResponseDTO } from "./schema";
import { serviceCreateTransfer, serviceFetchTransfersByAccountId } from "./services";
import { authHandler } from "middlewares/auth";
import { ErrorResponses } from "types/errorResponses";

const router: Router = Router({ mergeParams: true });

// GET /account/:idAccount/transfer - Fetch transfers for a specific account
router.get("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = res.locals.user;
		const idAccount = parseInt(req.params.idAccount, 10);

		// Validate account ID
		if (isNaN(idAccount)) {
			res.status(ErrorResponses.INVALID_ACCOUNT_ID.statusCode).json({ error: "Invalid account ID" });
			return;
		}

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
		const user = res.locals.user;
		const idAccount = parseInt(req.params.idAccount, 10);

		// Validate account ID
		if (isNaN(idAccount)) {
			res.status(ErrorResponses.INVALID_ACCOUNT_ID.statusCode).json({ error: "Invalid account ID" });
			return;
		}

		// Body control
		const controlledBody: CreateTransferDTO = await bodyControl(CreateTransferDTO, req.body);

		// Service call
		const result = await serviceCreateTransfer(controlledBody, user.idUtilisateur);

		// Response
		res.status(SuccessResponses.TRANSFER_DONE.statusCode).json({
			data: result.transfer,
		});
	} catch (error) {
		next(error);
	}
});

export default router;
