import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SyllabusModel from "@/models/syllabus.model";
import mongoose from "mongoose";

/**
 * GET /api/syllabus/sections?class=<classKey>&subject=<subjectKey>
 * Returns the populated sections[] for a syllabus doc.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get("class");
    const subject = searchParams.get("subject");

    if (!className || !subject) {
      return NextResponse.json(
        { error: "class and subject are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const doc = await SyllabusModel.findOne({
      class: className.toLowerCase().replace(/\s+/g, "_"),
      subject: subject.toLowerCase().replace(/\s+/g, "_"),
    })
      .populate("sections", "_id subject exam_type")
      .lean();

    if (!doc) {
      return NextResponse.json({ sections: [] }, { status: 200 });
    }

    const sections = ((doc as any).sections || []).map((s: any) => ({
      _id: String(s._id),
      subject: s.subject,
      exam_type: s.exam_type,
      label: s.subject
        .split("_")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    }));

    return NextResponse.json({ sections }, { status: 200 });
  } catch (error) {
    console.error("Error fetching syllabus sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch syllabus sections" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/syllabus/sections
 * Body: { class, subject, sectionIds: string[] }
 * Updates the sections[] field of the matching syllabus document.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { class: className, subject, sectionIds } = body;

    if (!className || !subject || !Array.isArray(sectionIds)) {
      return NextResponse.json(
        { error: "class, subject, and sectionIds[] are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const normalizedClass = className.toLowerCase().replace(/\s+/g, "_");
    const normalizedSubject = subject.toLowerCase().replace(/\s+/g, "_");

    // Convert string ids → ObjectIds (filter out invalid ones)
    const objectIds = sectionIds
      .filter((id: string) => mongoose.isValidObjectId(id))
      .map((id: string) => new mongoose.Types.ObjectId(id));

    const updated = await SyllabusModel.findOneAndUpdate(
      { class: normalizedClass, subject: normalizedSubject },
      { $set: { sections: objectIds } },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Syllabus document not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, sections: updated.sections },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating syllabus sections:", error);
    return NextResponse.json(
      { error: "Failed to update syllabus sections" },
      { status: 500 },
    );
  }
}
