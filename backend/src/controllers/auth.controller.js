import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, department, rollOrEmployeeId, phone } = req.body;

    if (!name || !email || !password || !rollOrEmployeeId) {
        throw new ApiError(400, "Name, email, password and Roll/Employee ID are required.");
    }

    const existedUser = await User.findOne({ email: email.toLowerCase() });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists.");
    }

    const assignedRole = ["student", "resolver", "admin", "hod", "higher_authority"].includes(role)
        ? role
        : "student";

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: assignedRole,
        department: department || null,
        rollOrEmployeeId,
        phone: phone || "",
    });

    const createdUser = await User.findById(user._id).select("-password").populate("department");
    if (!createdUser) {
        throw new ApiError(500, "Failed to register user into database.");
    }

    const token = user.generateAccessToken();

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };

    return res
        .status(201)
        .cookie("accessToken", token, options)
        .json(
            new ApiResponse(
                201,
                { user: createdUser, token },
                "User registered successfully"
            )
        );
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required.");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate("department");
    if (!user) {
        throw new ApiError(404, "Invalid credentials. User does not exist.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password. Please check your credentials.");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Account is deactivated. Contact system administrator.");
    }

    const token = user.generateAccessToken();

    const loggedInUser = await User.findById(user._id).select("-password").populate("department");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };

    return res
        .status(200)
        .cookie("accessToken", token, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, token },
                "User logged in successfully"
            )
        );
});

export const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password").populate("department");
    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "Current user fetched successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                ...(name && { name }),
                ...(phone !== undefined && { phone }),
                ...(avatar && { avatar }),
            },
        },
        { new: true }
    ).select("-password").populate("department");

    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "Profile updated successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current and new password are required.");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters.");
    }

    const user = await User.findById(req.user._id);
    const isPasswordValid = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordValid) {
        throw new ApiError(400, "Incorrect current password.");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});
