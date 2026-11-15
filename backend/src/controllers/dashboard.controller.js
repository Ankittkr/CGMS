import { Grievance } from "../models/Grievance.js";
import { Department } from "../models/Department.js";
import { Category } from "../models/Category.js";
import { User } from "../models/User.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
    const role = req.user.role;
    const userId = req.user._id;
    const userDept = req.user.department;

    let baseQuery = {};
    if (role === "student") {
        baseQuery = { complainant: userId };
    } else if (role === "resolver") {
        baseQuery = {
            $or: [{ assignedTo: userId }, { department: userDept }],
        };
    } else if (role === "hod") {
        if (userDept) baseQuery = { department: userDept };
    }

    const total = await Grievance.countDocuments(baseQuery);
    const pending = await Grievance.countDocuments({
        ...baseQuery,
        status: { $in: ["Submitted", "Grievance Processing", "Under Review"] },
    });
    const inProgress = await Grievance.countDocuments({
        ...baseQuery,
        status: { $in: ["Assigned", "In Progress", "Reassigned"] },
    });
    const resolved = await Grievance.countDocuments({
        ...baseQuery,
        status: "Resolved",
    });
    const closed = await Grievance.countDocuments({
        ...baseQuery,
        status: "Closed",
    });
    const escalated = await Grievance.countDocuments({
        ...baseQuery,
        status: "Escalated",
    });

    const recentGrievances = await Grievance.find(baseQuery)
        .populate("complainant", "name email rollOrEmployeeId")
        .populate("assignedTo", "name email")
        .populate("department", "name code")
        .populate("category", "name slaHours")
        .sort({ createdAt: -1 })
        .limit(6);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                stats: {
                    total,
                    pending,
                    inProgress,
                    resolved,
                    closed,
                    escalated,
                },
                recentGrievances,
            },
            "Dashboard stats fetched successfully"
        )
    );
});

export const getReportsAnalytics = asyncHandler(async (req, res) => {
    const { department, startDate, endDate } = req.query;

    const matchStage = {};
    if (department) matchStage.department = department;

    // Status aggregation
    const statusCounts = await Grievance.aggregate([
        { $match: matchStage },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Priority aggregation
    const priorityCounts = await Grievance.aggregate([
        { $match: matchStage },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // Department aggregation
    const departmentDistribution = await Grievance.aggregate([
        {
            $group: {
                _id: "$department",
                total: { $sum: 1 },
                resolved: {
                    $sum: { $cond: [{ $in: ["$status", ["Resolved", "Closed"]] }, 1, 0] },
                },
            },
        },
        {
            $lookup: {
                from: "departments",
                localField: "_id",
                foreignField: "_id",
                as: "dept",
            },
        },
        { $unwind: "$dept" },
        {
            $project: {
                department: "$dept.name",
                code: "$dept.code",
                total: 1,
                resolved: 1,
            },
        },
    ]);

    // Category aggregation
    const categoryDistribution = await Grievance.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "cat",
            },
        },
        { $unwind: "$cat" },
        {
            $project: {
                category: "$cat.name",
                count: 1,
            },
        },
    ]);

    // Monthly trends (Last 6 Months)
    const monthlyTrends = await Grievance.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                },
                submitted: { $sum: 1 },
                resolved: {
                    $sum: { $cond: [{ $in: ["$status", ["Resolved", "Closed"]] }, 1, 0] },
                },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 6 },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyTrends = monthlyTrends.map((item) => ({
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        submitted: item.submitted,
        resolved: item.resolved,
    }));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                statusCounts: statusCounts.map((s) => ({ status: s._id, count: s.count })),
                priorityCounts: priorityCounts.map((p) => ({ priority: p._id, count: p.count })),
                departmentDistribution,
                categoryDistribution,
                monthlyTrends: formattedMonthlyTrends,
            },
            "Reports and analytics retrieved successfully"
        )
    );
});
