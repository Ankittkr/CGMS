import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            index: true,
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: [true, "Department reference is required"],
            index: true,
        },
        slaHours: {
            type: Number,
            default: 48,
            min: [1, "SLA must be at least 1 hour"],
        },
        priorityDefault: {
            type: String,
            enum: ["Low", "Medium", "High", "Urgent"],
            default: "Medium",
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Category = mongoose.model("Category", categorySchema);
