"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Lightbulb,
  X,
  Info,
  RefreshCw,
  Share2,
  MoreVertical,
  PlayCircle,
  Eye,
} from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import { RegenerateQuestionDialog } from "./RegenerateQuestionDialog";
import { ShareTestDialog } from "./ShareTestDialog";
import SafeMath from "../SafeMath";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { onOpen } from "@/features/openModel";
import {
  setNewTestCreating,
  updateSessionId,
  retriveChatDetails,
  clearReattemptData,
  ChatDetails,
  setCredits,
} from "@/features/sessionDetails";
import LoadingState from "../common/LoadingState";
import { TimerPopup } from "./TimerPopup";
import TestInfoModal from "./TestInfoModal";
import ScoreCalculationModal from "./ScoreCalculationModal";
import TestReview from "./TestReview";
import type {
  TestQuestion,
  MCQTestQuestion,
  NumericalTestQuestion,
  MultiCorrectTestQuestion,
  MatchListTestQuestion,
  MatchListOptionFormatTestQuestion,
  ScoringConfig,
  ScoringRule,
  TestResults,
} from "@/types/global";
import { MCQQuestion } from "./questions/MCQQuestion";
import { NumericalQuestion } from "./questions/NumericalQuestion";
import { MultiCorrectQuestion } from "./questions/MultiCorrectQuestion";
import { MatchListQuestion } from "./questions/MatchListQuestion";
import { MatchListOptionFormat } from "./questions/MatchListOptionFormat";
import { SingleDigitIntegerQuestion } from "./questions/SingleDigitIntegerQuestion";
import SubjectNavigator from "./SubjectNavigator";
import axios from "axios";
import { useRouter } from "nextjs-toploader/app";

const getQuotaExceededMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return null;

  const payload = error.response?.data;
  if (payload?.code !== "CREDIT_QUOTA_REACHED") return null;

  return `${payload.message} Buy Now: ${payload.buyNowAction}`;
};

// ── Helpers ──

const normalizeQuestion = (q: Record<string, unknown>): TestQuestion => {
  const validTypes = [
    "mcq",
    "numerical",
    "singleDigitInteger",
    "multiCorrect",
    "matchList",
    "matchListOptionFormat",
    "caseStudy",
  ];
  if (q.type && validTypes.includes(q.type as string)) {
    return {
      ...q,
      id: String(q.id),
      // Preserve case study metadata if present
      _caseStudyParentId: q._caseStudyParentId as string | undefined,
      _caseStudyPassage: q._caseStudyPassage as string | undefined,
      _caseStudyTitle: q._caseStudyTitle as string | undefined,
    } as TestQuestion;
  }
  // Legacy MCQ format
  const answer = q.answer as string | undefined;
  return {
    id: String(q.id),
    type: "mcq",
    question: (q.question as string) || "",
    options: (q.options as string[]) || [],
    correctAnswerIndex:
      (q.correctAnswerIndex as number) ??
      (answer ? answer.charCodeAt(0) - 65 : 0),
    answer: answer,
    explanation: (q.explanation as string) || "",
    hint: q.hint as string | undefined,
    _caseStudyParentId: q._caseStudyParentId as string | undefined,
    _caseStudyPassage: q._caseStudyPassage as string | undefined,
    _caseStudyTitle: q._caseStudyTitle as string | undefined,
  } as MCQTestQuestion;
};

export const isAttempted = (answer: string | undefined): boolean => {
  if (!answer) return false;
  if (answer === "{}" || answer === "[]") return false;
  return true;
};

export const checkCorrectness = (
  q: TestQuestion,
  answer: string | undefined,
): boolean => {
  if (!answer) return false;
  switch (q.type) {
    case "mcq": {
      const correctLetter =
        q.answer || String.fromCharCode(65 + q.correctAnswerIndex);
      return answer === correctLetter;
    }
    case "numerical":
      return answer.trim() === q.correctAnswer.trim();
    case "singleDigitInteger":
      return answer.trim() === (q as any).correctAnswer?.trim();
    case "multiCorrect": {
      const selected = answer.split(",").filter(Boolean).sort();
      const correct = q.correctAnswerIndices
        .map((i) => String.fromCharCode(65 + i))
        .sort();
      return (
        selected.length === correct.length &&
        selected.every((v, i) => v === correct[i])
      );
    }
    case "matchList": {
      const q2 = q as MatchListTestQuestion;
      const userPairs = answer.split(",").filter(Boolean).sort();
      const correctPairs = q2.correctMatches
        .map((m) => `${m.listAIndex}-${m.listBIndex}`)
        .sort();
      return (
        userPairs.length === correctPairs.length &&
        userPairs.every((v, i) => v === correctPairs[i])
      );
    }
    case "matchListOptionFormat": {
      const q2 = q as MatchListOptionFormatTestQuestion;
      // Handle single answer format (component returns "0", "1", etc.)
      // Also support comma-separated format for backward compatibility
      const selected = answer.split(",").filter(Boolean).sort();
      // Support both correctIndex (single) and correctIndices (array)
      const correctIndices =
        q2.correctIndex !== undefined
          ? [q2.correctIndex]
          : q2.correctIndices || [];
      const correct = correctIndices.map((i) => String(i)).sort();
      return (
        selected.length === correct.length &&
        selected.every((v, i) => v === correct[i])
      );
    }
    default:
      return false;
  }
};

export const getTypeLabel = (type: string): string => {
  switch (type) {
    case "numerical":
      return "NUM";
    case "singleDigitInteger":
      return "SDI";
    case "multiCorrect":
      return "MCQ+";
    case "matchList":
      return "MTL";
    // case "matchListOptionFormat":
    //   return "MTL";
    default:
      return "MCQ";
  }
};

export const getFullTypeLabel = (type: string, isCaseStudySub?: boolean): string => {
  const prefix = isCaseStudySub ? "PASSAGE BASED — " : "";
  switch (type) {
    case "numerical":
      return `${prefix}NUMERICAL Value QUESTION`;
    case "singleDigitInteger":
      return `${prefix}SINGLE DIGIT INTEGER (0-9)`;
    case "multiCorrect":
      return `${prefix}MULTI SELECT QUESTION`;
    case "matchList":
      return `${prefix}MATCHING LIST TYPE QUESTION`;
    // case "matchListOptionFormat":
    //   return "MATCH LIST OPTION FORMAT QUESTION";
    default:
      return `${prefix}SINGLE SELECT QUESTION`;
  }
};

export const calculateQuestionScore = (
  q: TestQuestion,
  answer: string | undefined,
  rule: ScoringRule,
): { marks: number; maxMarks: number } => {
  if (!isAttempted(answer)) {
    return { marks: rule.unattempted || 0, maxMarks: rule.correct || 0 };
  }

  if (checkCorrectness(q, answer)) {
    let maxMark = rule.correct;
    if (q.type === "matchList" && rule.partialPerMatch !== undefined) {
      const mlQ = q as MatchListTestQuestion;
      maxMark = Math.max(maxMark, mlQ.correctMatches.length * rule.partialPerMatch);
    }
    return { marks: maxMark, maxMarks: maxMark };
  }

  switch (q.type) {
    case "multiCorrect": {
      const mcQ = q as MultiCorrectTestQuestion;
      const correctIndices = mcQ.correctAnswerIndices;
      const selected = (answer || "").split(",").filter(Boolean);
      const selectedIndices = selected.map((s) => s.charCodeAt(0) - 65);
      const hasWrong = selectedIndices.some((idx) => !correctIndices.includes(idx));
      if (hasWrong) {
        return { marks: rule.incorrect, maxMarks: rule.correct };
      }
      if (rule.partialPerCorrect !== undefined) {
        const correctSelected = selectedIndices.filter((idx) =>
          correctIndices.includes(idx),
        ).length;
        return { marks: correctSelected * rule.partialPerCorrect, maxMarks: rule.correct };
      }
      return { marks: rule.incorrect, maxMarks: rule.correct };
    }


    case "matchList": {
      const mlQ = q as MatchListTestQuestion;
      if (rule.partialPerMatch !== undefined) {
        const userPairs = (answer || "").split(",").filter(Boolean);
        const correctPairSet = new Set(
          mlQ.correctMatches.map((m) => `${m.listAIndex}-${m.listBIndex}`),
        );
        const correctCount = userPairs.filter((p) => correctPairSet.has(p)).length;
        const totalPairs = mlQ.correctMatches.length;
        const maxMarks = Math.max(rule.correct, totalPairs * rule.partialPerMatch);
        return { marks: correctCount * rule.partialPerMatch, maxMarks };
      }
      return { marks: rule.incorrect, maxMarks: rule.correct };
    }

    default:
      return { marks: rule.incorrect, maxMarks: rule.correct };
  }
};

const DEFAULT_SCORING: ScoringConfig = {
  mcq: { correct: 1, incorrect: 0, unattempted: 0 },
  numerical: { correct: 1, incorrect: 0, unattempted: 0 },
  multiCorrect: { correct: 1, incorrect: 0, unattempted: 0 },
  matchList: { correct: 1, incorrect: 0, unattempted: 0 },
  matchListOptionFormat: { correct: 1, incorrect: 0, unattempted: 0 },
  singleDigitInteger: { correct: 1, incorrect: 0, unattempted: 0 },
  caseStudy: { correct: 1, incorrect: 0, unattempted: 0 },
};
// ── Question Renderer ──

export function QuestionContent({
  question,
  currentAnswer,
  onAnswer,
  isSubmitted,
  isViewMode,
}: {
  question: TestQuestion;
  currentAnswer: string;
  onAnswer: (answer: string) => void;
  isSubmitted: boolean;
  isViewMode?: boolean;
}) {
  switch (question.type) {
    case "numerical":
      return (
        <NumericalQuestion
          question={question as NumericalTestQuestion}
          currentAnswer={currentAnswer}
          onAnswer={onAnswer}
          isSubmitted={isSubmitted}
          isDisabled={isSubmitted || isViewMode}
        />
      );
    case "singleDigitInteger":
      return (
        <SingleDigitIntegerQuestion
          question={question as NumericalTestQuestion}
          currentAnswer={currentAnswer}
          onAnswer={onAnswer}
          isSubmitted={isSubmitted}
          isDisabled={isSubmitted || isViewMode}
        />
      );
    case "multiCorrect":
      return (
        <MultiCorrectQuestion
          question={question as MultiCorrectTestQuestion}
          currentAnswer={currentAnswer}
          onAnswer={onAnswer}
          isSubmitted={isSubmitted}
          isDisabled={isSubmitted || isViewMode}
        />
      );
    case "matchList":
      return (
        <MatchListQuestion
          question={question as MatchListTestQuestion}
          currentAnswer={currentAnswer}
          onAnswer={onAnswer}
          isSubmitted={isSubmitted}
          isDisabled={isSubmitted || isViewMode}
        />
      );
    case "matchListOptionFormat":
      return (
        <MatchListOptionFormat
          question={question as MatchListOptionFormatTestQuestion}
          currentAnswer={currentAnswer || ""}
          onAnswer={onAnswer}
          isSubmitted={isSubmitted}
          isDisabled={isSubmitted || isViewMode}
        />
      );
    // caseStudy type no longer appears here — sub-questions are flattened
    // into their own types (mcq, numerical, etc.) with _caseStudyPassage
    case "mcq":
    default:
      return (
        <MCQQuestion
          question={question as MCQTestQuestion}
          currentAnswer={currentAnswer}
          onAnswer={onAnswer}
          isSubmitted={isSubmitted}
          isDisabled={isSubmitted || isViewMode}
        />
      );
  }
}

// ── Main Component ──

interface TestEnvironmentProps {
  questions?: TestQuestion[];
  onSubmit: (results: Record<string, unknown>) => void;
  initialState?: Record<string, unknown>;
  scoring?: ScoringConfig;
  subjects?: string[];
  isFullSyllabus?: boolean;
  examType?: string;
  grade?: string;
  timerConfig?: {
    totalTime?: number;
    totalQuestions?: number;
    perSubjectQuestions?: number;
    perQuestionTime?: number;
    isFullTest: boolean;
  };
  disableHint?: boolean;
  historyId?: string;
  isSamplePaper?: boolean;
  isPublicTest?: boolean;
  isReview?: boolean;
  testData?: any;
  title?: string;
  /** Section labels for Subject Test (from questionSections in paperJson) */
  questionSections?: string[] | null;
}

export const TestEnvironment: React.FC<TestEnvironmentProps> = ({
  questions: propQuestions,
  onSubmit,
  initialState,
  scoring: propScoring,
  subjects,
  isFullSyllabus,
  timerConfig,
  examType,
  grade,
  disableHint = false,
  historyId,
  isSamplePaper = false,
  isPublicTest = false,
  isReview = false,
  testData,
  title,
  questionSections,
}) => {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(
    initialState?.isSubmitted ? true : false,
  );
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isCalculatingResults, setIsCalculatingResults] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [showHintTooltip, setShowHintTooltip] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string>("");
  // Section tab state (Subject Test only) — tracks the section of the currently active question
  const [currentSection, setCurrentSection] = useState<string>("");

  // Timer state
  const [showTimerPopup, setShowTimerPopup] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState<boolean | null>(null);
  const [showHintInTest, setShowHintInTest] = useState<boolean | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [totalTimeTaken, setTotalTimeTaken] = useState<number>(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Per-question timing state
  const [questionTimings, setQuestionTimings] = useState<
    Record<string, number>
  >({});
  const [currentQuestionStartTime, setCurrentQuestionStartTime] =
    useState<number>(Date.now());

  // Info modals state
  const [showTestInfo, setShowTestInfo] = useState(false);
  const [showScoreCalculation, setShowScoreCalculation] = useState(false);

  // Reattempt state
  const [isReattempting, setIsReattempting] = useState(false);
  // Dialog state: null = closed, 'confirm' = reattempt confirmation, 'open-test' = redirect to open test
  const [reattemptDialog, setReattemptDialog] = useState<
    null | "confirm" | "open-test"
  >(null);
  const [openTestHistoryId, setOpenTestHistoryId] = useState<string | null>(
    null,
  );

  // Teacher Mode State
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // View Mode State (test opens in view mode after timer popup, user clicks start to begin)
  const [isViewMode, setIsViewMode] = useState(true);
  const [hasStartedTest, setHasStartedTest] = useState(false);

  const scoring = propScoring || DEFAULT_SCORING;
  const dispatch = useDispatch();
  const router = useRouter();
  const questionNavRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const currentChat: ChatDetails = useSelector((state: any) => state.chatSlice);

  // Calculate total time based on timerConfig
  const calculateTotalTime = () => {
    if (!timerConfig) return 0;

    if (timerConfig.isFullTest && timerConfig.totalTime) {
      return timerConfig.totalTime * 60; // Convert to seconds
    } else if (
      !timerConfig.isFullTest &&
      timerConfig.perQuestionTime &&
      questions.length > 0
    ) {
      return questions.length * timerConfig.perQuestionTime;
    }
    return 0;
  };

  // Show timer popup on mount if timerConfig exists and test not submitted
  useEffect(() => {
    // Check if preferences are already saved in initialState
    const savedTimerEnabled = initialState?.timerEnabled as boolean | undefined;
    const savedShowHint = initialState?.showHint as boolean | undefined;
    const isPreferencesSaved = initialState?.isPreferencesSaved as
      | boolean
      | undefined;

    if (questions.length > 0 && timerConfig && !initialState?.isSubmitted) {
      // If preferences are already saved, apply them without showing popup
      if (
        isPreferencesSaved &&
        savedTimerEnabled !== undefined &&
        savedShowHint !== undefined
      ) {
        // Apply saved preferences directly
        setTimerEnabled(savedTimerEnabled);
        setShowHintInTest(savedShowHint);
        setShowTimerPopup(false);

        if (savedTimerEnabled) {
          const totalTime = calculateTotalTime();
          setTimeRemaining(totalTime);
          setTimerStarted(true);
        }
        return;
      }

      if (timerEnabled !== null && showHintInTest !== null) {
        // Preferences were already selected, keep them as is
        setShowTimerPopup(false);
        return;
      }

      // Show popup if no saved preferences
      if (!isPreferencesSaved) {
        setShowTimerPopup(true);
      }
    } else if (
      questions.length > 0 &&
      timerConfig &&
      initialState?.isSubmitted
    ) {
      // If test already submitted, restore time info if available
      if (initialState.timeTaken) {
        setTotalTimeTaken(initialState.timeTaken as number);
      }
      // Restore per-question timings
      if (initialState.questionTimings) {
        setQuestionTimings(
          initialState.questionTimings as Record<string, number>,
        );
      }
    }
  }, [questions, timerConfig, initialState?.isSubmitted]);

  // Timer countdown effect
  useEffect(() => {
    if (
      timerEnabled &&
      timerStarted &&
      timeRemaining > 0 &&
      !isSubmitted &&
      !isTeacherMode &&
      !isViewMode
    ) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerEnabled, timerStarted, isSubmitted, isTeacherMode, isViewMode]);

  const handleTimeUp = () => {
    setIsSubmitted(true);
    onSubmit({
      userAnswers,
      isSubmitted: true,
      results: calculateResults(),
      timeTaken: totalTimeTaken,
      autoSubmitted: true,
    });
  };

  // Monitor for time up
  useEffect(() => {
    if (
      timerEnabled &&
      timerStarted &&
      !isSubmitted &&
      !isTeacherMode &&
      !isViewMode &&
      timeRemaining === 0
    ) {
      handleTimeUp();
    }
  }, [
    timeRemaining,
    timerEnabled,
    timerStarted,
    isSubmitted,
    isTeacherMode,
    isViewMode,
  ]);

  const handleStartTimer = (enableTimer: boolean, enableHint: boolean) => {
    setTimerEnabled(enableTimer);
    setShowHintInTest(enableHint);
    setShowTimerPopup(false);

    // Enter view mode - test is displayed but not started yet
    setIsViewMode(true);
    setIsTeacherMode(true);

    if (enableTimer) {
      const totalTime = calculateTotalTime();
      setTimeRemaining(totalTime);
      setTimerStarted(false);
    } else {
      setTimerStarted(false);
    }

    // Save preferences to paperJson immediately so popup doesn't show again
    onSubmit({
      timerEnabled: enableTimer,
      showHint: enableHint,
      isPreferencesSaved: true,
    });
  };

  const handleStartTest = () => {
    setIsViewMode(false);
    setHasStartedTest(true);
    setIsTeacherMode(false);
    setCurrentQuestionIndex(0);
    if (subjects && subjects.length > 0) {
      setCurrentSubject(subjects[0]);
    }

    if (timerEnabled) {
      setTimerStarted(true);
    } else if (timerEnabled === null && timerConfig) {
      setTimerEnabled(true);
      setTimerStarted(true);
      const totalTime = calculateTotalTime();
      setTimeRemaining(totalTime);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Track time taken when timer is enabled
  useEffect(() => {
    if (
      timerEnabled &&
      timerStarted &&
      !isSubmitted &&
      !isTeacherMode &&
      !isViewMode
    ) {
      const interval = setInterval(() => {
        setTotalTimeTaken((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerEnabled, timerStarted, isSubmitted, isTeacherMode, isViewMode]);

  const isMultiSubject = isFullSyllabus && subjects && subjects.length > 1;
  // Section filtering: applies only to Subject Test (not Full Test) when sections exist
  const isSubjectTestWithSections =
    !isFullSyllabus && !!questionSections && questionSections.length > 0;
  // Derive the section of the current question for auto-highlighting
  const activeQuestionSection = isSubjectTestWithSections
    ? (((questions[currentQuestionIndex] as any)?.section as string | null) ??
      null)
    : null;
  const filteredQuestions =
    isMultiSubject && currentSubject
      ? questions.filter((q) => q.subject === currentSubject)
      : questions;

  // ── Effects ──

  useEffect(() => {
    if (propQuestions && propQuestions.length > 0) {
      setIsLoadingQuestions(true);
      const timer = setTimeout(() => {
        const normalizedQuestions = (
          propQuestions as unknown as Record<string, unknown>[]
        ).map(normalizeQuestion);

        const hasSections =
          !isFullSyllabus && !!questionSections && questionSections.length > 0;
        const sortedQuestions = hasSections
          ? [...normalizedQuestions].sort((a, b) => {
              const sectionA = (a as any).section;
              const sectionB = (b as any).section;
              const idxA = sectionA
                ? questionSections.indexOf(sectionA)
                : questionSections.length;
              const idxB = sectionB
                ? questionSections.indexOf(sectionB)
                : questionSections.length;
              return idxA - idxB;
            })
          : normalizedQuestions;

        setQuestions(sortedQuestions);

        if (isMultiSubject && subjects && subjects.length > 0) {
          setCurrentSubject(subjects[0]);
        }

        setIsLoadingQuestions(false);
      }, 1000);
      return () => {
        clearTimeout(timer);
        setQuestions([]);
      };
    }
  }, [propQuestions]);

  useEffect(() => {
    if (!questionNavRef.current) return;

    const container = questionNavRef.current;
    const activeIndex =
      isMultiSubject && currentSubject
        ? questions
            .filter((q) => q.subject === currentSubject)
            .findIndex((q) => q.id === questions[currentQuestionIndex]?.id)
        : currentQuestionIndex;
    const activeButton = container.querySelector(
      `[data-question-index="${activeIndex >= 0 ? activeIndex : currentQuestionIndex}"]`,
    );

    if (activeButton) {
      const containerWidth = container.clientWidth;
      const buttonLeft = (activeButton as HTMLElement).offsetLeft;
      const buttonWidth = (activeButton as HTMLElement).offsetWidth;
      const scrollTarget = buttonLeft - containerWidth / 2 + buttonWidth / 2;
      container.scrollTo({ left: scrollTarget, behavior: "smooth" });
    }
  }, [currentQuestionIndex, currentSubject, questions, isMultiSubject]);

  useEffect(() => {
    setIsSubmitted(initialState?.isSubmitted ? true : false);
    return () => setIsSubmitted(false);
  }, [initialState?.isSubmitted]);

  useEffect(() => {
    if (initialState?.isSubmitted) {
      setUserAnswers(initialState?.userAnswers as Record<string, string>);
    }
    return () => setUserAnswers({});
  }, [initialState?.isSubmitted, initialState?.userAnswers]);

  useEffect(() => {
    if (isMultiSubject && subjects && subjects.length > 0 && !currentSubject) {
      setCurrentSubject(subjects[0]);
    }
  }, [isMultiSubject, subjects, currentSubject]);

  useEffect(() => {
    const element = document.getElementById(
      `question-dot-${currentQuestionIndex}`,
    );
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentQuestionIndex]);

  // ── Loading States ──

  if (!questions || questions.length === 0 || isLoadingQuestions) {
    return (
      <LoadingState
        title="Loading Your Test"
        description="It may take a moment, please wait..!"
      />
    );
  }

  // Timer Popup
  if (showTimerPopup && timerConfig && !initialState?.isSubmitted) {
    return (
      <TimerPopup
        timerConfig={timerConfig}
        questionCount={questions.length}
        onContinue={handleStartTimer}
        disableHint={disableHint}
      />
    );
  }

  // ── Core Logic ──

  const currentQuestion = questions[currentQuestionIndex];

  const getCurrentSubjectIndex = () => {
    if (!isMultiSubject || !currentSubject) return currentQuestionIndex;
    const subjectQuestions = questions.filter(
      (q) => q.subject === currentSubject,
    );
    const idx = subjectQuestions.findIndex((q) => q.id === currentQuestion?.id);
    return idx >= 0 ? idx : currentQuestionIndex;
  };

  const currentSubjectIndex = getCurrentSubjectIndex();

  const handleAnswer = (answer: string) => {
    if (isSubmitted) return;
    setUserAnswers({ ...userAnswers, [currentQuestion.id]: answer });
  };

  // Track time spent on current question when navigating
  const trackQuestionTime = () => {
    if (timerEnabled && !isSubmitted && !isViewMode) {
      const timeSpent = Math.floor(
        (Date.now() - currentQuestionStartTime) / 1000,
      );
      setQuestionTimings((prev) => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeSpent,
      }));
      setCurrentQuestionStartTime(Date.now());
    }
  };

  const calculateResults = (): TestResults => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    let score = 0;
    let maxScore = 0;

    questions.forEach((q) => {
      const userAnswer = userAnswers[q.id];
      const rule = scoring[q.type] || {
        correct: 1,
        incorrect: 0,
        unattempted: 0,
      };

      const { marks, maxMarks } = calculateQuestionScore(q, userAnswer, rule);
      score += marks;
      maxScore += maxMarks;

      if (!isAttempted(userAnswer)) {
        unattempted++;
      } else if (marks > 0) {
        correct++;
      } else {
        wrong++;
      }
    });

    return {
      correct,
      wrong,
      unattempted,
      total: questions.length,
      score,
      maxScore,
    };
  };

  const internalSubmit = () => {
    setIsCalculatingResults(true);
    trackQuestionTime();
    setTimeout(() => {
      setIsSubmitted(true);
      setIsCalculatingResults(false);
      const finalTimeTaken = timerEnabled ? totalTimeTaken : 0;
      onSubmit({
        userAnswers,
        isSubmitted: true,
        results: calculateResults(),
        timeTaken: finalTimeTaken,
        timerEnabled: timerEnabled ?? false,
        showHint: showHintInTest ?? true,
        questionTimings,
      });
    }, 2000);
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    dispatch(
      onOpen({
        type: "alertOnSubmit",
        data: {
          questions,
          userAnswers,
          total: questions.length,
          answered: Object.values(userAnswers).filter((a) => isAttempted(a))
            .length,
          onSubmit: internalSubmit,
        },
      }),
    );
  };

  /** Opens the reattempt confirmation dialog (user must confirm before API call) */
  const handleReattemptClick = () => {
    setReattemptDialog("confirm");
  };

  /** Actually runs the reattempt after user confirms */
  const handleReattemptConfirm = async () => {
    if (!historyId || isReattempting) return;
    setReattemptDialog(null);
    setIsReattempting(true);
    try {
      const res = await axios.post("/api/history/reattempt-test", {
        historyId,
      });

      if (res.data && res.data.success) {
        dispatch(setNewTestCreating(true));
        dispatch(clearReattemptData());
        dispatch(updateSessionId(res.data.reattemptHistoryId));

        const newTestData = {
          questions: res.data.questions,
          timerConfig: res.data.timerConfig,
          disableHint: res.data.disableHint,
          isSubmitted: false,
          subjects: res.data.subjects,
          isFullSyllabus: res.data.isFullSyllabus,
          scoring: res.data.scoring,
          isSamplePaper: false,
          historyId: res.data.reattemptHistoryId,
        };

        dispatch(
          retriveChatDetails({
            paper: newTestData,
            config: res.data.config,
            messages: [],
            activeSessionId: res.data.reattemptHistoryId,
            reattemptData: newTestData,
          }),
        );

        setTimeout(() => {
          router.refresh();
        }, 100);
      } else if (res.data?.openTestHistoryId) {
        // Server told us there's already an open test
        setOpenTestHistoryId(res.data.openTestHistoryId);
        setReattemptDialog("open-test");
      } else {
        console.error(
          "Reattempt API returned unsuccessful response:",
          res.data,
        );
        // Fallback: show open-test dialog if message mentions it
        setReattemptDialog("open-test");
      }
    } catch (error: any) {
      console.error("ERROR_REATTEMPTING_TEST:", error);
      // If 400 because of open test, show the open-test dialog
      const errData = error.response?.data;
      if (error.response?.status === 400 && errData?.openTestHistoryId) {
        setOpenTestHistoryId(errData.openTestHistoryId);
        setReattemptDialog("open-test");
      } else if (error.response?.status === 400) {
        setReattemptDialog("open-test");
      } else {
        setReattemptDialog(null);
      }
    } finally {
      setIsReattempting(false);
    }
  };

  /** Navigate to the existing open test */
  const handleGoToOpenTest = async () => {
    const targetId = openTestHistoryId || historyId;
    if (!targetId) return;
    setReattemptDialog(null);
    dispatch(setNewTestCreating(true));
    try {
      const res = await axios.get(
        `/api/history/attempt-details?historyId=${targetId}`,
      );
      if (res.data.success) {
        dispatch(updateSessionId(targetId));
        const newTestData = {
          questions: res.data.history.questions,
          timerConfig: res.data.history.timerConfig,
          disableHint: res.data.history.disableHint,
          isSubmitted: res.data.history.isSubmitted,
          userAnswers: res.data.history.userAnswers,
          results: res.data.history.results,
          timeTaken: res.data.history.timeTaken,
          timerEnabled: res.data.history.timerEnabled,
          showHint: res.data.history.showHint,
          questionTimings: res.data.history.questionTimings,
          isPreferencesSaved: res.data.history.isPreferencesSaved,
          subjects: res.data.history.subjects,
          isFullSyllabus: res.data.history.isFullSyllabus,
          scoring: res.data.history.scoring,
          isSamplePaper: false,
          historyId: targetId,
        };
        dispatch(
          retriveChatDetails({
            paper: newTestData,
            config: {
              class: res.data.history.class,
              subject: res.data.history.subject,
              examType: res.data.history.exam_type,
              paperType: res.data.history.paperType,
            },
            messages: [],
            activeSessionId: targetId,
          }),
        );
        router.refresh();
      }
    } catch (e) {
      console.error("ERROR_GOING_TO_OPEN_TEST:", e);
    } finally {
      dispatch(setNewTestCreating(false));
    }
  };

  /** Regenerate question API call */
  const handleRegenerateQuestion = async (customPrompt: string) => {
    if (!historyId) {
      toast.error("Cannot regenerate question in preview/sample mode.");
      return;
    }

    setIsRegenerating(true);
    try {
      const currentQ = questions[currentQuestionIndex];
      const res = await axios.post("/api/gemini/update-test", {
        currentQuestion: currentQ,
        customPrompt,
        subject: currentQ.subject || currentSubject,
        grade,
      });

      if (res.data && res.data.success) {
        let updatedQuestion = res.data.data;

        try {
          const creditRes = await axios.get("/api/ai-credits");
          if (creditRes.data.success) {
            dispatch(setCredits(creditRes.data));
          }
        } catch (err) {
          console.error("Failed to re-fetch credits:", err);
        }

        // Ensure strictly identical string ID and normalized schema
        updatedQuestion = normalizeQuestion({
          ...updatedQuestion,
          id: String(currentQ.id),
        });

        // Update local state by replacing exactly at the same index
        const newQuestions = [...questions];
        newQuestions[currentQuestionIndex] = updatedQuestion;
        setQuestions(newQuestions);

        // Clear answer for this question if any
        if (userAnswers[currentQ.id]) {
          const newAnswers = { ...userAnswers };
          delete newAnswers[currentQ.id];
          setUserAnswers(newAnswers);
        }

        // Forward the updated questions to the top-level handler to ensure Redux + DB sink properly

        try {
          await axios.post("/api/history/update-test", {
            historyId: currentChat.activeSessionId,
            attemptId: initialState.attemptId,
            testResults: { questions: newQuestions },
          });
        } catch (error) {
          console.error("Failed to save test results:", error);
        }
        // onSubmit({ questions: newQuestions });

        toast.success("Question regenerated successfully!");
        setShowRegenerateDialog(false);
      } else {
        toast.error("Failed to regenerate question.");
      }
    } catch (error) {
      console.error("Regenerate question error:", error);
      toast.error(
        getQuotaExceededMessage(error) || "Failed to regenerate question.",
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleOpenAllQuestions = () => {
    if (isSubmitted) return;
    dispatch(
      onOpen({
        type: "allTestQuestions",
        data: {
          questions,
          userAnswers,
          currentQuestionIndex,
          subjects,
          isFullSyllabus,
          onQuestionSelect: (index: number) => {
            const q = questions[index];
            if (isMultiSubject && q.subject) {
              const subjectQuestions = questions.filter(
                (ques) => ques.subject === q.subject,
              );
              const firstIndex = questions.indexOf(subjectQuestions[0]);
              setCurrentSubject(q.subject);
              setCurrentQuestionIndex(
                firstIndex +
                  subjectQuestions.findIndex((ques) => ques.id === q.id),
              );
            } else {
              setCurrentQuestionIndex(index);
            }
            setIsHintOpen(false);
          },
        },
      }),
    );
  };

  const handleGoTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubjectChange = (subject: string) => {
    if (subject === currentSubject) return;
    trackQuestionTime();

    const firstQuestionIndex = questions.findIndex(
      (q) => q.subject === subject,
    );
    if (firstQuestionIndex !== -1) {
      setCurrentSubject(subject);
      setCurrentQuestionIndex(firstQuestionIndex);
      setIsHintOpen(false);
    }
  };

  const renderNavButtons = () => {
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    if (isMultiSubject && !isLastQuestion) {
      const currentQ = questions[currentQuestionIndex];
      const currentSubjectQuestions = questions.filter(
        (q) => q.subject === currentSubject,
      );
      const currentIndexInSubject = currentSubjectQuestions.findIndex(
        (q) => q.id === currentQ.id,
      );
      const isLastInSubject =
        currentIndexInSubject === currentSubjectQuestions.length - 1;
      const currentSubjectIndex = subjects.indexOf(currentSubject);
      const hasNextSubject = currentSubjectIndex < subjects.length - 1;

      if (isLastInSubject && hasNextSubject) {
        const nextSubject = subjects[currentSubjectIndex + 1];
        return (
          <button
            onClick={() => handleSubjectChange(nextSubject)}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Next: {nextSubject}
            <ChevronRight size={20} />
          </button>
        );
      }
    }

    if (isLastQuestion) {
      return (
        <button
          onClick={handleSubmit}
          disabled={!hasStartedTest || isViewMode}
          className={`${!hasStartedTest || isViewMode ? "bg-slate-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"} flex items-center gap-2 px-8 py-3 rounded-xl  text-white font-bold transition-all shadow-lg hover:shadow-xl active:scale-95`}
        >
          Finish
          <Send size={20} />
        </button>
      );
    }

    return (
      <button
        onClick={handleNextQuestion}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
      >
        Next
        <ChevronRight size={18} />
      </button>
    );
  };

  const handleNextQuestion = () => {
    trackQuestionTime();
    if (isMultiSubject) {
      const currentQ = questions[currentQuestionIndex];
      const currentSubjectQuestions = questions.filter(
        (q) => q.subject === currentSubject,
      );
      const currentIndexInSubject = currentSubjectQuestions.findIndex(
        (q) => q.id === currentQ.id,
      );

      if (currentIndexInSubject === currentSubjectQuestions.length - 1) {
        const currentSubjectIndex = subjects.indexOf(currentSubject);
        if (currentSubjectIndex < subjects.length - 1) {
          const nextSubject = subjects[currentSubjectIndex + 1];
          handleSubjectChange(nextSubject);
          return;
        }
      }
    }

    setCurrentQuestionIndex(
      Math.min(questions.length - 1, currentQuestionIndex + 1),
    );
    setIsHintOpen(false);
  };

  const handlePreviousQuestion = () => {
    trackQuestionTime();
    if (isMultiSubject) {
      const currentQ = questions[currentQuestionIndex];
      const currentSubjectQuestions = questions.filter(
        (q) => q.subject === currentSubject,
      );
      const currentIndexInSubject = currentSubjectQuestions.findIndex(
        (q) => q.id === currentQ.id,
      );

      if (currentIndexInSubject === 0) {
        const currentSubjectIndex = subjects.indexOf(currentSubject);
        if (currentSubjectIndex > 0) {
          const prevSubject = subjects[currentSubjectIndex - 1];
          const prevSubjectQuestions = questions.filter(
            (q) => q.subject === prevSubject,
          );
          setCurrentSubject(prevSubject);
          setCurrentQuestionIndex(
            questions.indexOf(
              prevSubjectQuestions[prevSubjectQuestions.length - 1],
            ),
          );
          setIsHintOpen(false);
          return;
        }
      }
    }

    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
    setIsHintOpen(false);
  };

  // ── Calculating Results State ──

  if (isCalculatingResults) {
    return (
      <LoadingState
        title="Loading Your Test Performance"
        description="It may take a moment, please wait..!"
      />
    );
  }

  // ── Review Mode ──

  if (isSubmitted) {
    const results = calculateResults();
    return (
      <TestReview
        questions={questions}
        userAnswers={userAnswers}
        results={results}
        scoring={scoring}
        totalTimeTaken={totalTimeTaken}
        questionTimings={questionTimings}
        isSamplePaper={isSamplePaper}
        historyId={historyId}
        isReattempting={isReattempting}
        reattemptDialog={reattemptDialog}
        setReattemptDialog={setReattemptDialog}
        handleReattemptClick={handleReattemptClick}
        handleReattemptConfirm={handleReattemptConfirm}
        handleGoToOpenTest={handleGoToOpenTest}
        formatTime={formatTime}
        subjects={subjects}
        isFullSyllabus={isFullSyllabus}
        isPublicTest={isPublicTest}
        testData={testData}
        isReview={isReview}
        questionSections={isSubjectTestWithSections ? questionSections : null}
      />
    );
  }

  // ── Active Test Mode ──

  return (
    <>
      <TestInfoModal
        isOpen={showTestInfo}
        onClose={() => setShowTestInfo(false)}
        examType={String(examType)}
        grade={String(grade)}
        scoring={scoring}
        totalQuestions={questions.length}
        totalTime={timerConfig?.totalTime}
        questionTypes={[...new Set(questions.map(q => q.type))]}
      />
      <RegenerateQuestionDialog
        isOpen={showRegenerateDialog}
        onClose={() => setShowRegenerateDialog(false)}
        onRegenerate={handleRegenerateQuestion}
        isLoading={isRegenerating}
      />
      {showShareDialog && (
        <ShareTestDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          testDetails={{
            paperJson: JSON.stringify({
              questions,
              subjects: subjects || [],
              isFullSyllabus,
              timerConfig,
              scoring,
              questionSections
            }),
            title: title,
            subject: isMultiSubject ? "All" : currentSubject || "General",
            className: String(grade || "General"),
            exam_type: String(examType || "Custom"),
            paperType: isMultiSubject ? "Full Syllabus Test" : "Subject Test",
          }}
        />
      )}
      <div className="flex flex-col h-full w-full bg-slate-50/30 overflow-hidden relative">
        {/* Progress Header */}
        <div className="px-3 py-2 bg-neutral-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm/10 h-16">
          <div className="flex items-center gap-2">
            {!isPublicTest && <SidebarTrigger className="cursor-pointer" />}
            <div className="flex flex-col">
              <h3 className="font-bold text-slate-800 text-sm md:text-lg line-clamp-1">
                {title} {isPublicTest && "Public Test"}
              </h3>
              {isPublicTest && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1 flex-nowrap">
                    <span className="">Made by</span> Sarthaks AI
                  </span>
                  <span className="text-xs text-slate-400 hidden md:inline-block">
                    Question {currentSubjectIndex + 1} of{" "}
                    {isMultiSubject
                      ? filteredQuestions.length
                      : questions.length}
                    {isMultiSubject && currentSubject && (
                      <span className="ml-1 text-indigo-600">
                        ({currentSubject})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop: Teacher Mode Toggle and Share (hidden on mobile) */}
            {!isPublicTest && isViewMode && (
              <button
                onClick={() => setIsTeacherMode(!isTeacherMode)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-colors border ${isTeacherMode ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
              >
                Teacher Mode {isTeacherMode ? "ON" : "OFF"}
              </button>
            )}
            {isTeacherMode && !isPublicTest && isViewMode && (
              <button
                onClick={() => setShowShareDialog(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-colors border bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 shadow-sm"
                title="Share this test via link"
              >
                <Share2 size={14} />
                Share
              </button>
            )}

            {/* Mobile: 3-dot Menu (visible only on mobile, hidden on md and above) */}
            {!isPublicTest && isViewMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:hidden">
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 transition-colors"
                    title="More options"
                  >
                    <MoreVertical size={18} />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="z-[60] min-w-[150px]"
                >
                  {/* Teacher Mode Toggle - Custom button to keep dropdown open */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsTeacherMode(!isTeacherMode);
                    }}
                    className={`w-full flex items-center gap-2 cursor-pointer rounded-sm px-2 py-1.5 text-sm font-medium transition-colors ${
                      isTeacherMode
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isTeacherMode
                          ? "bg-indigo-600 border-indigo-600"
                          : "border-slate-300"
                      }`}
                    >
                      {isTeacherMode && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span>Teacher Mode</span>
                  </button>

                  {/* Share Button (only visible when Teacher Mode is ON) */}
                  {isTeacherMode && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShareDialog(true);
                      }}
                      className="flex items-center gap-2 cursor-pointer text-purple-600 hover:text-purple-700 focus:text-purple-700"
                    >
                      <Share2 size={16} />
                      <span>Share Test</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Info Button */}
            <button
              onClick={() => setShowTestInfo(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 transition-colors"
              title="Test Instructions & Marking Scheme"
            >
              <Info size={18} />
            </button>
            {/* Timer Display */}
            {!isViewMode && timerEnabled && timerStarted && (
              <div
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl tabular-nums ${
                  timeRemaining < 60
                    ? "bg-red-100 text-red-600"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    className="stroke-linecap-round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-mono font-bold text-xs sm:text-sm">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            {!isViewMode && (
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
                  Progress
                </span>
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${((currentSubjectIndex + 1) / (isMultiSubject ? filteredQuestions.length : questions.length)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {/* Start Test Button (only in view mode) */}
            {isViewMode && (
              <div className="flex flex-col md:flex-row gap-1 md:gap-2 items-center">
                <div className="py-[2px] px-2 text-nowrap text-xs md:text-sm md:py-1 md:px-3 border border-amber-300 flex items-center gap-1 rounded-full text-amber-600 font-bold">
                  <Eye className="w-4 h-4" />
                  <span className="inline-block">
                    View Mode{" "}
                    <span className="hidden md:inline-block">Active</span>
                  </span>
                </div>
                <button
                  onClick={handleStartTest}
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0 text-nowrap flex-nowrap"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span className="inline-block">
                    Start <span className="hidden md:inline-block">Test</span>
                  </span>
                </button>
              </div>
            )}
            {/* Submit Button (hidden in view mode) */}
            {!isViewMode && (
              <button
                onClick={handleSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Send size={16} />
                <span className="hidden md:inline-block">Submit</span>
              </button>
            )}
          </div>
        </div>

        {/* Subject Navigator (Full Test only) */}
        {isMultiSubject && (
          <SubjectNavigator
            subjects={subjects!}
            currentSubject={currentSubject}
            onSubjectChange={handleSubjectChange}
            className="sticky top-16 z-20"
          />
        )}

        {/* Section Navigator (Subject Test only, when questionSections exist) */}
        {isSubjectTestWithSections && (
          <div className="sticky top-16 z-20 flex items-center gap-2 px-4 bg-white border-b border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Section:
            </span>
            <div className="flex-1 w-0 overflow-x-auto hide-scrollbar flex items-center gap-2 py-2 pl-1">
              {questionSections!.map((sec) => {
                const count = questions.filter(
                  (q) => (q as any).section === sec,
                ).length;
                const attempted = questions
                  .filter((q) => (q as any).section === sec)
                  .filter((q) => isAttempted(userAnswers[q.id])).length;
                const isActive = activeQuestionSection === sec;
                return (
                  <button
                    key={sec}
                    onClick={() => {
                      // Jump to first question of this section
                      const firstIdx = questions.findIndex(
                        (q) => (q as any).section === sec,
                      );
                      if (firstIdx !== -1) {
                        trackQuestionTime();
                        setCurrentQuestionIndex(firstIdx);
                      }
                      setIsHintOpen(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 border whitespace-nowrap ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white"
                    }`}
                  >
                    {sec}
                    {/* <span
                      className={`text-xs font-bold ml-1 ${isActive ? "opacity-80" : "opacity-50"}`}
                    >
                      ({attempted}/{count})
                    </span> */}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Navigation */}
        <div className="sticky top-16 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center w-full max-w-full px-2 md:px-4 py-1 gap-4">
            <button
              onClick={handleOpenAllQuestions}
              className="hidden sm:flex flex-col flex-shrink-0 border-r border-slate-200 pr-2 group"
            >
              <div className="group-hover:bg-slate-500/10 duration-300 transition-colors p-1 rounded-md cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Questions
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">
                    {isMultiSubject
                      ? filteredQuestions.length
                      : questions.length}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0 transition-all duration-200">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    View All
                  </span>
                </div>
              </div>
            </button>

            <div
              ref={questionNavRef}
              className="flex-1 w-0 overflow-x-auto hide-scrollbar flex items-center gap-2 py-1 px-1 scroll-smooth"
            >
              {(isMultiSubject ? filteredQuestions : questions).map(
                (q, idx) => {
                  const attempted = isAttempted(userAnswers[q.id]);
                  const isActive = idx === currentSubjectIndex;

                  return (
                    <button
                      key={q.id}
                      data-question-index={idx}
                      onClick={() => {
                        trackQuestionTime();
                        if (isMultiSubject) {
                          const actualIndex = questions.indexOf(
                            filteredQuestions[idx],
                          );
                          setCurrentQuestionIndex(actualIndex);
                        } else {
                          setCurrentQuestionIndex(idx);
                        }
                        setIsHintOpen(false);
                      }}
                      className={`flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-300 transform ${
                        // q.type !== "mcq"
                        // ? "px-2 h-9 md:h-10 gap-1"
                        "size-9 md:size-10"
                      } ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 -translate-y-0.5 scale-105"
                          : attempted
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-50 hover:-translate-y-0.5"
                            : "bg-slate-50 border border-slate-100 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white hover:-translate-y-0.5"
                      }`}
                    >
                      {idx + 1}
                      {/* {q.type !== "mcq" && (
                    <span className="text-[8px] opacity-75">
                      {getTypeLabel(q.type)}
                    </span>
                  )} */}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* Question Content Area */}
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar px-4 md:px-8 flex justify-center pb-20">
          {currentQuestion?.hint && showHintInTest && (
            <div
              onClick={() => setIsHintOpen(!isHintOpen)}
              className="absolute -right-20 xl:right-6 top-4 md:top-6 bg-slate-100 px-2 py-1 rounded-full flex items-center gap-2 text-slate-600 cursor-pointer border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 duration-300 transition-colors z-30"
            >
              <Lightbulb
                className={cn(
                  "size-6 p-1 bg-amber-500/10 text-amber-500 rounded-full transition-colors",
                  isHintOpen && "bg-amber-500 text-white",
                )}
                strokeWidth={1.5}
              />
              <h2 className="text-sm font-semibold whitespace-nowrap">
                Want Hint?
              </h2>

              {(isHintOpen || showHintTooltip) && (
                <div
                  className={cn(
                    "absolute top-10 -translate-x-[92%] md:left-1/2 md:-translate-x-[80%] md:right-auto z-50 duration-500",
                    showHintTooltip && !isHintOpen && "animate-bounce-slow",
                  )}
                >
                  <div className="relative group bg-white/95 backdrop-blur-md border border-indigo-100 p-3 rounded-2xl shadow-[0_10px_40px_-10px_rgba(79,70,229,0.3)] min-w-[260px] md:min-w-[300px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsHintOpen(false);
                        setShowHintTooltip(false);
                      }}
                      className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 rounded-full p-1 transition-all hover:scale-110 z-10 cursor-pointer"
                    >
                      <X size={12} />
                    </button>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                            AI Hint
                          </span>
                        </div>
                        {isHintOpen && (
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            Question {currentSubjectIndex + 1}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-slate-700 text-sm font-semibold leading-tight">
                          {isHintOpen && currentQuestion.hint
                            ? "Hint Breakdown"
                            : `This is a ${getTypeLabel(currentQuestion.type)} type question.`}
                        </p>
                        <div className="text-slate-500 text-sm leading-relaxed">
                          {isHintOpen && currentQuestion.hint && (
                            <SafeMath>{currentQuestion.hint}</SafeMath>
                          )}
                        </div>
                      </div>

                      <div className="mt-1 pt-2 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-indigo-500">
                          {isHintOpen
                            ? "Take these clues to solve it!"
                            : "Click above to start"}
                        </span>
                      </div>
                    </div>

                    <div className="absolute -top-1.5 right-4 xl:right-12 w-3 h-3 bg-white border-t border-l border-indigo-50 rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="max-w-4xl w-full flex flex-col gap-6 overflow-y-auto overflow-x-hidden hide-scrollbar py-4 pb-10 h-full">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 relative group">
              <div className="absolute top-6 -right-28 size-50 bg-indigo-50 rounded-full transition-transform group-hover:scale-110 duration-700 opacity-50" />
              <div className="absolute bottom-6 -left-28 size-50 bg-indigo-50 rounded-full transition-transform group-hover:scale-110 duration-700 opacity-50" />

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex-1">
                  <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 mb-2">
                    {getFullTypeLabel(currentQuestion.type, !!currentQuestion._caseStudyParentId)}
                  </span>
                  {/* Show case study passage above the sub-question */}
                  {currentQuestion._caseStudyPassage && (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          Passage
                        </span>
                        {currentQuestion._caseStudyTitle && (
                          <span className="text-xs text-slate-500 ml-2">
                            — {currentQuestion._caseStudyTitle}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-700 text-sm md:text-base leading-relaxed">
                        <SafeMath>{currentQuestion._caseStudyPassage}</SafeMath>
                      </div>
                    </div>
                  )}
                  <h2 className="text-base md:text-lg lg:text-xl text-slate-900 leading-relaxed">
                    <SafeMath>{currentQuestion.question}</SafeMath>
                  </h2>
                </div>

                <div className="absolute -top-[35px] md:-top-8 -right-1 md:-right-3 bg-white flex items-center gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs border px-1 md:px-2 rounded-full py-0.5 md:py-1">
                    <span className="hidden md:inline-block text-slate-500 text-xs font-medium">
                      Marks :{" "}
                    </span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 rounded-lg border border-emerald-100">
                      +{scoring[currentQuestion.type]?.correct || 1}
                    </span>
                    <span className="text-rose-600 bg-rose-50 px-2 rounded-lg border border-rose-100">
                      {scoring[currentQuestion.type]?.incorrect || 0}
                    </span>
                  </div>
                  {isTeacherMode && !isSubmitted && (
                    <button
                      onClick={() => setShowRegenerateDialog(true)}
                      className="bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Regenerate Question"
                    >
                      <RefreshCw
                        size={12}
                        className={isRegenerating ? "animate-spin" : ""}
                      />
                      {isRegenerating ? "Regenerating..." : "Regenerate"}
                    </button>
                  )}
                </div>
              </div>

              <div className="relative z-10">
                <QuestionContent
                  question={currentQuestion}
                  currentAnswer={userAnswers[currentQuestion.id] || ""}
                  onAnswer={handleAnswer}
                  isSubmitted={false}
                  isViewMode={isViewMode}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-[30] bg-slate-100 flex items-center justify-between py-4 px-4 sm:px-12 md:px-24 lg:px-48">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div className="hidden sm:flex gap-1.5 max-w-xl overflow-x-auto hide-scrollbar">
                {(isMultiSubject ? filteredQuestions : questions).map(
                  (_, idx) => {
                    return (
                      <button
                        id={`question-dot-${idx}`}
                        key={idx}
                        onClick={() => {
                          trackQuestionTime();
                          if (isMultiSubject) {
                            const actualIndex = questions.indexOf(
                              filteredQuestions[idx],
                            );
                            setCurrentQuestionIndex(actualIndex);
                          } else {
                            setCurrentQuestionIndex(idx);
                          }
                          setIsHintOpen(false);
                        }}
                        className={`h-2 rounded-full transition-all duration-300 shrink-0 ${
                          idx === currentSubjectIndex
                            ? "w-8 bg-indigo-600"
                            : "w-2 bg-slate-200 hover:bg-slate-300"
                        }`}
                        aria-label={`Go to question ${idx + 1}`}
                      />
                    );
                  },
                )}
              </div>

              {renderNavButtons()}
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes bounce-slow {
            0%,
            100% {
              transform: translateY(-10%);
              animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }
            50% {
              transform: none;
              animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s infinite;
          }
        `}</style>
      </div>
    </>
  );
};
