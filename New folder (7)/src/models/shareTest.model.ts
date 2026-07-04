import mongoose, { Schema, Document } from "mongoose";

export interface IShareTest extends Document {
  ownerId: string;
  paperJson: string;
  title: string;
  subjectId?: string;
  subject: string;
  class: string;
  exam_type: string;
  paperType: string;
  createdAt: Date;
  updatedAt: Date;
  attempts: Array<{
    studentName: string;
    studentId?: string;
    guestId?: string;
    results: any;
    userAnswers: any;
    timeTaken: number;
    submittedAt: Date;
  }>;
}

const shareTestSchema = new Schema<IShareTest>(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    paperJson: {
      type: String,
      required: true,
    },
    title: { type: String, required: true },
    subjectId: { type: String, sparse: true },
    subject: { type: String, required: true },
    class: { type: String, required: true },
    exam_type: { type: String },
    paperType: { type: String },
    attempts: [
      {
        studentName: { type: String, required: true },
        studentId: { type: String },
        guestId: { type: String },
        results: { type: Schema.Types.Mixed },
        userAnswers: { type: Schema.Types.Mixed, default: () => ({}) , required: true},
        timeTaken: { type: Number },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, minimize: false }
);

const ShareTestModel = (mongoose.models.ShareTest as mongoose.Model<IShareTest>) || 
  mongoose.model<IShareTest>("ShareTest", shareTestSchema);

export default ShareTestModel;
