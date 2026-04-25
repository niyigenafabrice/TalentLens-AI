import { Request, Response } from "express";
import Job from "../models/job.model";
import Applicant from "../models/applicant.model";
import Interview from "../models/interview.model";

export const getJobStats = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }
    const totalApplicants = await Applicant.countDocuments({ jobId });
    const screened = await Applicant.countDocuments({ jobId, aiScore: { $exists: true } });
    const shortlisted = await Applicant.countDocuments({ jobId, status: "shortlisted" });
    const rejected = await Applicant.countDocuments({ jobId, status: "rejected" });
    const hired = await Applicant.countDocuments({ jobId, status: "hired" });
    const interviews = await Interview.countDocuments({ jobId });
    const avgScoreResult = await Applicant.aggregate([
      { $match: { jobId: job._id, aiScore: { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: "$aiScore" } } },
    ]);
    const avgScore = avgScoreResult[0]?.avgScore?.toFixed(1) || 0;
    res.status(200).json({
      success: true,
      data: {
        job: { id: job._id, title: job.title },
        stats: { totalApplicants, screened, shortlisted, rejected, hired, interviews, avgAiScore: avgScore },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get job stats", error });
  }
};

export const getAllJobsStats = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find();
    const stats = await Promise.all(
      jobs.map(async (job) => {
        const totalApplicants = await Applicant.countDocuments({ jobId: job._id });
        const shortlisted = await Applicant.countDocuments({ jobId: job._id, status: "shortlisted" });
        const hired = await Applicant.countDocuments({ jobId: job._id, status: "hired" });
        const interviews = await Interview.countDocuments({ jobId: job._id });
        const avgScoreResult = await Applicant.aggregate([
          { $match: { jobId: job._id, aiScore: { $exists: true } } },
          { $group: { _id: null, avgScore: { $avg: "$aiScore" } } },
        ]);
        return {
          jobId: job._id,
          title: job.title,
          totalApplicants,
          shortlisted,
          hired,
          interviews,
          avgAiScore: avgScoreResult[0]?.avgScore?.toFixed(1) || 0,
        };
      }),
    );
    res.status(200).json({ success: true, count: stats.length, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get stats", error });
  }
};

export const getHiringFunnel = async (req: Request, res: Response) => {
  try {
    const totalJobs = await Job.countDocuments();
    const totalApplicants = await Applicant.countDocuments();
    const screened = await Applicant.countDocuments({ aiScore: { $exists: true } });
    const shortlisted = await Applicant.countDocuments({ status: "shortlisted" });
    const interviewed = await Interview.countDocuments();
    const hired = await Applicant.countDocuments({ status: "hired" });
    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        funnel: [
          { stage: "Applied", count: totalApplicants },
          { stage: "AI Screened", count: screened },
          { stage: "Shortlisted", count: shortlisted },
          { stage: "Interviewed", count: interviewed },
          { stage: "Hired", count: hired },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get funnel", error });
  }
};
