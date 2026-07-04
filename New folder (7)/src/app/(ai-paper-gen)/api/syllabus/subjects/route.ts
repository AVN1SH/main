import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SyllabusModel from "@/models/syllabus.model";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get("class");
    const examType = searchParams.get("examType");

    await dbConnect();

    const query: Record<string, string> = {};
    if (className) query.class = className.toLowerCase().replace(/\s+/g, "_");
    if (examType) query.exam_type = examType.toUpperCase().replace(/\s+/g, "_");

    // Return id+name pairs; old docs without subjectId fall back to normalized subject slug as id
    const docs = await SyllabusModel.find(query)
      .select("subject subjectId")
      .lean();

    // Deduplicate by subjectId (or subject if no id yet)
    const seen = new Set<string>();
    const subjects: { id: string; name: string }[] = [];

    for (const doc of docs) {
      const id: string =
        (doc as any).subjectId ||
        (doc as any).subject; // backward-compat fallback
      if (seen.has(id)) continue;
      seen.add(id);

      const displayName = ((doc as any).subject as string)
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      subjects.push({ id, name: displayName });
    }

    // Also expose plain string array for consumers that only need names
    return NextResponse.json(
      {
        subjects: subjects.map((s) => s.name), // legacy compat
        subjectList: subjects,                  // new: [{id, name}]
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
