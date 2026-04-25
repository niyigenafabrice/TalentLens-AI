import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  requiredSkills: string[];
  experienceYears: number;
  educationLevel: string;
  location: string;
  createdAt: Date;
}

const JobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requiredSkills: [
    {
      type: String,
    },
  ],
  experienceYears: {
    type: Number,
    required: true,
  },
  educationLevel: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IJob>("Job", JobSchema);
