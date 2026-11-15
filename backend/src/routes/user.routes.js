import { Router } from "express";
import {
    getAllUsers,
    updateUserRole,
    toggleUserStatus,
    getResolvers,
} from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(authorizeRoles("admin", "hod", "higher_authority"), getAllUsers);
router.route("/resolvers").get(getResolvers);
router.route("/:id/role").put(authorizeRoles("admin"), updateUserRole);
router.route("/:id/toggle-status").patch(authorizeRoles("admin"), toggleUserStatus);

export default router;
