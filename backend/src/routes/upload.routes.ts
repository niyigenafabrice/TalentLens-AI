import express from "express";
import multer from "multer";
import { uploadCSV, uploadPDF } from "../controllers/upload.controller";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload/csv - Upload CSV or Excel file
router.post("/csv", upload.single("file"), uploadCSV);

// POST /api/upload/pdf - Upload multiple PDF resumes
router.post("/pdf", upload.array("files", 20), uploadPDF);

export default router;
