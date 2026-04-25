import mongoose, { Document } from "mongoose";
export interface IActivity extends Document {
    userId: mongoose.Types.ObjectId;
    userName: string;
    action: string;
    entity: "job" | "applicant" | "interview" | "pipeline" | "user" | "screening" | "note";
    entityId: mongoose.Types.ObjectId;
    details: string;
    ipAddress: string;
}
declare const _default: mongoose.Model<IActivity, {}, {}, {}, mongoose.Document<unknown, {}, IActivity> & IActivity & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=activity.model.d.ts.map