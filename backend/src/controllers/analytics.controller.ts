import { Request, Response } from "express";
import Job from "../models/job.model";
import Applicant from "../models/applicant.model";
import Screening from "../models/screening.model";

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    // Get total counts
    const totalJobs = await Job.countDocuments();
    const totalApplicants = await Applicant.countDocuments();
    const totalScreenings = await Screening.countDocuments();

    // Get all screenings for average score
    const screenings = await Screening.find();
    let totalScore = 0;
    let scoreCount = 0;

    screenings.forEach((screening) => {
      screening.results.forEach((result: any) => {
        totalScore += result.score;
        scoreCount++;
      });
    });

    const averageScore =
      scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    // Get top skills from applicants
    const applicants = await Applicant.find();
    const skillCounts: { [key: string]: number } = {};

    applicants.forEach((applicant) => {
      applicant.skills.forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Get recent jobs
    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5);

    // Get score distribution
    const scoreDistribution = {
      strong: 0, // 80-100
      good: 0, // 60-79
      average: 0, // 40-59
      weak: 0, // 0-39
    };

    screenings.forEach((screening) => {
      screening.results.forEach((result: any) => {
        if (result.score >= 80) scoreDistribution.strong++;
        else if (result.score >= 60) scoreDistribution.good++;
        else if (result.score >= 40) scoreDistribution.average++;
        else scoreDistribution.weak++;
      });
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalJobs,
          totalApplicants,
          totalScreenings,
          averageScore,
        },
        topSkills,
        recentJobs,
        scoreDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get analytics",
      error: error,
    });
  }
};
