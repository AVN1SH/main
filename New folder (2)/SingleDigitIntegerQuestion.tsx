import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { NumericalTestQuestion } from "@/types/global";

interface SingleDigitIntegerQuestionProps {
  question: NumericalTestQuestion;
  currentAnswer: string;
  onAnswer: (answer: string) => void;
  isSubmitted: boolean;
  isDisabled?: boolean;
}

const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export const SingleDigitIntegerQuestion: React.FC<SingleDigitIntegerQuestionProps> = ({
  question,
  currentAnswer,
  onAnswer,
  isSubmitted,
  isDisabled = false,
}) => {
  const displayValue = currentAnswer || "";
  const isCorrect =
    isSubmitted && displayValue.trim() === question.correctAnswer.trim();
  const isWrong = isSubmitted && displayValue && !isCorrect;

  if (isSubmitted) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium shadow-sm ${
              isCorrect
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <span className="text-sm">Your Answer:</span>
            <span className="font-bold font-mono text-xl">{displayValue || "—"}</span>
            {isCorrect ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : (
              <XCircle size={18} className="text-red-600" />
            )}
          </div>
          {isWrong && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium shadow-sm bg-emerald-50 border border-emerald-200 text-emerald-800">
              <span className="text-sm">Correct Answer:</span>
              <span className="font-bold font-mono text-xl">
                {question.correctAnswer}
              </span>
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-xs">
        {/* Display */}
        <div className="relative mb-4">
          <div
            className={`w-full px-4 py-4 text-3xl font-mono text-center bg-white border-2 rounded-xl shadow-sm transition-all min-h-[60px] flex items-center justify-center ${
              displayValue
                ? "border-indigo-400 ring-2 ring-indigo-100"
                : "border-slate-200"
            }`}
          >
            {displayValue || (
              <span className="text-slate-300 text-lg font-sans">
                Select a digit (0-9)
              </span>
            )}
          </div>
          {displayValue && !isDisabled && (
            <button
              onClick={() => onAnswer("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Digit grid */}
        <div className="grid grid-cols-5 gap-2">
          {digits.map((digit) => {
            const isSelected = displayValue === digit;
            return (
              <button
                key={digit}
                onClick={() => {
                  if (isDisabled) return;
                  onAnswer(digit);
                }}
                disabled={isDisabled}
                className={`px-4 py-3 text-lg font-bold rounded-xl transition-all duration-150 shadow-sm ${
                  isDisabled
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : isSelected
                      ? "bg-indigo-600 text-white scale-105 shadow-md"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 hover:scale-105 active:scale-95"
                }`}
              >
                {digit}
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-3 font-medium">
          Select a single digit (0–9). No decimals or negative values.
        </p>
      </div>
    </div>
  );
};
