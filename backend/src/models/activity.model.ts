import mongoose, { Document, Schema } from "mongoose";

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  action: string;
  entity:
    | "job"
    | "applicant"
    | "interview"
    | "pipeline"
    | "user"
    | "screening"
    | "note";
  entityId: mongoose.Types.ObjectId;
  details: string;
  ipAddress: string;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    entity: {
      type: String,
      enum: [
        "job",
        "applicant",
        "interview",
        "pipeline",
        "user",
        "screening",
        "note",
      ],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    details: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model<IActivity>("Activity", ActivitySchema);
