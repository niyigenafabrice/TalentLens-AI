import mongoose, { Document, Schema } from "mongoose";

export interface IActivity extends Document {
  userId?: mongoose.Types.ObjectId;
  userName?: string;
  action: string;
  entity: "job" | "applicant" | "interview" | "pipeline" | "user" | "screening" | "note" | "system";
  entityId?: mongoose.Types.ObjectId;
  details?: string;
  icon?: string;
  color?: string;
  ipAddress?: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, default: "System" },
    action: { type: String, required: true },
    entity: {
      type: String,
      enum: ["job", "applicant", "interview", "pipeline", "user", "screening", "note", "system"],
      default: "system",
    },
    entityId: { type: Schema.Types.ObjectId },
    details: { type: String, default: "" },
    icon: { type: String, default: "" },
    color: { type: String, default: "#1d4ed8" },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model<IActivity>("Activity", ActivitySchema);
