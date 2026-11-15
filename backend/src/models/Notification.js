import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Recipient is required"],
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["assignment", "status_change", "escalation", "resolution", "general"],
            default: "general",
            index: true,
        },
        relatedGrievance: {
            type: Schema.Types.ObjectId,
            ref: "Grievance",
            default: null,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Notification = mongoose.model("Notification", notificationSchema);
