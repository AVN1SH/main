import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SyllabusModel from "@/models/syllabus.model";
import TestPaperModel from "@/models/testPaper.model";
import SQPModel from "@/models/sqp.model";
import ChunkModel from "@/models/chunk.model";
import UserHistoryModel from "@/models/userHistory.model";
import ShareTestModel from "@/models/shareTest.model";
import AIAnalysisModel from "@/models/aiAnalysis.model";
import TestConfigModel from "@/models/testConfig.model";
import { getDashboardAuth } from "@/utils/dashboardAuth";
import { resetTestConfigCache } from "@/utils/testConfig";

function normalizeSubject(subject: string): string {
  return subject.toLowerCase().replace(/\s+/g, "_");
}

export async function POST(req: Request) {
  try {
    const auth = await getDashboardAuth();
    if (!auth || auth.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { class: className, examType, oldSubject, newSubject } = await req.json();

    if (!className || !oldSubject || !newSubject) {
      return new NextResponse("class, oldSubject, and newSubject are required", { status: 400 });
    }

    if (oldSubject === newSubject) {
      return new NextResponse("New subject must be different from the old one", { status: 400 });
    }

    await dbConnect();

    const oldNorm = normalizeSubject(oldSubject);
    const newNorm = normalizeSubject(newSubject);

    const results: Record<string, any> = {};

    const normalizedClass = className.toLowerCase().replace(/\s+/g, "_");
    const queryBase: Record<string, any> = { class: normalizedClass };
    if (examType) {
      queryBase.exam_type = examType.toUpperCase().replace(/\s+/g, "_");
    }

    // 1. Update SyllabusModel
    const syllabusResult = await SyllabusModel.updateMany(
      { ...queryBase, subject: oldNorm },
      { $set: { subject: newNorm } },
    );
    results.syllabus = syllabusResult.modifiedCount;

    // 2. Update TestPaperModel
    const testPaperResult = await TestPaperModel.updateMany(
      { ...queryBase, subject: oldNorm },
      { $set: { subject: newNorm } },
    );
    results.testPaper = testPaperResult.modifiedCount;

    // 3. Update SQPModel
    const sqpResult = await SQPModel.updateMany(
      { ...queryBase, subject: oldNorm },
      { $set: { subject: newNorm } },
    );
    results.sqp = sqpResult.modifiedCount;

    // 4. Update ChunkModel
    const chunkResult = await ChunkModel.updateMany(
      { ...queryBase, subject: oldNorm },
      { $set: { subject: newNorm } },
    );
    results.chunk = chunkResult.modifiedCount;

    // 5. Update UserHistoryModel
    const userHistoryResult = await UserHistoryModel.updateMany(
      { class: normalizedClass, subject: oldNorm },
      { $set: { subject: newNorm } },
    );
    results.userHistory = userHistoryResult.modifiedCount;

    // 6. Update ShareTestModel
    const shareTestResult = await ShareTestModel.updateMany(
      { class: normalizedClass, subject: oldNorm },
      { $set: { subject: newNorm } },
    );
    results.shareTest = shareTestResult.modifiedCount;

    // 7. Update AIAnalysisModel (uses 'grade' instead of 'class')
    const aiAnalysisQuery: Record<string, any> = {
      grade: normalizedClass,
      subject: oldNorm,
    };
    if (examType) {
      aiAnalysisQuery.examType = examType.toUpperCase().replace(/\s+/g, "_");
    }
    const aiAnalysisResult = await AIAnalysisModel.updateMany(
      aiAnalysisQuery,
      { $set: { subject: newNorm } },
    );
    results.aiAnalysis = aiAnalysisResult.modifiedCount;

    // 8. Update TestConfigModel - rename subject key in fullTest.subjectQuestions
    //    and boardQuestionCount.*.subjectQuestions, scoring keys, subjects array, subjectSections keys, and paperFormats
    const testConfig = await TestConfigModel.findOne({ configId: "main-config" });
    if (testConfig) {
      const tc = testConfig as any;
      const gradeEntry = tc.grades?.[normalizedClass];
      let modified = false;

      if (gradeEntry) {
        // 1. scoring keys
        if (gradeEntry.scoring) {
          const newScoring: Record<string, any> = {};
          for (const key of Object.keys(gradeEntry.scoring)) {
            let newKey = key;
            if (key === oldNorm) {
              newKey = newNorm;
            } else if (key.startsWith(oldNorm + "::")) {
              newKey = newNorm + key.slice(oldNorm.length);
            }
            newScoring[newKey] = gradeEntry.scoring[key];
            if (newKey !== key) modified = true;
          }
          gradeEntry.scoring = newScoring;
        }

        // 2. subjects array
        if (Array.isArray(gradeEntry.subjects)) {
          const index = gradeEntry.subjects.indexOf(oldNorm);
          if (index !== -1) {
            gradeEntry.subjects[index] = newNorm;
            modified = true;
          }
        }

        // 3. subjectSections keys
        if (gradeEntry.subjectSections && oldNorm in gradeEntry.subjectSections) {
          gradeEntry.subjectSections[newNorm] = gradeEntry.subjectSections[oldNorm];
          delete gradeEntry.subjectSections[oldNorm];
          modified = true;
        }

        const ftSQs = gradeEntry.fullTest?.subjectQuestions;
        if (ftSQs && oldNorm in ftSQs) {
          ftSQs[newNorm] = ftSQs[oldNorm];
          delete ftSQs[oldNorm];
          modified = true;
        }

        const bqc = gradeEntry.boardQuestionCount;
        if (bqc) {
          for (const board of Object.keys(bqc)) {
            const sqs = bqc[board]?.subjectQuestions;
            if (sqs && oldNorm in sqs) {
              sqs[newNorm] = sqs[oldNorm];
              delete sqs[oldNorm];
              modified = true;
            }
          }
        }
      }
      
      // paperFormats
      if (tc.paperFormats) {
        for (const formatKey of Object.keys(tc.paperFormats)) {
          if (tc.paperFormats[formatKey] && oldNorm in tc.paperFormats[formatKey]) {
            tc.paperFormats[formatKey][newNorm] = tc.paperFormats[formatKey][oldNorm];
            delete tc.paperFormats[formatKey][oldNorm];
            modified = true;
          }
        }
      }

      if (modified) {
        // Need to mark modified to ensure mongoose saves mixed types properly
        testConfig.markModified("grades");
        testConfig.markModified("paperFormats");
        await testConfig.save();
        resetTestConfigCache();
        results.testConfig = { renamed: true };
      } else {
        results.testConfig = { renamed: false, reason: "No keys found to rename" };
      }
    } else {
      results.testConfig = { renamed: false, reason: "Test config not found" };
    }

    return NextResponse.json({
      message: "Subject renamed successfully across all modules",
      results,
    });
  } catch (error) {
    console.error("SUBJECT_RENAME_ERROR:", error);
    return new NextResponse("Failed to rename subject", { status: 500 });
  }
}
