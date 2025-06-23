import { Router, Request, Response, NextFunction } from "express";
import { SuccessResponses } from "types/successResponses";
import {
	serviceGetAllCategories,
} from "./services";


const router: Router = Router();

// GET /category - Fetch all categories and subcategories
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const categories = await serviceGetAllCategories();

		res.status(SuccessResponses.CATEGORIES_FETCHED.statusCode).json({
			data: {
				categories: categories,
			}
		});
	} catch (error) {
		next(error);
	}
});

export default router;
