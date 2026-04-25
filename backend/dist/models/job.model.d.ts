import mongoose, { Document } from "mongoose";
export interface IJob extends Document {
    title: string;
    description: string;
    requiredSkills: string[];
    experienceYears: number;
    educationLevel: string;
    location: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IJob, {}, {}, {}, mongoose.Document<unknown, {}, IJob> & IJob & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=job.model.d.ts.map