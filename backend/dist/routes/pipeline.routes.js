"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pipeline_controller_1 = require("../controllers/pipeline.controller");
const router = express_1.default.Router();
// POST /api/pipeline - Create pipeline
router.post("/", pipeline_controller_1.createPipeline);
// GET /api/pipeline/stats - Get pipeline statistics
router.get("/stats", pipeline_controller_1.getPipelineStats);
// GET /api/pipeline/job/:jobId - Get all pipelines for a job
router.get("/job/:jobId", pipeline_controller_1.getPipelinesByJob);
// GET /api/pipeline/applicant/:applicantId - Get pipeline for applicant
router.get("/applicant/:applicantId", pipeline_controller_1.getPipelineByApplicant);
// PUT /api/pipeline/:id/advance - Advance pipeline to next stage
router.put("/:id/advance", pipeline_controller_1.advancePipeline);
exports.default = router;
//# sourceMappingURL=pipeline.routes.js.map