"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const interview_controller_1 = require("../controllers/interview.controller");
const router = express_1.default.Router();
// POST /api/interviews - Schedule interview
router.post("/", interview_controller_1.scheduleInterview);
// GET /api/interviews - Get all interviews
router.get("/", interview_controller_1.getAllInterviews);
// GET /api/interviews/job/:jobId - Get interviews for a job
router.get("/job/:jobId", interview_controller_1.getInterviewsByJob);
// PUT /api/interviews/:id - Update interview
router.put("/:id", interview_controller_1.updateInterview);
// DELETE /api/interviews/:id - Delete interview
router.delete("/:id", interview_controller_1.deleteInterview);
exports.default = router;
//# sourceMappingURL=interview.routes.js.map