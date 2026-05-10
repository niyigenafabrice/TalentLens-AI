import express from "express";
import {
  scheduleInterview,
  getInterviewsByJob,
  getAllInterviews,
  updateInterview,
  deleteInterview,
  rejectApplicant,
} from "../controllers/interview.controller";

const router = express.Router();

router.post("/", scheduleInterview);
router.post("/reject", rejectApplicant);
router.get("/", getAllInterviews);
router.get("/job/:jobId", getInterviewsByJob);
router.put("/:id", updateInterview);
router.delete("/:id", deleteInterview);

export default router;
