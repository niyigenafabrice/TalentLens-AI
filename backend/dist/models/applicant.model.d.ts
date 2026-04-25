import mongoose, { Document } from "mongoose";
export interface IApplicant extends Document {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experienceYears: number;
    educationLevel: string;
    currentPosition: string;
    location: string;
    summary: string;
    jobId: mongoose.Types.ObjectId;
    source: "umurava" | "external";
    resumeText?: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IApplicant, {}, {}, {}, mongoose.Document<unknown, {}, IApplicant> & IApplicant & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=applicant.model.d.ts.map