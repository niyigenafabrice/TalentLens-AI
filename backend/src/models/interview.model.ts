import mongoose, { Document, Schema } from "mongoose";

export interface IInterview extends Document {
  applicantId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  scheduledTime: string;
  interviewType: "online" | "in-person" | "phone";
  interviewerName: string;
  location: string;
  meetingLink: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes: string;
}

const InterviewSchema = new Schema<IInterview>(
  {
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    interviewType: {
      type: String,
      enum: ["online", "in-person", "phone"],
      default: "online",
    },
    interviewerName: { type: String, default: "" },
    location: { type: String, default: "" },
    meetingLink: { type: String, default: "" },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model<IInterview>("Interview", InterviewSchema);
