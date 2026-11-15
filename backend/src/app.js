import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";

// Route imports
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import departmentRouter from "./routes/department.routes.js";
import categoryRouter from "./routes/category.routes.js";
import grievanceRouter from "./routes/grievance.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

// Configure CORS
app.use(
    cors({
        origin: corsOrigin,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Configure body-parsing middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Configure static files & cookies
app.use(express.static("public"));
app.use(cookieParser());

// Basic health check
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Complaint & Grievance Management System API is healthy",
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
    });
});

// Mount API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/grievances", grievanceRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// Centralized error handling
app.use(errorHandler);

export { app };
