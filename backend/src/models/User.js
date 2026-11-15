
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        role: {
            type: String,
            enum: ["student", "resolver", "admin", "hod", "higher_authority"],
            default: "student",
            required: true,
            index: true,
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            default: null,
        },
        rollOrEmployeeId: {
            type: String,
            required: [true, "Roll No or Employee ID is required"],
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        avatar: {
            type: String,
            default: "",
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

// Password hashing middleware
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Password verification
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate JWT access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            role: this.role,
            department: this.department,
        },
        process.env.JWT_SECRET || "cgms_jwt_secret_token_key_2026",
        {
            expiresIn: process.env.JWT_EXPIRY || "7d",
        }
    );
};

export const User = mongoose.model("User", userSchema);
