import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SyllabusModel from "@/models/syllabus.model";
import ChunkModel from "@/models/chunk.model";
import SQPModel from "@/models/sqp.model";
import TestPaperModel from "@/models/testPaper.model";
import UserHistoryModel from "@/models/userHistory.model";
import ShareTestModel from "@/models/shareTest.model";
import AIAnalysisModel from "@/models/aiAnalysis.model";
import { getDashboardAuth } from "@/utils/dashboardAuth";

/**
 * ONE-TIME migration: backfill stable `subjectId` to all existing documents
 * that were created before the subjectId system was introduced.
 *
 * For each unique (class + exam_type + subject) combo in Syllabus,
 * we derive a subjectId and stamp it on every matching doc across all collections.
 *
 * POST /api/migration/backfill-subject-ids
 * Body: { dryRun?: boolean }  — set dryRun:true to preview without writing
 */
export async function POST(req: Request) {
  try {
    const auth = await getDashboardAuth();
    if (!auth || auth.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { dryRun = false } = await req.json().catch(() => ({}));

    await dbConnect();

    // 1. Find all unique (class, exam_type, subject) combos that have no subjectId
    const syllabusDocs = await SyllabusModel.find({
      $or: [{ subjectId: { $exists: false } }, { subjectId: null }, { subjectId: "" }],
    })
      .select("class exam_type subject subjectId")
      .lean();

    // Group by normalized (class + exam_type + subject) to produce one id per combo
    const comboMap = new Map<
      string,
      { classVal: string; examType: string; subject: string; subjectId: string }
    >();

    for (const doc of syllabusDocs) {
      const key = `${(doc as any).class}||${(doc as any).exam_type}||${(doc as any).subject}`;
      if (!comboMap.has(key)) {
        const slug = (doc as any).subject || "unknown";
        const rand = Math.random().toString(16).slice(2, 6);
        comboMap.set(key, {
          classVal: (doc as any).class,
          examType: (doc as any).exam_type,
          subject: (doc as any).subject,
          subjectId: `${slug}_${rand}`,
        });
      }
    }

    const combos = Array.from(comboMap.values());
    const report: any[] = [];

    for (const combo of combos) {
      const { classVal, examType, subject, subjectId } = combo;

      const syllabusQuery = { class: classVal, exam_type: examType, subject };
      const otherQuery: any = { class: classVal, subject };

      if (!dryRun) {
        // Stamp subjectId onto all matching docs in every collection
        await SyllabusModel.updateMany(syllabusQuery, { $set: { subjectId } });
        await ChunkModel.updateMany(
          { class: classVal, subject },
          { $set: { subjectId } },
        );
        await SQPModel.updateMany(
          { ...syllabusQuery },
          { $set: { subjectId } },
        );
        await TestPaperModel.updateMany(otherQuery, { $set: { subjectId } });
        await UserHistoryModel.updateMany(otherQuery, { $set: { subjectId } });
        await ShareTestModel.updateMany(otherQuery, { $set: { subjectId } });
        await AIAnalysisModel.updateMany(
          { grade: classVal, subject },
          { $set: { subjectId } },
        );
      }

      report.push({
        class: classVal,
        exam_type: examType,
        subject,
        assignedSubjectId: subjectId,
        dryRun,
      });
    }

    return NextResponse.json({
      message: dryRun
        ? `DRY RUN: would assign subjectId to ${combos.length} unique subject combos`
        : `Migration complete: assigned subjectId to ${combos.length} unique subject combos`,
      totalCombos: combos.length,
      report,
    });
  } catch (error) {
    console.error("MIGRATION_ERROR:", error);
    return new NextResponse("Migration failed", { status: 500 });
  }
}
