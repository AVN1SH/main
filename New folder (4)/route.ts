import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ChunkModel from "@/models/chunk.model";
import SyllabusModel from "@/models/syllabus.model";
import { buildDynamicResponseSchema } from "@/schemas/test.schema";
import TestPaperModel from "@/models/testPaper.model";
import UserHistoryModel from "@/models/userHistory.model";
import AIAnalysisModel from "@/models/aiAnalysis.model";
import { getRouteAuthData } from "@/utils/routeUtils";
import {
  getGradeConfig,
  type GradeConfig,
  type SubjectSectionConfig,
  type CaseStudyConfig,
} from "@/utils/testConfig";
import {
  createQuotaExceededResponse,
  normalizeCourseKey,
  resolveTestGenerationType,
} from "@/utils/aiCredits";
import { setTimeout } from "timers/promises";
import { baseURL } from "@/app/constants/Apis";
import axios from "axios";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface TokenUsageResult {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  thinkingTokens: number;
}

const extractTokenUsage = (result: any): TokenUsageResult => {
  const usageMetadata = result?.usageMetadata;
  return {
    inputTokens: usageMetadata?.promptTokenCount || 0,
    outputTokens: usageMetadata?.candidatesTokenCount || 0,
    totalTokens: usageMetadata?.totalTokenCount || 0,
    thinkingTokens: usageMetadata?.thoughtsTokenCount || 0,
  };
};

const sumTokenUsage = (usages: TokenUsageResult[]): TokenUsageResult => {
  return usages.reduce(
    (acc, curr) => ({
      inputTokens: acc.inputTokens + curr.inputTokens,
      outputTokens: acc.outputTokens + curr.outputTokens,
      totalTokens: acc.totalTokens + curr.totalTokens,
      thinkingTokens: acc.thinkingTokens + curr.thinkingTokens,
    }),
    { inputTokens: 0, outputTokens: 0, totalTokens: 0, thinkingTokens: 0 },
  );
};

// ── Prompt Helpers ──

const SECTION_DESCRIPTIONS: Record<string, string> = {
  mcq: "Single-correct MCQs with exactly 4 options. Provide correctAnswerIndex (0-3).",
  numerical:
    "Numerical answer questions where student types a number via keypad. Provide correctAnswer as a string (e.g. '42', '3.14', '-7').",
  multiCorrect:
    "Multiple-correct MCQs with exactly 4 options where 2 or more are correct. Provide correctAnswerIndices as an array of indices.",
  matchList:
    "Matrix match / Column matching where ONE item from List A can match to MULTIPLE items in List B. listA (3-5 items) and listB (4-6 items). Provide correctMatches as array of {listAIndex, listBIndex} pairs - each List A item can have multiple correct matches.",
  matchListOptionFormat:
    "Matrix match with option format where you provide 4 pre-made options (A, B, C, D). Each option is a mapping string like '(P) → (5) (Q) → (3) (R) → (2) (S) → (4)'. Provide listI (4 items: A, B, C, D from List I), listII (4 items: P, Q, R, S from List II), options (array of 4 mapping strings), and correctIndex (0-3 for which option A/B/C/D is correct). The user selects ONE option as answer.",
  singleDigitInteger:
    "Single-digit integer answer questions where the answer is exactly one digit (0-9). No decimals, no negative values, no multi-digit numbers. The student sees a 0-9 grid and selects one digit. Provide correctAnswer as a string with exactly one digit (e.g. '4', '0', '9').",
};

/** Build a dynamic case study description from config */
const buildCaseStudyDescription = (csConfig?: CaseStudyConfig): string => {
  const typeToArrayName: Record<string, string> = {
    mcq: "mcqSubQuestions",
    numerical: "numericalSubQuestions",
    multiCorrect: "multiCorrectSubQuestions",
    matchList: "matchListSubQuestions",
    matchListOptionFormat: "matchListOptionFormatSubQuestions",
    singleDigitInteger: "singleDigitIntegerSubQuestions",
  };

  if (!csConfig || !csConfig.enabled) {
    return `Case study / passage-based questions. Each case study has typed sub-question arrays: mcqSubQuestions, numericalSubQuestions, multiCorrectSubQuestions, matchListSubQuestions, matchListOptionFormatSubQuestions. Put sub-questions in the array matching their type. Each sub-question has its own schema enforced by the response format.`;
  }
  const allowedTypes =
    csConfig.subQuestionTypes.length > 0 ? csConfig.subQuestionTypes : ["mcq"];
  const arrayNames = allowedTypes
    .map((t) => typeToArrayName[t] || t)
    .join(", ");
  return `Case study / passage-based questions. CRITICAL INSTRUCTION: You MUST generate EXACTLY ${csConfig.count} case study passage(s). For EACH passage, you MUST generate EXACTLY ${csConfig.subQuestionsPerCase} sub-question(s) total. Allowed sub-question types: ${allowedTypes.join(", ")}. Place sub-questions in their matching typed array: ${arrayNames}. Each array enforces the exact schema for that question type. FAILURE TO GENERATE EXACTLY ${csConfig.subQuestionsPerCase} SUB-QUESTIONS PER PASSAGE IS A CRITICAL ERROR.`;
};

const SECTION_KEYS = [
  "mcq",
  "numerical",
  "singleDigitInteger",
  "multiCorrect",
  "matchList",
  "matchListOptionFormat",
  "caseStudy",
];

const buildSectionPrompt = (
  config: GradeConfig,
  isFullTest: boolean = false,
  subjectKey?: string,
  paperType?: string,
): string => {
  const subjectCount = config?.fullTest?.subjectQuestions?.[subjectKey];
  const csConfig = config.caseStudyConfig;

  const getSectionDesc = (section: string): string => {
    if (section === "caseStudy") {
      return buildCaseStudyDescription(csConfig);
    }
    return SECTION_DESCRIPTIONS[section] || "";
  };

  if (isFullTest) {
    let prompt = config.sections
      .map((section) => {
        if (section === "caseStudy" && csConfig?.enabled) {
          const totalSubQs = csConfig.count * csConfig.subQuestionsPerCase;
          return `- **${section}**: ${csConfig.count} case study passage(s) with ${csConfig.subQuestionsPerCase} sub-question(s) each (${totalSubQs} sub-questions total, each counting as an individual question) — ${getSectionDesc(section)}`;
        }
        const count = config.questionCount[section];
        return `- **${section}**: ${count?.default ?? 1} questions — ${getSectionDesc(section)}`;
      })
      .join("\n");
    if (subjectCount) {
      prompt += `\n**Important** : Total Question of ${subjectKey} must be exactly ${subjectCount}`;
      if (csConfig?.enabled) {
        const totalSubQs = csConfig.count * csConfig.subQuestionsPerCase;
        prompt += ` (including ${totalSubQs} case study sub-questions that count as individual questions)`;
      }
    }
    return prompt;
  }

  return config.sections
    .map((section) => {
      if (section === "caseStudy" && csConfig?.enabled) {
        const totalSubQs = csConfig.count * csConfig.subQuestionsPerCase;
        return `- **${section}**: ${csConfig.count} case study passage(s) with ${csConfig.subQuestionsPerCase} sub-question(s) each (${totalSubQs} sub-questions total, counted individually in total question count) — ${getSectionDesc(section)}`;
      }
      const count = config.questionCount[section];
      if (
        subjectKey &&
        config.fullTest?.subjectQuestions?.[subjectKey] &&
        paperType !== "Chapter Test"
      ) {
        return `- **${section}**:  questions — ${getSectionDesc(section)}`;
      }
      return `- **${section}**: must contain ${count.min} question, can contain up to ${count.max} questions — ${getSectionDesc(section)}`;
    })
    .join("\n");
};

const flattenResponse = (
  response: Record<string, unknown>,
  subject: string,
  startId: number = 1,
): Array<Record<string, unknown>> => {
  const questions: Array<Record<string, unknown>> = [];
  let globalId = startId;

  /** Maps typed sub-question array names → the question type they represent */
  const SUB_QUESTION_ARRAYS: Record<string, string> = {
    mcqSubQuestions: "mcq",
    numericalSubQuestions: "numerical",
    multiCorrectSubQuestions: "multiCorrect",
    matchListSubQuestions: "matchList",
    matchListOptionFormatSubQuestions: "matchListOptionFormat",
    singleDigitIntegerSubQuestions: "singleDigitInteger",
  };

  for (const section of SECTION_KEYS) {
    const items = response[section];
    if (items && Array.isArray(items)) {
      for (const q of items) {
        const subjectPrefix = subject.toLowerCase().replace(/\s+/g, "");
        const sectionLabel =
          (q as any).section === "null" ||
          (q as any).section === "" ||
          (q as any).section === null
            ? null
            : (q as any).section;

        if (section === "caseStudy") {
          // Collect sub-questions from all typed arrays
          const parentId = `${subjectPrefix}_cs${globalId++}`;
          const passage = (q as any).passage || "";
          const parentTitle = (q as any).question || "";

          // Also support legacy `subQuestions` array for backward compatibility
          const allSubs: Array<{ sub: any; subType: string }> = [];

          for (const [arrayKey, subType] of Object.entries(
            SUB_QUESTION_ARRAYS,
          )) {
            if (Array.isArray((q as any)[arrayKey])) {
              for (const sub of (q as any)[arrayKey]) {
                allSubs.push({ sub, subType });
              }
            }
          }

          // Legacy: single `subQuestions` array with `subType` discriminator
          if (Array.isArray((q as any).subQuestions)) {
            for (const sub of (q as any).subQuestions) {
              allSubs.push({ sub, subType: sub.subType || "mcq" });
            }
          }

          for (const { sub, subType } of allSubs) {
            questions.push({
              ...sub,
              type: subType,
              id: `${subjectPrefix}_q${globalId++}`,
              subject,
              section: sectionLabel,
              explanation: sub.explanation || (q as any).explanation || "",
              hint: sub.hint || null,
              _caseStudyParentId: parentId,
              _caseStudyPassage: passage,
              _caseStudyTitle: parentTitle,
            });
          }
        } else {
          questions.push({
            ...q,
            type: section,
            id: `${subjectPrefix}_q${globalId++}`,
            subject,
            section: sectionLabel,
          });
        }
      }
    }
  }
  return questions;
};

// ── Generate Questions for a Single Subject ──

/**
 * Applies paper-specific overrides (Paper 1 / Paper 2) to the GradeConfig.
 * Falls back to the base fullTest config when no paper or no paper config is found.
 */
const normalizePaperKey = (label: string) =>
  label
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

const applyPaperConfig = (
  gradeConfig: GradeConfig,
  paper?: string,
): GradeConfig => {
  if (!paper || !gradeConfig.fullTest) return gradeConfig;
  const paperKey = normalizePaperKey(paper);
  const pc = gradeConfig.fullTest[paperKey];
  if (!pc) return gradeConfig;

  return {
    ...gradeConfig,
    sections: pc.sections || gradeConfig.sections,
    questionCount: pc.questionCount || gradeConfig.questionCount,
    ...(pc.caseStudyConfig ? { caseStudyConfig: pc.caseStudyConfig } : {}),
    fullTest: {
      ...gradeConfig.fullTest,
      ...(pc.totalQuestions != null
        ? { totalQuestions: pc.totalQuestions }
        : {}),
      ...(pc.totalTime != null ? { totalTime: pc.totalTime } : {}),
      ...(pc.subjectQuestions ? { subjectQuestions: pc.subjectQuestions } : {}),
    },
  };
};

const generateQuestionsForSubject = async (
  subject: string,
  className: string,
  paperType: string,
  examType: string,
  chapter: string | undefined,
  gradeConfig: GradeConfig,
  isFullTest: boolean = false,
  subjectKey?: string,
  language?: string,
  subjectSections?: SubjectSectionConfig[],
  selectedChapters?: string[],
): Promise<{
  questions: Array<Record<string, unknown>>;
  tokenUsage: TokenUsageResult;
}> => {
  const normalizedSubject = subject.toLowerCase().replace(" ", "_");
  const normalizedClass = String(className.toLowerCase().replace(" ", "_"));
  let context = "";

  if (paperType === "Chapter Test") {
    let enhancedChapter = chapter;
    try {
      const enhancementPrompt = `
        As an academic expert in ${gradeConfig.promptContext}, enhance the chapter/topic: "${chapter}" for ${className} ${subject}.
        Create a keyword-rich search query including core concepts and specific terms frequently tested.
        Return ONLY the enhanced search query text for better semantic search results.
      `;
      const enhancementResult = await ai.models.generateContent({
        model: process.env.LiteModel,
        contents: enhancementPrompt,
      });
      if (enhancementResult?.text) {
        enhancedChapter = enhancementResult.text.trim();
      }
    } catch (err) {
      console.error("CHAPTER_ENHANCEMENT_FAILED:", err);
    }

    const embeddingResult = await ai.models.embedContent({
      model: process.env.EmbeddingModel,
      contents: enhancedChapter,
    });
    const embedding = embeddingResult.embeddings[0].values;

    const chunks = await ChunkModel.aggregate([
      {
        $vectorSearch: {
          index: "semantic-search",
          path: "embedding",
          queryVector: embedding,
          numCandidates: 300,
          limit: 250,
          filter: {
            subject: { $eq: normalizedSubject },
            class: { $eq: normalizedClass },
          },
        },
      },
      {
        $project: {
          sourceId: 1,
          text: 1,
          chunkIndex: 1,
          year: 1,
          subject: 1,
          exam_type: 1,
          class: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
      { $sort: { score: -1, chunkIndex: 1 } },
    ]);

    context = chunks.map((c: { text: string }) => c.text).join("\n\n");
  } else if (
    paperType === "Subject Test" ||
    paperType === "Full Syllabus Test"
  ) {
    console.log("selectedChapters", selectedChapters);
    // If specific chapters are selected, use semantic search scoped to those chapters
    if (selectedChapters && selectedChapters.length > 0) {
      // Fetch syllabus and filter to selected chapters only
      const syllabus = await SyllabusModel.findOne({
        class: normalizedClass,
        subject: normalizedSubject,
        exam_type: examType,
      }).populate("sections", "subject chapter_weightage exam_type");

      let filteredWeightage = null;

      if (syllabus) {
        filteredWeightage = syllabus.chapter_weightage.filter((cw: any) =>
          selectedChapters.some(
            (sc) =>
              cw.chapter.toLowerCase().includes(sc.toLowerCase()) ||
              sc.toLowerCase().includes(cw.chapter.toLowerCase()),
          ),
        );
        context +=
          "\n\nSyllabus Weightage Instructions: Use percentage for JEE/NEET or other competative exams and marks (out of 80/100) for school exams. Higher weightage requires more questions from that chapter. If total weight < 100% or weight > 100% or max marks, adjust values proportionally in percentage to reach the 100% in total before selecting questions. Selected Chapters Syllabus (focus questions ONLY on these chapters):\n" +
          JSON.stringify(
            filteredWeightage.length > 0
              ? filteredWeightage
              : syllabus.chapter_weightage,
          );
        +"If all the chapter weightage is 0 then calculate weightage from provided context to idendify the pattern and generate accordingly"
      }

      // Build a combined query from selected chapter names for embedding
      const chapterQuery = selectedChapters.join(", ") + filteredWeightage ? "Syllabus : " + filteredWeightage.map((item: any) => item.chapter + item.description ? " : " + item.description : "").join(", ") : "";
      let enhancedQuery = chapterQuery;
      try {
        const enhancementResult = await ai.models.generateContent({
          model: process.env.LiteModel,
          contents: `Expand the following chapter names into a keyword-rich search query for semantic search in ${className} ${subject}: "${chapterQuery}". Return ONLY the expanded query.`,
        });
        if (enhancementResult?.text)
          enhancedQuery = enhancementResult.text.trim();
      } catch {
        /* fallback to raw chapter names */
      }

      console.log(enhancedQuery)

      const embeddingResult = await ai.models.embedContent({
        model: process.env.EmbeddingModel,
        contents: enhancedQuery,
      });
      const embedding = embeddingResult.embeddings[0].values;

      const chunks = await ChunkModel.aggregate([
        {
          $vectorSearch: {
            index: "semantic-search",
            path: "embedding",
            queryVector: embedding,
            numCandidates: 300,
            limit: 250,
            filter: {
              subject: { $eq: normalizedSubject },
              class: { $eq: normalizedClass },
            },
          },
        },
        { $project: { text: 1, score: { $meta: "vectorSearchScore" } } },
        { $sort: { score: -1 } },
      ]);
      context += chunks.map((c: { text: string }) => c.text).join("\n\n");

      console.log(context)

    } else {
      // Default: fetch all chunks and full syllabus
      const chunks = await ChunkModel.find({
        class: normalizedClass,
        subject: normalizedSubject,
      }).limit(500);
      context = chunks.map((c: { text: string }) => c.text).join("\n\n");

      const syllabus = await SyllabusModel.findOne({
        class: normalizedClass,
        subject: normalizedSubject,
        exam_type: examType,
      }).populate("sections", "subject chapter_weightage exam_type");
      console.log(syllabus, "syllabus")
      console.log(buildSectionPrompt(gradeConfig, isFullTest, subjectKey));
      if (syllabus) {
        context +=
          "\n\nSyllabus Weightage Instructions: Use percentage for JEE/NEET or other competative exams and marks (out of 80/100) for school exams. Higher weightage requires more questions from that chapter. If total weight < 100% or weight > 100% or max marks, adjust values proportionally in percentage to reach the 100% in total before selecting questions:\n" +
          JSON.stringify(syllabus.chapter_weightage) + "If all the chapter weightage is 0 then calculate weightage from provided context to idendify the pattern and generate accordingly";

        let hasSectionSpecificSyllabus = false;
        if (subjectSections && subjectSections.length > 0) {
          const sectionSyllabiContexts = await Promise.all(
            subjectSections.map(async (sec: any) => {
              if (sec.linkedSyllabusIds && sec.linkedSyllabusIds.length > 0) {
                const linkedDocs = await SyllabusModel.find({
                  _id: { $in: sec.linkedSyllabusIds },
                });
                if (linkedDocs.length > 0) {
                  hasSectionSpecificSyllabus = true;
                  return `\n\nLinked Syllabus for Section "${sec.sectionName}" (Use this chapter weightage specifically for generating questions belonging to the "${sec.sectionName}" section):\n` +
                    linkedDocs
                      .map((d: any) => `Subject: ${d.subject.replace(/_/g, " ")} (${d.exam_type}):\n${JSON.stringify(d.chapter_weightage)}`)
                      .join("\n\n");
                }
              }
              return null;
            })
          );
          const validSectionContexts = sectionSyllabiContexts.filter(Boolean);
          if (validSectionContexts.length > 0) {
            context += validSectionContexts.join("\n");
          }
        }

        // If no section-specific syllabus was found, fallback to the legacy global linked sections
        if (!hasSectionSpecificSyllabus) {
          const linkedSections = (syllabus as any).sections as any[];
          if (linkedSections && linkedSections.length > 0) {
            context +=
              "\n\nLinked Subject Sections for common or basic or compulsory section of this subject includes (treat each as a distinct section of this subject, use their chapter weightage to distribute questions across these sections accordingly):\n" +
              linkedSections
                .map(
                  (sec: any) =>
                    `Section — ${sec.subject.replace(/_/g, " ")} (${sec.exam_type}):\n${JSON.stringify(sec.chapter_weightage)}`,
                )
                .join("\n\n");
          }
        }
      }
    }
  }
  const selectedChaptersStr =
    selectedChapters && selectedChapters.length > 0
      ? ` focusing on chapters: ${selectedChapters.join(", ")}`
      : chapter
        ? ` focusing on chapter "${chapter}"`
        : "";
  const prompt = `Generate a ${paperType} for ${subject} (Class/Course: ${className})${selectedChaptersStr}.
${language ? `Generate the entire paper (questions, options, explanations) in ${language} language.` : ""}

If Context from previous exams and syllabus provided below then use it otherwise generate based on exam pattern : ${examType} (Context are only used to track the pattern and styling and difficulty level of the question and not to use directly in the questions. Use your own knowledge to create new questions on those topics, pattern, difficulty level, questioin structure etc. according to the provided context you analyse and ${examType} exam.):
${context}`;
  const subjectCount = gradeConfig?.fullTest?.subjectQuestions?.[subjectKey];
  // Build sectional instruction for Subject Test
  const enabledSections =
    subjectSections?.filter((s) => s.enabled && s.sectionName.trim()) ?? [];
  const hasSectionalConfig =
    !isFullTest && paperType === "Subject Test" && enabledSections.length > 0;
  const sectionalInstruction = hasSectionalConfig
    ? `\n\n**SECTIONAL CATEGORISATION (Subject Test only)**:
This subject test is divided into the following predefined sections. For EVERY question you generate, you MUST set the \`section\` to EXACTLY one of the following values — no other values allowed:
${enabledSections.map((s) => `- "${s.sectionName}" (${s.questionCount} questions)`).join("\n")} ${subjectCount ? `**Important** : Total Question of this subject including all sections must be exactly ${subjectCount}` : ""}
Distribute questions across sections according to the question counts listed. The total must match the overall question count requested. Set \`section\` to null if I've not mentioned the section name above.`
    : "**IMPORTANT**: There is no Section for this Subject so Initialize null in the \`section\` field for every question.";

  const systemInstruction = `You are an expert exam paper generator following ${gradeConfig.promptContext}.

  ${
    isFullTest && gradeConfig.fullTest
      ? `**IMPORTANT**: You MUST generate exactly ${
          subjectKey && gradeConfig.fullTest.subjectQuestions?.[subjectKey]
            ? gradeConfig.fullTest.subjectQuestions[subjectKey]
            : gradeConfig.fullTest.perSubjectQuestions
        } TOTAL questions for this subject, not more not less.`
      : ""
  }
Generate questions for the following question types ONLY (strictly populate questions for the question types given below and leave other question types as null):
${buildSectionPrompt(gradeConfig, isFullTest, subjectKey)}

${sectionalInstruction}

Important rules:
${language ? `- **IMPORTANT**: Generate ALL questions, options, explanations, and hints in ${language} language. Do NOT use any other language.` : ""}
- Always set \`section\` to null if I've not mentioned the section name above, Don't add by yourself like (mcq or numericals or casestudy etc as questionType).
- Avoid Image base questions.
- Match the difficulty level—do not make them overly simple.
- The mathematical logic and depth match the PYQs, and the trick or trap built into the original questions.
- Look at the MCQ structure in the provided PYQs, generate options in a way that the wrong options (distractors) are framed to confuse the student.
- Match the exact question-delivery style (e.g., 'Which of the following is NOT...', 'Assertion-Reasoning', or 'Statement I and II'). Ensure the wrong answer choices are just as plausible and high-yield as the options in the PYQs.
- if question Type only have mcq then populate mcq question type only and ignore others.
- Only populate the question type listed above.
- Questions, options and explanation must be in markdown format.
- explanation should be sort under 100 words. and should be in step by step format.
- Don't prefix options with labels like (a), (b), (c), (d) — the frontend handles this.
- Mathematical symbols or chemical equations should be in Latex format, eg- $y = (\\sin x)^{\\tan x}$, $K_{max} = \\frac{hc}{λ} - ϕ$. 
- Always enclose Mathematical expressions or chemical equations strictly between single dollar signs ($...$) and you must use latex format where needed, including (question opitons, hints, explanation, etc).
- Ensure clear, unambiguous questions at appropriate difficulty.
- All string values must be on a single line. Use \\n for line breaks inside values.
- Provide a helpful hint for each question (formula or concept used).

**FINAL CRITICAL CHECK**: Before returning the JSON, YOU MUST INTERNALLY VERIFY that the total number of questions exactly matches the requested count (e.g. 18 questions). Count every single item in the mcq, numerical, multiCorrect, matchList arrays AND count every single sub-question inside the case study arrays. If the total is less than the requested amount, YOU MUST generate the missing questions before finishing. Do NOT output a partial test.`;

  // ── Build count hints for the response schema ──
  // Embedding per-section quantity expectations directly in the schema description
  // ensures lightweight models (e.g. gemini-3-flash-preview) respect the counts.
  const countHints: Record<string, { desc: string; minItems?: number; maxItems?: number }> = {};
  const csConfig = gradeConfig.caseStudyConfig;
  const SubCount = gradeConfig?.fullTest?.subjectQuestions?.[subjectKey];
  for (const section of gradeConfig.sections) {
    if (section === "caseStudy" && csConfig?.enabled) {
      const totalSubQs = csConfig.count * csConfig.subQuestionsPerCase;
      countHints[section] = {
        desc: `Exactly ${csConfig.count} passage(s) with ${csConfig.subQuestionsPerCase} sub-question(s) each (${totalSubQs} sub-questions total, each counts as separate question)`,
        minItems: csConfig.count,
        maxItems: csConfig.count,
      };
    } else if (isFullTest && gradeConfig.fullTest) {
      const d = gradeConfig.questionCount[section]?.default;
      if (d != null) {
        countHints[section] = { desc: `Exactly ${d} questions`, minItems: d, maxItems: d };
      } else if (subjectKey && gradeConfig.fullTest.subjectQuestions?.[subjectKey]) {
        countHints[section] = { desc: `Part of a ${gradeConfig.fullTest.subjectQuestions[subjectKey]}-question subject total` };
      }
    } else {
      const c = gradeConfig.questionCount[section];
      if (c) {
        countHints[section] = {
          desc: c.min === c.max ? `Exactly ${c.min} questions` : `${c.min}–${c.max} questions`,
          minItems: c.min,
          maxItems: c.max,
        };
      }
    }
  }
  console.log(
    buildDynamicResponseSchema(
      gradeConfig.sections,
      hasSectionalConfig
        ? (enabledSections?.map((s) => s.sectionName) ?? [])
        : undefined,
      Object.keys(countHints).length > 0 ? countHints : undefined,
    ),
  );
  console.log(
    "================>>>>>>>>>>>>>>>",
    prompt,
    systemInstruction,
    buildDynamicResponseSchema(
      gradeConfig.sections,
      hasSectionalConfig
        ? (enabledSections?.map((s) => s.sectionName) ?? [])
        : undefined,
      Object.keys(countHints).length > 0 ? countHints : undefined,
    ),
  );
  const result = await ai.models.generateContent({
    model: process.env.PrimaryModel,
    contents: prompt,
    config: {
      // tools: [
      //   { googleSearch : {} }
      // ],
      responseMimeType: "application/json",
      responseSchema: buildDynamicResponseSchema(
        gradeConfig.sections,
        hasSectionalConfig
          ? (enabledSections?.map((s) => s.sectionName) ?? [])
          : undefined,
        Object.keys(countHints).length > 0 ? countHints : undefined,
      ),
      // temperature: 0.1,
      // maxOutputTokens: 8192,
      systemInstruction,
    },
  });

  const tokenUsage = extractTokenUsage(result);
  const rawResponse = JSON.parse(result.text!);
  return {
    questions: flattenResponse(rawResponse, subject),
    tokenUsage,
  };
};

// ── Route Handler ──

export async function POST(request: Request) {
  try {
    const {
      formDetails,
      chapter,
      messages: clientMessages,
    } = await request.json();
    const {
      class: className,
      subject,
      paperType,
      examType,
      language,
      paper,
      selectedChapters,
    } = formDetails;
    const generationType = resolveTestGenerationType(paperType);
    const normalizedClass = String(className.toLowerCase().replace(" ", "_"));
    const normalizedExamType = examType.toUpperCase().replace(" ", "_");
    let gradeConfig = await getGradeConfig(normalizedClass);
    gradeConfig = applyPaperConfig(gradeConfig, paper);
    const gradeSubjects = gradeConfig.subjects || [];
    await dbConnect();

    // const auth = await getRouteAuthData();
    // if (!auth.success || !auth.data?.userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // const { userId, token } = auth.data;

    // let apiUrl = `${baseURL}/user-ai-credits`;

    // if (userId && token) {
    //   apiUrl += `?token=${token}&user_id=${userId}`;
    // }

    // const userCreditRemaining = await axios.get(apiUrl, {
    //   headers: {
    //     Authorization: `Bearer ${auth.data.bearerToken}`,
    //   },
    // });

    // if (!userCreditRemaining.data.success) {
    //   return new NextResponse("User credit remaining not found", {
    //     status: 404,
    //   });
    // }

    // const aiCreditCost = await axios.get(`${baseURL}/ai-credit-cost`, {
    //   headers: {
    //     Authorization: `Bearer ${auth.data.bearerToken}`,
    //   },
    // });

    // if (!aiCreditCost.data.success) {
    //   return new NextResponse("AI credit cost not found", { status: 404 });
    // }

    const courseKey = normalizeCourseKey(String(className));
    //for specific course......

    // const courseGenerationCost = aiCreditCost.data.data
    //   .find((item: any) => item.course_key === courseKey)
    //   .generation_types.find(
    //     (item: any) => item.generationType === generationType,
    //   ).cost;

    // allowing for all courses.....
    // const courseGenerationCost = aiCreditCost.data.data[0]
    //   .generation_types.find(
    //     (item: any) => item.generationType === generationType,
    //   ).cost;

    // const isEnoughCredits =
    //   userCreditRemaining.data.creditsRemaining >= courseGenerationCost;

    // if (!isEnoughCredits) {
    //   return createQuotaExceededResponse({
    //     courseKey: courseKey,
    //     generationType,
    //     creditsRemaining: userCreditRemaining.data.creditsRemaining,
    //     cost: courseGenerationCost,
    //   });
    // }
    // //early deduct credits
    //     const cookieStore = await cookies();

    //     let uuid = cookieStore.get("uuid")?.value || null;

    //     if (!uuid) {
    //       uuid = crypto.randomUUID();
    //       cookieStore.set("uuid", uuid, { httpOnly: true });
    //     }

    //     const apiUrl2 = `${baseURL}/user-ai-credits`;
    //     const body = {
    //       user_id: userId,
    //       course_key: courseKey,
    //       token: token,
    //       type: "deduct",
    //       generation_type: generationType,
    //       generation_id: uuid,
    //     };
    //     const response = await axios.patch(apiUrl2, body, {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //       },
    //       validateStatus: (status) =>
    //         (status >= 200 && status < 300) || status === 402,
    //     });
    //     if (!response.data.success) {
    //       return createQuotaExceededResponse({
    //         courseKey: courseKey,
    //         generationType,
    //         creditsRemaining: userCreditRemaining.data.creditsRemaining,
    //         cost: courseGenerationCost,
    //       });
    //     }

    const normalizedSubjectForCheck =
      paperType === "Full Syllabus Test"
        ? "all"
        : subject.toLowerCase().replace(" ", "_");

    // Calculate timer config (moved up for use in cached response)
    const isFullTestCheck = paperType === "Full Syllabus Test";
    let timerConfig = null;
    if (gradeConfig.fullTest && isFullTestCheck) {
      timerConfig = {
        totalTime: gradeConfig.fullTest.totalTime,
        totalQuestions: gradeConfig.fullTest.totalQuestions,
        perSubjectQuestions: gradeConfig.fullTest.perSubjectQuestions,
        subjectQuestions: gradeConfig.fullTest.subjectQuestions || null,
        isFullTest: true,
      };
    } else if (gradeConfig.perQuestionTime) {
      timerConfig = {
        perQuestionTime: gradeConfig.perQuestionTime,
        isFullTest: false,
      };
    }

    // const usedTestPaperIds = await UserHistoryModel.find({
    //   userId,
    //   class: normalizedClass,
    //   subject: normalizedSubjectForCheck,
    //   exam_type: normalizedExamType,
    //   paperType,
    //   chapterName: chapter ? chapter : '',
    // }).distinct("testPaper");

    // const cachedPaper = await TestPaperModel.findOne({
    //   class: normalizedClass,
    //   subject: normalizedSubjectForCheck,
    //   exam_type: normalizedExamType,
    //   paperType,
    //   chapterName: chapter ? chapter : '',
    //   ...(usedTestPaperIds.length ? { _id: { $nin: usedTestPaperIds } } : {}),
    // })
    //   .sort({ createdAt: 1 })
    //   .lean();

    // if (cachedPaper) {

      // const apiUrl = `${baseURL}/user-ai-credits`;
      // const body = {
      //   user_id: userId,
      //   course_key: courseKey,
      //   token: token,
      //   type: "deduct",
      //   generation_type: generationType,
      //   generation_id: crypto.randomUUID(),
      // };
      // const response = await axios.patch(apiUrl, body, {
      //   headers: {
      //     Authorization: `Bearer ${auth.data.bearerToken}`,
      //   },
      // });

      // if (!response.data.success) {

      //   return createQuotaExceededResponse({
      //     courseKey: courseKey,
      //     generationType,
      //     creditsRemaining: userCreditRemaining.data.creditsRemaining,
      //     cost: courseGenerationCost,
      //   });
      // }

    //   const parsedPaper = JSON.parse(cachedPaper.paperJson);

    //   const title = `${paperType}: ${paperType === "Full Syllabus Test" ? "All Subjects" : chapter || subject} (${className})`;
    //   const preview = `Contains ${parsedPaper.questions?.length || 0} questions.`;

    //   let historyItem = null;
    //   try {
    //     const defaultMessages = [
    //       {
    //         role: "user",
    //         content: `Generate ${paperType} for ${paperType === "Full Syllabus Test" ? "All Subjects" : chapter || subject}`,
    //       },
    //       {
    //         id: (Date.now() + 1).toString(),
    //         role: "bot",
    //         content:
    //           "I've generated the test for you. You can now start in the panel on the left!",
    //       },
    //     ];

    //     const finalMessages = clientMessages
    //       ? [
    //           ...clientMessages,
    //           {
    //             id: (Date.now() + 1).toString(),
    //             role: "bot",
    //             content:
    //               "I've generated the test for you. You can now start in the panel on the left!",
    //           },
    //         ]
    //       : defaultMessages;

    //     historyItem = await UserHistoryModel.create({
    //       userId,
    //       testPaper: cachedPaper._id,
    //       class: normalizedClass,
    //       subject: normalizedSubjectForCheck,
    //       exam_type: normalizedExamType,
    //       chapterName: chapter ? chapter : "",
    //       paperType,
    //       messages: finalMessages,
    //       paperJson: cachedPaper.paperJson,
    //       title,
    //       preview,
    //       language: (cachedPaper as any).language || language || null,
    //       rootHistoryId: null,
    //     });
    //   } catch (historyError) {
    //     console.error("USER_HISTORY_CACHE_WRITE_ERROR:", historyError);
    //   }

    //   await setTimeout(10000);

    //   return NextResponse.json({
    //     data: { ...parsedPaper, scoring: gradeConfig.scoring },
    //     scoring: gradeConfig.scoring,
    //     isCached: true,
    //     timerConfig: parsedPaper.timerConfig || timerConfig,
    //     userHistory: historyItem
    //       ? {
    //           id: historyItem._id.toString(),
    //           title: historyItem.title,
    //           messages: historyItem.messages,
    //           preview: historyItem.preview,
    //         }
    //       : null,
    //   });
    // }

    // Generate new questions
    let allQuestions: Array<Record<string, unknown>> = [];
    let subjects: string[] = [];
    const isFullTest = paperType === "Full Syllabus Test";

    // Update timerConfig for non-cached case
    if (gradeConfig.fullTest && isFullTest) {
      timerConfig = {
        totalTime: gradeConfig.fullTest.totalTime,
        totalQuestions: gradeConfig.fullTest.totalQuestions,
        perSubjectQuestions: gradeConfig.fullTest.perSubjectQuestions,
        subjectQuestions: gradeConfig.fullTest.subjectQuestions || null,
        isFullTest: true,
      };
    } else if (gradeConfig.perQuestionTime) {
      timerConfig = {
        perQuestionTime: gradeConfig.perQuestionTime,
        isFullTest: false,
      };
    }

    let totalTokenUsage: TokenUsageResult = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      thinkingTokens: 0,
    };

    if (isFullTest && gradeSubjects.length > 0) {
      subjects = gradeSubjects;
      // Loop through each subject and call API in parallel
      const questionsPromises = subjects.map((subj) => {
        const subjectKey = subj.toLowerCase().replace(/\s+/g, "_");
        return generateQuestionsForSubject(
          subj,
          className,
          paperType,
          examType,
          undefined,
          gradeConfig,
          true,
          subjectKey,
          language,
        );
      });

      const results = await Promise.all(questionsPromises);
      allQuestions = results.flatMap((r) => r.questions);
      totalTokenUsage = sumTokenUsage(results.map((r) => r.tokenUsage));
    } else {
      subjects = [subject];
      // For Subject Test: pass enabled subjectSections so Gemini knows the section breakdown
      const normalizedSubjKey = subject.toLowerCase().replace(/\s+/g, "_");
      const subjectSections =
        gradeConfig.subjectSections?.[normalizedSubjKey]?.filter(
          (s) => s.enabled,
        ) ?? [];
      const result = await generateQuestionsForSubject(
        subject,
        className,
        paperType,
        examType,
        chapter,
        gradeConfig,
        false,
        normalizedSubjKey,
        language,
        subjectSections.length > 0 ? subjectSections : undefined,
        selectedChapters,
      );
      allQuestions = result.questions;
      totalTokenUsage = result.tokenUsage;
    }

    const subjectsList = [
      ...new Set(allQuestions.map((q) => q.subject as string)),
    ];

    // Collect distinct section labels for Subject Test tab rendering
    const questionSections = isFullTest
      ? null
      : ([
          ...new Set(
            allQuestions
              .map((q) => (q as any).section as string | null)
              .filter(Boolean),
          ),
        ] as string[] | null);

    const responseData = {
      questions: allQuestions,
      subjects: subjectsList,
      isFullSyllabus: isFullTest,
      timerConfig,
      scoring: gradeConfig.scoring,
      // Section labels for Subject Test (null if not configured)
      questionSections:
        questionSections && questionSections.length > 0
          ? questionSections
          : null,
    };

    // Save to user history
    let historyItem = null;

    const normalizedSubjectForAnalysis =
      paperType === "Full Syllabus Test"
        ? "all"
        : subject.toLowerCase().replace(" ", "_");

    const title = `${paperType}: ${paperType === "Full Syllabus Test" ? "All Subjects" : chapter || subject} (${className})`;
    const paperJson = JSON.stringify(responseData);
    const preview = `Contains ${allQuestions.length} questions across ${subjectsList.length} subject(s).`;

    const botMsg = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      content:
        "I've generated the test for you. You can now start in the panel on the left!",
    };

    const normalizedSubject =
      paperType === "Full Syllabus Test"
        ? "all"
        : subject.toLowerCase().replace(" ", "_");

    let shouldCreateTestPaper = true;

    if (paperType === "Full Syllabus Test") {
      if (gradeConfig.fullTest) {
        const subjectQMap = gradeConfig.fullTest.subjectQuestions || {};
        for (const subj of subjectsList) {
          const subjectKey = subj.toLowerCase().replace(/\s+/g, "_");
          // Per-subject expected count: use subjectQuestions map, fall back to perSubjectQuestions
          const expectedCount =
            subjectQMap[subjectKey] ?? gradeConfig.fullTest.perSubjectQuestions;
          if (!expectedCount) continue; // no expectation set — skip caching check
          const count = allQuestions.filter((q) => q.subject === subj).length;
          if (count !== expectedCount) {
            shouldCreateTestPaper = false;
            break;
          }
        }
        if (
          gradeSubjects &&
          gradeSubjects.length > 0 &&
          subjectsList.length !== gradeSubjects.length
        ) {
          shouldCreateTestPaper = false;
        }
      } else {
        shouldCreateTestPaper = false;
      }
    }

    // cookieStore.delete("uuid");

    // const apiUrl2 = `${baseURL}/user-ai-credits`;
    // const body = {
    //   user_id: userId,
    //   course_key: courseKey,
    //   token: token,
    //   type: "deduct",
    //   generation_type: generationType,
    //   generation_id: crypto.randomUUID(),
    // };
    // const response = await axios.patch(apiUrl2, body, {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });

    // if (!response.data.success) {

    //   return createQuotaExceededResponse({
    //     courseKey: courseKey,
    //     generationType,
    //     creditsRemaining: userCreditRemaining.data.creditsRemaining,
    //     cost: courseGenerationCost,
    //   });
    // }

    let testPaperDoc = null;
    if (shouldCreateTestPaper) {
      testPaperDoc = await TestPaperModel.create({
        class: normalizedClass,
        subject: normalizedSubject,
        exam_type: normalizedExamType,
        chapterName: chapter ? chapter : "",
        paperType: paperType,
        paperJson: paperJson,
        language: language || null,
        selectedChapters: selectedChapters || [],
      });
    }

    const defaultMessages = [
      {
        role: "user",
        content: `Generate ${paperType} for ${paperType === "Full Syllabus Test" ? "All Subjects" : chapter || subject}`,
      },
      botMsg,
    ];

    const finalMessages = clientMessages
      ? [...clientMessages, botMsg]
      : defaultMessages;

    // historyItem = await UserHistoryModel.create({
    //   userId,
    //   testPaper: testPaperDoc ? testPaperDoc._id : null,
    //   class: normalizedClass,
    //   subject: normalizedSubject,
    //   exam_type: normalizedExamType,
    //   chapterName: chapter ? chapter : "",
    //   paperType,
    //   messages: finalMessages,
    //   paperJson,
    //   title,
    //   preview,
    //   language: language || null,
    //   rootHistoryId: null,
    // });

    // try {
    //   await AIAnalysisModel.create({
    //     type: "generation",
    //     userId,
    //     testType: "test",
    //     examType: normalizedExamType,
    //     paperType,
    //     subject: normalizedSubjectForAnalysis,
    //     grade: normalizedClass,
    //     language: language || null,
    //     tokenUsage: {
    //       inputTokens: totalTokenUsage.inputTokens,
    //       outputTokens: totalTokenUsage.outputTokens,
    //       totalTokens: totalTokenUsage.totalTokens,
    //       thinkingTokens: totalTokenUsage.thinkingTokens,
    //     },
    //     generatedAt: new Date(),
    //   });
    // } catch (analysisError) {
    //   console.error("AI_ANALYSIS_SAVE_ERROR:", analysisError);
    // }

    return NextResponse.json(
      {
        data: responseData,
        scoring: gradeConfig.scoring,
        isCached: false,
        timerConfig,
        userHistory: historyItem
          ? {
              id: historyItem._id.toString(),
              title: historyItem.title,
              messages: historyItem.messages,
              preview: historyItem.preview,
            }
          : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("MCQ Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate test questions" },
      { status: 500 },
    );
  }
}
