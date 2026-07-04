import mongoose from "mongoose";

export interface ITokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  thinkingTokens?: number;
}

export interface IGenerationRecord {
  userId: string;
  testType: "test" | "sample";
  examType: string;
  paperType: string;
  subjectId?: string;
  subject: string;
  grade: string;
  language?: string;
  tokenUsage: ITokenUsage;
  generatedAt: Date;
}

export interface IUpdateRecord {
  userId: string;
  samplePaperId: mongoose.Types.ObjectId;
  examType: string;
  paperType: string;
  subject: string;
  grade: string;
  language?: string;
  tokenUsage: ITokenUsage;
  updatedAt: Date;
}

export interface IAIAnalysis {
  type: "generation" | "update";
  userId: string;
  testType: "test" | "sample";
  examType: string;
  paperType: string;
  subjectId?: string;
  subject: string;
  grade: string;
  language?: string;
  tokenUsage: ITokenUsage;
  samplePaperId?: mongoose.Types.ObjectId;
  generatedAt: Date;
}

const TokenUsageSchema = new mongoose.Schema<ITokenUsage>(
  {
    inputTokens: { type: Number, required: true, default: 0 },
    outputTokens: { type: Number, required: true, default: 0 },
    totalTokens: { type: Number, required: true, default: 0 },
    thinkingTokens: { type: Number, default: 0 },
  },
  { _id: false }
);

const AIAnalysisSchema = new mongoose.Schema<IAIAnalysis>(
  {
    type: {
      type: String,
      enum: ["generation", "update"],
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    testType: {
      type: String,
      enum: ["test", "sample"],
      required: true,
    },
    examType: {
      type: String,
      required: true,
    },
    paperType: {
      type: String,
      required: true,
    },
    subjectId: {
      type: String,
      default: null,
    },
    subject: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: null,
    },
    tokenUsage: {
      type: TokenUsageSchema,
      required: true,
    },
    samplePaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestPaper",
      default: null,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AIAnalysisSchema.index({ generatedAt: -1 });
AIAnalysisSchema.index({ userId: 1, generatedAt: -1 });
AIAnalysisSchema.index({ testType: 1, generatedAt: -1 });
AIAnalysisSchema.index({ examType: 1, paperType: 1, subject: 1, grade: 1 });
AIAnalysisSchema.index({ "tokenUsage.totalTokens": 1 });

const AIAnalysisModel =
  (mongoose.models.AIAnalysis as mongoose.Model<IAIAnalysis>) ||
  mongoose.model<IAIAnalysis>("AIAnalysis", AIAnalysisSchema);

export default AIAnalysisModel;
