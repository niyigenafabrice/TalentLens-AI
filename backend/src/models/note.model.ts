import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  applicantId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  content: string;
  type: "general" | "interview" | "screening" | "offer" | "rejection";
}

const NoteSchema = new Schema<INote>(
  {
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["general", "interview", "screening", "offer", "rejection"],
      default: "general",
    },
  },
  { timestamps: true },
);

export default mongoose.model<INote>("Note", NoteSchema);
