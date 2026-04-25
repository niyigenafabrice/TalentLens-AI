import express from "express";
import {
  getHiringReport,
  exportShortlisted,
  exportScreeningResults,
  getInterviewReport,
} from "../controllers/report.controller";

const router = express.Router();

router.get("/hiring", getHiringReport);
router.get("/export/shortlisted", exportShortlisted);
router.get("/export/screening", exportScreeningResults);
router.get("/interviews", getInterviewReport);

export default router;
