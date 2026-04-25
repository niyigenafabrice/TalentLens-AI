import express from "express";
import {
  logActivity,
  getAllActivities,
  getActivitiesByUser,
  getActivitiesByEntity,
  getRecentActivities,
  getActivitySummary,
  deleteOldActivities,
} from "../controllers/activity.controller";

const router = express.Router();

router.post("/", logActivity);
router.get("/", getAllActivities);
router.get("/recent", getRecentActivities);
router.get("/summary", getActivitySummary);
router.get("/user/:userId", getActivitiesByUser);
router.get("/entity/:entity/:entityId", getActivitiesByEntity);
router.delete("/cleanup", deleteOldActivities);

export default router;
