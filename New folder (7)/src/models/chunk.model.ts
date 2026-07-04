import mongoose from "mongoose";

export interface Chunk {
  sourceId: string;
  chunkIndex: number;
  text: string;
  embedding: number[];
  year: number;
  subjectId?: string;
  subject: string;
  exam_type: string;
  class: string;
}

const ChunkSchema = new mongoose.Schema({
  sourceId: {
    type: String,
    required: true,
  },
  chunkIndex: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  subjectId: {
    type: String,
    index: true,
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
const ChunkModel =
  (mongoose.models.Chunk as mongoose.Model<Chunk>) ||
  mongoose.model<Chunk>("Chunk", ChunkSchema);

export default ChunkModel;
