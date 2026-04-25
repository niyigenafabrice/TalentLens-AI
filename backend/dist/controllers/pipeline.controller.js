"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPipelineStats = exports.advancePipeline = exports.getPipelinesByJob = exports.getPipelineByApplicant = exports.createPipeline = void 0;
const pipeline_model_1 = __importDefault(require("../models/pipeline.model"));
const applicant_model_1 = __importDefault(require("../models/applicant.model"));
// Create pipeline for applicant
const createPipeline = async (req, res) => {
    try {
        const { applicantId, jobId } = req.body;
        // Check if pipeline already exists
        const existing = await pipeline_model_1.default.findOne({ applicantId, jobId });
        if (existing) {
            res.status(400).json({
                success: false,
                message: "Pipeline already exists for this applicant",
            });
            return;
        }
        const pipeline = new pipeline_model_1.default({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create pipeline",
            error: error,
        });
    }
};
exports.createPipeline = createPipeline;
// Get pipeline for applicant
const getPipelineByApplicant = async (req, res) => {
    try {
        const pipeline = await pipeline_model_1.default.findOne({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get pipeline",
            error: error,
        });
    }
};
exports.getPipelineByApplicant = getPipelineByApplicant;
// Get all pipelines for a job
const getPipelinesByJob = async (req, res) => {
    try {
        const pipelines = await pipeline_model_1.default.find({ jobId: req.params.jobId })
            .populate("applicantId", "name email phone aiScore")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: pipelines.length,
            data: pipelines,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get pipelines",
            error: error,
        });
    }
};
exports.getPipelinesByJob = getPipelinesByJob;
// Advance pipeline to next stage
const advancePipeline = async (req, res) => {
    try {
        const { stage, notes } = req.body;
        const pipeline = await pipeline_model_1.default.findById(req.params.id);
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
            await applicant_model_1.default.findByIdAndUpdate(pipeline.applicantId, {
                status: "hired",
            });
        }
        else if (stage === "rejected") {
            pipeline.overallStatus = "rejected";
            await applicant_model_1.default.findByIdAndUpdate(pipeline.applicantId, {
                status: "rejected",
            });
        }
        await pipeline.save();
        res.status(200).json({
            success: true,
            message: `Pipeline advanced to ${stage}!`,
            data: pipeline,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to advance pipeline",
            error: error,
        });
    }
};
exports.advancePipeline = advancePipeline;
// Get pipeline statistics
const getPipelineStats = async (req, res) => {
    try {
        const { jobId } = req.query;
        const filter = jobId ? { jobId } : {};
        const total = await pipeline_model_1.default.countDocuments(filter);
        const hired = await pipeline_model_1.default.countDocuments({
            ...filter,
            overallStatus: "hired",
        });
        const rejected = await pipeline_model_1.default.countDocuments({
            ...filter,
            overallStatus: "rejected",
        });
        const active = await pipeline_model_1.default.countDocuments({
            ...filter,
            overallStatus: "active",
        });
        const stageStats = await pipeline_model_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get pipeline stats",
            error: error,
        });
    }
};
exports.getPipelineStats = getPipelineStats;
//# sourceMappingURL=pipeline.controller.js.map