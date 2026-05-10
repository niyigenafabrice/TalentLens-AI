import mongoose, { Document, Schema } from "mongoose";

export interface IApplicant extends Document {
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  skills: string[];
  experienceYears: number;
  yearsOfExperience?: number;
  educationLevel: string;
  currentPosition: string;
  currentRole?: string;
  jobTitle?: string;
  location: string;
  summary: string;
  coverLetter?: string;
  certifications?: string[];
  projects?: string[];
  jobId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  source: "umurava" | "external";
  resumeText?: string;
  resumeUrl?: string;
  aiScore?: number;
  aiBreakdown?: {
    skillsMatch: number;
    experience: number;
    education: number;
    projectsAndCertifications: number;
    jobTitleRelevance: number;
    applicationQuality: number;
    careerProgression: number;
  };
  strengths?: string[];
  gaps?: string[];
  recommendation?: string;
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "shortlisted"
    | "accepted"
    | "rejected"
    | "hired";
  createdAt: Date;
  updatedAt: Date;
}

const ApplicantSchema = new Schema<IApplicant>(
  {
    name: { type: String, required: true },
    fullName: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    skills: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    yearsOfExperience: { type: Number, default: 0 },
    educationLevel: { type: String },
    currentPosition: { type: String },
    currentRole: { type: String },
    jobTitle: { type: String },
    location: { type: String },
    summary: { type: String },
    coverLetter: { type: String },
    certifications: [{ type: String }],
    projects: [{ type: String }],
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    source: {
      type: String,
      enum: ["umurava", "external"],
      default: "external",
    },
    resumeText: { type: String },
    resumeUrl: { type: String },
    aiScore: { type: Number },
    aiBreakdown: {
      skillsMatch: { type: Number },
      experience: { type: Number },
      education: { type: Number },
      projectsAndCertifications: { type: Number },
      jobTitleRelevance: { type: Number },
      applicationQuality: { type: Number },
      careerProgression: { type: Number },
    },
    strengths: [{ type: String }],
    gaps: [{ type: String }],
    recommendation: { type: String },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_review",
        "shortlisted",
        "accepted",
        "rejected",
        "hired",
      ],
      default: "submitted",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IApplicant>("Applicant", ApplicantSchema);
