import express from "express";
import {
  addNote,
  getNotesByApplicant,
  getNotesByJob,
  updateNote,
  deleteNote,
  getNotesByType,
} from "../controllers/note.controller";

const router = express.Router();

// POST /api/notes - Add note
router.post("/", addNote);

// GET /api/notes/applicant/:applicantId - Get notes for applicant
router.get("/applicant/:applicantId", getNotesByApplicant);

// GET /api/notes/job/:jobId - Get notes for job
router.get("/job/:jobId", getNotesByJob);

// GET /api/notes/type/:type - Get notes by type
router.get("/type/:type", getNotesByType);

// PUT /api/notes/:id - Update note
router.put("/:id", updateNote);

// DELETE /api/notes/:id - Delete note
router.delete("/:id", deleteNote);

export default router;
