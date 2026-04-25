import mongoose, { Document } from "mongoose";
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
declare const _default: mongoose.Model<IInterview, {}, {}, {}, mongoose.Document<unknown, {}, IInterview> & IInterview & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=interview.model.d.ts.map