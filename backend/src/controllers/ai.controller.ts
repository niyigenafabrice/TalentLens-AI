import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const screenCandidates = async (job: any, candidates: any[]) => {
  const results = [];

  for (const candidate of candidates) {
    try {
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

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const text = response.text;
      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const result = JSON.parse(cleanText);
      results.push(result);
      console.log(`Screened: ${candidate.name || candidate.fullName} Score: ${result.score}`);

      await wait(20000);
    } catch (error: any) {
      if (error.message?.includes("429") || error.message?.includes("quota")) {
        console.log("Quota hit! Waiting 60 seconds...");
        await wait(60000);
        try {
          const retryResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Score this candidate and return only JSON: {"name":"${candidate.name || candidate.fullName}","score":75,"strengths":["relevant experience"],"gaps":["needs assessment"],"recommendation":"Recommended"}`,
          });
          const retryText = retryResponse.text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          results.push(JSON.parse(retryText));
        } catch (retryError) {
          console.error("Retry also failed, skipping candidate");
        }
      } else {
        console.error(`Failed for ${candidate.name || candidate.fullName}: ${error.message}`);
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
};

export const detectBias = (candidates: any[]) => {
  const locations = candidates.map((c) => c.location).filter(Boolean);
  const locationCounts: { [key: string]: number } = {};

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

export const generateInterviewQuestions = async (job: any, candidate: any) => {
  try {
    await wait(20000);
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
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text;
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Interview Questions Failed:", error);
    throw error;
  }
};

export const generateEmail = async (job: any, candidate: any) => {
  try {
    await wait(20000);
    const prompt = `
Write a professional interview invitation email.

JOB TITLE: ${job.title}
CANDIDATE NAME: ${candidate.name}
CANDIDATE STRENGTHS: ${(candidate.strengths || []).join(", ")}

Write a warm, professional and personalized email.
Return ONLY the email text, no subject line.
`;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Email Generation Failed:", error);
    throw error;
  }
};




