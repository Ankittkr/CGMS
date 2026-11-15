import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllUsers = asyncHandler(async (req, res) => {
    const { role, department, search } = req.query;

    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { rollOrEmployeeId: { $regex: search, $options: "i" } },
        ];
    }

    const users = await User.find(query)
        .select("-password")
        .populate("department")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, { users }, "Users retrieved successfully"));
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role, department } = req.body;

    if (!["student", "resolver", "admin", "hod", "higher_authority"].includes(role)) {
        throw new ApiError(400, "Invalid role specified.");
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        {
            $set: {
                role,
                ...(department !== undefined && { department: department || null }),
            },
        },
        { new: true }
    )
        .select("-password")
        .populate("department");

    if (!updatedUser) {
        throw new ApiError(404, "User not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { user: updatedUser }, "User role updated successfully"));
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    user.isActive = !user.isActive;
    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: { _id: user._id, isActive: user.isActive } },
                `User account ${user.isActive ? "activated" : "deactivated"} successfully`
            )
        );
});

export const getResolvers = asyncHandler(async (req, res) => {
    const { department } = req.query;

    const query = { role: { $in: ["resolver", "hod"] }, isActive: true };
    if (department) query.department = department;

    const resolvers = await User.find(query)
        .select("name email role department rollOrEmployeeId")
        .populate("department");

    return res
        .status(200)
        .json(new ApiResponse(200, { resolvers }, "Resolvers fetched successfully"));
});
