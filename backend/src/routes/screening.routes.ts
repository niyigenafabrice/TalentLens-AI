import express from "express";
import {
  runScreening,
  screenSingleCandidate,
  getScreeningResults,
  getInterviewQuestions,
  getInvitationEmail,
} from "../controllers/screening.controller";

const router = express.Router();

router.post("/screen", screenSingleCandidate); // ✅ single candidate
router.post("/run", runScreening); // ✅ batch all
router.get("/:jobId", getScreeningResults);
router.post("/questions", getInterviewQuestions);
router.post("/email", getInvitationEmail);

export default router;
