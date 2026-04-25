"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobStats_controller_1 = require("../controllers/jobStats.controller");
const router = express_1.default.Router();
// GET /api/job-stats - Get stats for all jobs
router.get("/", jobStats_controller_1.getAllJobsStats);
// GET /api/job-stats/funnel - Get overall hiring funnel
router.get("/funnel", jobStats_controller_1.getHiringFunnel);
// GET /api/job-stats/:jobId - Get stats for a specific job
router.get("/:jobId", jobStats_controller_1.getJobStats);
exports.default = router;
//# sourceMappingURL=jobStats.routes.js.map