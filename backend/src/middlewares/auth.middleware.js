import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Authentication token missing. Please sign in.");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET || "cgms_jwt_secret_token_key_2026"
        );

        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token or user no longer exists.");
        }

        if (!user.isActive) {
            throw new ApiError(403, "Account has been deactivated. Please contact administrator.");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid or expired access token.");
    }
});

export const authorizeRoles = (...roles) => {
    return (req, _, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Access denied. Role '${req.user?.role || "guest"}' is not authorized for this resource.`
            );
        }
        next();
    };
};
