"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHiringFunnel = exports.getAllJobsStats = exports.getJobStats = void 0;
const job_model_1 = __importDefault(require("../models/job.model"));
const applicant_model_1 = __importDefault(require("../models/applicant.model"));
const interview_model_1 = __importDefault(require("../models/interview.model"));
// Get stats for a specific job
const getJobStats = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await job_model_1.default.findById(jobId);
        if (!job) {
            res.status(404).json({ success: false, message: "Job not found" });
            return;
        }
        const totalApplicants = await applicant_model_1.default.countDocuments({ jobId });
        const screened = await applicant_model_1.default.countDocuments({
            jobId,
            aiScore: { $exists: true },
        });
        const shortlisted = await applicant_model_1.default.countDocuments({
            jobId,
            status: "shortlisted",
        });
        const rejected = await applicant_model_1.default.countDocuments({
            jobId,
            status: "rejected",
        });
        const hired = await applicant_model_1.default.countDocuments({ jobId, status: "hired" });
        const interviews = await interview_model_1.default.countDocuments({ jobId });
        const avgScoreResult = await applicant_model_1.default.aggregate([
            { $match: { jobId: job._id, aiScore: { $exists: true } } },
            { $group: { _id: null, avgScore: { $avg: "$aiScore" } } },
        ]);
        const avgScore = avgScoreResult[0]?.avgScore?.toFixed(1) || 0;
        res.status(200).json({
            success: true,
            data: {
                job: { id: job._id, title: job.title, status: job.status },
                stats: {
                    totalApplicants,
                    screened,
                    shortlisted,
                    rejected,
                    hired,
                    interviews,
                    avgAiScore: avgScore,
                    screeningRate: totalApplicants
                        ? ((screened / totalApplicants) * 100).toFixed(1) + "%"
                        : "0%",
                    shortlistRate: screened
                        ? ((shortlisted / screened) * 100).toFixed(1) + "%"
                        : "0%",
                    hireRate: totalApplicants
                        ? ((hired / totalApplicants) * 100).toFixed(1) + "%"
                        : "0%",
                },
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Failed to get job stats", error });
    }
};
exports.getJobStats = getJobStats;
// Get stats for all jobs
const getAllJobsStats = async (req, res) => {
    try {
        const jobs = await job_model_1.default.find();
        const stats = await Promise.all(jobs.map(async (job) => {
            const totalApplicants = await applicant_model_1.default.countDocuments({
                jobId: job._id,
            });
            const shortlisted = await applicant_model_1.default.countDocuments({
                jobId: job._id,
                status: "shortlisted",
            });
            const hired = await applicant_model_1.default.countDocuments({
                jobId: job._id,
                status: "hired",
            });
            const interviews = await interview_model_1.default.countDocuments({ jobId: job._id });
            const avgScoreResult = await applicant_model_1.default.aggregate([
                { $match: { jobId: job._id, aiScore: { $exists: true } } },
                { $group: { _id: null, avgScore: { $avg: "$aiScore" } } },
            ]);
            return {
                jobId: job._id,
                title: job.title,
                status: job.status,
                totalApplicants,
                shortlisted,
                hired,
                interviews,
                avgAiScore: avgScoreResult[0]?.avgScore?.toFixed(1) || 0,
            };
        }));
        res.status(200).json({
            success: true,
            count: stats.length,
            data: stats,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Failed to get stats", error });
    }
};
exports.getAllJobsStats = getAllJobsStats;
// Get overall hiring funnel
const getHiringFunnel = async (req, res) => {
    try {
        const totalJobs = await job_model_1.default.countDocuments();
        const totalApplicants = await applicant_model_1.default.countDocuments();
        const screened = await applicant_model_1.default.countDocuments({
            aiScore: { $exists: true },
        });
        const shortlisted = await applicant_model_1.default.countDocuments({
            status: "shortlisted",
        });
        const interviewed = await interview_model_1.default.countDocuments();
        const hired = await applicant_model_1.default.countDocuments({ status: "hired" });
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
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Failed to get funnel", error });
    }
};
exports.getHiringFunnel = getHiringFunnel;
//# sourceMappingURL=jobStats.controller.js.map