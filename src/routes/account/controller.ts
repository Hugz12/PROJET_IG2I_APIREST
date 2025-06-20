import { ErrorResponses } from "types/errorResponses";
import { Router, Request, Response, NextFunction } from "express";
import { bodyControl } from "lib/services/bodyControl";
import { SuccessResponses } from "types/successResponses";
import { CreateAccountDTO, UpdateAccountDTO } from "routes/account/schema";
import {
	serviceCreateAccount,
	serviceGetUserAccounts,
	serviceGetAccountById,
	serviceUpdateAccount,
	serviceDeleteAccount,
} from "routes/account/services";
import transferRoutes from "routes/account/transfer/controller";
import movementRoutes from "routes/account/movement/controller";
import { authHandler } from "middlewares/auth";

const router: Router = Router();

// GET /account - Fetch all user accounts
router.get("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Enhance user
		const user = res.locals.user;
		// Service call
		const accounts = await serviceGetUserAccounts(user.idUtilisateur);
		// Send response
		res.status(SuccessResponses.ACCOUNTS_FETCHED.statusCode).json({
			data: {
				accounts: accounts,
			},
		});
	} catch (error) {
		next(error);
	}
});

// POST /account - Create a new account
router.post("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Enhance user
		const user = res.locals.user;
		// Body control
		const controlledBody: CreateAccountDTO = await bodyControl(CreateAccountDTO, req.body);
		// Service call
		const result = await serviceCreateAccount(controlledBody, user.idUtilisateur);
		// Send response
		res.status(SuccessResponses.ACCOUNT_CREATED.statusCode).json({
			data: {
				account: result.account,
			},
		});
	} catch (error) {
		next(error);
	}
});

// GET /account/:idAccount - Fetch user's account data
router.get("/:idAccount", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = res.locals.user;
		const idAccount = parseInt(req.params.idAccount, 10);

		// Validate account ID
		if (isNaN(idAccount)) {
			res.status(ErrorResponses.INVALID_ACCOUNT_ID.statusCode).json({ error: "Invalid account ID" });
			return;
		}

		// Service call
		const account = await serviceGetAccountById(idAccount, user.idUtilisateur);
		// Send response
		res.status(SuccessResponses.ACCOUNT_FETCHED.statusCode).json({
			data: {
				account: account,
			},
		});
	} catch (error) {
		next(error);
	}
});

// PUT /account/:idAccount - Update an account
router.patch("/:idAccount", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = res.locals.user;
		const idAccount = parseInt(req.params.idAccount, 10);

		// Validate account ID
		if (isNaN(idAccount)) {
			res.status(ErrorResponses.INVALID_ACCOUNT_ID.statusCode).json({ error: "Invalid account ID" });
			return;
		}

		// Body control
		const controlledBody: UpdateAccountDTO = await bodyControl(UpdateAccountDTO, req.body);
		// Service call
		const account = await serviceUpdateAccount(idAccount, controlledBody, user.idUtilisateur);
		// Send response
		res.status(SuccessResponses.ACCOUNT_UPDATED.statusCode).json({
			account: account,
		});
	} catch (error) {
		next(error);
	}
});

// DELETE /account/:idAccount - Delete an account
router.delete("/:idAccount", authHandler, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = res.locals.user;
		const idAccount = parseInt(req.params.idAccount, 10);

		// Validate account ID
		if (isNaN(idAccount)) {
			res.status(ErrorResponses.INVALID_ACCOUNT_ID.statusCode).json({ error: "Invalid account ID" });
			return;
		}

		// Service call
		await serviceDeleteAccount(idAccount, user.idUtilisateur);
		// Send response
		res.sendStatus(SuccessResponses.ACCOUNT_DELETED.statusCode)
	} catch (error) {
		next(error);
	}
});

// Add subroutes
router.use("/:idAccount/transfer", transferRoutes);
router.use("/:idAccount/movement", movementRoutes);

export default router;
