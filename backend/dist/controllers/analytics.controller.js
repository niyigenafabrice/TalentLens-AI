"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAnalytics = void 0;
const job_model_1 = __importDefault(require("../models/job.model"));
const applicant_model_1 = __importDefault(require("../models/applicant.model"));
const screening_model_1 = __importDefault(require("../models/screening.model"));
const getDashboardAnalytics = async (req, res) => {
    try {
        // Get total counts
        const totalJobs = await job_model_1.default.countDocuments();
        const totalApplicants = await applicant_model_1.default.countDocuments();
        const totalScreenings = await screening_model_1.default.countDocuments();
        // Get all screenings for average score
        const screenings = await screening_model_1.default.find();
        let totalScore = 0;
        let scoreCount = 0;
        screenings.forEach((screening) => {
            screening.results.forEach((result) => {
                totalScore += result.score;
                scoreCount++;
            });
        });
        const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
        // Get top skills from applicants
        const applicants = await applicant_model_1.default.find();
        const skillCounts = {};
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
        const recentJobs = await job_model_1.default.find().sort({ createdAt: -1 }).limit(5);
        // Get score distribution
        const scoreDistribution = {
            strong: 0, // 80-100
            good: 0, // 60-79
            average: 0, // 40-59
            weak: 0, // 0-39
        };
        screenings.forEach((screening) => {
            screening.results.forEach((result) => {
                if (result.score >= 80)
                    scoreDistribution.strong++;
                else if (result.score >= 60)
                    scoreDistribution.good++;
                else if (result.score >= 40)
                    scoreDistribution.average++;
                else
                    scoreDistribution.weak++;
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get analytics",
            error: error,
        });
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
//# sourceMappingURL=analytics.controller.js.map