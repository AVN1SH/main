import dbConnect from "@/lib/dbConnect";
import TestConfigModel from "@/models/testConfig.model";
import testConfigJson from "@/static/steps/test-config.json";

export interface SubjectSectionConfig {
  sectionName: string;
  enabled: boolean;
  questionCount: number;
}

export interface CaseStudyConfig {
  enabled: boolean;
  /** Number of case study passages */
  count: number;
  /** Number of sub-questions per case study */
  subQuestionsPerCase: number;
  /** Allowed sub-question types */
  subQuestionTypes: string[];
}

export interface PaperConfig {
  sections?: string[];
  questionCount?: Record<string, { min: number; max: number; default?: number }>;
  subjectQuestions?: Record<string, number>;
  totalQuestions?: number;
  totalTime?: number;
  /** Per-paper case study configuration (overrides grade-level config) */
  caseStudyConfig?: CaseStudyConfig;
}

export interface GradeConfig {
  sections: string[];
  questionCount: Record<string, { min: number; max: number; default?: number }>;
  fullTest?: {
    totalQuestions: number;
    perSubjectQuestions: number;
    totalTime: number;
    /** Per-subject override: { [normalizedSubjectKey]: numberOfQuestions } */
    subjectQuestions?: Record<string, number>;
    paper1?: PaperConfig;
    paper2?: PaperConfig;
  } & Record<string, any>;
  perQuestionTime?: number;
  scoring: Record<string, Record<string, number>>;
  promptContext: string;
  subjects: string[];
  paperFormat: string;
  /**
   * Predefined sectional breakdowns per subject for "Subject Test" only.
   * Key = normalized subject (e.g. "physics"), value = array of section configs.
   */
  subjectSections?: Record<string, SubjectSectionConfig[]>;
  /** Case study configuration for the grade */
  caseStudyConfig?: CaseStudyConfig;
}

interface TestConfig {
  settings: {
    defaultYear: number;
    fallbackYear: number;
  };
  grades: Record<string, GradeConfig>;
  paperFormats: Record<string, Record<string, string>>;
  questionFormats: Record<string, string>;
}

const staticConfig = testConfigJson as unknown as TestConfig;

let dbConfig: TestConfig | null = null;
let dbConfigTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

const loadConfig = async (): Promise<TestConfig> => {
  const now = Date.now();
  if (dbConfig && now - dbConfigTimestamp < CACHE_TTL) return dbConfig;

  try {
    await dbConnect();
    const result = await TestConfigModel.findOne({
      configId: "main-config",
    }).lean();
    if (result) {
      dbConfig = result as unknown as TestConfig;
      dbConfigTimestamp = now;
      return dbConfig;
    }
  } catch (e) {
    console.error("Failed to load test config from DB:", e);
  }

  return staticConfig;
};

export const getGradeConfig = async (grade: string): Promise<GradeConfig> => {
  const config = await loadConfig();
  return config.grades[grade] || config.grades["default"];
};

export const getPaperFormatKey = async (
  grade: string,
  examType: string,
  subject: string,
): Promise<string | null> => {
  const config = await loadConfig();
  const gradeConfig = config.grades[grade] || config.grades["default"];

  const formatKeyWithExam = `${gradeConfig.paperFormat}_${examType.toLowerCase()}`;
  let formatMap = config.paperFormats[formatKeyWithExam];

  if (!formatMap) {
    formatMap = config.paperFormats[gradeConfig.paperFormat];
  }

  if (!formatMap) return null;

  const normalizedSubject = subject.toLowerCase().replace(" ", "_");
  return formatMap[normalizedSubject] || null;
};

export const getQuestionFormatString = async (
  grade: string,
  examType: string,
  subject: string,
): Promise<string | null> => {
  const config = await loadConfig();
  const formatKey = await getPaperFormatKey(grade, examType, subject);
  if (!formatKey) return null;

  return config.questionFormats[formatKey] || null;
};

export const getYear = async (): Promise<number> => {
  const config = await loadConfig();
  const currentYear = new Date().getFullYear();

  // if (currentYear >= config.settings.defaultYear) {
  //   return currentYear;
  // }

  return config.settings.defaultYear;
};

export const resetTestConfigCache = () => {
  dbConfig = null;
  dbConfigTimestamp = 0;
};
