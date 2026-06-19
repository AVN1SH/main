"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calculator,
  CheckCircle,
  XCircle,
  MinusCircle,
  Info,
} from "lucide-react";
import { ScoringConfig, TestResults, TestQuestion } from "@/types/global";
import { calculateQuestionScore } from "./TestEnvironment";

interface ScoreCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: TestResults;
  scoring: ScoringConfig;
  questions?: TestQuestion[];
  userAnswers?: Record<string, string>;
}

const isAttempted = (answer: string | undefined): boolean => {
  if (!answer) return false;
  if (answer === "{}" || answer === "[]") return false;
  return true;
};

/** Human-readable label for a scoring key */
const getTypeLabel = (type: string): string => {
  // Case study sub-type keys like "caseStudy_mcq", "caseStudy_numerical" etc.
  if (type.startsWith("caseStudy_")) {
    const sub = type.replace("caseStudy_", "");
    const subLabels: Record<string, string> = {
      mcq: "MCQ",
      numerical: "Numerical",
      multiCorrect: "Multi-Select",
      matchList: "Match List",
      matchListOptionFormat: "Match Option Format",
      singleDigitInteger: "Single Digit Integer",
    };
    return `Passage Based — ${subLabels[sub] || sub}`;
  }
  switch (type) {
    case "mcq": return "Single Select Questions";
    case "numerical": return "Numerical Value Questions";
    case "multiCorrect": return "Multiple Select Questions";
    case "matchList": return "Match List Type Questions";
    case "matchListOptionFormat": return "Single Select Questions";
    case "caseStudy": return "Paragraph Based Questions";
    case "singleDigitInteger": return "Single Digit Integer";
    default: return type;
  }
};

const ScoreCalculationModal: React.FC<ScoreCalculationModalProps> = ({
  isOpen,
  onClose,
  results,
  scoring,
  questions = [],
  userAnswers = {},
}) => {
  const { correct, wrong, unattempted, score, maxScore } = results;

  const calculateCategoryBreakdown = () => {
    const breakdown: Record<
      string,
      { correct: number; wrong: number; unattempted: number; count: number; score: number; maxScore: number }
    > = {};

    // Initialise buckets for every configured scoring key
    Object.keys(scoring).forEach((type) => {
      // matchListOptionFormat maps visually to "mcq" bucket; caseStudy_* get their own bucket
      const displayType = type === "matchListOptionFormat" ? "mcq" : type;
      if (!breakdown[displayType]) {
        breakdown[displayType] = { correct: 0, wrong: 0, unattempted: 0, count: 0, score: 0, maxScore: 0 };
      }
    });

    questions.forEach((q) => {
      const userAnswer = userAnswers[q.id];
      const isCaseStudySub = !!(q as any)._caseStudyParentId;

      let displayType: string;
      let rule: any;

      if (isCaseStudySub) {
        // Prefer a sub-type specific rule, fall back to generic "caseStudy"
        const subKey = `caseStudy_${q.type}`;
        const lookupKey = subKey in scoring ? subKey : "caseStudy";
        rule = scoring[lookupKey];
        displayType = lookupKey; // e.g. "caseStudy_mcq" or "caseStudy"
      } else {
        displayType = q.type === "matchListOptionFormat" ? "mcq" : q.type;
        rule = scoring[q.type] || scoring["mcq"];
      }

      if (!rule || !breakdown[displayType]) return;

      breakdown[displayType].count++;
      const { marks, maxMarks } = calculateQuestionScore(q, userAnswer, rule);
      breakdown[displayType].score += marks;
      breakdown[displayType].maxScore += maxMarks;

      if (!isAttempted(userAnswer)) {
        breakdown[displayType].unattempted++;
      } else if (marks > 0) {
        breakdown[displayType].correct++;
      } else {
        breakdown[displayType].wrong++;
      }
    });

    return breakdown;
  };

  const hasNegativeMarking = Object.values(scoring).some((r) => r.incorrect < 0);
  const breakdown = calculateCategoryBreakdown();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-white dark:bg-neutral-900 p-0 thin-scroll">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Calculator className="size-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Score Calculation
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Overall Score */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
            <div className="text-center">
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">Your Score</p>
              <div className="text-4xl font-black text-indigo-700 dark:text-indigo-300">
                {results.score} / {results.maxScore}
              </div>
              {hasNegativeMarking && (
                <p className="text-xs text-indigo-500 mt-2">(Includes negative marking)</p>
              )}
            </div>
          </div>

          {/* Question Status Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-center">
              <CheckCircle className="size-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{correct}</div>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Correct</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/50 text-center">
              <XCircle className="size-5 text-red-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-red-700 dark:text-red-300">{wrong}</div>
              <div className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">Wrong</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 text-center">
              <MinusCircle className="size-5 text-amber-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-amber-700 dark:text-amber-300">{unattempted}</div>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Skipped</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          {Object.keys(breakdown).length > 0 && Object.values(breakdown).some((b) => b.count > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Score Breakdown by Question Type
                </h3>
              </div>

              <div className="space-y-3">
                {Object.keys(breakdown).map((type) => {
                  const count = breakdown[type];
                  if (!count || count.count === 0) return null;

                  // Resolve the scoring rule for this display key
                  const rules =
                    type === "mcq"
                      ? (scoring["mcq"] || scoring["matchListOptionFormat"])
                      : scoring[type];

                  if (!rules) return null;

                  const isCaseStudySub = type.startsWith("caseStudy_") && type !== "caseStudy";

                  return (
                    <div
                      key={type}
                      className={`bg-white dark:bg-zinc-800 p-4 rounded-xl border ${
                        isCaseStudySub ? "border-indigo-100 dark:border-indigo-800/40 ml-3 border-l-2 border-l-indigo-400" : "border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                            isCaseStudySub
                              ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                              : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                          }`}>
                            {isCaseStudySub ? "PASSAGE" : type.toUpperCase().slice(0, 3)}
                          </span>
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            {getTypeLabel(type)} — {count.count} q{count.count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {count.score} / {count.maxScore}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                          <CheckCircle className="size-3.5 text-emerald-600" />
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {count.correct} × {rules.correct >= 0 ? `+${rules.correct}` : rules.correct}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <XCircle className="size-3.5 text-red-600" />
                          <span className="text-red-700 dark:text-red-400">
                            {count.wrong} × {rules.incorrect >= 0 ? `+${rules.incorrect}` : rules.incorrect}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                          <MinusCircle className="size-3.5 text-amber-600" />
                          <span className="text-amber-700 dark:text-amber-400">
                            {count.unattempted} × {rules.unattempted >= 0 ? `+${rules.unattempted}` : rules.unattempted}
                          </span>
                        </div>
                      </div>

                      {"partialPerCorrect" in rules && rules.partialPerCorrect !== undefined && (
                        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700">
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Info className="size-3" />
                            <span>Partial: +{rules.partialPerCorrect} per correct option</span>
                          </div>
                        </div>
                      )}
                      {"partialPerMatch" in rules && rules.partialPerMatch !== undefined && (
                        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700">
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Info className="size-3" />
                            <span>Partial: +{rules.partialPerMatch} per correct match</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Formula Explanation */}
          {hasNegativeMarking && (
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-2">
                <Info className="size-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">How is the score calculated?</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Your final score is calculated by adding{" "}
                <span className="font-semibold text-emerald-600">+marks for correct answers</span>,{" "}
                <span className="font-semibold text-red-600">subtracting marks for incorrect answers</span>, and{" "}
                <span className="font-semibold text-amber-600">no deduction for unattempted questions</span>.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreCalculationModal;
