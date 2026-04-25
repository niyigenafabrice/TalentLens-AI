"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOldActivities = exports.getActivitySummary = exports.getRecentActivities = exports.getActivitiesByEntity = exports.getActivitiesByUser = exports.getAllActivities = exports.logActivity = void 0;
const activity_model_1 = __importDefault(require("../models/activity.model"));
// Log a new activity
const logActivity = async (req, res) => {
    try {
        const activity = new activity_model_1.default({
            ...req.body,
            ipAddress: req.ip || req.socket.remoteAddress || "",
        });
        await activity.save();
        res.status(201).json({
            success: true,
            message: "Activity logged successfully!",
            data: activity,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to log activity",
            error: error,
        });
    }
};
exports.logActivity = logActivity;
// Get all activities
const getAllActivities = async (req, res) => {
    try {
        const activities = await activity_model_1.default.find().sort({ createdAt: -1 }).limit(100);
        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get activities",
            error: error,
        });
    }
};
exports.getAllActivities = getAllActivities;
// Get activities by user
const getActivitiesByUser = async (req, res) => {
    try {
        const activities = await activity_model_1.default.find({ userId: req.params.userId }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get activities",
            error: error,
        });
    }
};
exports.getActivitiesByUser = getActivitiesByUser;
// Get activities by entity
const getActivitiesByEntity = async (req, res) => {
    try {
        const { entity, entityId } = req.params;
        const activities = await activity_model_1.default.find({ entity, entityId }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get activities",
            error: error,
        });
    }
};
exports.getActivitiesByEntity = getActivitiesByEntity;
// Get recent activities
const getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const activities = await activity_model_1.default.find()
            .sort({ createdAt: -1 })
            .limit(limit);
        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get recent activities",
            error: error,
        });
    }
};
exports.getRecentActivities = getRecentActivities;
// Get activity summary
const getActivitySummary = async (req, res) => {
    try {
        const totalActivities = await activity_model_1.default.countDocuments();
        const byEntity = await activity_model_1.default.aggregate([
            { $group: { _id: "$entity", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        const byUser = await activity_model_1.default.aggregate([
            { $group: { _id: "$userName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);
        const recentActivities = await activity_model_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5);
        res.status(200).json({
            success: true,
            data: {
                totalActivities,
                byEntity,
                byUser,
                recentActivities,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get activity summary",
            error: error,
        });
    }
};
exports.getActivitySummary = getActivitySummary;
// Delete old activities
const deleteOldActivities = async (req, res) => {
    try {
        const daysOld = parseInt(req.query.days) || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        await activity_model_1.default.deleteMany({ createdAt: { $lt: cutoffDate } });
        res.status(200).json({
            success: true,
            message: `Activities older than ${daysOld} days deleted successfully!`,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete old activities",
            error: error,
        });
    }
};
exports.deleteOldActivities = deleteOldActivities;
//# sourceMappingURL=activity.controller.js.map