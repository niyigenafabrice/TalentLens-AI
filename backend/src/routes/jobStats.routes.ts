import express from "express";
import {
  getJobStats,
  getAllJobsStats,
  getHiringFunnel,
} from "../controllers/jobStats.controller";

const router = express.Router();

// GET /api/job-stats - Get stats for all jobs
router.get("/", getAllJobsStats);

// GET /api/job-stats/funnel - Get overall hiring funnel
router.get("/funnel", getHiringFunnel);

// GET /api/job-stats/:jobId - Get stats for a specific job
router.get("/:jobId", getJobStats);

export default router;
