"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info, CheckCircle, XCircle, MinusCircle, Clock, FileText, BookOpen } from "lucide-react";
import { ScoringConfig, TestQuestionType } from "@/types/global";

interface TestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  examType: string;
  grade: string;
  scoring: ScoringConfig;
  totalQuestions: number;
  totalTime?: number;
  questionTypes?: TestQuestionType[];
}

const TestInfoModal: React.FC<TestInfoModalProps> = ({
  isOpen,
  onClose,
  examType,
  grade,
  scoring,
  totalQuestions,
  totalTime,
  questionTypes,
}) => {
  const getTypeLabel = (type: string): string => {
    if (type.startsWith("caseStudy_")) {
      const sub = type.replace("caseStudy_", "");
      const subLabels: Record<string, string> = {
        mcq: "MCQ Sub-Questions",
        numerical: "Numerical Sub-Questions",
        multiCorrect: "Multi-Correct Sub-Questions",
        matchList: "Match List Sub-Questions",
        matchListOptionFormat: "Match Option Format Sub-Questions",
        singleDigitInteger: "Single Digit Integer Sub-Questions",
      };
      return subLabels[sub] || sub;
    }
    switch (type) {
      case "mcq": return "Single Select Questions";
      case "numerical": return "Numerical Value Questions";
      case "multiCorrect": return "Multiple Select Questions";
      case "matchList": return "Match List Type Questions";
      case "matchListOptionFormat": return "Single Select Questions";
      case "caseStudy": return "Paragraph Based Questions (Default)";
      default: return type;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
    return `${minutes} minutes`;
  };

  const questionTypeSet = questionTypes ? new Set(questionTypes) : null;
  // Top-level scoring entries (exclude caseStudy_* — shown nested under caseStudy)
  const scoringEntries = Object.entries(scoring).filter(
    ([type]) =>
      !type.startsWith("caseStudy_") &&
      (!questionTypeSet || questionTypeSet.has(type as TestQuestionType))
  );
  // Sub-type overrides for case study sub-questions
  const caseStudySubEntries = Object.entries(scoring).filter(
    ([type]) => type.startsWith("caseStudy_")
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-white dark:bg-neutral-900 p-0 thin-scroll">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Info className="size-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Test Instructions
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Test Overview */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="size-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                Test Overview
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Exam Type:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{examType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Grade Level:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{grade.charAt(0).toUpperCase() + grade.slice(1).replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Total Questions:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalQuestions}</span>
              </div>
              {totalTime && (
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Total Time:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatTime(totalTime)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Marking Scheme */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-1 bg-emerald-500 rounded-full" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Marking Scheme
              </h3>
            </div>

            <div className="space-y-3">
              {scoringEntries.map(([type, rules]) => {
                if (type === "matchListOptionFormat") return null;
                const isCS = type === "caseStudy";
                return (
                  <div key={type}>
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                          {type}
                        </span>
                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          {getTypeLabel(type)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                          <CheckCircle className="size-4 text-emerald-600" />
                          <div>
                            <span className="text-emerald-600 font-bold">{rules.correct >= 0 ? `+${rules.correct}` : rules.correct}</span>
                            <span className="text-emerald-700 dark:text-emerald-400 ml-1">Correct</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <XCircle className="size-4 text-red-600" />
                          <div>
                            <span className="text-red-600 font-bold">{rules.incorrect >= 0 ? `+${rules.incorrect}` : rules.incorrect}</span>
                            <span className="text-red-700 dark:text-red-400 ml-1">Wrong</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                          <MinusCircle className="size-4 text-amber-600" />
                          <div>
                            <span className="text-amber-600 font-bold">{rules.unattempted >= 0 ? `+${rules.unattempted}` : rules.unattempted}</span>
                            <span className="text-amber-700 dark:text-amber-400 ml-1">Skip</span>
                          </div>
                        </div>
                      </div>

                      {"partialPerCorrect" in rules && rules.partialPerCorrect !== undefined && (
                        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400">
                          {isCS
                            ? `Default partial: +${rules.partialPerCorrect} per sub-question (when no sub-type override)`
                            : `Partial: +${rules.partialPerCorrect} per correct option`}
                        </div>
                      )}
                      {"partialPerMatch" in rules && rules.partialPerMatch !== undefined && (
                        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400">
                          Partial: +{rules.partialPerMatch} per correct match
                        </div>
                      )}
                    </div>

                    {/* Case Study sub-type overrides — shown indented below the parent caseStudy card */}
                    {isCS && caseStudySubEntries.length > 0 && (
                      <div className="ml-4 mt-2 space-y-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <BookOpen className="size-3 text-indigo-400" />
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Sub-Question Type Overrides</span>
                        </div>
                        {caseStudySubEntries.map(([subKey, subRules]) => (
                          <div key={subKey} className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/40">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                                {subKey.replace("caseStudy_", "")}
                              </span>
                              <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                {getTypeLabel(subKey)}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="flex items-center gap-1 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                <CheckCircle className="size-3 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">{subRules.correct >= 0 ? `+${subRules.correct}` : subRules.correct}</span>
                              </div>
                              <div className="flex items-center gap-1 p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20">
                                <XCircle className="size-3 text-red-600" />
                                <span className="text-red-700 font-bold">{subRules.incorrect >= 0 ? `+${subRules.incorrect}` : subRules.incorrect}</span>
                              </div>
                              <div className="flex items-center gap-1 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                <MinusCircle className="size-3 text-amber-600" />
                                <span className="text-amber-700 font-bold">{subRules.unattempted >= 0 ? `+${subRules.unattempted}` : subRules.unattempted}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* General Instructions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-1 bg-amber-500 rounded-full" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                General Instructions
              </h3>
            </div>

            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">1.</span>
                <span>Read all questions carefully before answering.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">2.</span>
                <span>Manage your time effectively across all questions.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">3.</span>
                <span>
                  For Multiple Choice questions, select only one correct answer.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">4.</span>
                <span>
                  For Numerical questions, enter your answer as a number (decimals accepted where applicable).
                </span>
              </li>
              {scoringEntries.some(([_, rules]) => "partialPerCorrect" in rules || "partialPerMatch" in rules) && (
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">5.</span>
                  <span>
                    Partial credit may be awarded for partially correct answers.
                  </span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">{scoringEntries.some(([_, rules]) => "partialPerCorrect" in rules || "partialPerMatch" in rules) ? "6." : "5."}</span>
                <span>You can navigate between questions using the question navigator.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">{scoringEntries.some(([_, rules]) => "partialPerCorrect" in rules || "partialPerMatch" in rules) ? "7." : "6."}</span>
                <span>Click Finish when you are ready to submit your test.</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestInfoModal;
