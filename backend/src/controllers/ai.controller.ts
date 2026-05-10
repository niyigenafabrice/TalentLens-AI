import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const screenCandidates = async (job: any, candidates: any[]) => {
  const results = [];

  for (const candidate of candidates) {
    try {
      const prompt = `You are an expert HR recruiter. Score this candidate for the job below using this exact scoring criteria:

SCORING CRITERIA (must add up to 100):
1. Skills Match: 35% - How well do the candidate skills match the required job skills?
2. Years of Experience: 25% - Does the candidate meet or exceed the required experience?
3. Education Level: 20% - Does the candidate meet the required education level?
4. Projects and Certifications: 10% - Does the candidate have relevant projects built and certifications earned?
5. Job Title Relevance: 5% - Was the candidate previous job title similar to this role?
6. Application Quality: 3% - Is the candidate profile clear, relevant and professional?
7. Career Progression: 2% - Has the candidate grown over time (Junior to Mid to Senior)?

JOB:
- Title: ${job.title}
- Required Skills: ${job.requiredSkills.join(", ")}
- Experience Required: ${job.experienceYears} years
- Education Required: ${job.educationLevel}
- Description: ${job.description || "Not provided"}

CANDIDATE:
- Name: ${candidate.name || candidate.fullName}
- Skills: ${(candidate.skills || []).join(", ")}
- Years of Experience: ${candidate.yearsOfExperience || candidate.experienceYears || 0}
- Education Level: ${candidate.educationLevel || "Not provided"}
- Certifications: ${(candidate.certifications || []).join(", ") || "None listed"}
- Projects: ${(candidate.projects || []).join(", ") || "None listed"}
- Previous Job Title: ${candidate.currentRole || candidate.jobTitle || "Not provided"}
- Cover Letter / Summary: ${candidate.coverLetter || candidate.summary || "Not provided"}

Calculate each section score separately then add them for the final score.
Return ONLY this JSON, no extra text:
{
  "name": "candidate full name",
  "score": 85,
  "breakdown": {
    "skillsMatch": 30,
    "experience": 22,
    "education": 18,
    "projectsAndCertifications": 8,
    "jobTitleRelevance": 4,
    "applicationQuality": 2,
    "careerProgression": 1
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2"],
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
      console.log(`Screened: ${candidate.name || candidate.fullName} | Score: ${result.score} | Recommendation: ${result.recommendation}`);

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
    const prompt = `Generate 5 interview questions for this candidate based on their strengths and gaps.
JOB: ${job.title}
CANDIDATE: ${candidate.name}
STRENGTHS: ${(candidate.strengths || []).join(", ")}
GAPS: ${(candidate.gaps || []).join(", ")}
SCORE BREAKDOWN: Skills ${candidate.breakdown?.skillsMatch || 0}%, Experience ${candidate.breakdown?.experience || 0}%, Education ${candidate.breakdown?.education || 0}%

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
SCORE: ${candidate.score}%
STRENGTHS: ${(candidate.strengths || []).join(", ")}
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


