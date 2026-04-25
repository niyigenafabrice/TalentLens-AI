"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvitationEmail = exports.getInterviewQuestions = exports.getScreeningResults = exports.runScreening = void 0;
const job_model_1 = __importDefault(require("../models/job.model"));
const applicant_model_1 = __importDefault(require("../models/applicant.model"));
const screening_model_1 = __importDefault(require("../models/screening.model"));
const ai_controller_1 = require("./ai.controller");
const runScreening = async (req, res) => {
    try {
        const { jobId } = req.body;
        const job = await job_model_1.default.findById(jobId);
        if (!job) {
            res.status(404).json({
                success: false,
                message: "Job not found",
            });
            return;
        }
        const applicants = await applicant_model_1.default.find({ jobId });
        if (applicants.length === 0) {
            res.status(400).json({
                success: false,
                message: "No applicants found for this job",
            });
            return;
        }
        const aiResults = await (0, ai_controller_1.screenCandidates)(job, applicants);
        const results = aiResults.map((result) => {
            const applicant = applicants.find((a) => a.name.toLowerCase() === result.name.toLowerCase());
            return {
                ...result,
                applicantId: applicant?._id,
            };
        });
        const biasWarning = (0, ai_controller_1.detectBias)(applicants);
        const screening = new screening_model_1.default({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Screening failed",
            error: error,
        });
    }
};
exports.runScreening = runScreening;
const getScreeningResults = async (req, res) => {
    try {
        const screening = await screening_model_1.default.findOne({
            jobId: req.params.jobId,
        }).sort({ createdAt: -1 });
        if (!screening) {
            res.status(404).json({
                success: false,
                message: "No screening results found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: screening,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get screening results",
            error: error,
        });
    }
};
exports.getScreeningResults = getScreeningResults;
const getInterviewQuestions = async (req, res) => {
    try {
        const { jobId, candidateData } = req.body;
        const job = await job_model_1.default.findById(jobId);
        if (!job) {
            res.status(404).json({
                success: false,
                message: "Job not found",
            });
            return;
        }
        const questions = await (0, ai_controller_1.generateInterviewQuestions)(job, candidateData);
        res.status(200).json({
            success: true,
            data: questions,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate questions",
            error: error,
        });
    }
};
exports.getInterviewQuestions = getInterviewQuestions;
const getInvitationEmail = async (req, res) => {
    try {
        const { jobId, candidateData } = req.body;
        const job = await job_model_1.default.findById(jobId);
        if (!job) {
            res.status(404).json({
                success: false,
                message: "Job not found",
            });
            return;
        }
        const email = await (0, ai_controller_1.generateEmail)(job, candidateData);
        res.status(200).json({
            success: true,
            data: email,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate email",
            error: error,
        });
    }
};
exports.getInvitationEmail = getInvitationEmail;
//# sourceMappingURL=screening.controller.js.map