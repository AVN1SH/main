import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SyllabusModel from "@/models/syllabus.model";

/**
 * GET /api/syllabus/list?class=<classKey>&subject=<subjectKey>
 *
 * Returns all syllabus documents for a given class (optionally excluding a
 * specific subject so a subject doesn't link to itself).
 * Each item: { _id, subject, exam_type }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get("class");
    const excludeSubject = searchParams.get("subject"); // optional – exclude self

    if (!className) {
      return NextResponse.json({ error: "class is required" }, { status: 400 });
    }

    await dbConnect();

    const normalizedClass = className.toLowerCase().replace(/\s+/g, "_");

    const query: Record<string, any> = { class: normalizedClass };
    if (excludeSubject) {
      query.subject = {
        $ne: excludeSubject.toLowerCase().replace(/\s+/g, "_"),
      };
    }

    const docs = await SyllabusModel.find(query, {
      _id: 1,
      subject: 1,
      exam_type: 1,
    }).lean();

    const items = docs.map((d: any) => ({
      _id: String(d._id),
      subject: d.subject,
      exam_type: d.exam_type,
      // Pretty-printed label
      label: d.subject
        .split("_")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    }));

    return NextResponse.json({ syllabi: items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching syllabus list:", error);
    return NextResponse.json(
      { error: "Failed to fetch syllabus list" },
      { status: 500 },
    );
  }
}
