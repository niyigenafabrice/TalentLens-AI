import { Request, Response } from "express";
import pdfParse from "pdf-parse";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const parseCV = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    // Extract text from PDF
    let cvText = "";
    try {
      const parsed = await pdfParse(req.file.buffer);
      cvText = parsed.text;
    } catch (e) {
      // If PDF parse fails, use filename as fallback
      cvText = req.file.originalname;
    }

    if (!cvText || cvText.trim().length < 20) {
      res.status(400).json({ success: false, message: "Could not extract text from CV. Please make sure it is a text-based PDF." });
      return;
    }

    // Use Groq AI to extract structured info
    const prompt = `You are an expert CV parser. Extract information from this CV text and return ONLY a JSON object with no extra text or markdown.

CV TEXT:
${cvText.slice(0, 3000)}

Extract and return ONLY this JSON:
{
  "fullName": "candidate full name",
  "email": "email address or empty string",
  "phone": "phone number or empty string",
  "currentTitle": "current or most recent job title or empty string",
  "yearsOfExperience": 3,
  "educationLevel": "highest education level (one of: High School, Diploma, Bachelor Degree, BSc Computer Science, BSc Software Engineering, BSc Information Technology, MSc Computer Science, MSc Software Engineering, MBA, PhD, Other)",
  "summary": "2-3 sentence professional summary based on the CV",
  "skills": ["skill1", "skill2", "skill3"],
  "certifications": ["cert1", "cert2"],
  "projects": ["project1 description", "project2 description"],
  "githubUrl": "github url if found or empty string",
  "portfolioUrl": "portfolio or website url if found or empty string"
}

Rules:
- skills must be an array of strings (technical skills only, max 10)
- certifications must be an array of strings (max 5)
- projects must be an array of strings describing each project (max 3)
- yearsOfExperience must be a number
- Return ONLY the JSON, no explanation`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const text = response.choices[0]?.message?.content || "";
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const extracted = JSON.parse(clean);

    res.status(200).json({
      success: true,
      message: "CV parsed successfully",
      data: extracted,
    });

  } catch (error: any) {
    console.error("CV parse error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to parse CV",
      error: error.message,
    });
  }
};
