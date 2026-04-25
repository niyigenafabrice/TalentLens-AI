import express from "express";
import {
  createPipeline,
  getPipelineByApplicant,
  getPipelinesByJob,
  advancePipeline,
  getPipelineStats,
} from "../controllers/pipeline.controller";

const router = express.Router();

// POST /api/pipeline - Create pipeline
router.post("/", createPipeline);

// GET /api/pipeline/stats - Get pipeline statistics
router.get("/stats", getPipelineStats);

// GET /api/pipeline/job/:jobId - Get all pipelines for a job
router.get("/job/:jobId", getPipelinesByJob);

// GET /api/pipeline/applicant/:applicantId - Get pipeline for applicant
router.get("/applicant/:applicantId", getPipelineByApplicant);

// PUT /api/pipeline/:id/advance - Advance pipeline to next stage
router.put("/:id/advance", advancePipeline);

export default router;
