import mongoose, { Schema, Document } from "mongoose";

export interface StepCondition {
  key: string;
  value: string | string[];
}

export interface FetchOptions {
  url: string;
  key: string;
}

export interface Step {
  id: string;
  text: string;
  options: string[];
  key_name: string;
  skip?: boolean;
  condition?: StepCondition;
  fetchOptions?: FetchOptions;
  fetchType?: string;
}

export interface FinalStep {
  id: string;
  text: string;
  key_name: string;
}

export interface IGradeStep extends Document {
  gradeId: string;
  defaultExamType?: string;
  examPattern?: string;
  sections?: string[];
  questionTypes?: Record<string, any>;
  steps: Step[];
  finalStep: FinalStep;
  active?: boolean;
}

const GradeStepSchema: Schema = new Schema(
  {
    gradeId: { type: String, required: true, unique: true },
    defaultExamType: { type: String },
    examPattern: { type: String },
    sections: { type: [String], default: undefined },
    questionTypes: { type: Object },
    steps: { type: Array, required: true },
    finalStep: { type: Object, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.GradeStep ||
  mongoose.model<IGradeStep>("GradeStep", GradeStepSchema);
