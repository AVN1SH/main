import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SyllabusModel from "@/models/syllabus.model";
import { getDashboardAuth } from "@/utils/dashboardAuth";

/**
 * Rename a subject's display name only.
 *
 * With the new subjectId system this is trivial — we update ONLY
 * the human-readable `subject` field in Syllabus documents that share
 * the same `subjectId`.  No other collection needs touching because
 * they all store `subjectId` as the stable foreign key.
 *
 * For backward-compat (docs without subjectId) we still allow a fallback
 * rename by normalized name, but this cascades to ALL collections as before.
 */
export async function POST(req: Request) {
  try {
    const auth = await getDashboardAuth();
    if (!auth || auth.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      class: className,
      examType,
      subjectId,        // preferred — stable id
      oldSubject,       // fallback if no subjectId yet
      newSubject,
    } = await req.json();

    if (!className || !newSubject || (!subjectId && !oldSubject)) {
      return new NextResponse(
        "class, newSubject, and either subjectId or oldSubject are required",
        { status: 400 },
      );
    }

    if (oldSubject && oldSubject === newSubject) {
      return new NextResponse("New subject must be different from the old one", {
        status: 400,
      });
    }

    await dbConnect();

    const normalizedClass = className.toLowerCase().replace(/\s+/g, "_");
    const newSubjectNorm = newSubject.toLowerCase().replace(/\s+/g, "_");

    const results: Record<string, any> = {};

    if (subjectId) {
      // ── NEW FLOW: update only the display name in Syllabus by subjectId ──
      const queryBase: Record<string, any> = { subjectId, class: normalizedClass };
      if (examType) queryBase.exam_type = examType.toUpperCase().replace(/\s+/g, "_");

      const syllabusResult = await SyllabusModel.updateMany(
        queryBase,
        { $set: { subject: newSubjectNorm } },
      );
      results.syllabus = syllabusResult.modifiedCount;
      results.note =
        "Only display name updated. Other collections unaffected (they use subjectId as FK).";
    } else {
      // ── LEGACY FALLBACK: cascade rename across all collections ──
      const { default: TestPaperModel } = await import("@/models/testPaper.model");
      const { default: SQPModel } = await import("@/models/sqp.model");
      const { default: ChunkModel } = await import("@/models/chunk.model");
      const { default: UserHistoryModel } = await import("@/models/userHistory.model");
      const { default: ShareTestModel } = await import("@/models/shareTest.model");
      const { default: AIAnalysisModel } = await import("@/models/aiAnalysis.model");

      function normalizeSubject(subject: string): string {
        return subject.toLowerCase().replace(/\s+/g, "_");
      }

      const oldNorm = normalizeSubject(oldSubject);
      const queryBase: Record<string, any> = { class: normalizedClass };
      if (examType) queryBase.exam_type = examType.toUpperCase().replace(/\s+/g, "_");

      results.syllabus = (
        await SyllabusModel.updateMany(
          { ...queryBase, subject: oldNorm },
          { $set: { subject: newSubjectNorm } },
        )
      ).modifiedCount;

      results.testPaper = (
        await TestPaperModel.updateMany(
          { ...queryBase, subject: oldNorm },
          { $set: { subject: newSubjectNorm } },
        )
      ).modifiedCount;

      results.sqp = (
        await SQPModel.updateMany(
          { ...queryBase, subject: oldNorm },
          { $set: { subject: newSubjectNorm } },
        )
      ).modifiedCount;

      results.chunk = (
        await ChunkModel.updateMany(
          { ...queryBase, subject: oldNorm },
          { $set: { subject: newSubjectNorm } },
        )
      ).modifiedCount;

      results.userHistory = (
        await UserHistoryModel.updateMany(
          { class: normalizedClass, subject: oldNorm },
          { $set: { subject: newSubjectNorm } },
        )
      ).modifiedCount;

      results.shareTest = (
        await ShareTestModel.updateMany(
          { class: normalizedClass, subject: oldNorm },
          { $set: { subject: newSubjectNorm } },
        )
      ).modifiedCount;

      const aiQuery: Record<string, any> = { grade: normalizedClass, subject: oldNorm };
      if (examType) aiQuery.examType = examType.toUpperCase().replace(/\s+/g, "_");
      results.aiAnalysis = (
        await AIAnalysisModel.updateMany(aiQuery, { $set: { subject: newSubjectNorm } })
      ).modifiedCount;

      results.note =
        "Legacy cascade rename (no subjectId found). Run the migration to avoid this in future.";
    }

    return NextResponse.json({
      message: "Subject renamed successfully",
      results,
    });
  } catch (error) {
    console.error("SUBJECT_RENAME_ERROR:", error);
    return new NextResponse("Failed to rename subject", { status: 500 });
  }
}
