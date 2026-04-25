import express from "express";
import { getDashboardAnalytics } from "../controllers/analytics.controller";

const router = express.Router();

// GET /api/analytics/dashboard
router.get("/dashboard", getDashboardAnalytics);

export default router;
