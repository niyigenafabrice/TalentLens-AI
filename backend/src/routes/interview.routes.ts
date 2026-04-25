import express from "express";
import {
  scheduleInterview,
  getInterviewsByJob,
  getAllInterviews,
  updateInterview,
  deleteInterview,
} from "../controllers/interview.controller";

const router = express.Router();

// POST /api/interviews - Schedule interview
router.post("/", scheduleInterview);

// GET /api/interviews - Get all interviews
router.get("/", getAllInterviews);

// GET /api/interviews/job/:jobId - Get interviews for a job
router.get("/job/:jobId", getInterviewsByJob);

// PUT /api/interviews/:id - Update interview
router.put("/:id", updateInterview);

// DELETE /api/interviews/:id - Delete interview
router.delete("/:id", deleteInterview);

export default router;
