import { Request, Response } from "express";
import Activity from "../models/activity.model";

// Log a new activity
export const logActivity = async (req: Request, res: Response) => {
  try {
    const activity = new Activity({
      ...req.body,
      ipAddress: req.ip || req.socket.remoteAddress || "",
    });
    await activity.save();

    res.status(201).json({
      success: true,
      message: "Activity logged successfully!",
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to log activity",
      error: error,
    });
  }
};

// Get all activities
export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get activities",
      error: error,
    });
  }
};

// Get activities by user
export const getActivitiesByUser = async (req: Request, res: Response) => {
  try {
    const activities = await Activity.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get activities",
      error: error,
    });
  }
};

// Get activities by entity
export const getActivitiesByEntity = async (req: Request, res: Response) => {
  try {
    const { entity, entityId } = req.params;
    const activities = await Activity.find({ entity, entityId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get activities",
      error: error,
    });
  }
};

// Get recent activities
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get recent activities",
      error: error,
    });
  }
};

// Get activity summary
export const getActivitySummary = async (req: Request, res: Response) => {
  try {
    const totalActivities = await Activity.countDocuments();

    const byEntity = await Activity.aggregate([
      { $group: { _id: "$entity", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byUser = await Activity.aggregate([
      { $group: { _id: "$userName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const recentActivities = await Activity.find()
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get activity summary",
      error: error,
    });
  }
};

// Delete old activities
export const deleteOldActivities = async (req: Request, res: Response) => {
  try {
    const daysOld = parseInt(req.query.days as string) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await Activity.deleteMany({ createdAt: { $lt: cutoffDate } });

    res.status(200).json({
      success: true,
      message: `Activities older than ${daysOld} days deleted successfully!`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete old activities",
      error: error,
    });
  }
};
