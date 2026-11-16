import mongoose, { Schema } from "mongoose";

const statusHistorySchema = new Schema(
    {
        previousStatus: {
            type: String,
            default: "",
        },
        newStatus: {
            type: String,
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        remarks: {
            type: String,
            default: "",
            trim: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);


const attachmentSchema = new Schema(
    {
        filename: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            default: "document",
        },
        resourceType: {
            type: String,
            default: "image",
        },
        format: {
            type: String,
            default: "",
        },
        size: {
            type: Number,
            default: 0,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);


const grievanceSchema = new Schema(
    {
        grievanceId: {
            type: String,
            unique: true,
            required: true,
            index: true,
            uppercase: true,
        },
        title: {
            type: String,
            required: [true, "Grievance title is required"],
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, "Detailed description is required"],
            trim: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category reference is required"],
            index: true,
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: [true, "Department reference is required"],
            index: true,
        },
        complainant: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Complainant is required"],
            index: true,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Urgent"],
            default: "Medium",
            index: true,
        },
        status: {
            type: String,
            enum: [
                "Submitted",
                "Grievance Processing",
                "Under Review",
                "Assigned",
                "In Progress",
                "Resolved",
                "Closed",
                "Reopened",
                "Reassigned",
                "Escalated",
            ],
            default: "Submitted",
            index: true,
        },
        escalatedTo: {
            role: {
                type: String,
                enum: ["hod", "higher_authority", ""],
                default: "",
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
            reason: {
                type: String,
                default: "",
            },
            escalatedAt: {
                type: Date,
                default: null,
            },
        },
        resolutionDetails: {
            resolvedBy: {
                type: Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
            resolutionNotes: {
                type: String,
                default: "",
            },
            resolvedAt: {
                type: Date,
                default: null,
            },
        },
        attachments: [attachmentSchema],
        statusHistory: [statusHistorySchema],
    },
    {
        timestamps: true,
    }
);

export const Grievance = mongoose.model("Grievance", grievanceSchema);
