import { Category } from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
    const { name, department, slaHours, priorityDefault, description } = req.body;

    if (!name || !department) {
        throw new ApiError(400, "Category name and department are required.");
    }

    const category = await Category.create({
        name,
        department,
        slaHours: slaHours || 48,
        priorityDefault: priorityDefault || "Medium",
        description: description || "",
    });

    const populated = await Category.findById(category._id).populate("department");

    return res
        .status(201)
        .json(new ApiResponse(201, { category: populated }, "Category created successfully"));
});

export const getAllCategories = asyncHandler(async (req, res) => {
    const { department } = req.query;

    const query = { isActive: true };
    if (department) query.department = department;

    const categories = await Category.find(query)
        .populate("department")
        .sort({ name: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, { categories }, "Categories fetched successfully"));
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, department, slaHours, priorityDefault, description, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
        id,
        {
            $set: {
                ...(name && { name }),
                ...(department && { department }),
                ...(slaHours !== undefined && { slaHours }),
                ...(priorityDefault && { priorityDefault }),
                ...(description !== undefined && { description }),
                ...(isActive !== undefined && { isActive }),
            },
        },
        { new: true }
    ).populate("department");

    if (!category) {
        throw new ApiError(404, "Category not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { category }, "Category updated successfully"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true }
    );

    if (!category) {
        throw new ApiError(404, "Category not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Category deactivated successfully"));
});
