import { Router } from "express";
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getUserNotifications);
router.route("/:id/read").patch(markAsRead);
router.route("/read-all").patch(markAllAsRead);

export default router;
