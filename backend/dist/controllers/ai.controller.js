"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmail = exports.generateInterviewQuestions = exports.detectBias = exports.screenCandidates = void 0;
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ai = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
// ✅ Fix 1: Helper to wait between requests
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const screenCandidates = async (job, candidates) => {
    const results = [];
    for (const candidate of candidates) {
        try {
            // ✅ Fix 2: Screen ONE candidate at a time
            const prompt = `
You are an expert HR recruiter AI assistant.
Score this ONE candidate for the job below.

JOB DETAILS:
- Title: ${job.title}
- Description: ${job.description}
- Required Skills: ${job.requiredSkills.join(", ")}
- Experience Required: ${job.experienceYears} years
- Education Level: ${job.educationLevel}

CANDIDATE:
- Name: ${candidate.name || candidate.fullName}
- Skills: ${(candidate.skills || []).join(", ")}
- Experience: ${candidate.yearsOfExperience || candidate.experienceYears} years
- Education: ${candidate.educationLevel}
- Current Position: ${candidate.currentPosition || candidate.currentTitle || "N/A"}
- Summary: ${candidate.summary || "N/A"}

Return ONLY this JSON, no extra text:
{
  "name": "candidate name",
  "score": 85,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2"],
  "recommendation": "Strongly Recommended"
}

Recommendation must be one of:
- "Strongly Recommended"
- "Recommended"  
- "Maybe"
- "Not Recommended"
`;
            // ✅ Fix 3: Use gemini-1.5-flash — better free quota
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: prompt,
            });
            const text = response.text;
            const cleanText = text
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
            const result = JSON.parse(cleanText);
            results.push(result);
            console.log(`✅ Screened: ${candidate.name || candidate.fullName} → Score: ${result.score}`);
            // ✅ Fix 4: Wait 5 seconds between each candidate — stays under quota
            await wait(5000);
        }
        catch (error) {
            console.error(`❌ Failed for ${candidate.name || candidate.fullName}:`, error.message);
            // ✅ Fix 5: If quota hit, wait 60 seconds and retry once
            if (error.message?.includes("429") || error.message?.includes("quota")) {
                console.log("⏳ Quota hit! Waiting 60 seconds...");
                await wait(60000);
                // retry
                try {
                    const retryResponse = await ai.models.generateContent({
                        model: "gemini-1.5-flash",
                        contents: `Score this candidate for ${job.title}: ${candidate.name || candidate.fullName}, ${candidate.yearsOfExperience} years exp, skills: ${(candidate.skills || []).join(", ")}. Return JSON: {"name":"...","score":75,"strengths":["..."],"gaps":["..."],"recommendation":"Recommended"}`,
                    });
                    const retryText = retryResponse.text
                        .replace(/```json/g, "")
                        .replace(/```/g, "")
                        .trim();
                    results.push(JSON.parse(retryText));
                }
                catch (retryError) {
                    console.error("Retry also failed, skipping candidate");
                }
            }
        }
    }
    // ✅ Fix 6: Sort by score, return top 10
    return results.sort((a, b) => b.score - a.score).slice(0, 10);
};
exports.screenCandidates = screenCandidates;
const detectBias = (candidates) => {
    const locations = candidates.map((c) => c.location).filter(Boolean);
    const locationCounts = {};
    locations.forEach((loc) => {
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    for (const loc in locationCounts) {
        const percentage = (locationCounts[loc] / candidates.length) * 100;
        if (percentage >= 80) {
            return `Bias Warning: ${percentage.toFixed(0)}% of shortlisted candidates are from ${loc}. Consider reviewing manually.`;
        }
    }
    return null;
};
exports.detectBias = detectBias;
const generateInterviewQuestions = async (job, candidate) => {
    try {
        await wait(5000);
        const prompt = `
You are an expert HR interviewer.
Generate 5 personalized interview questions for this candidate.

JOB: ${job.title}
CANDIDATE NAME: ${candidate.name}
CANDIDATE STRENGTHS: ${(candidate.strengths || []).join(", ")}
CANDIDATE GAPS: ${(candidate.gaps || []).join(", ")}

Return ONLY a JSON array like this:
[
  "Question 1 here?",
  "Question 2 here?",
  "Question 3 here?",
  "Question 4 here?",
  "Question 5 here?"
]
`;
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
        });
        const text = response.text;
        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        return JSON.parse(cleanText);
    }
    catch (error) {
        console.error("Interview Questions Failed:", error);
        throw error;
    }
};
exports.generateInterviewQuestions = generateInterviewQuestions;
const generateEmail = async (job, candidate) => {
    try {
        await wait(5000);
        const prompt = `
Write a professional interview invitation email.

JOB TITLE: ${job.title}
CANDIDATE NAME: ${candidate.name}
CANDIDATE STRENGTHS: ${(candidate.strengths || []).join(", ")}

Write a warm, professional and personalized email.
Return ONLY the email text, no subject line.
`;
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    }
    catch (error) {
        console.error("Email Generation Failed:", error);
        throw error;
    }
};
exports.generateEmail = generateEmail;
//# sourceMappingURL=ai.controller.js.map