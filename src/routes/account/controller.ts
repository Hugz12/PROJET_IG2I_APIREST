import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { SuccessResponses } from "types/successResponses";
import { CreateTransferDTO, TransferResponseDTO } from "./schema";
import { serviceCreateTransfer } from "./services";
import transferRoutes from "routes/account/transfer/controller";

const router: Router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
	try {
	} catch (error) {
		next(error);
	}
});

// Add subroutes
router.use("/:idAccount/transfer", transferRoutes);
