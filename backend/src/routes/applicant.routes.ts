import express from "express";
import {
  createApplicant,
  getApplicantsByJob,
  getApplicantById,
  getMyApplication,
  updateApplicantStatus,
  updateDraft,
  deleteApplicant,
  searchApplicants,
} from "../controllers/applicant.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/search", searchApplicants);
router.get("/my-application", protect, getMyApplication); // applicant sees their own
router.patch("/my-draft", protect, updateDraft); // applicant updates draft
router.get("/", getApplicantsByJob);
router.post("/", protect, createApplicant);
router.get("/job/:jobId", getApplicantsByJob);
router.get("/:id", getApplicantById);
router.patch("/:id/status", updateApplicantStatus);
router.put("/:id", updateApplicantStatus);
router.delete("/:id", deleteApplicant);

export default router;

