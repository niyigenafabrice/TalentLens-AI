import { Request, Response } from "express";
import * as XLSX from "xlsx";
const pdf = require("pdf-parse");
import Applicant from "../models/applicant.model";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const parseResumeWithAI = async (resumeText: string) => {
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
  } catch (error) {
    console.error("Resume parsing failed:", error);
    return null;
  }
};

export const uploadCSV = async (req: Request, res: Response) => {
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
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    if (rows.length === 0) {
      res.status(400).json({
        success: false,
        message: "File is empty",
      });
      return;
    }

    const applicants = rows.map((row: any) => ({
      name: row.name || row.Name || row.NAME || "Unknown",
      email: row.email || row.Email || row.EMAIL || "",
      phone: row.phone || row.Phone || row.PHONE || "",
      skills: row.skills
        ? row.skills.split(",").map((s: string) => s.trim())
        : [],
      experienceYears: parseInt(row.experience || row.experienceYears || "0"),
      educationLevel: row.education || row.educationLevel || "",
      currentPosition: row.position || row.currentPosition || "",
      location: row.location || row.Location || "",
      summary: row.summary || row.Summary || "",
      jobId,
      source: "external",
    }));

    await Applicant.insertMany(applicants);

    res.status(200).json({
      success: true,
      message: `${applicants.length} applicants uploaded successfully!`,
      data: applicants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error,
    });
  }
};

export const uploadPDF = async (req: Request, res: Response) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
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

    const files = req.files as Express.Multer.File[];
    const savedApplicants = [];

    for (const file of files) {
      try {
        const pdfData = await pdf(file.buffer);
        const resumeText = pdfData.text;
        const parsed = await parseResumeWithAI(resumeText);

        if (parsed) {
          const applicant = new Applicant({
            ...parsed,
            jobId,
            source: "external",
            resumeText,
          });
          await applicant.save();
          savedApplicants.push(applicant);
        }
      } catch (err) {
        console.error(`Failed to process ${file.originalname}:`, err);
      }
    }

    res.status(200).json({
      success: true,
      message: `${savedApplicants.length} resumes processed successfully!`,
      data: savedApplicants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload PDFs",
      error: error,
    });
  }
};
