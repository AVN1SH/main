import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SyllabusModel from "@/models/syllabus.model";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get("class");
    const subject = searchParams.get("subject");
    const subjectId = searchParams.get("subjectId"); // preferred
    const examType = searchParams.get("examType");

    if (!className || (!subject && !subjectId)) {
      return NextResponse.json(
        { error: "Missing class and subject/subjectId parameters" },
        { status: 400 },
      );
    }

    const normalizeClassName = className.toLowerCase().replace(/\s+/g, "_");
    await dbConnect();

    // Build query — prefer subjectId (stable), fall back to normalized name (legacy)
    const query: Record<string, string> = { class: normalizeClassName };
    if (subjectId) {
      query.subjectId = subjectId;
    } else if (subject) {
      query.subject = subject.toLowerCase().replace(/\s+/g, "_");
    }
    if (examType) {
      query.exam_type = examType.toUpperCase().replace(/\s+/g, "_");
    }

    const syllabus = await SyllabusModel.findOne(query);

    if (!syllabus) {
      return NextResponse.json({ chapters: [] });
    }

    const chapters: string[] = [];
    for (const item of syllabus.chapter_weightage) {
      if ((item as any).isSubChapters && (item as any).subChapters?.length) {
        for (const sub of (item as any).subChapters) {
          chapters.push(`${item.chapter} - ${sub.name}`);
        }
      } else {
        chapters.push(item.chapter);
      }
    }

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
