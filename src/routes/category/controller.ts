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
            internalCode: SuccessResponses.CATEGORIES_FETCHED.internalCode,
            categories: categories,
            message: SuccessResponses.CATEGORIES_FETCHED.message
        });
    } catch (error) {
        next(error);
    }
});

export default router;
