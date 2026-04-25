"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const note_controller_1 = require("../controllers/note.controller");
const router = express_1.default.Router();
// POST /api/notes - Add note
router.post("/", note_controller_1.addNote);
// GET /api/notes/applicant/:applicantId - Get notes for applicant
router.get("/applicant/:applicantId", note_controller_1.getNotesByApplicant);
// GET /api/notes/job/:jobId - Get notes for job
router.get("/job/:jobId", note_controller_1.getNotesByJob);
// GET /api/notes/type/:type - Get notes by type
router.get("/type/:type", note_controller_1.getNotesByType);
// PUT /api/notes/:id - Update note
router.put("/:id", note_controller_1.updateNote);
// DELETE /api/notes/:id - Delete note
router.delete("/:id", note_controller_1.deleteNote);
exports.default = router;
//# sourceMappingURL=note.routes.js.map