import dbConnect from "@/lib/dbConnect";
import TestPaperModel from "@/models/testPaper.model";
import { checkEditor } from "@/utils/rbacUtils";
import { NextRequest, NextResponse } from "next/server";

const safeParsePaper = (paperJson: string) => {
  try {
    return JSON.parse(paperJson);
  } catch {
    return null;
  }
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await checkEditor();
    if (!auth.success) {
      return new NextResponse(auth.error, { status: auth.status });
    }

    await dbConnect();
    const { id } = await params;

    const paper = await TestPaperModel.findById(id).lean();

    if (!paper) {
      return new NextResponse("Test paper not found", { status: 404 });
    }

    return NextResponse.json({
      id: paper._id.toString(),
      class: paper.class,
      subject: paper.subject,
      exam_type: paper.exam_type,
      paperType: paper.paperType,
      chapterName: paper.chapterName,
      selectedChapters: paper.selectedChapters,
      language: paper.language || null,
      createdAt: paper.createdAt,
      updatedAt: paper.updatedAt,
      paper: safeParsePaper(paper.paperJson),
      paperJson: paper.paperJson,
    });
  } catch (error) {
    console.error("TEST_PAPER_GET_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await checkEditor();
    if (!auth.success) {
      return new NextResponse(auth.error, { status: auth.status });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { class: className, subject, exam_type, paperType, language, paper } = body;

    if (!className || !subject || !exam_type || !paperType || !paper) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const nextPaper = typeof paper === "string" ? JSON.parse(paper) : paper;

    if (typeof nextPaper !== "object" || nextPaper === null) {
      return new NextResponse("Invalid paper payload", { status: 400 });
    }

    nextPaper.class = className;
    nextPaper.subject = subject;
    if (language) {
      nextPaper.language = language;
    }

    const updated = await TestPaperModel.findByIdAndUpdate(
      id,
      {
        class: className,
        subject,
        exam_type,
        paperType,
        language: language || null,
        paperJson: JSON.stringify(nextPaper),
      },
      { new: true },
    ).lean();

    if (!updated) {
      return new NextResponse("Test paper not found", { status: 404 });
    }

    return NextResponse.json({
      success: true,
      id: updated._id.toString(),
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error("TEST_PAPER_PATCH_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await checkEditor();
    if (!auth.success) {
      return new NextResponse(auth.error, { status: auth.status });
    }

    await dbConnect();
    const { id } = await params;

    const deleted = await TestPaperModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      return new NextResponse("Test paper not found", { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("TEST_PAPER_DELETE_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
