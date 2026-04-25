"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJob = exports.deleteJob = exports.getJobById = exports.getAllJobs = exports.createJob = void 0;
const job_model_1 = __importDefault(require("../models/job.model"));
const applicant_model_1 = __importDefault(require("../models/applicant.model"));
const createJob = async (req, res) => {
    try {
        const job = new job_model_1.default(req.body);
        await job.save();
        res.status(201).json({
            success: true,
            message: "Job created successfully!",
            data: job,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create job",
            error: error,
        });
    }
};
exports.createJob = createJob;
const getAllJobs = async (req, res) => {
    try {
        const jobs = await job_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: jobs,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get jobs",
            error: error,
        });
    }
};
exports.getAllJobs = getAllJobs;
const getJobById = async (req, res) => {
    try {
        const job = await job_model_1.default.findById(req.params.id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get job",
            error: error,
        });
    }
};
exports.getJobById = getJobById;
const deleteJob = async (req, res) => {
    try {
        await job_model_1.default.findByIdAndDelete(req.params.id);
        await applicant_model_1.default.deleteMany({ jobId: req.params.id });
        res.status(200).json({
            success: true,
            message: "Job deleted successfully!",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete job",
            error: error,
        });
    }
};
exports.deleteJob = deleteJob;
const updateJob = async (req, res) => {
    try {
        const job = await job_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update job",
            error: error,
        });
    }
};
exports.updateJob = updateJob;
//# sourceMappingURL=job.controller.js.map