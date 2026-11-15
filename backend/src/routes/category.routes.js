import { Router } from "express";
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .get(getAllCategories)
    .post(authorizeRoles("admin", "hod"), createCategory);

router
    .route("/:id")
    .put(authorizeRoles("admin", "hod"), updateCategory)
    .delete(authorizeRoles("admin"), deleteCategory);

export default router;
