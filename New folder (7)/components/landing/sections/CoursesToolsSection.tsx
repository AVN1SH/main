"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getFilteredCourseOptions } from "@/utils/getNextStep";
import QuickSetupFlow, { Selection } from "./QuickSetupFlow";

/* ─────────────────────────────────────────────────────────────────────
   TYPES & CONSTANTS
───────────────────────────────────────────────────────────────────── */

interface CourseCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  tag?: { text: string; type: "new" | "trending" };
}

const COURSE_ICONS: Record<string, string> = {
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

const COURSE_TAGS: Record<string, { text: string; type: "new" | "trending" }> =
  {
    "12th": { text: "Board Exam", type: "trending" },
    "11th": { text: "Board Exam", type: "trending" },
    "10th": { text: "Board Exam", type: "trending" },
    "9th": { text: "Foundation", type: "new" },
    "8th": { text: "Foundation", type: "new" },
    "7th": { text: "Foundation", type: "new" },
  };

const SCHOOL_NAMES = new Set(["12th", "11th", "10th", "9th", "8th", "7th"]);
const toCourseId = (n: string) => n.toLowerCase().replace(/\s+/g, "-");
const getDesc = (n: string) =>
  SCHOOL_NAMES.has(n)
    ? `Class ${n.replace(/th$/, "")} sample papers & tests`
    : `${n} exam pattern mock tests`;

/* ─────────────────────────────────────────────────────────────────────
   TAB ICONS — SVG icons matching NoteGPT icon style
───────────────────────────────────────────────────────────────────── */

const IconSamplePaper = ({ active }: { active: boolean }) => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#fff" : "#64748b"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const IconTest = ({ active }: { active: boolean }) => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#fff" : "#64748b"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

// Sub-tab icons for test types
const IconFullSyllabus = ({ active }: { active: boolean }) => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#3b82f6" : "#94a3b8"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

const IconSubjectTest = ({ active }: { active: boolean }) => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#3b82f6" : "#94a3b8"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4l3 3" />
  </svg>
);

const IconChapterTest = ({ active }: { active: boolean }) => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#3b82f6" : "#94a3b8"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────
   HORIZONTAL SCROLL ROW — for course cards
───────────────────────────────────────────────────────────────────── */

function CourseScrollRow({
  courses,
  label,
  onCourseClick,
}: {
  courses: CourseCard[];
  label?: string;
  onCourseClick: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  const check = () => {
    const el = ref.current;
    if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    check();
    el.addEventListener("scroll", check, { passive: true });
    const o = new ResizeObserver(check);
    o.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      o.disconnect();
    };
  }, [courses]);

  const scroll = (d: "l" | "r") =>
    ref.current?.scrollBy({ left: d === "l" ? -240 : 240, behavior: "smooth" });

  if (!courses.length) return null;

  return (
    <div>
      {label && (
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          {label}
        </p>
      )}
      <div className="relative group/row">
        {canL && (
          <button
            onClick={() => scroll("l")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all opacity-0 group-hover/row:opacity-100"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {courses.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => onCourseClick(c.id)}
              whileHover={{ y: -2 }}
              className="group flex items-center gap-3 min-w-[200px] max-w-[200px] shrink-0 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl px-4 py-3 text-left transition-all"
            >
              {/* Icon box — NoteGPT card style */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center shrink-0 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                <div className="relative w-7 h-7">
                  <Image
                    src={c.icon}
                    alt={c.title}
                    fill
                    className="object-contain"
                    sizes="28px"
                  />
                </div>
              </div>
              {/* Text */}
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight truncate">
                  {c.title}
                </p>
                <p className="text-xs text-slate-400 leading-tight mt-0.5 truncate">
                  {c.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
        {canR && (
          <button
            onClick={() => scroll("r")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all opacity-0 group-hover/row:opacity-100"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   MAIN TABS CONFIG
───────────────────────────────────────────────────────────────────── */

type MainTab = "sample-paper" | "test";
type TestSubTab = "full-syllabus" | "subject-test" | "chapter-test";

const MAIN_TABS: {
  id: MainTab;
  label: string;
  Icon: (props: { active: boolean }) => React.ReactNode;
  isNew?: boolean;
}[] = [
  { id: "sample-paper", label: "Sample Paper", Icon: IconSamplePaper },
  { id: "test", label: "Test", Icon: IconTest, isNew: true },
];

const TEST_SUB_TABS: {
  id: TestSubTab;
  label: string;
  desc: string;
  Icon: (props: { active: boolean }) => React.ReactNode;
}[] = [
  {
    id: "full-syllabus",
    label: "Full Syllabus Test",
    desc: "Complete course coverage",
    Icon: IconFullSyllabus,
  },
  {
    id: "subject-test",
    label: "Subject Test",
    desc: "Single subject deep dive",
    Icon: IconSubjectTest,
  },
  {
    id: "chapter-test",
    label: "Chapter Test",
    desc: "Chapter-level precision",
    Icon: IconChapterTest,
  },
];

const TEST_CONFIG: Record<
  TestSubTab,
  {
    level: "class" | "subject" | "chapter";
    defaultPaperType: string;
    title: string;
    description: string;
  }
> = {
  "full-syllabus": {
    level: "class",
    defaultPaperType: "Full Syllabus Test",
    title: "FULL SYLLABUS TEST",
    description: "Pick your course to generate a complete syllabus test",
  },
  "subject-test": {
    level: "subject",
    defaultPaperType: "Subject Test",
    title: "SUBJECT TEST",
    description: "Pick your course and subject to generate a subject test",
  },
  "chapter-test": {
    level: "chapter",
    defaultPaperType: "Chapter Test",
    title: "CHAPTER TEST",
    description:
      "Pick your course, subject, and chapter to generate a chapter test",
  },
};

/* ─────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────── */

const CoursesToolsSection = () => {
  const router = useRouter();
  const [activeMain, setActiveMain] = useState<MainTab>("sample-paper");
  const [activeTestSub, setActiveTestSub] =
    useState<TestSubTab>("full-syllabus");
  const [school, setSchool] = useState<CourseCard[]>([]);
  const [competitive, setCompetitive] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await getFilteredCourseOptions("Sample Paper");
        if (cancelled) return;
        const sc: CourseCard[] = [];
        const co: CourseCard[] = [];
        for (const n of all) {
          const id = toCourseId(n);
          const card: CourseCard = {
            id,
            title: n,
            description: getDesc(n),
            icon: COURSE_ICONS[id] || "/images/subjects/book.png",
            tag: COURSE_TAGS[n],
          };
          (SCHOOL_NAMES.has(n) ? sc : co).push(card);
        }
        if (!cancelled) {
          setSchool(sc);
          setCompetitive(co);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCourseClick = (id: string) => {
    const found = [...competitive, ...school].find((c) => c.id === id);
    if (found)
      router.push(
        `/sarthaks-ai/generate/new?class=${encodeURIComponent(found.title)}&paperType=Sample+Paper`
      );
  };

  const handleTestGenerate = (sel: Selection) => {
    const p = new URLSearchParams();
    if (sel.course) p.set("class", sel.course.trim());
    if (sel.subject) p.set("subject", sel.subject.trim());
    if (sel.chapter) p.set("chapter", sel.chapter.trim());
    if (sel.board) p.set("board", sel.board.trim());
    if (sel.paperType) p.set("paperType", sel.paperType.trim());
    if (sel.language) p.set("language", sel.language.trim());
    router.push(`/sarthaks-ai/generate/new?${p.toString()}`);
  };

  const cfg = TEST_CONFIG[activeTestSub];

  return (
    <section id="tools-section" className="w-full bg-white">
      {/* ── Tab bar — NoteGPT style ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-end gap-1 pt-2">
            {MAIN_TABS.map((tab) => {
              const active = activeMain === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMain(tab.id)}
                  className="relative flex flex-col items-center gap-1.5 px-6 py-3 min-w-[100px] transition-colors"
                >
                  {/* Icon + "New" badge */}
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        active
                          ? "bg-blue-500"
                          : "bg-transparent hover:bg-slate-100"
                      }`}
                    >
                      <tab.Icon active={active} />
                    </div>
                    {tab.isNew && (
                      <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                        New
                      </span>
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      active ? "text-blue-600" : "text-slate-500"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {/* Active underline */}
                  {active && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">

          {/* ════ SAMPLE PAPER tab ════ */}
          {activeMain === "sample-paper" && (
            <motion.div
              key="sample-paper"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {/* Sub-heading */}
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
                Select a course to generate an official-pattern sample paper
              </p>

              {loading ? (
                /* Loading skeletons — NoteGPT card shape */
                <div className="flex gap-3 flex-wrap">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 min-w-[200px] max-w-[200px] bg-slate-100 rounded-xl px-4 py-3 animate-pulse"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <CourseScrollRow
                    courses={competitive}
                    label="Competitive Exams"
                    onCourseClick={handleCourseClick}
                  />
                  <CourseScrollRow
                    courses={school}
                    label="School Exams"
                    onCourseClick={handleCourseClick}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* ════ TEST tab ════ */}
          {activeMain === "test" && (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              {/* Sub-tab row — smaller icon+label tabs, NoteGPT sub-tab style */}
              <div className="flex flex-wrap gap-2">
                {TEST_SUB_TABS.map((sub) => {
                  const on = activeTestSub === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveTestSub(sub.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all ${
                        on
                          ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
                      }`}
                    >
                      <sub.Icon active={on} />
                      <span>{sub.label}</span>
                      {on && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* QuickSetupFlow — with top description label */}
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
                {cfg.description}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestSub}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden"
                >
                  <QuickSetupFlow
                    key={activeTestSub}
                    level={cfg.level}
                    defaultPaperType={cfg.defaultPaperType}
                    title={cfg.title}
                    description={cfg.description}
                    onGenerate={handleTestGenerate}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CoursesToolsSection;
