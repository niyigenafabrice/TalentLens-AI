import { Request, Response } from "express";
import Job from "../models/job.model";
import Applicant from "../models/applicant.model";

export const createJob = async (req: Request, res: Response) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json({
      success: true,
      message: "Job created successfully!",
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error,
    });
  }
};

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get jobs",
      error: error,
    });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get job",
      error: error,
    });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    await Applicant.deleteMany({ jobId: req.params.id });
    res.status(200).json({
      success: true,
      message: "Job deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error,
    });
  }
};
export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Job updated successfully!",
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error,
    });
  }
};
