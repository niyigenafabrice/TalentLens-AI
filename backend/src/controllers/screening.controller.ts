import { Request, Response } from "express";
import Job from "../models/job.model";
import Applicant from "../models/applicant.model";
import Screening from "../models/screening.model";
import {
  screenCandidates,
  detectBias,
  generateInterviewQuestions,
  generateEmail,
} from "./ai.controller";

// Screen ONE candidate at a time (used by frontend)
export const screenSingleCandidate = async (req: Request, res: Response) => {
  try {
    const { jobId, applicantId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      res.status(404).json({ success: false, message: "Applicant not found" });
      return;
    }

    // Screen just this one candidate
    const aiResults = await screenCandidates(job, [applicant]);

    if (!aiResults || aiResults.length === 0) {
      res
        .status(500)
        .json({ success: false, message: "AI screening returned no results" });
      return;
    }

    const result = aiResults[0];

    // Update applicant with AI score
    await Applicant.findByIdAndUpdate(applicantId, {
      aiScore: result.score,
      aiRecommendation: result.recommendation,
      aiFeedback: {
        strengths: result.strengths || [],
        weaknesses: result.gaps || [],
        recommendation: result.recommendation,
      },
      status: "screening",
    });

    // Return enriched result
    res.status(200).json({
      success: true,
      message: "Screening completed!",
      data: {
        _id: applicantId,
        fullName: applicant.name,
        name: applicant.name,
        email: applicant.email,
        currentTitle: (applicant as any).currentPosition,
        aiScore: result.score,
        aiFeedback: {
          strengths: result.strengths || [],
          weaknesses: result.gaps || [],
          recommendation: result.recommendation,
        },
        jobId,
      },
    });
  } catch (error: any) {
    console.error("Single screening error:", error.message);
    res.status(500).json({
      success: false,
      message: "Screening failed: " + error.message,
      error: error,
    });
  }
};

// Screen ALL candidates for a job (batch)
export const runScreening = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    const applicants = await Applicant.find({ jobId });
    if (applicants.length === 0) {
      res
        .status(400)
        .json({ success: false, message: "No applicants found for this job" });
      return;
    }

    const aiResults = await screenCandidates(job, applicants);

    const results = aiResults.map((result: any) => {
      const applicant = applicants.find(
        (a) => a.name.toLowerCase() === result.name.toLowerCase(),
      );
      return { ...result, applicantId: applicant?._id };
    });

    const biasWarning = detectBias(applicants);

    const screening = new Screening({
      jobId,
      results,
      totalApplicants: applicants.length,
      shortlistedCount: results.length,
      biasWarning,
    });

    await screening.save();

    res.status(200).json({
      success: true,
      message: "Screening completed successfully!",
      data: screening,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Screening failed",
      error: error,
    });
  }
};

export const getScreeningResults = async (req: Request, res: Response) => {
  try {
    const screening = await Screening.findOne({ jobId: req.params.jobId }).sort(
      { createdAt: -1 },
    );
    if (!screening) {
      res
        .status(404)
        .json({ success: false, message: "No screening results found" });
      return;
    }
    res.status(200).json({ success: true, data: screening });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get screening results",
      error,
    });
  }
};

export const getInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const { jobId, candidateData } = req.body;
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }
    const questions = await generateInterviewQuestions(job, candidateData);
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to generate questions", error });
  }
};

export const getInvitationEmail = async (req: Request, res: Response) => {
  try {
    const { jobId, candidateData } = req.body;
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }
    const email = await generateEmail(job, candidateData);
    res.status(200).json({ success: true, data: email });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to generate email", error });
  }
};
