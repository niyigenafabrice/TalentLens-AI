import mongoose, { Document } from "mongoose";
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
declare const _default: mongoose.Model<IPipeline, {}, {}, {}, mongoose.Document<unknown, {}, IPipeline> & IPipeline & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=pipeline.model.d.ts.map