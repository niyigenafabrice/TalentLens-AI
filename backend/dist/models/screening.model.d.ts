import mongoose, { Document } from "mongoose";
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
declare const _default: mongoose.Model<IScreening, {}, {}, {}, mongoose.Document<unknown, {}, IScreening> & IScreening & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=screening.model.d.ts.map