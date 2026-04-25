"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPDF = exports.uploadCSV = void 0;
const XLSX = __importStar(require("xlsx"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const applicant_model_1 = __importDefault(require("../models/applicant.model"));
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const parseResumeWithAI = async (resumeText) => {
    try {
        const prompt = `
Extract structured data from this resume text.
Return ONLY a JSON object like this:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+250781234567",
  "skills": ["skill1", "skill2"],
  "experienceYears": 3,
  "educationLevel": "BSc Computer Science",
  "currentPosition": "Software Engineer at Company",
  "location": "Kigali, Rwanda",
  "summary": "Brief professional summary"
}

Resume text:
${resumeText}
`;
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });
        const text = result.text;
        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        return JSON.parse(cleanText);
    }
    catch (error) {
        console.error("Resume parsing failed:", error);
        return null;
    }
};
const uploadCSV = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
            return;
        }
        const { jobId } = req.body;
        if (!jobId) {
            res.status(400).json({
                success: false,
                message: "Job ID is required",
            });
            return;
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        if (rows.length === 0) {
            res.status(400).json({
                success: false,
                message: "File is empty",
            });
            return;
        }
        const applicants = rows.map((row) => ({
            name: row.name || row.Name || row.NAME || "Unknown",
            email: row.email || row.Email || row.EMAIL || "",
            phone: row.phone || row.Phone || row.PHONE || "",
            skills: row.skills
                ? row.skills.split(",").map((s) => s.trim())
                : [],
            experienceYears: parseInt(row.experience || row.experienceYears || "0"),
            educationLevel: row.education || row.educationLevel || "",
            currentPosition: row.position || row.currentPosition || "",
            location: row.location || row.Location || "",
            summary: row.summary || row.Summary || "",
            jobId,
            source: "external",
        }));
        await applicant_model_1.default.insertMany(applicants);
        res.status(200).json({
            success: true,
            message: `${applicants.length} applicants uploaded successfully!`,
            data: applicants,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to upload file",
            error: error,
        });
    }
};
exports.uploadCSV = uploadCSV;
const uploadPDF = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            res.status(400).json({
                success: false,
                message: "No files uploaded",
            });
            return;
        }
        const { jobId } = req.body;
        if (!jobId) {
            res.status(400).json({
                success: false,
                message: "Job ID is required",
            });
            return;
        }
        const files = req.files;
        const savedApplicants = [];
        for (const file of files) {
            try {
                const pdfData = await (0, pdf_parse_1.default)(file.buffer);
                const resumeText = pdfData.text;
                const parsed = await parseResumeWithAI(resumeText);
                if (parsed) {
                    const applicant = new applicant_model_1.default({
                        ...parsed,
                        jobId,
                        source: "external",
                        resumeText,
                    });
                    await applicant.save();
                    savedApplicants.push(applicant);
                }
            }
            catch (err) {
                console.error(`Failed to process ${file.originalname}:`, err);
            }
        }
        res.status(200).json({
            success: true,
            message: `${savedApplicants.length} resumes processed successfully!`,
            data: savedApplicants,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to upload PDFs",
            error: error,
        });
    }
};
exports.uploadPDF = uploadPDF;
//# sourceMappingURL=upload.controller.js.map