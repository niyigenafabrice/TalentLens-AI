"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activity_controller_1 = require("../controllers/activity.controller");
const router = express_1.default.Router();
router.post("/", activity_controller_1.logActivity);
router.get("/", activity_controller_1.getAllActivities);
router.get("/recent", activity_controller_1.getRecentActivities);
router.get("/summary", activity_controller_1.getActivitySummary);
router.get("/user/:userId", activity_controller_1.getActivitiesByUser);
router.get("/entity/:entity/:entityId", activity_controller_1.getActivitiesByEntity);
router.delete("/cleanup", activity_controller_1.deleteOldActivities);
exports.default = router;
//# sourceMappingURL=activity.routes.js.map