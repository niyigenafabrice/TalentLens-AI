import { Request, Response } from "express";
import Pipeline from "../models/pipeline.model";
import Applicant from "../models/applicant.model";

// Create pipeline for applicant
export const createPipeline = async (req: Request, res: Response) => {
  try {
    const { applicantId, jobId } = req.body;

    // Check if pipeline already exists
    const existing = await Pipeline.findOne({ applicantId, jobId });
    if (existing) {
      res.status(400).json({
        success: false,
        message: "Pipeline already exists for this applicant",
      });
      return;
    }

    const pipeline = new Pipeline({
      applicantId,
      jobId,
      currentStage: "applied",
      stages: [
        { stage: "applied", status: "completed", enteredAt: new Date() },
        { stage: "screened", status: "pending" },
        { stage: "shortlisted", status: "pending" },
        { stage: "interview", status: "pending" },
        { stage: "offer", status: "pending" },
        { stage: "hired", status: "pending" },
      ],
    });

    await pipeline.save();

    res.status(201).json({
      success: true,
      message: "Pipeline created successfully!",
      data: pipeline,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create pipeline",
      error: error,
    });
  }
};

// Get pipeline for applicant
export const getPipelineByApplicant = async (req: Request, res: Response) => {
  try {
    const pipeline = await Pipeline.findOne({
      applicantId: req.params.applicantId,
    })
      .populate("applicantId", "name email phone")
      .populate("jobId", "title department");

    if (!pipeline) {
      res.status(404).json({
        success: false,
        message: "Pipeline not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: pipeline,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get pipeline",
      error: error,
    });
  }
};

// Get all pipelines for a job
export const getPipelinesByJob = async (req: Request, res: Response) => {
  try {
    const pipelines = await Pipeline.find({ jobId: req.params.jobId })
      .populate("applicantId", "name email phone aiScore")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pipelines.length,
      data: pipelines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get pipelines",
      error: error,
    });
  }
};

// Advance pipeline to next stage
export const advancePipeline = async (req: Request, res: Response) => {
  try {
    const { stage, notes } = req.body;

    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) {
      res.status(404).json({
        success: false,
        message: "Pipeline not found",
      });
      return;
    }

    // Update the stage
    const stageIndex = pipeline.stages.findIndex((s) => s.stage === stage);
    if (stageIndex !== -1) {
      pipeline.stages[stageIndex].status = "completed";
      pipeline.stages[stageIndex].completedAt = new Date();
      pipeline.stages[stageIndex].notes = notes || "";
    }

    pipeline.currentStage = stage;

    // Update overall status if hired or rejected
    if (stage === "hired") {
      pipeline.overallStatus = "hired";
      await Applicant.findByIdAndUpdate(pipeline.applicantId, {
        status: "hired",
      });
    } else if (stage === "rejected") {
      pipeline.overallStatus = "rejected";
      await Applicant.findByIdAndUpdate(pipeline.applicantId, {
        status: "rejected",
      });
    }

    await pipeline.save();

    res.status(200).json({
      success: true,
      message: `Pipeline advanced to ${stage}!`,
      data: pipeline,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to advance pipeline",
      error: error,
    });
  }
};

// Get pipeline statistics
export const getPipelineStats = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.query;
    const filter: any = jobId ? { jobId } : {};

    const total = await Pipeline.countDocuments(filter);
    const hired = await Pipeline.countDocuments({
      ...filter,
      overallStatus: "hired",
    });
    const rejected = await Pipeline.countDocuments({
      ...filter,
      overallStatus: "rejected",
    });
    const active = await Pipeline.countDocuments({
      ...filter,
      overallStatus: "active",
    });

    const stageStats = await Pipeline.aggregate([
      { $match: filter },
      { $group: { _id: "$currentStage", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        hired,
        rejected,
        active,
        stageStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get pipeline stats",
      error: error,
    });
  }
};
