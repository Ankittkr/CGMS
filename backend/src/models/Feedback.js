import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema(
    {
        grievance: {
            type: Schema.Types.ObjectId,
            ref: "Grievance",
            required: [true, "Grievance reference is required"],
            unique: true,
            index: true,
        },
        student: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Student reference is required"],
            index: true,
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: 1,
            max: 5,
        },
        comments: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
