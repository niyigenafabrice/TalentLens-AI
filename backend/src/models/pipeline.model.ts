import mongoose, { Document, Schema } from "mongoose";

export interface IPipeline extends Document {
  applicantId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  stages: {
    stage: string;
    status: "pending" | "completed" | "skipped";
    enteredAt: Date;
    completedAt: Date;
    notes: string;
  }[];
  currentStage: string;
  overallStatus: "active" | "hired" | "rejected" | "withdrawn";
}

const PipelineSchema = new Schema<IPipeline>(
  {
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    stages: [
      {
        stage: {
          type: String,
          enum: [
            "applied",
            "screened",
            "shortlisted",
            "interview",
            "offer",
            "hired",
            "rejected",
          ],
        },
        status: {
          type: String,
          enum: ["pending", "completed", "skipped"],
          default: "pending",
        },
        enteredAt: { type: Date, default: Date.now },
        completedAt: { type: Date },
        notes: { type: String, default: "" },
      },
    ],
    currentStage: { type: String, default: "applied" },
    overallStatus: {
      type: String,
      enum: ["active", "hired", "rejected", "withdrawn"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPipeline>("Pipeline", PipelineSchema);
