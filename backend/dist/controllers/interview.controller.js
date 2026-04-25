"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInterview = exports.updateInterview = exports.getAllInterviews = exports.getInterviewsByJob = exports.scheduleInterview = void 0;
const interview_model_1 = __importDefault(require("../models/interview.model"));
const applicant_model_1 = __importDefault(require("../models/applicant.model"));
// Schedule interview
const scheduleInterview = async (req, res) => {
    try {
        const interview = new interview_model_1.default(req.body);
        await interview.save();
        // Update applicant status to interview
        await applicant_model_1.default.findByIdAndUpdate(req.body.applicantId, {
            status: "interview",
        });
        res.status(201).json({
            success: true,
            message: "Interview scheduled successfully!",
            data: interview,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to schedule interview",
            error: error,
        });
    }
};
exports.scheduleInterview = scheduleInterview;
// Get all interviews for a job
const getInterviewsByJob = async (req, res) => {
    try {
        const interviews = await interview_model_1.default.find({ jobId: req.params.jobId })
            .populate("applicantId", "name email phone")
            .sort({ scheduledDate: 1 });
        res.status(200).json({
            success: true,
            count: interviews.length,
            data: interviews,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get interviews",
            error: error,
        });
    }
};
exports.getInterviewsByJob = getInterviewsByJob;
// Get all interviews
const getAllInterviews = async (req, res) => {
    try {
        const interviews = await interview_model_1.default.find()
            .populate("applicantId", "name email phone")
            .populate("jobId", "title department")
            .sort({ scheduledDate: 1 });
        res.status(200).json({
            success: true,
            count: interviews.length,
            data: interviews,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get interviews",
            error: error,
        });
    }
};
exports.getAllInterviews = getAllInterviews;
// Update interview status
const updateInterview = async (req, res) => {
    try {
        const interview = await interview_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update interview",
            error: error,
        });
    }
};
exports.updateInterview = updateInterview;
// Delete interview
const deleteInterview = async (req, res) => {
    try {
        await interview_model_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Interview deleted successfully!",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete interview",
            error: error,
        });
    }
};
exports.deleteInterview = deleteInterview;
//# sourceMappingURL=interview.controller.js.map