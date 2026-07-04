import mongoose from "mongoose";

export interface SQP {
  question_text: string;
  question_type: "mcq" | "subjective" | "case_study";
  question_options: [string] | null;
  sub_questions: {
    question_text: string;
    question_options: [string] | null;
    type: "mcq" | "subjective";
    marks: number;
  }[];
  marks: number;
  year: number;
  subjectId?: string;
  subject: string;
  exam_type: string;
  class: string;
}

const SQPSchema = new mongoose.Schema<SQP>({
  question_text: {
    type: String,
    required: true,
  },
  question_type: {
    type: String,
    enum: ["mcq", "subjective", "case_study"],
    required: true,
  },
  question_options: {
    type: [String],
  },
  sub_questions: {
    type: [
      {
        question_text: {
          type: String,
          required: true,
        },
        question_options: {
          type: [String],
        },
        type: {
          type: String,
          enum: ["mcq", "subjective"],
          required: true,
        },
        marks: {
          type: Number,
          required: true,
        },
      },
    ],
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  subjectId: {
    type: String,
    sparse: true,
  },
  subject: {
    type: String,
    required: true,
  },
  exam_type: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
});
const SQPModel =
  (mongoose.models.SQP as mongoose.Model<SQP>) ||
  mongoose.model<SQP>("SQP", SQPSchema);

export default SQPModel;
