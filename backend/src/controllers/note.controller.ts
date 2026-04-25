import { Request, Response } from "express";
import Note from "../models/note.model";

// Add note to applicant
export const addNote = async (req: Request, res: Response) => {
  try {
    const note = new Note(req.body);
    await note.save();

    res.status(201).json({
      success: true,
      message: "Note added successfully!",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add note",
      error: error,
    });
  }
};

// Get all notes for an applicant
export const getNotesByApplicant = async (req: Request, res: Response) => {
  try {
    const notes = await Note.find({ applicantId: req.params.applicantId }).sort(
      { createdAt: -1 },
    );

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get notes",
      error: error,
    });
  }
};

// Get all notes for a job
export const getNotesByJob = async (req: Request, res: Response) => {
  try {
    const notes = await Note.find({ jobId: req.params.jobId })
      .populate("applicantId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get notes",
      error: error,
    });
  }
};

// Update note
export const updateNote = async (req: Request, res: Response) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content, type: req.body.type },
      { new: true },
    );

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update note",
      error: error,
    });
  }
};

// Delete note
export const deleteNote = async (req: Request, res: Response) => {
  try {
    await Note.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Note deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error,
    });
  }
};

// Get all notes by type
export const getNotesByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const notes = await Note.find({ type })
      .populate("applicantId", "name email")
      .populate("jobId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get notes",
      error: error,
    });
  }
};
