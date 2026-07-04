"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  getFilteredCourseOptions,
  getNextStep,
  loadInitialSteps,
  resetStepCache,
} from "@/utils/getNextStep";
import type { BotResponse } from "@/types/global";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Selection {
  course?: string;
  subject?: string;
  chapter?: string;
  board?: string;
  paperType?: string;
  language?: string;
}

type StepKey =
  | "class"
  | "subject"
  | "chapter"
  | "board"
  | "paperType"
  | "language";
const STEP_KEYS: readonly StepKey[] = [
  "class",
  "board",
  "subject",
  "paperType",
  "chapter",
  "language",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const getCourseIcon = (name: string): string => {
  const map: Record<string, string> = {
    "12th": "/images/courses/12th.png",
    "11th": "/images/courses/11th.png",
    "10th": "/images/courses/10th.png",
    "9th": "/images/courses/9th.png",
    "8th": "/images/courses/8th.png",
    "7th": "/images/courses/7th.png",
    "jee-main": "/images/courses/jee-main.png",
    "jee-advanced": "/images/courses/jee-advanced.png",
    neet: "/images/courses/neet.png",
    cuet: "/images/courses/cuet.png",
  };
  return map[name] || "/images/subjects/book.png";
};

const getBoardIcon = (name: string): string => {
  const map: Record<string, string> = {
    cbse: "/images/boards/cbse.png",
    icse: "/images/boards/icse.png",
    bseb: "/images/boards/bseb.png",
    CBSE: "/images/boards/cbse.png",
    ICSE: "/images/boards/icse.png",
    BSEB: "/images/boards/bseb.png",
  };
  return map[name] || map[name.toUpperCase()] || "/images/subjects/book.png";
};

const getPaperTypeIcon = (name: string): string => {
  const map: Record<string, string> = {
    "Chapter Test": "/images/paper-types/chapter-test.png",
    "Subject Test": "/images/paper-types/subject-test.png",
    "Full Syllabus Test": "/images/paper-types/full-sylabus-test.png",
    "Sample Paper": "/images/paper-types/chapter-test.png",
  };
  return map[name] || "/images/subjects/book.png";
};

const getLanguageIcon = (name: string): string => {
  const map: Record<string, string> = {
    English: "/images/languages/english.png",
    Hindi: "/images/languages/hindi.png",
    english: "/images/languages/english.png",
    hindi: "/images/languages/hindi.png",
  };
  return map[name] || "/images/subjects/book.png";
};

const getCourseTag = (name: string): string | undefined => {
  const map: Record<string, string> = {
    "12th": "Board Exam",
    "11th": "Board Exam",
    "10th": "Board Exam",
    "9th": "Foundation",
    "8th": "Foundation",
    "7th": "Foundation",
    CUET: "Competitive",
    "JEE Main": "Competitive",
    "JEE Advanced": "Competitive",
    NEET: "Competitive",
  };
  return map[name];
};

const getSubjectIcon = (name: string): string => {
  const map: Record<string, string> = {
    Physics: "/images/subjects/physics.png",
    Chemistry: "/images/subjects/chemistry.png",
    Mathematics: "/images/subjects/mathematics.png",
    Maths: "/images/subjects/mathematics.png",
    Biology: "/images/subjects/biology.png",
    Science: "/images/subjects/science.png",
    English: "/images/subjects/english.png",
    "Social Science": "/images/subjects/sociology.png",
    Economics: "/images/subjects/economics.png",
    History: "/images/subjects/history.png",
    Geography: "/images/subjects/geography.png",
    "Business Studies": "/images/subjects/business.png",
    Accountancy: "/images/subjects/accountancy.png",
    "Computer Science": "/images/subjects/code.png",
  };
  return map[name] || "/images/subjects/book.png";
};

const getSubjectColor = (name: string): string => {
  const map: Record<string, string> = {
    Physics: "blue",
    Chemistry: "purple",
    Mathematics: "emerald",
    Biology: "rose",
    Science: "cyan",
    English: "indigo",
    "Social Science": "amber",
  };
  return map[name] || "blue";
};

const getKeyLabel = (key: StepKey): string => {
  const map: Record<StepKey, string> = {
    class: "Course",
    subject: "Subject",
    chapter: "Chapter",
    board: "Board",
    paperType: "Paper Type",
    language: "Language",
  };
  return map[key];
};

/* ------------------------------------------------------------------ */
/*  Style helpers                                                      */
/* ------------------------------------------------------------------ */

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  rose: { bg: "bg-rose-50", text: "text-rose-600" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
};

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

const CheckIcon = ({ className = "size-3" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronRight = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-4.35-4.35m1.35-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
    />
  </svg>
);

const SparklesIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
    <path d="M19 14l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" />
    <path d="M5 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
  </svg>
);

const SpinnerIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-90"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const FloatingPill = ({
  label,
  stepNumber,
  active,
  completed,
  disabled,
  onClick,
}: {
  label: string;
  stepNumber: number;
  active: boolean;
  completed: boolean;
  disabled: boolean;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={disabled ? undefined : { scale: 1.05 }}
    whileTap={disabled ? undefined : { scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-semibold transition-all whitespace-nowrap ${
      active
        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
        : completed
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300"
          : disabled
            ? "bg-white text-slate-400 border-slate-100 cursor-not-allowed"
            : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
    }`}
  >
    <span
      className={`flex items-center justify-center size-5 rounded-full text-[10px] font-bold shrink-0 ${
        active
          ? "bg-white/20 text-white"
          : completed
            ? "bg-emerald-500 text-white"
            : "bg-slate-100 text-slate-500"
      }`}
    >
      {completed ? <CheckIcon className="size-2.5" /> : stepNumber}
    </span>
    <span>{label}</span>
  </motion.button>
);

const Card = ({
  title,
  subtitle,
  icon,
  active,
  onClick,
}: {
  title: string;
  subtitle?: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) => (
  <motion.button
    layout
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`relative flex flex-col items-center gap-1.5 p-4 rounded-2xl border transition-all w-[100px] sm:w-[120px] shrink-0 ${
      active
        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-200"
        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:shadow-md"
    }`}
  >
    <span className="relative size-10 sm:size-12">
      <Image
        src={icon}
        alt={title}
        fill
        className="object-contain"
        sizes="48px"
      />
    </span>
    <span className="text-xs sm:text-sm font-bold text-center leading-tight line-clamp-2">
      {title}
    </span>
    {subtitle && (
      <span
        className={`text-xs font-medium ${active ? "text-white/80" : "text-slate-400"}`}
      >
        {subtitle}
      </span>
    )}
    {active && (
      <motion.span
        layoutId="active-indicator"
        className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-5 bg-emerald-400 rounded-full border-2 border-white"
      >
        <CheckIcon className="size-2.5 text-white" />
      </motion.span>
    )}
  </motion.button>
);

const ChapterCard = ({
  label,
  index,
  active,
  onClick,
}: {
  label: string;
  index: number;
  active: boolean;
  onClick: () => void;
}) => (
  <motion.button
    layout
    whileHover={{ x: 4, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`group flex items-center gap-3 sm:gap-4 p-4 rounded-2xl border text-left transition-all w-full min-w-0 ${
      active
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent shadow-lg shadow-indigo-200"
        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30"
    }`}
  >
    <span
      className={`flex items-center justify-center shrink-0 size-10 sm:size-11 rounded-xl font-bold text-sm transition-colors ${
        active
          ? "bg-white/20 text-white"
          : "bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 group-hover:from-indigo-100 group-hover:to-purple-100"
      }`}
    >
      {String(index + 1).padStart(2, "0")}
    </span>
    <p
      className={`flex-1 min-w-0 font-semibold text-sm sm:text-[15px] leading-snug ${
        active ? "text-white" : "text-slate-800"
      }`}
    >
      {label}
    </p>
    <span
      className={`shrink-0 flex items-center justify-center size-7 sm:size-8 rounded-full border-2 transition-all ${
        active
          ? "bg-white border-white"
          : "border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50"
      }`}
    >
      {active ? (
        <CheckIcon className="size-3.5 text-indigo-600" />
      ) : (
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400" />
      )}
    </span>
  </motion.button>
);

const OptionPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all ${
      active
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-200"
        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:shadow-sm"
    }`}
  >
    {label}
  </motion.button>
);

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export interface QuickSetupFlowProps {
  title?: string;
  description?: string;
  onGenerate?: (selection: Selection) => void;
  generateLabel?: string;
  /** Restrict flow to this step depth. Stops after this step is selected. */
  level?: StepKey;
  /** When set, courses that don't support this paper type are hidden and the
   *  paperType step is auto-filled without showing it in the UI. */
  defaultPaperType?: string;
}

const QuickSetupFlow = ({
  title = "QUICK SETUP",
  description = "Choose your course and preferences to get started",
  onGenerate,
  generateLabel = "Pass to AI",
  level,
  defaultPaperType,
}: QuickSetupFlowProps) => {
  const [collectedData, setCollectedData] = useState<
    { key: string; value: string }[]
  >([]);
  const [currentStep, setCurrentStep] = useState<BotResponse | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chapterQuery, setChapterQuery] = useState("");
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const visitedPathRef = useRef<StepKey[]>(["class"]);

  const addToPath = (key: string) => {
    if (STEP_KEYS.includes(key as StepKey)) {
      visitedPathRef.current = [...visitedPathRef.current, key as StepKey];
    }
  };

  const truncatePathTo = (targetKey: string) => {
    const idx = visitedPathRef.current.indexOf(targetKey as StepKey);
    if (idx !== -1) {
      visitedPathRef.current = visitedPathRef.current.slice(0, idx + 1);
    }
  };

  const withDefaultPaperType = (data: { key: string; value: string }[]) => {
    if (!defaultPaperType) return data;
    if (data.some((d) => d.key === "paperType")) return data;
    return [...data, { key: "paperType" as const, value: defaultPaperType }];
  };

  const collectedMap = new Map(collectedData.map((d) => [d.key, d.value]));
  const currentKeyName = (currentStep?.key_name || "class") as StepKey;
  const completedKeys = new Set(collectedData.map((d) => d.key));
  const pillSteps = visitedPathRef.current;

  useEffect(() => {
    setChapterQuery("");
  }, [currentStep?.key_name]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        resetStepCache();
        const opts = await getFilteredCourseOptions(defaultPaperType);
        setCourseOptions(opts);
      } catch {
        setCourseOptions(["10th", "12th", "NEET", "JEE Main", "JEE Advanced"]);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [defaultPaperType]);

  const selectCourse = async (course: string) => {
    const newData = [{ key: "class", value: course }];
    setCollectedData(newData);
    visitedPathRef.current = ["class"];
    setIsComplete(false);

    if (level === "class") {
      setIsComplete(true);
      return;
    }

    setIsLoading(true);
    try {
      const next = await getNextStep(
        withDefaultPaperType(newData).map((d) => ({
          id: `${d.key}-${Date.now()}`,
          key: d.key,
          value: d.value,
        })),
      );
      if (next.finished) {
        setIsComplete(true);
      } else {
        addToPath(next.key_name);
        setCurrentStep(next);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const selectOption = async (value: string) => {
    if (!currentStep) return;
    if(isComplete) {
      const keyName = currentStep.key_name;
      const updatedData = collectedData.map((d) => {
        if (d.key === keyName) {
          return { key: keyName, value };
        }
        return d;
      });
      setCollectedData(updatedData);
      return;
    }
    const keyName = currentStep.key_name;
    const newData = [...collectedData, { key: keyName, value }];
    setCollectedData(newData);

    if (level && keyName === level) {
      setIsComplete(true);
      return;
    }

    setIsLoading(true);
    setChapterQuery("");
    try {
      const next = await getNextStep(
        withDefaultPaperType(newData).map((d) => ({
          id: `${d.key}-${Date.now()}`,
          key: d.key,
          value: d.value,
        })),
      );
      if (next.finished) {
        setIsComplete(true);
      } else {
        addToPath(next.key_name);
        setCurrentStep(next);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = async () => {
    const truncated = collectedData.slice(0, -1);
    setCollectedData(truncated);
    setIsComplete(false);
    visitedPathRef.current = visitedPathRef.current.slice(0, -1);

    if (truncated.length === 0) {
      setCurrentStep(null);
      setChapterQuery("");
      return;
    }

    setIsLoading(true);
    try {
      const next = await getNextStep(
        withDefaultPaperType(truncated).map((d) => ({
          id: `${d.key}-${Date.now()}`,
          key: d.key,
          value: d.value,
        })),
      );
      // Path already ends at the right step after the slice above — `next`
      // will resolve back to that same step since its answer was just
      // removed. Do NOT addToPath here, or it gets pushed twice (duplicate
      // React key / "repeated step" glitch).
      setCurrentStep(next);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCollectedData([]);
    setCurrentStep(null);
    setIsComplete(false);
    setChapterQuery("");
  };

  const handleGenerate = () => {
    if (!onGenerate) return;
    const selection: Selection = {};
    for (const d of collectedData) {
      if (d.key === "class") selection.course = d.value;
      else if (d.key === "subject") selection.subject = d.value;
      else if (d.key === "chapter") selection.chapter = d.value;
      else if (d.key === "board") selection.board = d.value;
      else if (d.key === "paperType") selection.paperType = d.value;
      else if (d.key === "language") selection.language = d.value;
    }
    if (defaultPaperType && !selection.paperType) {
      selection.paperType = defaultPaperType;
    }
    onGenerate(selection);
  };

  const courseCards = (
    <div className="flex flex-wrap gap-3">
      {courseOptions.map((name) => {
        const id = name.toLowerCase().replace(/\s+/g, "-");
        return (
          <Card
            key={id}
            title={name}
            subtitle={getCourseTag(name)}
            icon={getCourseIcon(id)}
            active={collectedMap.get("class") === name}
            onClick={() => selectCourse(name)}
          />
        );
      })}
    </div>
  );

  const subjectCards = (options: string[]) => (
    <div className="flex flex-wrap gap-3">
      {options.map((name) => {
        const id = name.toLowerCase().replace(/\s+/g, "-");
        return (
          <Card
            key={id}
            title={name}
            icon={getSubjectIcon(name)}
            active={collectedMap.get("subject") === name}
            onClick={() => selectOption(name)}
          />
        );
      })}
    </div>
  );

  const chapterList = (options: string[]) => {
    const filtered = options.filter((c) =>
      c.toLowerCase().includes(chapterQuery.toLowerCase()),
    );
    return (
      <div>
        {options.length > 5 && (
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={chapterQuery}
              onChange={(e) => setChapterQuery(e.target.value)}
              placeholder={`Search in ${options.length} chapters...`}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>
        )}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((name, i) => (
              <ChapterCard
                key={`ch-${i}`}
                label={name}
                index={i}
                active={collectedMap.get("chapter") === name}
                onClick={() => selectOption(name)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-sm text-slate-400">
            No chapters match &ldquo;{chapterQuery}&rdquo;
          </div>
        )}
      </div>
    );
  };

  const boardCards = (options: string[], keyName: string) => (
    <div className="flex flex-wrap gap-3">
      {options.map((name) => {
        const icon = getBoardIcon(name);
        const hasImg = icon !== "/images/subjects/book.png";
        return hasImg ? (
          <Card
            key={name}
            title={name}
            icon={icon}
            active={collectedMap.get(keyName) === name}
            onClick={() => selectOption(name)}
          />
        ) : (
          <OptionPill
            key={name}
            label={name}
            active={collectedMap.get(keyName) === name}
            onClick={() => selectOption(name)}
          />
        );
      })}
    </div>
  );

  const paperTypeCards = (options: string[], keyName: string) => (
    <div className="flex flex-wrap gap-3">
      {options.map((name) => {
        const icon = getPaperTypeIcon(name);
        const hasImg = icon !== "/images/subjects/book.png";
        return hasImg ? (
          <Card
            key={name}
            title={name}
            icon={icon}
            active={collectedMap.get(keyName) === name}
            onClick={() => selectOption(name)}
          />
        ) : (
          <OptionPill
            key={name}
            label={name}
            active={collectedMap.get(keyName) === name}
            onClick={() => selectOption(name)}
          />
        );
      })}
    </div>
  );

  const languageCards = (options: string[], keyName: string) => (
    <div className="flex flex-wrap gap-3">
      {options.map((name) => {
        const icon = getLanguageIcon(name);
        const hasImg = icon !== "/images/subjects/book.png";
        return hasImg ? (
          <Card
            key={name}
            title={name}
            icon={icon}
            active={collectedMap.get(keyName) === name}
            onClick={() => selectOption(name)}
          />
        ) : (
          <OptionPill
            key={name}
            label={name}
            active={collectedMap.get(keyName) === name}
            onClick={() => selectOption(name)}
          />
        );
      })}
    </div>
  );

  const optionPills = (options: string[], keyName: string) => (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {options.map((opt) => (
        <OptionPill
          key={opt}
          label={opt}
          active={collectedMap.get(keyName) === opt}
          onClick={() => selectOption(opt)}
        />
      ))}
    </div>
  );

  const navigateToStep = (targetKey: string) => {
    const idx = collectedData.findIndex((d) => d.key === targetKey);
    if (idx === -1) return;
    const truncated = collectedData.slice(0, idx);
    setCollectedData(truncated);
    setIsComplete(false);
    truncatePathTo(targetKey);
    if (truncated.length === 0) {
      setCurrentStep(null);
      setChapterQuery("");
      return;
    }
    setIsLoading(true);
    getNextStep(
      withDefaultPaperType(truncated).map((d) => ({
        id: `nav-${d.key}-${Date.now()}`,
        key: d.key,
        value: d.value,
      })),
    )
      .then((next) => {
        // Same reasoning as goBack: truncatePathTo already leaves the path
        // ending at targetKey, and `next` will resolve back to that same
        // step. Skip addToPath to avoid a duplicate key in pillSteps.
        if (!next.finished) {
          setCurrentStep(next);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const renderStepContent = () => {
    if (!currentStep) return courseCards;

    const keyName = currentStep.key_name;
    const options = currentStep.options;

    if (keyName === "subject") return subjectCards(options);
    if (keyName === "chapter") return chapterList(options);
    if (keyName === "board") return boardCards(options, keyName);
    if (keyName === "paperType") return paperTypeCards(options, keyName);
    if (keyName === "language") return languageCards(options, keyName);
    return optionPills(options, keyName);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-slate-800 antialiased">
      <div className="max-w-[2160px] mx-auto">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-sm md:text-base text-zinc-700 mt-1">
            {description}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {pillSteps.map((s, i) => (
                <React.Fragment key={s}>
                  {i > 0 && (
                    <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                  )}
                  <FloatingPill
                    label={getKeyLabel(s)}
                    stepNumber={i + 1}
                    active={s === currentKeyName}
                    completed={completedKeys.has(s)}
                    disabled={!completedKeys.has(s)}
                    onClick={() => navigateToStep(s)}
                  />
                </React.Fragment>
              ))}

              <div className="ml-auto flex items-center gap-3">
                {collectedData.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={reset}
                    className="text-xs text-slate-500 hover:text-red-600 transition-colors font-medium"
                  >
                    Reset
                  </motion.button>
                )}
              </div>
            </div>

            <div className="relative min-h-[180px] max-h-[340px] overflow-y-auto thin-scroll pt-2 overflow-x-hidden">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center w-full py-16"
                  >
                    <SpinnerIcon className="w-6 h-6 text-indigo-600 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentStep?.key_name || "course"}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {collectedData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Selected:</span>
                    {collectedData.map((d, i) => (
                      <React.Fragment key={d.key}>
                        {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
                        <button
                          onClick={() => {
                            if (d.key !== "class" && !isComplete) goBack();
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold transition-colors ${
                            d.key === "subject"
                              ? `${COLOR_MAP[getSubjectColor(d.value)]?.bg || "bg-indigo-50"} ${COLOR_MAP[getSubjectColor(d.value)]?.text || "text-indigo-700"}`
                              : d.key === "chapter"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-indigo-50 text-indigo-700"
                          } ${!isComplete && d.key !== "class" ? "hover:opacity-80 cursor-pointer" : ""}`}
                          disabled={d.key === "class" || isComplete}
                        >
                          {d.value}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isComplete && collectedData.length > 0 && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={goBack}
                        disabled={collectedData.length === 0}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-40"
                      >
                        Back
                      </motion.button>
                    )}

                    {isComplete && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerate}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
                      >
                        <SparklesIcon className="size-4" />
                        {generateLabel}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSetupFlow;
