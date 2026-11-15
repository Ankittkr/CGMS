import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Department } from "./models/Department.js";
import { Category } from "./models/Category.js";
import { Grievance } from "./models/Grievance.js";
import { Notification } from "./models/Notification.js";

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log("🌱 Starting Database Seeding...");

        // Clean existing collections
        await User.deleteMany({});
        await Department.deleteMany({});
        await Category.deleteMany({});
        await Grievance.deleteMany({});
        await Notification.deleteMany({});
        console.log("🧹 Cleared existing database records.");

        // 1. Seed Departments
        const departmentsData = [
            { name: "Computer Science & Engineering", code: "CSE", description: "Department of Computer Science & Engineering and Computing Labs" },
            { name: "Hostel & Residential Services", code: "HOSTEL", description: "Student accommodation, mess, maintenance, and hostel welfare" },
            { name: "Examination & Academic Cell", code: "ACAD", description: "Curriculum, hall tickets, evaluations, grade cards and semester exams" },
            { name: "Finance & Accounts Department", code: "FIN", description: "Tuition fees, scholarship disbursements, exam fee receipts and refunds" },
            { name: "Library & Information Services", code: "LIB", description: "Central library, e-resources, journals and digital repository access" },
            { name: "Transport & Fleet Management", code: "TRANS", description: "Institutional buses, shuttles, campus transit routes and schedules" },
        ];
        const departments = await Department.insertMany(departmentsData);
        console.log(`✅ Seeded ${departments.length} departments.`);

        const cseDept = departments.find((d) => d.code === "CSE");
        const hostelDept = departments.find((d) => d.code === "HOSTEL");
        const examDept = departments.find((d) => d.code === "ACAD");
        const finDept = departments.find((d) => d.code === "FIN");
        const libDept = departments.find((d) => d.code === "LIB");

        // 2. Seed Users across all 5 roles
        const usersData = [
            {
                name: "Ankit Kumar",
                email: "student@college.edu",
                password: "password123",
                role: "student",
                department: cseDept._id,
                rollOrEmployeeId: "2026-CSE-042",
                phone: "+91 9876543210",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
            },
            {
                name: "Prof. Rajesh Sharma",
                email: "resolver@college.edu",
                password: "password123",
                role: "resolver",
                department: cseDept._id,
                rollOrEmployeeId: "EMP-RES-302",
                phone: "+91 9876543211",
                avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
            },
            {
                name: "Dr. Sarah Jenkins",
                email: "admin@college.edu",
                password: "password123",
                role: "admin",
                department: cseDept._id,
                rollOrEmployeeId: "EMP-ADM-001",
                phone: "+91 9876543212",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
            },
            {
                name: "Dr. Arvind Gupta",
                email: "hod@college.edu",
                password: "password123",
                role: "hod",
                department: cseDept._id,
                rollOrEmployeeId: "EMP-HOD-101",
                phone: "+91 9876543213",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
            },
            {
                name: "Prof. M. K. Narayanan (Dean / Principal)",
                email: "principal@college.edu",
                password: "password123",
                role: "higher_authority",
                department: cseDept._id,
                rollOrEmployeeId: "EMP-DIR-001",
                phone: "+91 9876543214",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
            },
        ];

        const users = [];
        for (const u of usersData) {
            const created = await User.create(u);
            users.push(created);
        }
        console.log(`✅ Seeded ${users.length} users with hashed credentials.`);

        const student = users.find((u) => u.role === "student");
        const resolver = users.find((u) => u.role === "resolver");
        const admin = users.find((u) => u.role === "admin");
        const hod = users.find((u) => u.role === "hod");
        const higherAuth = users.find((u) => u.role === "higher_authority");

        // Link HOD to Department
        await Department.findByIdAndUpdate(cseDept._id, { hod: hod._id });

        // 3. Seed Categories
        const categoriesData = [
            { name: "Lab Systems & High Performance Computing", department: cseDept._id, slaHours: 24, priorityDefault: "Urgent", description: "Hardware or network malfunction in college computing labs." },
            { name: "Hostel Hot Water & Electrical Maintenance", department: hostelDept._id, slaHours: 48, priorityDefault: "High", description: "Geyser, plumbing, electrical fixtures or room maintenance in student hostels." },
            { name: "Exam Hall Ticket Discrepancy", department: examDept._id, slaHours: 24, priorityDefault: "Urgent", description: "Subject mismatch, roll number error or hall ticket downloading block." },
            { name: "Fee Double Debit & Refund", department: finDept._id, slaHours: 72, priorityDefault: "Medium", description: "Bank gateway timeouts or duplicate transaction debits for semester fee." },
            { name: "Library Digital Repository Login Issue", department: libDept._id, slaHours: 24, priorityDefault: "Medium", description: "IEEE Xplore or ACM Digital Library proxy authentication failure." },
            
        ];
        const categories = await Category.insertMany(categoriesData);
        console.log(`✅ Seeded ${categories.length} categories.`);

        // 4. Seed Grievances
        const grievance1 = await Grievance.create({
            grievanceId: "GRV-2026-0001-9482",
            title: "Computing Lab 4 Cluster Memory Parity Errors",
            description: "Workstation rack 2 in Computing Lab 4 freezes with kernel panic memory parity errors during machine learning evaluations.",
            category: categories[0]._id,
            department: cseDept._id,
            complainant: student._id,
            assignedTo: resolver._id,
            priority: "Urgent",
            status: "In Progress",
            statusHistory: [
                { previousStatus: "", newStatus: "Submitted", updatedBy: student._id, remarks: "Complaint lodged by student.", timestamp: new Date(Date.now() - 36 * 3600 * 1000) },
                { previousStatus: "Submitted", newStatus: "Assigned", updatedBy: admin._id, remarks: "Assigned to Lab Incharge Prof. Rajesh Sharma.", timestamp: new Date(Date.now() - 24 * 3600 * 1000) },
                { previousStatus: "Assigned", newStatus: "In Progress", updatedBy: resolver._id, remarks: "Replaced faulty DDR5 ECC RAM module on node 02. Running diagnostics.", timestamp: new Date(Date.now() - 12 * 3600 * 1000) },
            ],
        });

        const grievance2 = await Grievance.create({
            grievanceId: "GRV-2026-0002-3819",
            title: "Semester V Examination Fee Debited Twice",
            description: "Payment gateway failed on first attempt, second attempt succeeded, but both debited Rs 2,400 from SBI account.",
            category: categories[3]._id,
            department: finDept._id,
            complainant: student._id,
            assignedTo: null,
            priority: "High",
            status: "Under Review",
            statusHistory: [
                { previousStatus: "", newStatus: "Submitted", updatedBy: student._id, remarks: "Complaint lodged with bank transaction statements.", timestamp: new Date(Date.now() - 48 * 3600 * 1000) },
                { previousStatus: "Submitted", newStatus: "Under Review", updatedBy: admin._id, remarks: "Sent to Accounts reconciliation section.", timestamp: new Date(Date.now() - 20 * 3600 * 1000) },
            ],
        });

        const grievance3 = await Grievance.create({
            grievanceId: "GRV-2026-0003-7164",
            title: "Hostel Block B Geyser Circuit Tripped",
            description: "No hot water in 2nd-floor washrooms due to main breaker tripping after voltage spike.",
            category: categories[1]._id,
            department: hostelDept._id,
            complainant: student._id,
            assignedTo: resolver._id,
            priority: "Medium",
            status: "Resolved",
            resolutionDetails: {
                resolvedBy: resolver._id,
                resolutionNotes: "Replaced 32A MCB switch and verified insulation resistance on solar heating line.",
                resolvedAt: new Date(Date.now() - 4 * 3600 * 1000),
            },
            statusHistory: [
                { previousStatus: "", newStatus: "Submitted", updatedBy: student._id, remarks: "Grievance submitted.", timestamp: new Date(Date.now() - 60 * 3600 * 1000) },
                { previousStatus: "Submitted", newStatus: "Assigned", updatedBy: admin._id, remarks: "Assigned to maintenance team.", timestamp: new Date(Date.now() - 40 * 3600 * 1000) },
                { previousStatus: "Assigned", newStatus: "In Progress", updatedBy: resolver._id, remarks: "Electrician dispatched.", timestamp: new Date(Date.now() - 10 * 3600 * 1000) },
                { previousStatus: "In Progress", newStatus: "Resolved", updatedBy: resolver._id, remarks: "Heater switch replaced and heating verified.", timestamp: new Date(Date.now() - 4 * 3600 * 1000) },
            ],
        });

        const grievance4 = await Grievance.create({
            grievanceId: "GRV-2026-0004-1829",
            title: "Core Subject CS-502 Missing from Hall Ticket",
            description: "Registered for CS-502 Distributed Systems in portal but exam hall ticket lists CS-503 Cryptography instead.",
            category: categories[2]._id,
            department: examDept._id,
            complainant: student._id,
            assignedTo: null,
            priority: "Urgent",
            status: "Escalated",
            escalatedTo: {
                role: "hod",
                user: hod._id,
                reason: "Examination date is within 48 hours. Requires Dean/HOD signoff for registration amendment.",
                escalatedAt: new Date(Date.now() - 6 * 3600 * 1000),
            },
            statusHistory: [
                { previousStatus: "", newStatus: "Submitted", updatedBy: student._id, remarks: "Urgent escalation requested.", timestamp: new Date(Date.now() - 12 * 3600 * 1000) },
                { previousStatus: "Submitted", newStatus: "Escalated", updatedBy: admin._id, remarks: "Escalated to HOD due to exam proximity.", timestamp: new Date(Date.now() - 6 * 3600 * 1000) },
            ],
        });

        console.log("✅ Seeded 4 sample grievances with lifecycle audit histories.");

        // 5. Seed Notifications
        await Notification.insertMany([
            {
                recipient: student._id,
                title: "Grievance Status: In Progress",
                message: "Prof. Rajesh Sharma has commenced hardware diagnostics on #GRV-2026-0001-9482.",
                type: "status_change",
                relatedGrievance: grievance1._id,
                isRead: false,
            },
            {
                recipient: student._id,
                title: "Grievance Resolved: Hostel Geyser",
                message: "#GRV-2026-0003-7164 has been resolved. Please provide resolution feedback.",
                type: "resolution",
                relatedGrievance: grievance3._id,
                isRead: false,
            },
            {
                recipient: resolver._id,
                title: "Grievance Assigned to You",
                message: "High priority grievance #GRV-2026-0001-9482 assigned by Dr. Sarah Jenkins.",
                type: "assignment",
                relatedGrievance: grievance1._id,
                isRead: false,
            },
            {
                recipient: hod._id,
                title: "Grievance Escalation Alert",
                message: "Urgent hall ticket issue #GRV-2026-0004-1829 has been escalated to your desk.",
                type: "escalation",
                relatedGrievance: grievance4._id,
                isRead: false,
            },
        ]);

        console.log("✅ Seeded initial notifications.");
        console.log("\n🎉 Database Seeding Completed Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();
