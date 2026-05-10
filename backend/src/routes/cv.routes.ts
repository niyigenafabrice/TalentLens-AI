import express from "express";
import multer from "multer";
import { parseCV } from "../controllers/cv.controller";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/parse", upload.single("cv"), parseCV);

export default router;
