"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const screening_routes_1 = __importDefault(require("./routes/screening.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const applicant_routes_1 = __importDefault(require("./routes/applicant.routes"));
const interview_routes_1 = __importDefault(require("./routes/interview.routes"));
const pipeline_routes_1 = __importDefault(require("./routes/pipeline.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const note_routes_1 = __importDefault(require("./routes/note.routes"));
const activity_routes_1 = __importDefault(require("./routes/activity.routes"));
const jobStats_routes_1 = __importDefault(require("./routes/jobStats.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/jobs", job_routes_1.default);
app.use("/api/screening", screening_routes_1.default);
app.use("/api/applicants", applicant_routes_1.default);
app.use("/api/interviews", interview_routes_1.default);
app.use("/api/upload", upload_routes_1.default);
app.use("/api/analytics", analytics_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/pipeline", pipeline_routes_1.default);
app.use("/api/reports", report_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/notes", note_routes_1.default);
app.use("/api/activities", activity_routes_1.default);
app.use("/api/job-stats", jobStats_routes_1.default);
app.get("/", (req, res) => {
    res.json({ message: "TalentLens AI Backend is Running!" });
});
const startServer = async () => {
    try {
        await (0, database_1.default)();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Server failed to start:", error);
    }
};
startServer();
//# sourceMappingURL=index.js.map