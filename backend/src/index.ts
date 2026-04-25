import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDatabase from "./config/database";
import jobRoutes from "./routes/job.routes";
import screeningRoutes from "./routes/screening.routes";
import uploadRoutes from "./routes/upload.routes";
import analyticsRoutes from "./routes/analytics.routes";
import authRoutes from "./routes/auth.routes";
import applicantRoutes from "./routes/applicant.routes";
import interviewRoutes from "./routes/interview.routes";
import pipelineRoutes from "./routes/pipeline.routes";
import reportRoutes from "./routes/report.routes";
import userRoutes from "./routes/user.routes";
import noteRoutes from "./routes/note.routes";
import activityRoutes from "./routes/activity.routes";
import jobStatsRoutes from "./routes/jobStats.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','PATCH'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());

app.use("/api/jobs", jobRoutes);
app.use("/api/screening", screeningRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pipeline", pipelineRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/job-stats", jobStatsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "TalentLens AI Backend is Running!" });
});

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();

