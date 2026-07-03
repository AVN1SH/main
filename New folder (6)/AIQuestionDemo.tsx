"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, CheckCircle2, XCircle, Loader2, Zap } from "lucide-react";

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

const QUICK_TOPICS = [
  "Thermodynamics",
  "Photosynthesis",
  "Gravitation",
  "Quadratic Equations",
  "French Revolution",
  "Electrochemistry",
  "Newton's Laws",
  "Probability",
];

// Typewriter hook
function useTypewriter(text: string, speed = 14, active = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || !text) {
      setDisplayed("");
      setDone(false);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, active, speed]);

  return { displayed, done };
}

const AIQuestionDemo = () => {
  const [topic, setTopic] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "typing" | "ready" | "answered">("idle");
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { displayed, done } = useTypewriter(question?.question ?? "", 14, phase === "typing");

  useEffect(() => {
    if (done && phase === "typing") setPhase("ready");
  }, [done, phase]);

  const handleGenerate = async () => {
    const t = topic.trim();
    if (!t || phase === "loading" || phase === "typing") return;

    setPhase("loading");
    setError(null);
    setSelected(null);
    setQuestion(null);

    try {
      const res = await fetch("/api/demo/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data: GeneratedQuestion = await res.json();
      if (!data.question || !data.options?.length) throw new Error("Invalid response");
      setQuestion(data);
      setPhase("typing");
    } catch {
      setError("Couldn't generate the question. Please try again.");
      setPhase("idle");
    }
  };

  const handleSelect = (idx: number) => {
    if (phase !== "ready" && phase !== "answered") return;
    if (selected !== null) return;
    setSelected(idx);
    setPhase("answered");
  };

  const handleReset = () => {
    setPhase("idle");
    setSelected(null);
    setQuestion(null);
    setError(null);
    setTopic("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const isCorrect = selected !== null && selected === question?.correctIndex;

  return (
    <div className="w-full bg-white py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
      <div className="max-w-[2160px] mx-auto">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 ml-1">
              Live AI Demo
            </span>
            <span className="flex items-center gap-1 ml-1">
              <span className="relative flex size-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-indigo-500" />
              </span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mt-3">
            Ask our AI to generate a question
          </h2>
          <p className="mt-2 text-base text-slate-500 max-w-xl">
            Type any topic — our AI generates a real exam-quality MCQ instantly using the same engine powering Sarthaks AI.
          </p>
        </div>

        {/* ── Input ── */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex-1 min-w-0 relative">
            <input
              ref={inputRef}
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && topic.trim() && handleGenerate()}
              placeholder="e.g. Thermodynamics, Photosynthesis, Newton's Laws…"
              disabled={phase !== "idle"}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 bg-slate-50/80 disabled:opacity-60 transition-all"
            />
            {topic && phase === "idle" && (
              <button
                onClick={() => setTopic("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <XCircle size={16} />
              </button>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || phase === "loading" || phase === "typing"}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shrink-0 shadow-md shadow-indigo-200"
          >
            <Sparkles size={15} />
            Generate
          </button>

          {phase !== "idle" && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shrink-0"
            >
              <RefreshCw size={14} />
              Reset
            </button>
          )}
        </div>

        {/* ── Quick Topic Pills ── */}
        {phase === "idle" && (
          <div className="flex flex-wrap gap-2 mb-6">
            {QUICK_TOPICS.map((t) => (
              <motion.button
                key={t}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTopic(t)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  topic === t
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 bg-white"
                }`}
              >
                {t}
              </motion.button>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl"
          >
            <XCircle size={16} className="shrink-0" />
            {error}
          </motion.div>
        )}

        {/* ── Question Card ── */}
        <AnimatePresence mode="wait">
          {phase !== "idle" && (
            <motion.div
              key={question?.question ?? "loading"}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
            >
              {/* Card top bar */}
              <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 px-5 py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-white/80" />
                  <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
                    {phase === "loading"
                      ? "AI is thinking…"
                      : `AI Generated · ${question?.topic ?? ""}`}
                  </span>
                </div>
                <span className="text-xs font-bold bg-white/25 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
                  MCQ
                </span>
              </div>

              {/* Loading skeleton */}
              {phase === "loading" && (
                <div className="bg-white px-5 py-6">
                  <div className="flex items-center gap-2.5 text-indigo-600 mb-4">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm font-semibold">Generating a real question for "{topic}"…</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-4 w-full bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-4 w-4/5 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-11 bg-slate-100 rounded-xl animate-pulse"
                        style={{ animationDelay: `${i * 90}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Question + Options */}
              {(phase === "typing" || phase === "ready" || phase === "answered") && question && (
                <div className="bg-white px-5 py-5">
                  {/* Question text with cursor */}
                  <p className="text-sm sm:text-[15px] font-semibold text-slate-800 leading-relaxed mb-5 min-h-[3rem]">
                    {displayed}
                    {phase === "typing" && !done && (
                      <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 align-middle animate-pulse rounded-full" />
                    )}
                  </p>

                  {/* Options – show after typing finishes */}
                  {(phase === "ready" || phase === "answered") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {question.options.map((opt, idx) => {
                        const isSelected = selected === idx;
                        const isCorrectOpt = idx === question.correctIndex;
                        let cls = "border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer";
                        let dotCls = "border-slate-300 text-slate-400";

                        if (phase === "answered") {
                          if (isCorrectOpt) {
                            cls = "border-emerald-400 bg-emerald-50 text-emerald-800 cursor-default";
                            dotCls = "border-emerald-500 bg-emerald-500 text-white";
                          } else if (isSelected) {
                            cls = "border-rose-400 bg-rose-50 text-rose-700 cursor-default";
                            dotCls = "border-rose-400 bg-rose-400 text-white";
                          } else {
                            cls = "border-slate-100 text-slate-400 cursor-default opacity-60";
                          }
                        }

                        return (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            onClick={() => handleSelect(idx)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left border transition-all ${cls}`}
                          >
                            <span className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${dotCls}`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {phase === "answered" && isCorrectOpt && (
                              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                            )}
                            {phase === "answered" && isSelected && !isCorrectOpt && (
                              <XCircle size={14} className="text-rose-400 shrink-0" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Explanation slide-in */}
              <AnimatePresence>
                {phase === "answered" && question && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`overflow-hidden border-t ${isCorrect ? "border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50" : "border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50"}`}
                  >
                    <div className="px-5 py-4 flex items-start gap-3">
                      {isCorrect
                        ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        : <XCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                      }
                      <div>
                        <p className={`text-sm font-bold mb-1 ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                          {isCorrect ? "Correct! 🎉" : "Not quite — here's the explanation:"}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">{question.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle placeholder */}
        {phase === "idle" && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 rounded-2xl px-6 py-10 text-center bg-slate-50/50"
          >
            <div className="size-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-1">
              <Sparkles size={20} className="text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              Pick a topic above or type your own, then click{" "}
              <span className="text-indigo-600">Generate</span>
            </p>
            <p className="text-xs text-slate-400">Powered by the same Gemini AI engine used inside Sarthaks AI</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIQuestionDemo;
