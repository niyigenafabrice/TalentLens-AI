"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotesByType = exports.deleteNote = exports.updateNote = exports.getNotesByJob = exports.getNotesByApplicant = exports.addNote = void 0;
const note_model_1 = __importDefault(require("../models/note.model"));
// Add note to applicant
const addNote = async (req, res) => {
    try {
        const note = new note_model_1.default(req.body);
        await note.save();
        res.status(201).json({
            success: true,
            message: "Note added successfully!",
            data: note,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add note",
            error: error,
        });
    }
};
exports.addNote = addNote;
// Get all notes for an applicant
const getNotesByApplicant = async (req, res) => {
    try {
        const notes = await note_model_1.default.find({ applicantId: req.params.applicantId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: notes.length,
            data: notes,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get notes",
            error: error,
        });
    }
};
exports.getNotesByApplicant = getNotesByApplicant;
// Get all notes for a job
const getNotesByJob = async (req, res) => {
    try {
        const notes = await note_model_1.default.find({ jobId: req.params.jobId })
            .populate("applicantId", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: notes.length,
            data: notes,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get notes",
            error: error,
        });
    }
};
exports.getNotesByJob = getNotesByJob;
// Update note
const updateNote = async (req, res) => {
    try {
        const note = await note_model_1.default.findByIdAndUpdate(req.params.id, { content: req.body.content, type: req.body.type }, { new: true });
        if (!note) {
            res.status(404).json({
                success: false,
                message: "Note not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Note updated successfully!",
            data: note,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update note",
            error: error,
        });
    }
};
exports.updateNote = updateNote;
// Delete note
const deleteNote = async (req, res) => {
    try {
        await note_model_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Note deleted successfully!",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete note",
            error: error,
        });
    }
};
exports.deleteNote = deleteNote;
// Get all notes by type
const getNotesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const notes = await note_model_1.default.find({ type })
            .populate("applicantId", "name email")
            .populate("jobId", "title")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: notes.length,
            data: notes,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get notes",
            error: error,
        });
    }
};
exports.getNotesByType = getNotesByType;
//# sourceMappingURL=note.controller.js.map