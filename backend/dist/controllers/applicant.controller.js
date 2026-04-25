"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicantById = exports.updateApplicantStatus = exports.searchApplicants = exports.deleteApplicant = exports.getApplicantsByJob = exports.createApplicant = void 0;
const applicant_model_1 = __importDefault(require("../models/applicant.model"));
// Add single applicant manually
const createApplicant = async (req, res) => {
    try {
        const applicant = new applicant_model_1.default(req.body);
        await applicant.save();
        res.status(201).json({
            success: true,
            message: "Applicant added successfully!",
            data: applicant,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add applicant",
            error: error,
        });
    }
};
exports.createApplicant = createApplicant;
// Get all applicants for a job
const getApplicantsByJob = async (req, res) => {
    try {
        const applicants = await applicant_model_1.default.find({
            jobId: req.params.jobId,
        });
        res.status(200).json({
            success: true,
            count: applicants.length,
            data: applicants,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get applicants",
            error: error,
        });
    }
};
exports.getApplicantsByJob = getApplicantsByJob;
// Delete applicant
const deleteApplicant = async (req, res) => {
    try {
        await applicant_model_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Applicant deleted successfully!",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete applicant",
            error: error,
        });
    }
};
exports.deleteApplicant = deleteApplicant;
// Search and filter applicants
const searchApplicants = async (req, res) => {
    try {
        const { jobId, skills, minExperience, maxExperience, location, education } = req.query;
        // Build filter object
        const filter = {};
        // Filter by job
        if (jobId) {
            filter.jobId = jobId;
        }
        // Filter by skills
        if (skills) {
            const skillsArray = skills.split(",").map((s) => s.trim());
            filter.skills = { $in: skillsArray };
        }
        // Filter by experience range
        if (minExperience || maxExperience) {
            filter.experienceYears = {};
            if (minExperience) {
                filter.experienceYears.$gte = parseInt(minExperience);
            }
            if (maxExperience) {
                filter.experienceYears.$lte = parseInt(maxExperience);
            }
        }
        // Filter by location
        if (location) {
            filter.location = {
                $regex: location,
                $options: "i",
            };
        }
        // Filter by education
        if (education) {
            filter.educationLevel = {
                $regex: education,
                $options: "i",
            };
        }
        const applicants = await applicant_model_1.default.find(filter).sort({
            experienceYears: -1,
        });
        res.status(200).json({
            success: true,
            count: applicants.length,
            data: applicants,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Search failed",
            error: error,
        });
    }
};
exports.searchApplicants = searchApplicants;
// Update applicant status
const updateApplicantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = [
            "pending",
            "screened",
            "shortlisted",
            "interview",
            "hired",
            "rejected",
        ];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: "Invalid status. Must be: pending, screened, shortlisted, interview, hired, or rejected",
            });
            return;
        }
        const applicant = await applicant_model_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!applicant) {
            res.status(404).json({
                success: false,
                message: "Applicant not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: `Applicant status updated to ${status}!`,
            data: applicant,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: error,
        });
    }
};
exports.updateApplicantStatus = updateApplicantStatus;
// Get single applicant
const getApplicantById = async (req, res) => {
    try {
        const applicant = await applicant_model_1.default.findById(req.params.id);
        if (!applicant) {
            res.status(404).json({
                success: false,
                message: "Applicant not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: applicant,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get applicant",
            error: error,
        });
    }
};
exports.getApplicantById = getApplicantById;
//# sourceMappingURL=applicant.controller.js.map