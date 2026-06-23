export interface MCQ {
  id: number;
  sequenceNum?: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  section: string;
}

export interface SubjectiveQuestion {
  id: number;
  sequenceNum?: number;
  question: string;
  marks: number;
  section: string;
}

export interface subQuestions {
  id: number;
  question: string;
  options?: string[]; // Optional because subjective subquestions might not have them
  type: "mcq" | "subjective";
  marks: number;
}

export interface mapBased {
  id: number;
  sequenceNum?: number;
  question: string;
  subQuestions: subQuestions[];
  marks: number;
  section: string;
}

export interface caseStudies {
  id: number;
  sequenceNum?: number;
  question: string;
  subQuestions: subQuestions[];
  marks: number;
  section: string;
}

export interface PaperInstruction {
  sequenceNum: string;
  instruction: string;
}

export interface QuestionPaper {
  isSubmitted?: boolean;
  samplePaperId?: string | null;
  language?: string | null;
  title: string;
  class: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  instructions?: PaperInstruction[] | null;
  mcqs: MCQ[];
  subjective: SubjectiveQuestion[];
  caseStudies?: caseStudies[] | null;
  mapBased?: mapBased[] | null;
  refusalReason?: string;
  questions?: any;
  scoring?: ScoringConfig;
  timerConfig?: {
    isFullTest: boolean;
    totalTime?: number;
    perQuestionTime?: number;
  };
  disableHint?: boolean;
}

export type UnifiedQuestion =
  | (MCQ & { qType: "mcq" })
  | (SubjectiveQuestion & { qType: "subjective" })
  | (caseStudies & { qType: "case" })
  | (mapBased & { qType: "map" });

export interface FormDetails {
  class: string;
  subject: string;
  paperType: string;
  examType: string;
  samplePaperId?: string;
  language?: string;
  paper?: string;
  selectedChapters?: string[];
  /** Board name for school grades (e.g. "CBSE", "ICSE", "State Board").
   *  Used to apply board-specific question count overrides in generate-mcq. */
  board?: string;
}

export type AppView = "setup" | "dashboard" | "quiz";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  isError?: boolean;
}

export enum MessageRole {
  USER = "user",
  BOT = "bot",
  SYSTEM_FORM = "system_form",
}

export type StepOption = { label: string; value: string };

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  options?: (StepOption | string)[];
  questionPaper?: QuestionPaper | null;
  timestamp?: number;
  isError?: boolean;
  stepKey?: string;
  isMultiSelect?: boolean;
}

export interface CollectedData {
  [key: string]: string;
}

export interface QuestionTypeConfig {
  min: number;
  max: number;
  description: string;
}

export interface BotResponseMetadata {
  defaultExamType?: string;
  sections?: string[];
  questionTypes?: Record<string, QuestionTypeConfig>;
  [key: string]: unknown;
}

export interface BotResponse {
  id: string;
  text: string;
  options: string[];
  key_name: string;
  finished: boolean;
  isMultiSelect?: boolean;
  metadata?: BotResponseMetadata;
}

// ── Test Question Types (for TestEnvironment) ──

export type TestQuestionType =
  | "mcq"
  | "numerical"
  | "singleDigitInteger"
  | "multiCorrect"
  | "matchList"
  | "matchListOptionFormat"
  | "caseStudy";

interface BaseTestQuestion {
  id: string;
  type: TestQuestionType;
  question: string;
  explanation: string;
  hint?: string;
  subject: string;
  /** Set on flattened case study sub-questions — ID of the parent case study */
  _caseStudyParentId?: string;
  /** Set on flattened case study sub-questions — the passage from the parent */
  _caseStudyPassage?: string;
  /** Set on flattened case study sub-questions — the parent question title */
  _caseStudyTitle?: string;
}

export interface MCQTestQuestion extends BaseTestQuestion {
  type: "mcq";
  options: string[];
  correctAnswerIndex: number;
  answer?: string;
}

export interface NumericalTestQuestion extends BaseTestQuestion {
  type: "numerical";
  correctAnswer: string;
}

export interface SingleDigitIntegerTestQuestion extends BaseTestQuestion {
  type: "singleDigitInteger";
  /** The correct answer — a single digit 0-9 */
  correctAnswer: string;
}

export interface MultiCorrectTestQuestion extends BaseTestQuestion {
  type: "multiCorrect";
  options: string[];
  correctAnswerIndices: number[];
}

export interface MatchListMatch {
  listAIndex: number;
  listBIndex: number;
}

export interface MatchListTestQuestion extends BaseTestQuestion {
  type: "matchList";
  listA: string[];
  listB: string[];
  correctMatches: MatchListMatch[];
}

export interface MatchListOptionFormatTestQuestion extends BaseTestQuestion {
  type: "matchListOptionFormat";
  listI: string[];
  listII: string[];
  options: string[];
  correctIndices: number[];
  correctIndex?: number;
}

export type CaseStudySubQuestionType =
  | "mcq"
  | "numerical"
  | "singleDigitInteger"
  | "multiCorrect"
  | "matchList"
  | "matchListOptionFormat";

export interface CaseStudySubQuestion {
  id: string;
  subType: CaseStudySubQuestionType;
  question: string;
  explanation?: string;
  hint?: string;
  // MCQ fields
  options?: string[];
  correctAnswerIndex?: number;
  // Numerical fields
  correctAnswer?: string;
  // MultiCorrect fields
  correctAnswerIndices?: number[];
  // MatchList fields
  listA?: string[];
  listB?: string[];
  correctMatches?: { listAIndex: number; listBIndex: number }[];
  // MatchListOptionFormat fields
  listI?: string[];
  listII?: string[];
  correctIndex?: number;
}

export interface CaseStudyTestQuestion extends BaseTestQuestion {
  type: "caseStudy";
  passage: string;
  subQuestions: CaseStudySubQuestion[];
}

export type TestQuestion =
  | MCQTestQuestion
  | NumericalTestQuestion
  | SingleDigitIntegerTestQuestion
  | MultiCorrectTestQuestion
  | MatchListTestQuestion
  | MatchListOptionFormatTestQuestion
  | CaseStudyTestQuestion;

export interface ScoringRule {
  correct: number;
  incorrect: number;
  unattempted: number;
  partialPerCorrect?: number;
  partialPerMatch?: number;
}

export type ScoringConfig = Record<string, ScoringRule>;

export interface TestResults {
  correct: number;
  wrong: number;
  unattempted: number;
  total: number;
  score: number;
  maxScore: number;
}
