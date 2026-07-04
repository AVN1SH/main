"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Layers,
  BookOpen,
  Loader2,
  AlertCircle,
  Hash,
} from "lucide-react";
import { getFilteredCourseOptions } from "@/utils/getNextStep";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubjectEntry {
  name: string;
  chapters: string[];
  loadingChapters: boolean;
  chaptersLoaded: boolean;
  error?: string;
}

interface CourseData {
  id: string;
  label: string;
  subjects: SubjectEntry[];
  loadingSubjects: boolean;
  subjectsLoaded: boolean;
  error?: string;
}

// ─── Color palettes ──────────────────────────────────────────────────────────

const PALETTES = [
  {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    activeBg: "bg-indigo-600",
    activeBorder: "border-indigo-600",
    pill: "bg-indigo-50 border-indigo-200 text-indigo-700",
    dot: "bg-indigo-400",
    headerBg: "bg-indigo-50",
    headerBorder: "border-indigo-200",
  },
  {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    activeBg: "bg-violet-600",
    activeBorder: "border-violet-600",
    pill: "bg-violet-50 border-violet-200 text-violet-700",
    dot: "bg-violet-400",
    headerBg: "bg-violet-50",
    headerBorder: "border-violet-200",
  },
  {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    activeBg: "bg-sky-600",
    activeBorder: "border-sky-600",
    pill: "bg-sky-50 border-sky-200 text-sky-700",
    dot: "bg-sky-400",
    headerBg: "bg-sky-50",
    headerBorder: "border-sky-200",
  },
  {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    activeBg: "bg-emerald-600",
    activeBorder: "border-emerald-600",
    pill: "bg-emerald-50 border-emerald-200 text-emerald-700",
    dot: "bg-emerald-400",
    headerBg: "bg-emerald-50",
    headerBorder: "border-emerald-200",
  },
  {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    activeBg: "bg-amber-600",
    activeBorder: "border-amber-600",
    pill: "bg-amber-50 border-amber-200 text-amber-700",
    dot: "bg-amber-400",
    headerBg: "bg-amber-50",
    headerBorder: "border-amber-200",
  },
];

const getPalette = (idx: number) => PALETTES[idx % PALETTES.length];

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function fetchSubjects(courseLabel: string): Promise<string[]> {
  const res = await fetch(
    `/api/syllabus/subjects?class=${encodeURIComponent(courseLabel)}`
  );
  if (!res.ok) throw new Error("Failed to fetch subjects");
  const data = await res.json();
  return data.subjects || [];
}

async function fetchChapters(
  courseLabel: string,
  subject: string
): Promise<string[]> {
  const res = await fetch(
    `/api/syllabus/chapters?class=${encodeURIComponent(courseLabel)}&subject=${encodeURIComponent(subject)}`
  );
  if (!res.ok) throw new Error("Failed to fetch chapters");
  const data = await res.json();
  return data.chapters || [];
}

// ─── Chapter Pill ─────────────────────────────────────────────────────────────

function ChapterPill({ name, colorIdx }: { name: string; colorIdx: number }) {
  const p = getPalette(colorIdx);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${p.pill}`}
    >
      <span className={`size-2 rounded-full shrink-0 ${p.dot}`} />
      {name}
    </motion.div>
  );
}

// ─── Subject Row ──────────────────────────────────────────────────────────────

function SubjectRow({
  subject,
  colorIdx,
  courseLabel,
  isOpen,
  onToggle,
}: {
  subject: SubjectEntry;
  colorIdx: number;
  courseLabel: string;
  isOpen: boolean;
  onToggle: (subjectName: string) => void;
}) {
  const p = getPalette(colorIdx);

  const handleClick = () => onToggle(subject.name);

  return (
    <div
      className={`rounded-xl border transition-all overflow-hidden ${
        isOpen ? `${p.border} ${p.bg}` : "border-slate-100 bg-white"
      }`}
    >
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`size-7 rounded-lg flex items-center justify-center border shrink-0 ${
              isOpen ? `${p.bg} ${p.border} ${p.text}` : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            <BookOpen size={13} />
          </span>
          <span className={`font-semibold text-sm truncate ${isOpen ? p.text : "text-slate-700"}`}>
            {subject.name}
          </span>
          {subject.chaptersLoaded && (
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
              {subject.chapters.length} chapters
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {subject.loadingChapters && (
            <Loader2 size={13} className="text-indigo-400 animate-spin" />
          )}
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className={isOpen ? p.text : "text-slate-400"}
          >
            <ChevronRight size={16} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {subject.loadingChapters && (
                <div className="flex flex-wrap gap-1.5">
                  {[80, 110, 70, 95, 85].map((w, i) => (
                    <div
                      key={i}
                      className="h-6 bg-slate-200 rounded-full animate-pulse"
                      style={{ width: w, animationDelay: `${i * 60}ms` }}
                    />
                  ))}
                </div>
              )}
              {subject.error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                  <AlertCircle size={12} />
                  {subject.error}
                </div>
              )}
              {subject.chaptersLoaded && subject.chapters.length === 0 && (
                <p className="text-xs text-slate-400 italic">No chapters found in database</p>
              )}
              {subject.chaptersLoaded && subject.chapters.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {subject.chapters.map((ch, i) => (
                    <ChapterPill key={ch} name={ch} colorIdx={colorIdx} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SyllabusVisualizer = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [openSubject, setOpenSubject] = useState<string | null>(null);

  // ── Load courses on mount ──
  useEffect(() => {
    let cancelled = false;
    getFilteredCourseOptions()
      .then((labels) => {
        if (cancelled) return;
        const initial: CourseData[] = labels.map((label) => ({
          id: label,
          label,
          subjects: [],
          loadingSubjects: false,
          subjectsLoaded: false,
        }));
        setCourses(initial);
        if (initial.length > 0) setActiveCourseId(initial[0].id);
      })
      .catch(() => {
        if (!cancelled) setLoadingCourses(false);
      })
      .finally(() => {
        if (!cancelled) setLoadingCourses(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Load subjects when course changes ──
  useEffect(() => {
    if (!activeCourseId) return;
    const course = courses.find((c) => c.id === activeCourseId);
    if (!course || course.subjectsLoaded || course.loadingSubjects) return;

    setCourses((prev) =>
      prev.map((c) =>
        c.id === activeCourseId ? { ...c, loadingSubjects: true } : c
      )
    );

    fetchSubjects(activeCourseId)
      .then((subjects) => {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === activeCourseId
              ? {
                  ...c,
                  loadingSubjects: false,
                  subjectsLoaded: true,
                  subjects: subjects.map((name) => ({
                    name,
                    chapters: [],
                    loadingChapters: false,
                    chaptersLoaded: false,
                  })),
                }
              : c
          )
        );
      })
      .catch(() => {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === activeCourseId
              ? {
                  ...c,
                  loadingSubjects: false,
                  subjectsLoaded: true,
                  error: "Failed to load subjects",
                }
              : c
          )
        );
      });
  }, [activeCourseId, courses]);

  // ── Toggle subject open & load chapters on demand ──
  const handleSubjectToggle = useCallback(
    (subjectName: string) => {
      const isClosing = openSubject === subjectName;
      setOpenSubject(isClosing ? null : subjectName);

      if (isClosing || !activeCourseId) return;

      // Check if chapters already loaded
      const course = courses.find((c) => c.id === activeCourseId);
      const subj = course?.subjects.find((s) => s.name === subjectName);
      if (!subj || subj.chaptersLoaded || subj.loadingChapters) return;

      // Mark loading
      setCourses((prev) =>
        prev.map((c) =>
          c.id !== activeCourseId
            ? c
            : {
                ...c,
                subjects: c.subjects.map((s) =>
                  s.name === subjectName ? { ...s, loadingChapters: true } : s
                ),
              }
        )
      );

      fetchChapters(activeCourseId, subjectName)
        .then((chapters) => {
          setCourses((prev) =>
            prev.map((c) =>
              c.id !== activeCourseId
                ? c
                : {
                    ...c,
                    subjects: c.subjects.map((s) =>
                      s.name === subjectName
                        ? {
                            ...s,
                            loadingChapters: false,
                            chaptersLoaded: true,
                            chapters,
                          }
                        : s
                    ),
                  }
            )
          );
        })
        .catch(() => {
          setCourses((prev) =>
            prev.map((c) =>
              c.id !== activeCourseId
                ? c
                : {
                    ...c,
                    subjects: c.subjects.map((s) =>
                      s.name === subjectName
                        ? {
                            ...s,
                            loadingChapters: false,
                            chaptersLoaded: true,
                            error: "Failed to load chapters",
                          }
                        : s
                    ),
                  }
            )
          );
        });
    },
    [openSubject, activeCourseId, courses]
  );

  const handleCourseChange = (id: string) => {
    if (id === activeCourseId) return;
    setActiveCourseId(id);
    setOpenSubject(null);
  };

  const activeCourse = courses.find((c) => c.id === activeCourseId);

  return (
    <div className="w-full bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
      <div className="max-w-[2160px] mx-auto">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
              <Layers size={16} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-violet-600 ml-1">
              Syllabus Explorer
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Explore Our Full Syllabus
          </h2>
          <p className="mt-2 text-base text-slate-500 max-w-xl">
            Browse every course, subject, and chapter our AI covers — all sourced live from our database.
          </p>
        </div>

        {/* ── Loading courses ── */}
        {loadingCourses && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-8">
            <Loader2 size={16} className="animate-spin" />
            Loading courses…
          </div>
        )}

        {!loadingCourses && courses.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-8 border border-dashed border-slate-200 rounded-2xl justify-center">
            <AlertCircle size={16} />
            No courses found
          </div>
        )}

        {!loadingCourses && courses.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-5">

            {/* ── Course Selector ── */}
            <div className="lg:w-52 flex-shrink-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
                Course
              </p>
              <div
                className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0"
                style={{ scrollbarWidth: "none" }}
              >
                {courses.map((c, i) => {
                  const isActive = c.id === activeCourseId;
                  return (
                    <motion.button
                      key={c.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleCourseChange(c.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-left whitespace-nowrap shrink-0 lg:shrink font-semibold text-sm transition-all ${
                        isActive
                          ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200/60"
                          : "bg-white border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50"
                      }`}
                    >
                      <Hash size={13} className={isActive ? "text-violet-300" : "text-slate-400"} />
                      {c.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* ── Subject + Chapter Panel ── */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCourseId}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {/* Stats bar */}
                  {activeCourse && activeCourse.subjectsLoaded && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {activeCourse.label} — {activeCourse.subjects.length} subject{activeCourse.subjects.length !== 1 ? "s" : ""}
                        {activeCourse.subjects.some((s) => s.chaptersLoaded) &&
                          ` · ${activeCourse.subjects.reduce((a, s) => a + s.chapters.length, 0)} chapters loaded`}
                      </span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                  )}

                  {/* Loading subjects */}
                  {activeCourse?.loadingSubjects && (
                    <div className="flex flex-col gap-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-12 bg-white border border-slate-100 rounded-xl animate-pulse"
                          style={{ animationDelay: `${i * 80}ms` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Error */}
                  {activeCourse?.error && (
                    <div className="flex items-center gap-2 text-sm text-rose-500 font-semibold border border-rose-200 bg-rose-50 rounded-xl px-4 py-3">
                      <AlertCircle size={14} />
                      {activeCourse.error}
                    </div>
                  )}

                  {/* No subjects */}
                  {activeCourse?.subjectsLoaded && !activeCourse.error && activeCourse.subjects.length === 0 && (
                    <div className="text-sm text-slate-400 italic border border-dashed border-slate-200 rounded-xl px-4 py-8 text-center">
                      No subjects found for this course yet
                    </div>
                  )}

                  {/* Subject rows */}
                  {activeCourse?.subjectsLoaded && activeCourse.subjects.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {activeCourse.subjects.map((subj, idx) => (
                        <SubjectRow
                          key={subj.name}
                          subject={subj}
                          colorIdx={idx}
                          courseLabel={activeCourseId!}
                          isOpen={openSubject === subj.name}
                          onToggle={handleSubjectToggle}
                        />
                      ))}
                    </div>
                  )}

                  {/* Footer hint */}
                  {activeCourse?.subjectsLoaded && activeCourse.subjects.length > 0 && (
                    <p className="text-xs text-slate-400 text-center mt-3">
                      Click a subject to explore its chapters · AI generates from your exact syllabus
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusVisualizer;
