"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const applicant_controller_1 = require("../controllers/applicant.controller");
const router = express_1.default.Router();
router.get("/search", applicant_controller_1.searchApplicants);
router.post("/", applicant_controller_1.createApplicant);
router.get("/job/:jobId", applicant_controller_1.getApplicantsByJob);
router.get("/:id", applicant_controller_1.getApplicantById);
router.patch("/:id/status", applicant_controller_1.updateApplicantStatus);
router.delete("/:id", applicant_controller_1.deleteApplicant);
exports.default = router;
//# sourceMappingURL=applicant.routes.js.map