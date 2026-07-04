import { Message } from "@/types/global";
import mongoose from "mongoose";

export interface UserHistory {
  userId: string;
  testPaper?: mongoose.Types.ObjectId;

  class: string;
  subjectId?: string; // stable subject identifier
  subject: string;
  exam_type: string;
  chapterName : string;
  paperType: string;
  messages: Message[];

  paperJson: string;

  title: string;
  preview: string;

  samplePaperId?: string;
  language?: string;

  parentHistoryId?: mongoose.Types.ObjectId;
  rootHistoryId?: mongoose.Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

const UserHistorySchema = new mongoose.Schema<UserHistory>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    testPaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestPaper",
    },
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
    chapterName : {
      type : String,
      required : false
    },
    exam_type: {
      type: String,
      required: true,
    },
    paperType: {
      type: String,
      required: true,
    },
    messages: {
      type: [Object],
      required: true,
    },
    paperJson: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    preview: {
      type: String,
      required: true,
    },
    samplePaperId: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: null,
    },
    parentHistoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserHistory",
      default: null,
    },
    rootHistoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserHistory",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index for finding existing test by config (used in create-test-attempt)
UserHistorySchema.index(
  { userId: 1, class: 1, subject: 1, exam_type: 1, paperType: 1, samplePaperId: 1, chapterName : 1 },
  { name: "userHistory_lookup_idx" },
);

// Helpful for quickly finding which papers a user has already seen for a config
UserHistorySchema.index(
  { userId: 1, class: 1, subject: 1, exam_type: 1, paperType: 1, chapterName : 1 },
  { name: "userHistory_user_config_idx" },
);

// Index for grouping reattempts
UserHistorySchema.index(
  { rootHistoryId: 1 },
  { name: "userHistory_root_idx" },
);

const UserHistoryModel =
  (mongoose.models.UserHistory as mongoose.Model<UserHistory>) ||
  mongoose.model<UserHistory>("UserHistory", UserHistorySchema);

export default UserHistoryModel;
