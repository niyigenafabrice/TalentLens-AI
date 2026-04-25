"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterviewReport = exports.exportScreeningResults = exports.exportShortlisted = exports.getHiringReport = void 0;
const applicant_model_1 = __importDefault(require("../models/applicant.model"));
const job_model_1 = __importDefault(require("../models/job.model"));
const interview_model_1 = __importDefault(require("../models/interview.model"));
// Get full hiring report
const getHiringReport = async (req, res) => {
    try {
        const { jobId, startDate, endDate } = req.query;
        const filter = {};
        if (jobId)
            filter.jobId = jobId;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const totalApplicants = await applicant_model_1.default.countDocuments(filter);
        const screened = await applicant_model_1.default.countDocuments({
            ...filter,
            status: "screened",
        });
        const shortlisted = await applicant_model_1.default.countDocuments({
            ...filter,
            status: "shortlisted",
        });
        const interviewed = await applicant_model_1.default.countDocuments({
            ...filter,
            status: "interview",
        });
        const hired = await applicant_model_1.default.countDocuments({
            ...filter,
            status: "hired",
        });
        const rejected = await applicant_model_1.default.countDocuments({
            ...filter,
            status: "rejected",
        });
        const topCandidates = await applicant_model_1.default.find({ ...filter })
            .sort({ aiScore: -1 })
            .limit(10)
            .select("name email aiScore status skills experienceYears");
        const jobs = await job_model_1.default.find(jobId ? { _id: jobId } : {}).select("title department status createdAt");
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
                    hiringRate: totalApplicants > 0
                        ? ((hired / totalApplicants) * 100).toFixed(1) + "%"
                        : "0%",
                },
                topCandidates,
                jobs,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate report",
            error: error,
        });
    }
};
exports.getHiringReport = getHiringReport;
// Export shortlisted candidates as CSV
const exportShortlisted = async (req, res) => {
    try {
        const { jobId } = req.query;
        const filter = { status: "shortlisted" };
        if (jobId)
            filter.jobId = jobId;
        const candidates = await applicant_model_1.default.find(filter).select("name email phone skills experienceYears educationLevel aiScore status location");
        // Build CSV
        const headers = "Name,Email,Phone,Skills,Experience(Years),Education,AI Score,Status,Location\n";
        const rows = candidates
            .map((c) => `${c.name},${c.email},${c.phone},"${c.skills.join(", ")}",${c.experienceYears},${c.educationLevel},${c.aiScore || 0},${c.status},${c.location}`)
            .join("\n");
        const csv = headers + rows;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=shortlisted_candidates.csv");
        res.status(200).send(csv);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to export candidates",
            error: error,
        });
    }
};
exports.exportShortlisted = exportShortlisted;
// Export screening results as CSV
const exportScreeningResults = async (req, res) => {
    try {
        const { jobId } = req.query;
        const filter = {};
        if (jobId)
            filter.jobId = jobId;
        const candidates = await applicant_model_1.default.find(filter)
            .sort({ aiScore: -1 })
            .select("name email aiScore aiRecommendation status skills experienceYears");
        // Build CSV
        const headers = "Name,Email,AI Score,Recommendation,Status,Skills,Experience(Years)\n";
        const rows = candidates
            .map((c) => `${c.name},${c.email},${c.aiScore || 0},"${c.aiRecommendation || ""}",${c.status},"${c.skills.join(", ")}",${c.experienceYears}`)
            .join("\n");
        const csv = headers + rows;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=screening_results.csv");
        res.status(200).send(csv);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to export screening results",
            error: error,
        });
    }
};
exports.exportScreeningResults = exportScreeningResults;
// Get interview report
const getInterviewReport = async (req, res) => {
    try {
        const { jobId } = req.query;
        const filter = {};
        if (jobId)
            filter.jobId = jobId;
        const totalInterviews = await interview_model_1.default.countDocuments(filter);
        const scheduled = await interview_model_1.default.countDocuments({
            ...filter,
            status: "scheduled",
        });
        const completed = await interview_model_1.default.countDocuments({
            ...filter,
            status: "completed",
        });
        const cancelled = await interview_model_1.default.countDocuments({
            ...filter,
            status: "cancelled",
        });
        const upcomingInterviews = await interview_model_1.default.find({
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
                summary: {
                    totalInterviews,
                    scheduled,
                    completed,
                    cancelled,
                },
                upcomingInterviews,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate interview report",
            error: error,
        });
    }
};
exports.getInterviewReport = getInterviewReport;
//# sourceMappingURL=report.controller.js.map