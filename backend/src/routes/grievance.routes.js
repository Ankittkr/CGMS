import { Router } from "express";
import {
    createGrievance,
    getAllGrievances,
    getGrievanceById,
    updateGrievanceStatus,
    assignGrievance,
    reopenGrievance,
    escalateGrievance,
    submitFeedback,
} from "../controllers/grievance.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .post(authorizeRoles("student", "admin"), createGrievance)
    .get(getAllGrievances);

router.route("/:id").get(getGrievanceById);

router.route("/:id/status").patch(updateGrievanceStatus);

router
    .route("/:id/assign")
    .patch(authorizeRoles("admin", "hod", "higher_authority"), assignGrievance);

router.route("/:id/reopen").post(reopenGrievance);

router
    .route("/:id/escalate")
    .post(authorizeRoles("resolver", "hod", "admin"), escalateGrievance);

router
    .route("/:id/feedback")
    .post(authorizeRoles("student"), submitFeedback);

export default router;
