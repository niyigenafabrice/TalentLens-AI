import { Request, Response } from "express";
import Applicant from "../models/applicant.model";
import Job from "../models/job.model";
import Interview from "../models/interview.model";
import Pipeline from "../models/pipeline.model";

// Get full hiring report
export const getHiringReport = async (req: Request, res: Response) => {
  try {
    const { jobId, startDate, endDate } = req.query;

    const filter: any = {};
    if (jobId) filter.jobId = jobId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const totalApplicants = await Applicant.countDocuments(filter);
    const screened = await Applicant.countDocuments({
      ...filter,
      status: "screened",
    });
    const shortlisted = await Applicant.countDocuments({
      ...filter,
      status: "shortlisted",
    });
    const interviewed = await Applicant.countDocuments({
      ...filter,
      status: "interview",
    });
    const hired = await Applicant.countDocuments({
      ...filter,
      status: "hired",
    });
    const rejected = await Applicant.countDocuments({
      ...filter,
      status: "rejected",
    });

    const topCandidates = await Applicant.find({ ...filter })
      .sort({ aiScore: -1 })
      .limit(10)
      .select("name email aiScore status skills experienceYears");

    const jobs = await Job.find(jobId ? { _id: jobId } : {}).select(
      "title department status createdAt",
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalApplicants,
          screened,
          shortlisted,
          interviewed,
          hired,
          rejected,
          hiringRate:
            totalApplicants > 0
              ? ((hired / totalApplicants) * 100).toFixed(1) + "%"
              : "0%",
        },
        topCandidates,
        jobs,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to generate report", error });
  }
};

// Export shortlisted candidates as CSV
export const exportShortlisted = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.query;
    const filter: any = { status: "shortlisted" };
    if (jobId) filter.jobId = jobId;

    const candidates = await Applicant.find(filter).select(
      "name email phone skills experienceYears educationLevel aiScore status location",
    );

    const headers =
      "Name,Email,Phone,Skills,Experience(Years),Education,AI Score,Status,Location\n";
    const rows = candidates
      .map(
        (c: any) =>
          `${c.name},${c.email},${c.phone},"${c.skills.join(", ")}",${c.experienceYears},${c.educationLevel},${c.aiScore || 0},${c.status},${c.location}`,
      )
      .join("\n");

    const csv = headers + rows;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=shortlisted_candidates.csv",
    );
    res.status(200).send(csv);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to export candidates", error });
  }
};

// Export screening results as CSV
export const exportScreeningResults = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.query;
    const filter: any = {};
    if (jobId) filter.jobId = jobId;

    const candidates = await Applicant.find(filter)
      .sort({ aiScore: -1 })
      .select(
        "name email aiScore aiRecommendation status skills experienceYears",
      );

    const headers =
      "Name,Email,AI Score,Recommendation,Status,Skills,Experience(Years)\n";
    const rows = candidates
      .map(
        (c: any) =>
          `${c.name},${c.email},${c.aiScore || 0},"${c.aiRecommendation || ""}",${c.status},"${c.skills.join(", ")}",${c.experienceYears}`,
      )
      .join("\n");

    const csv = headers + rows;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=screening_results.csv",
    );
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to export screening results",
      error,
    });
  }
};

// Get interview report
export const getInterviewReport = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.query;
    const filter: any = {};
    if (jobId) filter.jobId = jobId;

    const totalInterviews = await Interview.countDocuments(filter);
    const scheduled = await Interview.countDocuments({
      ...filter,
      status: "scheduled",
    });
    const completed = await Interview.countDocuments({
      ...filter,
      status: "completed",
    });
    const cancelled = await Interview.countDocuments({
      ...filter,
      status: "cancelled",
    });

    const upcomingInterviews = await Interview.find({
      ...filter,
      status: "scheduled",
      scheduledDate: { $gte: new Date() },
    })
      .populate("applicantId", "name email")
      .populate("jobId", "title")
      .sort({ scheduledDate: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        summary: { totalInterviews, scheduled, completed, cancelled },
        upcomingInterviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate interview report",
      error,
    });
  }
};
