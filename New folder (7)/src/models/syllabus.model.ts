import mongoose from "mongoose";
interface Topic {
  chapter: string;
  description: string;
  weightage: number;
}
export interface Syllabus {
  chapter_weightage: Topic[];
  year: number;
  subjectId: string;  // stable unique id — never changes, used as FK across collections
  subject: string;   // human-readable display name — freely editable
  exam_type: string;
  class: string;
  sections: mongoose.Schema.Types.ObjectId[];
}

const SyllabusSchema = new mongoose.Schema({
  chapter_weightage: {
    type: [],
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  subjectId: {
    type: String,
    required: true,
    index: true,
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
  active: {
    type: Boolean,
    default: true,
  },
  sections: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Syllabus",
    default: [],
  },
});
const SyllabusModel =
  (mongoose.models.Syllabus as mongoose.Model<Syllabus>) ||
  mongoose.model<Syllabus>("Syllabus", SyllabusSchema);

export default SyllabusModel;
