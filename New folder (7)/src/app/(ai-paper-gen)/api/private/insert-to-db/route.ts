import dbConnect from "@/lib/dbConnect";
import SQPModel from "@/models/sqp.model";
import { NextResponse } from "next/server";
import chunkModel from "@/models/chunk.model";
import { createChunks } from "@/lib/createChunks";
import { GoogleGenAI } from "@google/genai";
import SyllabusModel from "@/models/syllabus.model";
import TestConfigModel from "@/models/testConfig.model";
import { checkEditor } from "@/utils/rbacUtils";
import { resetTestConfigCache } from "@/utils/testConfig";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_TIMEOUT = 300000;

/**
 * Generate a stable, unique subject ID from a display name.
 * e.g. "Social Science" → "social_science_a3f7"
 */
function generateSubjectId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  const rand = Math.random().toString(16).slice(2, 6);
  return `${slug}_${rand}`;
}

const syncTestConfigSubjects = async (classVal: string) => {
  try {
    const subjects = await SyllabusModel.distinct("subject", { class: classVal });
    const subjectsDisplay = subjects
      .filter(Boolean)
      .map((s: string) =>
        s
          .split("_")
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(" "),
      );
    const config = await TestConfigModel.findOne({ configId: "main-config" }).lean();
    if (config && (config as any).grades?.[classVal]) {
      await TestConfigModel.updateOne(
        { configId: "main-config" },
        { $set: { [`grades.${classVal}.subjects`]: subjectsDisplay } },
      );
      resetTestConfigCache();
    }
  } catch (e) {
    console.error("Failed to sync test config subjects:", e);
  }
};

export async function POST(req: Request) {
  const auth = await checkEditor();
  if (!auth.success) {
    return new NextResponse(auth.error, { status: auth.status });
  }

  const { data, type } = await req.json();

  if (!data) return new NextResponse("Data needed", { status: 400 });
  if (!type) return new NextResponse("Type needed", { status: 400 });

  try {
    await dbConnect();

    if (type === "sqp") {
      const formattedData = data.map((q: any) => ({
        ...q,
        year: Number(q.year),
        class: (q.class as string).toLowerCase().replace(/\s+/g, "_"),
        marks: Number(q.marks),
        exam_type: (q.exam_type as string).toUpperCase().replace(/\s+/g, "_"),
        subject: (q.subject as string).toLowerCase().replace(/\s+/g, "_"),
        subjectId: q.subjectId || undefined,
        sub_questions: q.sub_questions || [],
      }));

      const check = await SQPModel.findOne({
        year: formattedData[0].year,
        class: formattedData[0].class,
        exam_type: formattedData[0].exam_type,
        subject: formattedData[0].subject,
      });

      if (check)
        return new NextResponse("Data already exists", { status: 409 });

      const result = await SQPModel.insertMany(formattedData);
      return NextResponse.json(
        { message: "success", data: result },
        { status: 200 },
      );
    } else if (type === "pyq") {
      const formattedData = {
        ...data,
        year: Number(data.year),
        class: (data.class as string).toLowerCase().replace(/\s+/g, "_"),
        exam_type: (data.exam_type as string).toUpperCase().replace(/\s+/g, "_"),
        subject: (data.subject as string).toLowerCase().replace(/\s+/g, "_"),
        subjectId: data.subjectId || undefined,
      };

      const sourceId =
        `${formattedData.exam_type}_${formattedData.class}_${formattedData.subject}_${formattedData.year}_SET${data.set}`.toUpperCase();

      const check = await chunkModel.findOne({ sourceId });

      if (check)
        return new NextResponse("Data already exists", { status: 409 });

      const chunks = createChunks(formattedData.text, 500, 50);

      const result = await Promise.race([
        ai.models.embedContent({
          model: process.env.EmbeddingModel,
          contents: chunks,
          config: {
            taskType: "RETRIEVAL_DOCUMENT",
            title: "Document Chunk",
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini Embedding API timed out")), GEMINI_TIMEOUT),
        ),
      ]);

      const embeddings = result.embeddings.map((e) => e.values);

      const chunkDocs = embeddings.map((embedding, i) => ({
        sourceId,
        chunkIndex: i,
        text: chunks[i],
        embedding,
        year: formattedData.year,
        subjectId: formattedData.subjectId,
        subject: formattedData.subject,
        exam_type: formattedData.exam_type,
        class: formattedData.class,
      }));

      await chunkModel.insertMany(chunkDocs);

      return NextResponse.json({ data: "success" }, { status: 200 });
    } else if (type === "syllabus") {
      const normalizedSubject = (data.subject as string)
        .toLowerCase()
        .replace(/\s+/g, "_");

      const formattedData = {
        chapter_weightage: data.chapter_weightage,
        year: Number(data.year),
        class: (data.class as string).toLowerCase().replace(/\s+/g, "_"),
        exam_type: (data.exam_type as string).toUpperCase().replace(/\s+/g, "_"),
        subject: normalizedSubject,
        // Use provided subjectId; if not provided (e.g. old flow), generate one
        subjectId: data.subjectId || generateSubjectId(data.subject),
      };

      const check = await SyllabusModel.findOne({
        year: formattedData.year,
        class: formattedData.class,
        exam_type: formattedData.exam_type,
        subject: formattedData.subject,
      });

      if (check)
        return new NextResponse("Data already exists", { status: 409 });

      const response = await SyllabusModel.create(formattedData);

      if (!response)
        return new NextResponse("error while inseting data", { status: 500 });

      await syncTestConfigSubjects(formattedData.class);

      return NextResponse.json({ data: "success" }, { status: 200 });
    } else {
      return new NextResponse("Invalid type", { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
