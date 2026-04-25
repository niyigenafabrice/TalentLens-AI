import mongoose, { Document, Schema } from "mongoose";

export interface IApplicant extends Document {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experienceYears: number;
  educationLevel: string;
  currentPosition: string;
  location: string;
  summary: string;
  coverLetter?: string;
  jobId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // linked applicant account
  source: "umurava" | "external";
  resumeText?: string;
  resumeUrl?: string; // uploaded CV file path
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "shortlisted"
    | "accepted"
    | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ApplicantSchema = new Schema<IApplicant>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    skills: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    educationLevel: { type: String },
    currentPosition: { type: String },
    location: { type: String },
    summary: { type: String },
    coverLetter: { type: String },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" }, // optional — links to applicant account
    source: {
      type: String,
      enum: ["umurava", "external"],
      default: "external",
    },
    resumeText: { type: String },
    resumeUrl: { type: String },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_review",
        "shortlisted",
        "accepted",
        "rejected",
      ],
      default: "submitted",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IApplicant>("Applicant", ApplicantSchema);
