import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import GradeStep, { IGradeStep } from "@/models/gradeStep.model";

export async function GET() {
  await dbConnect();
  try {
    const steps = await GradeStep.find({}).sort({ gradeId: 1 });
    return NextResponse.json(steps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { gradeId, steps, finalStep, defaultExamType, examPattern, sections, questionTypes, active } = body;

    if (!gradeId) {
      return NextResponse.json(
        { error: "gradeId is required" },
        { status: 400 },
      );
    }

    const updateFields: any = { steps, finalStep, defaultExamType, examPattern, sections, questionTypes };
    if (typeof active === "boolean") updateFields.active = active;

    const updated = await GradeStep.findOneAndUpdate(
      { gradeId },
      updateFields,
      { upsert: true, new: true },
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const gradeId = searchParams.get("gradeId");

    if (!gradeId) {
      return NextResponse.json(
        { error: "gradeId is required" },
        { status: 400 },
      );
    }

    await GradeStep.deleteOne({ gradeId });
    return NextResponse.json({ message: "Grade deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
