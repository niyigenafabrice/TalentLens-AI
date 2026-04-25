import mongoose, { Document } from "mongoose";
export interface INote extends Document {
    applicantId: mongoose.Types.ObjectId;
    jobId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    authorName: string;
    content: string;
    type: "general" | "interview" | "screening" | "offer" | "rejection";
}
declare const _default: mongoose.Model<INote, {}, {}, {}, mongoose.Document<unknown, {}, INote> & INote & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=note.model.d.ts.map