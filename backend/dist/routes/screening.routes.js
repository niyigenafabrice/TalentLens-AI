"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const screening_controller_1 = require("../controllers/screening.controller");
const router = express_1.default.Router();
router.post("/run", screening_controller_1.runScreening);
router.get("/:jobId", screening_controller_1.getScreeningResults);
router.post("/questions", screening_controller_1.getInterviewQuestions);
router.post("/email", screening_controller_1.getInvitationEmail);
exports.default = router;
//# sourceMappingURL=screening.routes.js.map