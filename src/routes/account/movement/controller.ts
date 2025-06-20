import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { SuccessResponses } from "types/successResponses";
import { CreateMovementDTO, FetchMovementsByAccountIdResponseDTO, MovementResponseDTO } from "./schema";
import { serviceCreateMovement, serviceFetchMovementsByAccountId } from "./services";
import { authHandler } from "middlewares/auth";
import { ErrorResponses } from "types/errorResponses";

const router: Router = Router({ mergeParams: true });

// GET /account/:idAccount/movement - Fetch all movements for specified account
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
		const movements = (await serviceFetchMovementsByAccountId(idAccount, user.idUtilisateur)) as MovementResponseDTO[];

		// Response
		res.status(SuccessResponses.MOVEMENTS_FETCHED.statusCode).json(new FetchMovementsByAccountIdResponseDTO(movements));
	} catch (error) {
		next(error);
	}
});

// GET /account/:idAccount/movement/:idMovement - Fetch a specific movement by ID
router.get("/:idMovement", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = res.locals.user;
		const idAccount = parseInt(req.params.idAccount, 10);
		const idMovement = parseInt(req.params.idMovement, 10);

		// Validate account ID and movement ID
		if (isNaN(idAccount) || isNaN(idMovement)) {
			res.status(ErrorResponses.INVALID_ACCOUNT_ID.statusCode).json({ error: "Invalid account or movement ID" });
			return;
		}

		// Service call
		const movement = (await serviceFetchMovementsByAccountId(
			idAccount,
			user.idUtilisateur,
			idMovement
		)) as MovementResponseDTO;

		// Response
		res.status(SuccessResponses.MOVEMENT_FETCHED.statusCode).json({
			movement: movement,
		});
	} catch (error) {
		next(error);
	}
});

// POST /account/:idAccount/movement - Create a movement
router.post("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = res.locals.user;
		const idAccount = parseInt(req.params.idAccount, 10);

		// Validate account ID
		if (isNaN(idAccount)) {
			res.status(ErrorResponses.INVALID_ACCOUNT_ID.statusCode).json({ error: "Invalid account ID" });
			return;
		}

		// Body control - set the account ID from URL params
		const controlledBody: CreateMovementDTO = await bodyControl(CreateMovementDTO, {
			...req.body,
			idCompte: idAccount,
		});

		// Service call
		const result = await serviceCreateMovement(controlledBody, user.idUtilisateur);

		// Response
		res.status(SuccessResponses.MOVEMENT_CREATED.statusCode).json({
			movement: result,
		});
	} catch (error) {
		next(error);
	}
});

export default router;
