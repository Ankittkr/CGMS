import { Grievance } from "../models/Grievance.js";
import { Notification } from "../models/Notification.js";
import { Feedback } from "../models/Feedback.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    uploadToCloudinary,
    deleteFromCloudinary,
} from "../services/cloudinary.service.js";
// Helper to generate unique complaint ID
const generateGrievanceId = async () => {
    const year = new Date().getFullYear();
    const count = await Grievance.countDocuments();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `GRV-${year}-${String(count + 1).padStart(4, "0")}-${randomHex}`;
};


export const createGrievance = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        category,
        department,
        priority,
    } = req.body;

    if (!title || !description || !category || !department) {
        throw new ApiError(
            400,
            "Title, description, category and department are required."
        );
    }

    const uploadedAttachments = [];
    let grievanceSaved = false;
    try {
        // 1. Upload attachments to Cloudinary
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadToCloudinary(file.buffer);

                uploadedAttachments.push({
                    filename: file.originalname,
                    url: result.secure_url,
                    publicId: result.public_id,
                    fileType: file.mimetype,
                    resourceType: result.resource_type,
                    format: result.format || "",
                    size: result.bytes,
                    uploadedAt: new Date(),
                });
            }
        }

        // 2. Generate grievance ID
        const grievanceId = await generateGrievanceId();

        // 3. Save grievance in MongoDB
        const grievance = await Grievance.create({
            grievanceId,
            title,
            description,
            category,
            department,
            priority: priority || "Medium",
            complainant: req.user._id,
            status: "Submitted",
            attachments: uploadedAttachments,
            statusHistory: [
                {
                    previousStatus: "",
                    newStatus: "Submitted",
                    updatedBy: req.user._id,
                    remarks: "Grievance submitted by complainant.",
                    timestamp: new Date(),
                },
            ],
        });
        grievanceSaved = true;
        // 4. Notify administrators
        const admins = await User.find({
            role: "admin",
            isActive: true,
        });

        if (admins.length > 0) {
            const notifications = admins.map((admin) => ({
                recipient: admin._id,
                title: "New Grievance Submitted",
                message: `New complaint #${grievanceId} "${title}" lodged under your institution.`,
                type: "general",
                relatedGrievance: grievance._id,
            }));

            await Notification.insertMany(notifications);
        }

        // 5. Return populated grievance
        const createdGrievance = await Grievance.findById(grievance._id)
            .populate("complainant", "name email rollOrEmployeeId")
            .populate("department", "name code")
            .populate("category", "name slaHours");

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { grievance: createdGrievance },
                    "Grievance submitted successfully"
                )
            );

    } catch (error) {
        // 6. Cleanup Cloudinary files if grievance creation fails
        if (!grievanceSaved) {
            await Promise.allSettled(
                uploadedAttachments.map((file) =>
                    deleteFromCloudinary(
                        file.publicId,
                        file.resourceType
                    )
                )
            );
        }


        throw new ApiError(
            500,
            error.message || "Failed to submit grievance."
        );
    }
});

export const getAllGrievances = asyncHandler(async (req, res) => {
    const { status, priority, department, category, search, assignedTo } = req.query;

    const query = {};

    // Role-based scoping
    if (req.user.role === "student") {
        query.complainant = req.user._id;
    } else if (req.user.role === "resolver") {
        query.$or = [
            { assignedTo: req.user._id },
            { department: req.user.department },
        ];
    } else if (req.user.role === "hod") {
        if (req.user.department) {
            query.department = req.user.department;
        }
    } else if (req.user.role === "higher_authority") {
        // Can filter for escalated complaints or all
    }

    // Explicit filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
        query.$or = [
            { grievanceId: { $regex: search, $options: "i" } },
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    const grievances = await Grievance.find(query)
        .populate("complainant", "name email rollOrEmployeeId")
        .populate("assignedTo", "name email rollOrEmployeeId")
        .populate("department", "name code")
        .populate("category", "name slaHours")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, { grievances }, "Grievances retrieved successfully"));
});

export const getGrievanceById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const grievance = await Grievance.findById(id)
        .populate("complainant", "name email rollOrEmployeeId department phone")
        .populate("assignedTo", "name email rollOrEmployeeId department")
        .populate("department", "name code")
        .populate("category", "name slaHours priorityDefault")
        .populate("statusHistory.updatedBy", "name role")
        .populate("resolutionDetails.resolvedBy", "name role")
        .populate("escalatedTo.user", "name role");

    if (!grievance) {
        throw new ApiError(404, "Grievance record not found.");
    }

    // Student privacy protection
    if (
        req.user.role === "student" &&
        grievance.complainant._id.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(403, "Access denied. You can only view your own complaints.");
    }

    const feedback = await Feedback.findOne({ grievance: grievance._id });

    return res
        .status(200)
        .json(new ApiResponse(200, { grievance, feedback }, "Grievance details fetched successfully"));
});

export const updateGrievanceStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, remarks, resolutionNotes } = req.body;

    const validStatuses = [
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
    ];

    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status transition specified.");
    }

    const grievance = await Grievance.findById(id);
    if (!grievance) {
        throw new ApiError(404, "Grievance not found.");
    }

    // Role permission validation
    if (req.user.role === "student" && !["Reopened", "Closed"].includes(status)) {
        throw new ApiError(403, "Students can only close or reopen their grievances.");
    }

    const previousStatus = grievance.status;
    grievance.status = status;

    grievance.statusHistory.push({
        previousStatus,
        newStatus: status,
        updatedBy: req.user._id,
        remarks: remarks || `Status updated from ${previousStatus} to ${status}.`,
        timestamp: new Date(),
    });

    if (status === "Resolved") {
        grievance.resolutionDetails = {
            resolvedBy: req.user._id,
            resolutionNotes: resolutionNotes || remarks || "Grievance resolved by department.",
            resolvedAt: new Date(),
        };
    }

    await grievance.save();

    // Dispatched notification to complainant
    await Notification.create({
        recipient: grievance.complainant,
        title: `Grievance #${grievance.grievanceId} Status Update`,
        message: `Your grievance has transitioned to "${status}". Remarks: ${remarks || "No additional remarks."}`,
        type: status === "Resolved" ? "resolution" : "status_change",
        relatedGrievance: grievance._id,
    });

    const updated = await Grievance.findById(grievance._id)
        .populate("complainant", "name email")
        .populate("assignedTo", "name email")
        .populate("department", "name code")
        .populate("category", "name slaHours");

    return res
        .status(200)
        .json(new ApiResponse(200, { grievance: updated }, `Grievance status changed to ${status}`));
});

export const assignGrievance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { resolverId, remarks } = req.body;

    if (!resolverId) {
        throw new ApiError(400, "Resolver ID is required for assignment.");
    }

    const resolver = await User.findById(resolverId);
    if (!resolver || !["resolver", "hod"].includes(resolver.role)) {
        throw new ApiError(400, "Assigned user must be a valid resolver or HOD.");
    }

    const grievance = await Grievance.findById(id);
    if (!grievance) {
        throw new ApiError(404, "Grievance not found.");
    }

    const previousStatus = grievance.status;
    const newStatus = grievance.assignedTo ? "Reassigned" : "Assigned";
    grievance.assignedTo = resolver._id;
    grievance.status = newStatus;

    grievance.statusHistory.push({
        previousStatus,
        newStatus,
        updatedBy: req.user._id,
        remarks: remarks || `Assigned to ${resolver.name} (${resolver.role}).`,
        timestamp: new Date(),
    });

    await grievance.save();

    // Dispatched notification to resolver
    await Notification.create({
        recipient: resolver._id,
        title: "New Grievance Assigned to You",
        message: `Complaint #${grievance.grievanceId} "${grievance.title}" has been assigned to you.`,
        type: "assignment",
        relatedGrievance: grievance._id,
    });

    // Dispatched notification to student
    await Notification.create({
        recipient: grievance.complainant,
        title: `Grievance #${grievance.grievanceId} Assigned`,
        message: `Your grievance has been assigned to ${resolver.name} for departmental resolution.`,
        type: "status_change",
        relatedGrievance: grievance._id,
    });

    const populated = await Grievance.findById(grievance._id)
        .populate("complainant", "name email")
        .populate("assignedTo", "name email")
        .populate("department", "name code")
        .populate("category", "name");

    return res
        .status(200)
        .json(new ApiResponse(200, { grievance: populated }, "Grievance assigned successfully"));
});

export const reopenGrievance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
        throw new ApiError(400, "Reason for reopening complaint is required.");
    }

    const grievance = await Grievance.findById(id);
    if (!grievance) {
        throw new ApiError(404, "Grievance not found.");
    }

    if (
        req.user.role === "student" &&
        grievance.complainant.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(403, "You can only reopen your own grievances.");
    }

    const previousStatus = grievance.status;
    grievance.status = "Reopened";

    grievance.statusHistory.push({
        previousStatus,
        newStatus: "Reopened",
        updatedBy: req.user._id,
        remarks: `Reopened by complainant: ${reason}`,
        timestamp: new Date(),
    });

    await grievance.save();

    // Notify resolver if assigned
    if (grievance.assignedTo) {
        await Notification.create({
            recipient: grievance.assignedTo,
            title: `Grievance #${grievance.grievanceId} Reopened`,
            message: `Complainant has reopened grievance with reason: "${reason}"`,
            type: "status_change",
            relatedGrievance: grievance._id,
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { grievance }, "Grievance reopened successfully"));
});

export const escalateGrievance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { escalateToRole, reason } = req.body;

    if (!["hod", "higher_authority"].includes(escalateToRole)) {
        throw new ApiError(400, "Can only escalate to 'hod' or 'higher_authority'.");
    }

    const grievance = await Grievance.findById(id);
    if (!grievance) {
        throw new ApiError(404, "Grievance not found.");
    }

    const previousStatus = grievance.status;
    grievance.status = "Escalated";
    grievance.escalatedTo = {
        role: escalateToRole,
        user: null,
        reason: reason || "Escalated due to SLA breach or specialized authority requirement.",
        escalatedAt: new Date(),
    };

    grievance.statusHistory.push({
        previousStatus,
        newStatus: "Escalated",
        updatedBy: req.user._id,
        remarks: `Escalated to ${escalateToRole}: ${reason}`,
        timestamp: new Date(),
    });

    await grievance.save();

    // Notify HODs or Higher Authority
    const authorities = await User.find({ role: escalateToRole, isActive: true });
    if (authorities.length > 0) {
        const notifs = authorities.map((auth) => ({
            recipient: auth._id,
            title: `URGENT: Grievance #${grievance.grievanceId} Escalated`,
            message: `Grievance "${grievance.title}" escalated to your attention. Reason: ${reason}`,
            type: "escalation",
            relatedGrievance: grievance._id,
        }));
        await Notification.insertMany(notifs);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { grievance }, "Grievance escalated successfully"));
});

export const submitFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comments } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be an integer between 1 and 5.");
    }

    const grievance = await Grievance.findById(id);
    if (!grievance) {
        throw new ApiError(404, "Grievance not found.");
    }

    if (grievance.complainant.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only submit feedback for your own grievances.");
    }

    const feedback = await Feedback.findOneAndUpdate(
        { grievance: grievance._id },
        {
            $set: {
                student: req.user._id,
                rating,
                comments: comments || "",
            },
        },
        { upsert: true, new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, { feedback }, "Feedback submitted successfully"));
});
