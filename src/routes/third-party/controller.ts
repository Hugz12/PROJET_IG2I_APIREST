import { Router, Request, Response, NextFunction } from "express";
import { SuccessResponses } from "types/successResponses";
import { serviceCreateThirdParty, serviceUpdateThirdParty, serviceGetThirdPartiesByUserId } from "./services";
import { authHandler } from "middlewares/auth";
import { CreateThirdPartyDTO, UpdateThirdPartyDTO } from "./schema";
import { bodyControl } from "lib/services/bodyControl";
import { ErrorResponses } from "types/errorResponses";

const router: Router = Router();

router.get("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = res.locals.user;

        const thirdParties = await serviceGetThirdPartiesByUserId(user.idUtilisateur);

        res.status(SuccessResponses.THIRD_PARTIES_FETCHED.statusCode).json({
            data: { thirdParties: thirdParties },
        });
    } catch (error) {
        next(error);
    }
});

router.post("/", authHandler, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = res.locals.user;

        const controlledBody: CreateThirdPartyDTO = await bodyControl(CreateThirdPartyDTO, req.body);

        const newThirdParty = await serviceCreateThirdParty({ thirdPartyName: controlledBody.thirdPartyName}, user.idUtilisateur );

        res.status(SuccessResponses.THIRD_PARTY_CREATED.statusCode).json({
            data: { thirdParty: newThirdParty },
        });

    } catch (error) {
        console.error("Error creating third party:", error);
        next(error);
    }
});

router.patch("/:id", authHandler, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = res.locals.user;
        const thirdPartyId = parseInt(req.params.id, 10);

        if (isNaN(thirdPartyId)) {
            res.status(ErrorResponses.INVALID_PARAMS.statusCode).json({
                error: {
                    internalCode: ErrorResponses.INVALID_PARAMS.internalCode,
                    message: ErrorResponses.INVALID_PARAMS.message
                }
            });
            return;
        }
        const controlledBody: UpdateThirdPartyDTO = await bodyControl(UpdateThirdPartyDTO, req.body);


        const updatedThirdParty = await serviceUpdateThirdParty(thirdPartyId, {
            thirdPartyName: controlledBody.thirdPartyName
        },
            user.idUtilisateur
        );
        res.status(SuccessResponses.THIRD_PARTY_UPDATED.statusCode).json({
            data: { thirdParty: updatedThirdParty },
        });
    } catch (error) {
        console.error("Error updating third party:", error);
        next(error);
    }
});

export default router;
