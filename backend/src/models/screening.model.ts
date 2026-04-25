import mongoose, { Document, Schema } from "mongoose";

export interface IScreeningResult {
  rank: number;
  applicantId: mongoose.Types.ObjectId;
  name: string;
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export interface IScreening extends Document {
  jobId: mongoose.Types.ObjectId;
  results: IScreeningResult[];
  totalApplicants: number;
  shortlistedCount: number;
  biasWarning?: string;
  createdAt: Date;
}

const ScreeningResultSchema = new Schema<IScreeningResult>({
  rank: {
    type: Number,
    required: true,
  },
  applicantId: {
    type: Schema.Types.ObjectId,
    ref: "Applicant",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  strengths: [
    {
      type: String,
    },
  ],
  gaps: [
    {
      type: String,
    },
  ],
  recommendation: {
    type: String,
    required: true,
  },
});

const ScreeningSchema = new Schema<IScreening>({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  results: [ScreeningResultSchema],
  totalApplicants: {
    type: Number,
    required: true,
  },
  shortlistedCount: {
    type: Number,
    required: true,
  },
  biasWarning: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IScreening>("Screening", ScreeningSchema);
