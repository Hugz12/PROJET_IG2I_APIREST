import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { SuccessResponses } from "types/successResponses";
import { CreateTransferDTO, TransferResponseDTO } from "./schema";
import { serviceCreateTransfer } from "./services";

const router: Router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const idAccount = parseInt(req.params.idAccount, 10);
		// Body control
		const controlledBody: CreateTransferDTO = await bodyControl(
			CreateTransferDTO,
			req.body
		);
		// Service call
		const result: TransferResponseDTO = await serviceCreateTransfer(
			controlledBody
		);
	} catch (error) {
		next(error);
	}
});

export default router;
