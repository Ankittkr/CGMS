import { Department } from "../models/Department.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createDepartment = asyncHandler(async (req, res) => {
    const { name, code, description, hod } = req.body;

    if (!name || !code) {
        throw new ApiError(400, "Department name and code are required.");
    }

    const existed = await Department.findOne({
        $or: [{ code: code.toUpperCase() }, { name: { $regex: `^${name}$`, $options: "i" } }],
    });

    if (existed) {
        throw new ApiError(409, "Department with this name or code already exists.");
    }

    const department = await Department.create({
        name,
        code: code.toUpperCase(),
        description: description || "",
        hod: hod || null,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, { department }, "Department created successfully"));
});

export const getAllDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find({ isActive: true })
        .populate("hod", "name email rollOrEmployeeId")
        .sort({ name: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, { departments }, "Departments fetched successfully"));
});

export const updateDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, code, description, hod, isActive } = req.body;

    const department = await Department.findByIdAndUpdate(
        id,
        {
            $set: {
                ...(name && { name }),
                ...(code && { code: code.toUpperCase() }),
                ...(description !== undefined && { description }),
                ...(hod !== undefined && { hod: hod || null }),
                ...(isActive !== undefined && { isActive }),
            },
        },
        { new: true }
    ).populate("hod", "name email rollOrEmployeeId");

    if (!department) {
        throw new ApiError(404, "Department not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { department }, "Department updated successfully"));
});

export const deleteDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const department = await Department.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true }
    );

    if (!department) {
        throw new ApiError(404, "Department not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Department deactivated successfully"));
});
