import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const screenCandidates = async (job: any, candidates: any[]) => {
  const results = [];

  for (const candidate of candidates) {
    try {
      const prompt = `You are an expert HR recruiter. Score this candidate for the job below.

JOB:
- Title: ${job.title}
- Required Skills: ${job.requiredSkills.join(", ")}
- Experience Required: ${job.experienceYears} years
- Education: ${job.educationLevel}

CANDIDATE:
- Name: ${candidate.name || candidate.fullName}
- Skills: ${(candidate.skills || []).join(", ")}
- Experience: ${candidate.yearsOfExperience || candidate.experienceYears} years
- Education: ${candidate.educationLevel}

Return ONLY this JSON, no extra text:
{
  "name": "candidate name",
  "score": 85,
  "strengths": ["strength 1", "strength 2"],
  "gaps": ["gap 1"],
  "recommendation": "Recommended"
}`;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const text = response.choices[0]?.message?.content || "";
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(cleanText);
      results.push(result);
      console.log(`Screened: ${candidate.name || candidate.fullName} Score: ${result.score}`);

    } catch (error: any) {
      console.error(`Failed for ${candidate.name || candidate.fullName}: ${error.message}`);
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
      return `Bias Warning: ${percentage.toFixed(0)}% of shortlisted candidates are from ${loc}.`;
    }
  }
  return null;
};

export const generateInterviewQuestions = async (job: any, candidate: any) => {
  try {
    const prompt = `Generate 5 interview questions for this candidate.
JOB: ${job.title}
CANDIDATE: ${candidate.name}
STRENGTHS: ${(candidate.strengths || []).join(", ")}
GAPS: ${(candidate.gaps || []).join(", ")}

Return ONLY a JSON array:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const text = response.choices[0]?.message?.content || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Interview Questions Failed:", error);
    throw error;
  }
};

export const generateEmail = async (job: any, candidate: any) => {
  try {
    const prompt = `Write a professional interview invitation email.
JOB: ${job.title}
CANDIDATE: ${candidate.name}
Return only the email text.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Email Generation Failed:", error);
    throw error;
  }
};

