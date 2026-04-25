"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const report_controller_1 = require("../controllers/report.controller");
const router = express_1.default.Router();
router.get("/hiring", report_controller_1.getHiringReport);
router.get("/export/shortlisted", report_controller_1.exportShortlisted);
router.get("/export/screening", report_controller_1.exportScreeningResults);
router.get("/interviews", report_controller_1.getInterviewReport);
exports.default = router;
//# sourceMappingURL=report.routes.js.map