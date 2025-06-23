import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { paramControl } from "lib/services/paramControl";
import { SuccessResponses } from "types/successResponses";
import { CreateMovementDTO } from "./schema";
import { serviceCreateMovement, serviceFetchMovementsByAccountId } from "routes/account/movement/services";
import { authHandler } from "middlewares/auth";

const router: Router = Router({ mergeParams: true });

// GET /account/:idAccount/movement - Fetch all movements for specified account
router.get("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Enhance user
		const user = res.locals.user;
		// Param control
		const idAccount = paramControl(req.params.idAccount);
		// Service call
		const result = (await serviceFetchMovementsByAccountId(idAccount, user.idUtilisateur));
		// Response
		res.status(SuccessResponses.MOVEMENTS_FETCHED.statusCode).json({
			data: {
				movements: result.movement
			}
		});
	} catch (error) {
		next(error);
	}
});

// GET /account/:idAccount/movement/:idMovement - Fetch a specific movement by ID
router.get("/:idMovement", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Enhance user
		const user = res.locals.user;
		// Param control
		const idAccount = paramControl(req.params.idAccount);
		const idMovement = paramControl(req.params.idMovement);
		// Service call
		const result = await serviceFetchMovementsByAccountId(
			idAccount,
			user.idUtilisateur,
			idMovement
		);
		// Response
		res.status(SuccessResponses.MOVEMENT_FETCHED.statusCode).json({
			data: {
				movement: result.movement
			},
		});
	} catch (error) {
		next(error);
	}
});

// POST /account/:idAccount/movement - Create a movement
router.post("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Enhance user
		const user = res.locals.user;
		// Param control
		const idAccount = paramControl(req.params.idAccount);
		// Body control - set the account ID from URL params
		const controlledBody: CreateMovementDTO = await bodyControl(CreateMovementDTO, req.body);
		// Service call
		const result = await serviceCreateMovement(controlledBody, idAccount, user.idUtilisateur);
		// Response
		res.status(SuccessResponses.MOVEMENT_CREATED.statusCode).json({
			data: {
				movement: result.movement,
			},
		});
	} catch (error) {
		next(error);
	}
});

export default router;
