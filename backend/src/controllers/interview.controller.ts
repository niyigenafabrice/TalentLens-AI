import { Request, Response } from "express";
import Interview from "../models/interview.model";
import Applicant from "../models/applicant.model";

// Schedule interview
export const scheduleInterview = async (req: Request, res: Response) => {
  try {
    const interview = new Interview(req.body);
    await interview.save();

    // Update applicant status to interview
    await Applicant.findByIdAndUpdate(req.body.applicantId, {
      status: "interview",
    });

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully!",
      data: interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to schedule interview",
      error: error,
    });
  }
};

// Get all interviews for a job
export const getInterviewsByJob = async (req: Request, res: Response) => {
  try {
    const interviews = await Interview.find({ jobId: req.params.jobId })
      .populate("applicantId", "name email phone")
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get interviews",
      error: error,
    });
  }
};

// Get all interviews
export const getAllInterviews = async (req: Request, res: Response) => {
  try {
    const interviews = await Interview.find()
      .populate("applicantId", "name email phone")
      .populate("jobId", "title department")
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get interviews",
      error: error,
    });
  }
};

// Update interview status
export const updateInterview = async (req: Request, res: Response) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Interview updated successfully!",
      data: interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update interview",
      error: error,
    });
  }
};

// Delete interview
export const deleteInterview = async (req: Request, res: Response) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Interview deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete interview",
      error: error,
    });
  }
};
