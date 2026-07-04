import mongoose from "mongoose";

// Normalized configuration used to generate a paper
export interface TestPaper {
  class: string;
  subjectId?: string; // stable subject identifier
  subject: string; // normalized: lowercase with underscores (e.g. "social_science")
  exam_type: string; // normalized: uppercase (e.g. "CBSE")
  paperType: string;
  paperJson: string; // stringified QuestionPaper JSON from Gemini
  chapterName ?: string;
  selectedChapters ?: string[];
  language?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TestPaperSchema = new mongoose.Schema<TestPaper>(
  {
    class: {
      type: String,
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
    paperType: {
      type: String,
      required: true,
    },
    chapterName : {
      type : String,
      required : false
    },
    selectedChapters : {
      type : [String],
      required : false
    },
    paperJson: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: null,
    },
    createdAt : {
      type: Date,
      default: Date.now,
      expires: "365d",
    }
  },
  {
    timestamps: true,
  },
);

// Helpful index for quickly finding papers by configuration
TestPaperSchema.index(
  {
    class: 1,
    subject: 1,
    exam_type: 1,
    paperType: 1,
    language: 1,
    chapterName: 1,
    createdAt: 1,
  },
  { name: "testpaper_config_createdAt_idx" },
);

const TestPaperModel =
  (mongoose.models.TestPaper as mongoose.Model<TestPaper>) ||
  mongoose.model<TestPaper>("TestPaper", TestPaperSchema);

export default TestPaperModel;
