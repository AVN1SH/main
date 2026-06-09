import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ChunkModel from "@/models/chunk.model";
import SyllabusModel from "@/models/syllabus.model";
import { testResponseSchema } from "@/schemas/test.schema";
import TestPaperModel from "@/models/testPaper.model";
import UserHistoryModel from "@/models/userHistory.model";
import AIAnalysisModel from "@/models/aiAnalysis.model";
import { getRouteAuthData } from "@/utils/routeUtils";
import { getGradeConfig, type GradeConfig, type SubjectSectionConfig } from "@/utils/testConfig";
import {
  createQuotaExceededResponse,
  normalizeCourseKey,
  resolveTestGenerationType,
} from "@/utils/aiCredits";
import { setTimeout } from "timers/promises";
import { baseURL } from "@/app/constants/Apis";
import axios from "axios";
import { cookies } from "next/headers";

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
};

const SECTION_KEYS = [
  "mcq",
  "numerical",
  "multiCorrect",
  "matchList",
  "matchListOptionFormat",
  "caseStudy",
];

const buildSectionPrompt = (
  config: GradeConfig,
  isFullTest: boolean = false,
  subjectKey?: string,
): string => {
  if (isFullTest) {
    return config.sections
      .map((section) => {
        const count = config.questionCount[section];
        // Use per-subject count if available, else section default, else perSubjectQuestions, else 1
        const subjectCount =
          subjectKey && config.fullTest?.subjectQuestions?.[subjectKey]
            ? config.fullTest.subjectQuestions[subjectKey]
            : (count?.default ?? config.fullTest?.perSubjectQuestions ?? 1);
        return `- **${section}**: ${subjectCount} questions — ${SECTION_DESCRIPTIONS[section]}`;
      })
      .join("\n");
  }

  return config.sections
    .map((section) => {
      const count = config.questionCount[section];
      return `- **${section}**: must contain ${count.min} question, can contain up to ${count.max} questions — ${SECTION_DESCRIPTIONS[section]}`;
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
  for (const section of SECTION_KEYS) {
    const items = response[section];
    if (items && Array.isArray(items)) {
      for (const q of items) {
        const subjectPrefix = subject.toLowerCase().replace(/\s+/g, "");
        questions.push({
          ...q,
          type: section,
          id: `${subjectPrefix}_q${globalId++}`,
          subject,
          // preserve `section` label if Gemini set it, else null
          section: (q as any).section ?? null,
        });
      }
    }
  }
  return questions;
};

// ── Generate Questions for a Single Subject ──

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
          limit: 50,
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
    const chunks = await ChunkModel.find({
      class: normalizedClass,
      subject: normalizedSubject,
    }).limit(50);

    
    context = chunks.map((c: { text: string }) => c.text).join("\n\n");
    
    const syllabus = await SyllabusModel.findOne({
      class: normalizedClass,
      subject: normalizedSubject,
    });
    
    console.log("details =========================>>>>>>>>>>>>>>>>>", chunks, syllabus);

    if (syllabus) {
      context +=
        "\n\nSyllabus Weightage Instructions: Use percentage for JEE/NEET and marks (out of 80/100) for others. Higher weightage requires more questions from that chapter. If total weight < 100% or weight > 100% or max marks, adjust values proportionally to reach the full total before selecting questions:\n" +
        JSON.stringify(syllabus.chapter_weightage);
    }
  }

  const prompt = `Generate a ${paperType} for ${subject} (Class/Course: ${className})${chapter ? ` focusing on chapter "${chapter}"` : ""}.
${language ? `Generate the entire paper (questions, options, explanations) in ${language} language.` : ""}

If Context from previous exams and syllabus provided below then use it otherwise generate based on exam pattern : ${examType} (Context are only used to track the pattern and styling of the question and not to use directly in the questions. Use your own knowledge you have trained on to create new questions on those topics and pattern according to the context and ${examType} exam.):
${context}`;

  // Build sectional instruction for Subject Test
  const enabledSections = subjectSections?.filter((s) => s.enabled && s.sectionName.trim()) ?? [];
  const hasSectionalConfig = !isFullTest && paperType === "Subject Test" && enabledSections.length > 0;
  const sectionalInstruction = hasSectionalConfig
    ? `\n\n**SECTIONAL CATEGORISATION (Subject Test only)**:
This subject test is divided into the following predefined sections. For EVERY question you generate, you MUST set the \`section\` field to exactly one of these section names:
${enabledSections.map((s) => `- "${s.sectionName}" (${s.questionCount} questions)`).join("\n")}
Distribute questions across sections according to the question counts listed. The total must match the overall question count requested. Set \`section\` to null only if the question does not fit any section.`
    : "";

  const systemInstruction = `You are an expert exam paper generator following ${gradeConfig.promptContext}.

  ${isFullTest && gradeConfig.fullTest ? `**IMPORTANT**: You MUST generate exactly ${
    subjectKey && gradeConfig.fullTest.subjectQuestions?.[subjectKey]
      ? gradeConfig.fullTest.subjectQuestions[subjectKey]
      : gradeConfig.fullTest.perSubjectQuestions
  } TOTAL questions for this subject, not more not less.` : ""}
Generate questions for the following sections ONLY (strictly populate questions for the sections given below and leave other sections as null):
${buildSectionPrompt(gradeConfig, isFullTest, subjectKey)}${sectionalInstruction}

Important rules:
${language ? `- **IMPORTANT**: Generate ALL questions, options, explanations, and hints in ${language} language. Do NOT use any other language.` : ""}
- Avoid Image base questions.
- if section only have mcq then populate mcq section only and ignore other sections.
- Only populate the sections listed above.
- Questions, options and explanation must be in markdown format.
- explanation should be sort under 100 words. and should be in step by step format.
- Don't prefix options with labels like (a), (b), (c), (d) — the frontend handles this.
- Mathematical symbols should be in Latex format, eg- $y = (\\sin x)^{\\tan x}$, $K_{max} = \\frac{hc}{λ} - ϕ$.
- Ensure clear, unambiguous questions at appropriate difficulty.
- All string values must be on a single line. Use \\n for line breaks inside values.
- Provide a helpful hint for each question (formula or concept used).`;
  const result = await ai.models.generateContent({
    model: process.env.PrimaryModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: testResponseSchema,
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
    } = formDetails;
    const generationType = resolveTestGenerationType(paperType);
    const normalizedClass = String(className.toLowerCase().replace(" ", "_"));
    const normalizedExamType = examType.toUpperCase().replace(" ", "_");
    const gradeConfig = await getGradeConfig(normalizedClass);
    const gradeSubjects = gradeConfig.subjects || [];
    await dbConnect();

    // const auth = await getRouteAuthData();
    // if (!auth.success || !auth.data?.userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // const { userId, token } = auth.data;

    let apiUrl = `${baseURL}/user-ai-credits`;

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


    // if (!initialQuota.allowed) {
    //   return createQuotaExceededResponse({
    //     courseKey: initialQuota.courseKey,
    //     generationType,
    //     creditsRemaining: initialQuota.creditsRemaining,
    //     cost: initialQuota.cost,
    //   });
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

    console.log(normalizedClass, normalizedSubjectForCheck, normalizedExamType, paperType, chapter)

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

      // console.log("cachedPaper-------", cachedPaper)

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

      // const parsedPaper = JSON.parse(cachedPaper.paperJson);

      // const title = `${paperType}: ${paperType === "Full Syllabus Test" ? "All Subjects" : chapter || subject} (${className})`;
      // const preview = `Contains ${parsedPaper.questions?.length || 0} questions.`;

      // let historyItem = null;
      // try {
      //   const defaultMessages = [
      //     {
      //       role: "user",
      //       content: `Generate ${paperType} for ${paperType === "Full Syllabus Test" ? "All Subjects" : chapter || subject}`,
      //     },
      //     {
      //       id: (Date.now() + 1).toString(),
      //       role: "bot",
      //       content:
      //         "I've generated the test for you. You can now start in the panel on the left!",
      //     },
      //   ];

      //   const finalMessages = clientMessages
      //     ? [
      //         ...clientMessages,
      //         {
      //           id: (Date.now() + 1).toString(),
      //           role: "bot",
      //           content:
      //             "I've generated the test for you. You can now start in the panel on the left!",
      //         },
      //       ]
      //     : defaultMessages;

        // historyItem = await UserHistoryModel.create({
        //   userId,
        //   testPaper: cachedPaper._id,
        //   class: normalizedClass,
        //   subject: normalizedSubjectForCheck,
        //   exam_type: normalizedExamType,
        //   chapterName: chapter ? chapter : "",
        //   paperType,
        //   messages: finalMessages,
        //   paperJson: cachedPaper.paperJson,
        //   title,
        //   preview,
        //   language: (cachedPaper as any).language || language || null,
        //   rootHistoryId: null,
        // });
      // } catch (historyError) {
      //   console.error("USER_HISTORY_CACHE_WRITE_ERROR:", historyError);
      // }

      // await setTimeout(10000);

      // return NextResponse.json({
      //   data: parsedPaper,
      //   scoring: gradeConfig.scoring,
      //   isCached: true,
      //   timerConfig: parsedPaper.timerConfig || timerConfig,
      //   userHistory: historyItem
      //     ? {
      //         id: historyItem._id.toString(),
      //         title: historyItem.title,
      //         messages: historyItem.messages,
      //         preview: historyItem.preview,
      //       }
      //     : null,
      // });
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
      const subjectSections = gradeConfig.subjectSections?.[normalizedSubjKey]?.filter((s) => s.enabled) ?? [];
      console.log(
        "[generate-mcq] subjectSections lookup:",
        { normalizedSubjKey, raw: gradeConfig.subjectSections, resolved: subjectSections }
      );
      const result = await generateQuestionsForSubject(
        subject,
        className,
        paperType,
        examType,
        chapter,
        gradeConfig,
        false,
        undefined,
        language,
        subjectSections.length > 0 ? subjectSections : undefined,
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
      : [
          ...new Set(
            allQuestions
              .map((q) => (q as any).section as string | null)
              .filter(Boolean),
          ),
        ] as string[] | null;

    const responseData = {
      questions: allQuestions,
      subjects: subjectsList,
      isFullSyllabus: isFullTest,
      timerConfig,
      // Section labels for Subject Test (null if not configured)
      questionSections: questionSections && questionSections.length > 0 ? questionSections : null,
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
          const expectedCount = subjectQMap[subjectKey] ?? gradeConfig.fullTest.perSubjectQuestions;
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
