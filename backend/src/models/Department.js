import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Department name is required"],
            unique: true,
            trim: true,
            index: true,
        },
        code: {
            type: String,
            required: [true, "Department code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        hod: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
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

export const Department = mongoose.model("Department", departmentSchema);
