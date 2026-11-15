import { Router } from "express";
import {
    createDepartment,
    getAllDepartments,
    updateDepartment,
    deleteDepartment,
} from "../controllers/department.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Public route: Required during registration/sign-up
router.get("/", getAllDepartments);

router
    .route("/")
    .post(verifyJWT, authorizeRoles("admin"), createDepartment);

router
    .route("/:id")
    .put(verifyJWT, authorizeRoles("admin"), updateDepartment)
    .delete(verifyJWT, authorizeRoles("admin"), deleteDepartment);

export default router;
