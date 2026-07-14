"use client";
import React, { useState, useRef, useMemo } from "react";
import {
  AlertCircle,
  ChevronUp,
  Clock,
  RefreshCw,
  Loader2,
  PlayCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Circle,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { SidebarTrigger } from "../ui/sidebar";
import SafeMath from "../SafeMath";
import PerformanceGauge from "../graph/PerformaceGauge";
import ScoreCalculationModal from "./ScoreCalculationModal";
import type { TestQuestion, ScoringConfig, ScoringRule, TestResults } from "@/types/global";
import {
  checkCorrectness,
  calculateQuestionScore,
  isAttempted,
  QuestionContent,
} from "./TestEnvironment";
import { isAuthenticated } from "@/utils/cookieUtils";
import { toast } from "sonner";
import { useRouter } from "nextjs-toploader/app";
import { useDispatch } from "react-redux";
import { onOpen } from "@/features/openModel";
import Link from "next/link";

const SUBJECT_COLORS: Record<string, string> = {
  Physics: "bg-blue-100 text-blue-700 border-blue-200",
  Chemistry: "bg-green-100 text-green-700 border-green-200",
  Mathematics: "bg-purple-100 text-purple-700 border-purple-200",
  Zoology: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Botany: "bg-green-100 text-green-700 border-green-200",
};

const SUBJECT_ICONS: Record<string, string> = {
  Physics: "⚛️",
  Chemistry: "🧪",
  Mathematics: "📐",
  Zoology: "🦋",
  Botany: "🌿",
};

interface TestReviewProps {
  questions: TestQuestion[];
  userAnswers: Record<string, string>;
  results: TestResults;
  scoring: ScoringConfig;
  totalTimeTaken: number;
  questionTimings: Record<string, number>;
  isSamplePaper: boolean;
  historyId?: string;
  isReattempting: boolean;
  reattemptDialog: "confirm" | "open-test" | null;
  setReattemptDialog: React.Dispatch<
    React.SetStateAction<"confirm" | "open-test" | null>
  >;
  handleReattemptClick: () => void;
  handleReattemptConfirm: () => void;
  handleGoToOpenTest: () => void;
  formatTime: (seconds: number) => string;
  subjects?: string[];
  isFullSyllabus?: boolean;
  isPublicTest?: boolean;
  testData?: any;
  isReview?: boolean;
  /** Section labels for Subject Test review tabs (null = not a sectional test) */
  questionSections?: string[] | null;
}

export function ResultAnalysis({
  results,
  scoring,
  timeTaken,
  questionTimings,
  questions,
  userAnswers,
}: {
  results: TestResults;
  scoring?: ScoringConfig;
  timeTaken?: number;
  questionTimings?: Record<string, number>;
  questions?: TestQuestion[];
  userAnswers?: Record<string, string>;
}) {
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  const hasNegativeMarking = scoring
    ? Object.values(scoring).some((r) => r.incorrect < 0)
    : false;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <>
      {scoring && (
        <ScoreCalculationModal
          isOpen={showScoreInfo}
          onClose={() => setShowScoreInfo(false)}
          results={results}
          scoring={scoring}
          questions={questions}
          userAnswers={userAnswers}
        />
      )}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm max-w-6xl mx-auto mb-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">
                Performance Score
              </h3>
            </div>
            <PerformanceGauge
              correct={results.correct}
              wrong={results.wrong}
              skipped={results.unattempted}
              total={results.total}
            />

            <div className="flex justify-center flex-wrap gap-4 mt-[-40px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">
                  Correct
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">
                  Wrong
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">
                  Skipped
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col items-center">
              <span className="text-blue-600 text-xs font-bold uppercase mb-1">
                Total
              </span>
              <span className="text-3xl font-black text-blue-800">
                {results.total}
              </span>
            </div>

            <div className="bg-green-50 p-5 rounded-2xl border border-green-100 flex flex-col items-center">
              <span className="text-green-600 text-xs font-bold uppercase mb-1">
                Correct
              </span>
              <span className="text-3xl font-black text-green-800">
                {results.correct}
              </span>
            </div>

            <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex flex-col items-center">
              <span className="text-red-600 text-xs font-bold uppercase mb-1">
                Wrong
              </span>
              <span className="text-3xl font-black text-red-800">
                {results.wrong}
              </span>
            </div>

            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex flex-col items-center">
              <span className="text-amber-600 text-xs font-bold uppercase mb-1">
                Skipped
              </span>
              <span className="text-3xl font-black text-amber-800">
                {results.unattempted}
              </span>
            </div>

            {hasNegativeMarking && (
              <div className="relative bg-indigo-50 p-5 rounded-2xl border border-indigo-100 flex flex-col items-center">
                <span className="text-indigo-600 text-xs font-bold uppercase mb-1">
                  Score
                </span>
                <span className="text-3xl font-black text-indigo-800">
                  {results.score} / {results.maxScore}
                </span>
                {scoring && (
                  <button
                    onClick={() => setShowScoreInfo(true)}
                    className="absolute right-2 top-1 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="View Score Calculation"
                  >
                    <Info size={14} />
                  </button>
                )}
              </div>
            )}

            {timeTaken !== undefined && timeTaken > 0 && (
              <div
                className={`${!hasNegativeMarking ? "col-span-2" : ""} bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center`}
              >
                <span className="text-slate-500 text-xs font-bold uppercase mb-1">
                  Time Taken
                </span>
                <span className="text-3xl font-black text-slate-700">
                  {formatTime(timeTaken)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function TestReview({
  questions,
  userAnswers,
  results,
  scoring,
  totalTimeTaken,
  questionTimings,
  isSamplePaper,
  historyId,
  isReattempting,
  reattemptDialog,
  setReattemptDialog,
  handleReattemptClick,
  handleReattemptConfirm,
  handleGoToOpenTest,
  formatTime,
  subjects,
  isFullSyllabus,
  isPublicTest,
  isReview = false,
  testData,
  questionSections,
}: TestReviewProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const isMultiSubject = isFullSyllabus && subjects && subjects.length > 1;
  const [currentSubject, setCurrentSubject] = useState<string>(
    isMultiSubject && subjects ? subjects[0] : "",
  );
  const subjectFilteredQuestions = isMultiSubject && currentSubject
    ? questions.filter((q) => q.subject === currentSubject)
    : questions;

  const availableSections = useMemo(() => {
    if (!isFullSyllabus && questionSections && questionSections.length > 0) {
      return questionSections;
    }
    if (isFullSyllabus) {
      const sections = Array.from(
        new Set(
          subjectFilteredQuestions
            .map((q) => (q as any).section as string)
            .filter(Boolean)
        )
      );
      return sections.length > 0 ? sections : null;
    }
    return null;
  }, [isFullSyllabus, questionSections, subjectFilteredQuestions]);

  const hasSectionsForCurrentView = !!availableSections && availableSections.length > 0;

  const [currentSection, setCurrentSection] = useState<string>(
    hasSectionsForCurrentView && availableSections ? availableSections[0] : "",
  );

  React.useEffect(() => {
    if (hasSectionsForCurrentView && availableSections) {
      if (!currentSection || !availableSections.includes(currentSection)) {
        setCurrentSection(availableSections[0]);
      }
    } else {
      if (currentSection !== "") {
        setCurrentSection("");
      }
    }
  }, [hasSectionsForCurrentView, availableSections, currentSection]);

  const [resultFilter, setResultFilter] = useState<
    "all" | "correct" | "wrong" | "skipped"
  >("all");
  const [filterLoading, setFilterLoading] = useState(false);
  const router = useRouter();

  const filteredQuestions = hasSectionsForCurrentView && currentSection
    ? subjectFilteredQuestions.filter((q) => (q as any).section === currentSection)
    : subjectFilteredQuestions;

  const filteredByResult = useMemo(() => {
    if (resultFilter === "all") return filteredQuestions;
    return filteredQuestions.filter((q) => {
      const userAnswer = userAnswers[q.id];
      const isCorrect = checkCorrectness(q, userAnswer);
      const attempted = isAttempted(userAnswer);
      if (resultFilter === "correct") return isCorrect;
      if (resultFilter === "wrong") return attempted && !isCorrect;
      if (resultFilter === "skipped") return !attempted;
      return true;
    });
  }, [filteredQuestions, resultFilter, userAnswers]);

  const subjectResults = useMemo(() => {
    const subjectQs =
      isMultiSubject && currentSubject
        ? questions.filter((q) => q.subject === currentSubject)
        : questions;
    return subjectQs.reduce(
      (acc, q) => {
        const userAnswer = userAnswers[q.id];
        const isCorrect = checkCorrectness(q, userAnswer);
        const attempted = isAttempted(userAnswer);
        if (isCorrect) acc.correct++;
        else if (attempted) acc.wrong++;
        else acc.skipped++;
        return acc;
      },
      { correct: 0, wrong: 0, skipped: 0 },
    );
  }, [questions, userAnswers, isMultiSubject, currentSubject]);

  const getQuestionScore = (
    q: (typeof questions)[0],
    isCorrect: boolean,
    attempted: boolean,
  ): { marks: number; maxMarks: number } => {
    if (!scoring) return { marks: 0, maxMarks: 0 };
    const isCaseStudySub = !!(q as any)._caseStudyParentId;
    const section = (q as any).section as string | null | undefined;
    const lookupType = isCaseStudySub ? "caseStudy" : q.type;
    const defaultRule: ScoringRule = { correct: 1, incorrect: 0, unattempted: 0 };

    let rule: ScoringRule;
    const normSection = section ? section.toLowerCase().replace(/\s+/g, "_") : null;
    if (normSection && scoring[`${normSection}::${q.type}`]) {
      rule = scoring[`${normSection}::${q.type}`];
    } else if (section && scoring[`${section}::${q.type}`]) {
      rule = scoring[`${section}::${q.type}`];
    } else if (isCaseStudySub) {
      rule = scoring[`caseStudy_${q.type}`] || scoring["caseStudy"] || defaultRule;
    } else {
      rule = scoring[q.type] || scoring["mcq"] || defaultRule;
    }

    if (!rule) return { marks: 0, maxMarks: 0 };
    if (!attempted) {
      return { marks: rule.unattempted || 0, maxMarks: lookupType === "caseStudy" ? (rule.partialPerCorrect || rule.correct || 0) : (rule.correct || 0) };
    }
    if (!isCorrect) {
      if (rule.partialPerCorrect !== undefined || rule.partialPerMatch !== undefined) {
        return calculateQuestionScore(q, userAnswers[q.id], rule);
      }
      return { marks: rule.incorrect, maxMarks: lookupType === "caseStudy" ? (rule.partialPerCorrect || rule.correct || 0) : rule.correct };
    }
    const getMaxMarks = (): number => {
      if (lookupType === "caseStudy" && rule.partialPerCorrect !== undefined) {
        return rule.partialPerCorrect;
      }
      if ((lookupType === "multiCorrect" || lookupType === "matchListOptionFormat") && rule.partialPerCorrect !== undefined) {
        const numCorrect = lookupType === "multiCorrect"
          ? (q as any).correctAnswerIndices?.length
          : ((q as any).correctIndices || [(q as any).correctIndex].filter((i: any) => i !== undefined))?.length;
        return Math.max(rule.correct, (numCorrect || 0) * rule.partialPerCorrect);
      }
      if (lookupType === "matchList" && rule.partialPerMatch !== undefined) {
        return Math.max(rule.correct, (q as any).correctMatches?.length * rule.partialPerMatch);
      }
      return rule.correct;
    };
    const maxMarks = getMaxMarks();
    return { marks: maxMarks, maxMarks };
  };

  const handleSubjectChange = (subject: string) => {
    setFilterLoading(true);
    setCurrentSubject(subject);
    setResultFilter("all");
    setTimeout(() => {
      setFilterLoading(false);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const handleSectionChange = (section: string) => {
    setFilterLoading(true);
    setCurrentSection(section);
    setResultFilter("all");
    setTimeout(() => {
      setFilterLoading(false);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const handleFilterChange = (
    filter: "all" | "correct" | "wrong" | "skipped",
  ) => {
    setFilterLoading(true);
    setResultFilter(filter);
    setTimeout(() => {
      setFilterLoading(false);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const handleGoTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const dispatch = useDispatch();

  const handleShowLeaderboard = () => {
    if (!isAuthenticated()) {
      toast.info("Please login to view leaderboard");
      router.push(
        `/login?returnUrl=${encodeURIComponent(window.location.href)}`,
      );
      return;
    }

    dispatch(
      onOpen({
        type: "publicLeaderboard",
        data: {
          attempts: testData?.attempts || [],
          testTitle: testData?.title || "Test Leaderboard",
          testId: testData?._id || testData?.id,
        },
      }),
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 relative">
      <Dialog
        open={reattemptDialog === "confirm"}
        onOpenChange={(o) => !o && setReattemptDialog(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw size={20} className="text-indigo-600" />
              Reattempt This Test?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reattempt this test? A fresh copy of the
              test will be created for you to try again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setReattemptDialog(null)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReattemptConfirm}
              disabled={isReattempting}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isReattempting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Reattempt
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={reattemptDialog === "open-test"}
        onOpenChange={(o) => !o && setReattemptDialog(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              Test Already In Progress
            </DialogTitle>
            <DialogDescription>
              You already have an open (unsubmitted) attempt for this test.
              Please complete or submit that attempt before starting a new
              reattempt.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setReattemptDialog(null)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={handleGoToOpenTest}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <PlayCircle size={16} />
              Start Test
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className="flex items-center justify-center p-2 rounded-full shadow-indigo-500 border bg-white border-slate-200 shadow-sm hover:scale-105 transition-transform duration-300 cursor-pointer fixed bottom-3 right-6 z-30"
        onClick={handleGoTop}
      >
        <ChevronUp
          className="cursor-pointer size-8 text-indigo-600"
          strokeWidth={1.5}
        />
      </div>
      <div className="px-3 py-2 bg-neutral-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm/10 h-16">
        <div className="flex items-center gap-2">
          {!isPublicTest && (
            <SidebarTrigger className="cursor-pointer p-1.5 rounded-lg transition-colors" />
          )}
          {isPublicTest && (
            <Link
              href={"/sarthaks-ai/generate"}
              className="flex xl:hidden items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadoxl transition-all duration-300 group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform duration-300"
              />
            </Link>
          )}
          <div className="flex flex-col border-l xl:border-l-0 border-slate-200 pl-3 xl:pl-0 ml-1 xl:ml-0">
            <h3 className="font-bold text-slate-800 text-base md:text-lg tracking-tight">
              Test Review
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] md:text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Completed
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">Results</span>
            <span className="text-slate-400">•</span>
            <span className="text-indigo-600 font-semibold">
              {questions.length} Questions
            </span>
          </div>
          {!isSamplePaper && historyId && (
            <button
              onClick={handleReattemptClick}
              disabled={isReattempting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
            >
              {isReattempting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              <span className="hidden sm:inline">Reattempt</span>
            </button>
          )}
          {isPublicTest && !isReview && (
            <button
              onClick={handleShowLeaderboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer transition-all shadow-md"
            >
              <BarChart3 size={14} />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>
          )}
        </div>
      </div>
      <div className="relative w-full overflow-y-auto thin-scroll">
        {isPublicTest && (
          <Link
            href={
              isReview
                ? `/public-test/${window.location.pathname.split("/")[2]}`
                : "/sarthaks-ai/generate"
            }
            className="hidden xl:flex fixed top-[62px] xl:top-17 left-4 z-50 bg-white px-4 py-[2px] xl:py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors items-center gap-2"
          >
            ←{" "}
            <span className="hidden xl:block">
              {isReview ? "Back to Leaderboard" : "Go Back"}
            </span>
          </Link>
        )}
        <div ref={topRef} className="absolute top-0 left-0 w-full h-0" />
        <div className="max-w-5xl mx-auto w-full pt-4">
          <ResultAnalysis
            results={results}
            scoring={scoring}
            timeTaken={totalTimeTaken}
            questionTimings={questionTimings}
            questions={questions}
            userAnswers={userAnswers}
          />
          {subjectResults && (
            <div className="sticky top-0 z-20 mx-3 px-3 py-2 bg-slate-50/95 backdrop-blur-sm rounded-2xl border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full bg-white rounded-2xl border border-slate-200 p-2 gap-2">
                <div className="flex flex-col w-full overflow-x-auto">
                  {isMultiSubject && (
                    <div className="flex-1 sm:w-auto overflow-x-auto hide-scrollbar">
                      <div className="flex items-center gap-2 py-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap px-2 hidden lg:block">
                          Subject:
                        </span>
                        <div className="flex gap-1">
                          {subjects!.map((subject) => {
                            const isActive = currentSubject === subject;
                            const colorClass =
                              SUBJECT_COLORS[subject] ||
                              "bg-slate-100 text-slate-700 border-slate-200";
                            const icon = SUBJECT_ICONS[subject] || "📚";

                            return (
                              <button
                                key={subject}
                                onClick={() => handleSubjectChange(subject)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                  isActive
                                    ? colorClass + " shadow-md"
                                    : "bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                                }`}
                              >
                                <span>{icon}</span>
                                <span>{subject}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section tabs for Subject Test review */}
                  {hasSectionsForCurrentView && (
                    <div className="flex-1 w-full sm:w-auto overflow-x-auto hide-scrollbar">
                      <div className="flex items-center gap-2 py-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap px-2 hidden lg:block">
                          Section:
                        </span>
                        <div className="flex gap-1 flex-nowrap">
                          {availableSections!.map((sec) => {
                            const isActive = currentSection === sec;
                            const secQs = subjectFilteredQuestions.filter(
                              (q) => (q as any).section === sec,
                            );
                            const secCorrect = secQs.filter((q) =>
                              checkCorrectness(q, userAnswers[q.id]),
                            ).length;
                            return (
                              <button
                                key={sec}
                                onClick={() => handleSectionChange(sec)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                                  isActive
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white"
                                }`}
                              >
                                {sec}
                                <span
                                  className={`ml-1 ${isActive ? "opacity-80" : "opacity-50"}`}
                                >
                                  ({secCorrect}/{secQs.length})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {subjectResults && (
                  <div className="flex items-center gap-2 px-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0">
                    <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap hidden lg:block">
                      Filter:
                    </span>
                    <div className="flex gap-1 whitespace-nowrap">
                      <button
                        onClick={() => handleFilterChange("all")}
                        disabled={filterLoading}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                          resultFilter === "all"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        All ({filteredQuestions.length})
                      </button>
                      <button
                        onClick={() => handleFilterChange("correct")}
                        disabled={filterLoading}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                          resultFilter === "correct"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <CheckCircle
                          size={12}
                          className={
                            resultFilter === "correct"
                              ? "text-white"
                              : "text-emerald-500"
                          }
                        />
                        <span>Correct ({subjectResults.correct})</span>
                      </button>
                      <button
                        onClick={() => handleFilterChange("wrong")}
                        disabled={filterLoading}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                          resultFilter === "wrong"
                            ? "bg-red-600 text-white"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <XCircle
                          size={12}
                          className={
                            resultFilter === "wrong"
                              ? "text-white"
                              : "text-red-500"
                          }
                        />
                        <span>Wrong ({subjectResults.wrong})</span>
                      </button>
                      <button
                        onClick={() => handleFilterChange("skipped")}
                        disabled={filterLoading}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                          resultFilter === "skipped"
                            ? "bg-amber-600 text-white"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Circle
                          size={12}
                          className={
                            resultFilter === "skipped"
                              ? "text-white"
                              : "text-amber-500"
                          }
                        />
                        <span>Skipped ({subjectResults.skipped})</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {filterLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600 size-8" />
            </div>
          ) : filteredByResult.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Circle size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No questions found</p>
              <p className="text-sm">
                Try changing the filter to see more questions
              </p>
            </div>
          ) : (
            <div className="space-y-6 mt-6 pb-20">
              {filteredByResult.map((q, idx) => {
                const userAnswer = userAnswers[q.id];
                const isCorrect = checkCorrectness(q, userAnswer);
                const attempted = isAttempted(userAnswer);
                const questionTime = questionTimings?.[q.id];
                const scoreInfo = getQuestionScore(q, isCorrect, attempted);

                return (
                  <div
                    key={q.id}
                    className={`bg-white p-3 md:p-6 rounded-2xl border transition-all relative ${
                      isCorrect
                        ? "border-emerald-100 shadow-sm"
                        : attempted
                          ? "border-red-100 shadow-sm"
                          : "border-amber-100 shadow-sm bg-amber-50/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 md:gap-4 mb-6">
                      <div className="flex items-start gap-2 md:gap-4 flex-1 min-w-0">
                        <div
                          className={`size-6 md:size-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm md:text-lg ${
                            isCorrect
                              ? "bg-emerald-100 text-emerald-600"
                              : attempted
                                ? "bg-red-100 text-red-600"
                                : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 flex flex-row-reverse justify-between items-start">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2"></div>
                            <div className="absolute right-5 -top-[9px] flex items-center gap-2">
                              {questionTime !== undefined &&
                                questionTime > 0 && (
                                  <div
                                    className={`flex items-center gap-1 text-sm text-slate-500 bg-slate-50 border px-2 rounded-full ${
                                      isCorrect
                                        ? "border-emerald-100 shadow-sm"
                                        : attempted
                                          ? "border-red-100 shadow-sm"
                                          : "border-amber-100 shadow-sm bg-amber-50/10"
                                    }`}
                                  >
                                    <Clock className="size-[14px]" />
                                    <div>{formatTime(questionTime)}</div>
                                  </div>
                                )}
                              {scoring && (
                                <div
                                  className={`ml-2 flex items-center px-2 py-0.5 rounded-full text-[14px] font-bold border align-baseline ${
                                    isCorrect
                                      ? "bg-emerald-50 text-emerald-600"
                                      : attempted
                                        ? "bg-red-50 text-red-600"
                                        : "bg-amber-50 text-amber-600"
                                  }`}
                                >
                                  <span>
                                    {isCorrect ? "+" : attempted ? "" : ""}
                                    {scoreInfo.marks} / {scoreInfo.maxMarks}
                                  </span>
                                  {/* <span className="text-xs opacity-70">
                                    {" "}
                                    / {scoreInfo.maxMarks}
                                  </span> */}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-base md:text-lg font-semibold text-slate-800 break-words overflow-wrap-anywhere whitespace-normal">
                            <SafeMath>{q.question}</SafeMath>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <QuestionContent
                        question={q}
                        currentAnswer={userAnswer || ""}
                        onAnswer={() => {}}
                        isSubmitted={true}
                        isViewMode={false}
                      />
                    </div>

                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex gap-2 break-words overflow-wrap-anywhere whitespace-normal">
                      <AlertCircle
                        className="text-indigo-500 flex-shrink-0"
                        size={16}
                      />
                      <div className="pt-[1px]">
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">
                          Explanation
                        </p>
                        <div className="text-slate-700 text-base leading-8 overflow-hidden whitespace-normal">
                          <SafeMath>{q.explanation}</SafeMath>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
