"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getFilteredCourseOptions } from "@/utils/getNextStep";

interface CourseCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  tag?: {
    text: string;
    type: "new" | "trending";
  };
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

const COURSE_TAGS: Record<string, string> = {
  "12th": "Board Exam",
  "11th": "Board Exam",
  "10th": "Board Exam",
  "9th": "Foundation",
  "8th": "Foundation",
  "7th": "Foundation",
};

const SCHOOL_NAMES = new Set([
  "12th",
  "11th",
  "10th",
  "9th",
  "8th",
  "7th",
]);

const toCourseId = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-");

const getDescription = (name: string) => {
  if (SCHOOL_NAMES.has(name)) {
    return `Generate Class ${name.replace(/th$/, "")} sample papers and tests.`;
  }
  return `Generate ${name} exam pattern based mock tests.`;
};

const CHEVRON_LEFT = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const CHEVRON_RIGHT = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const SCROLL_AMOUNT = 220;

function ScrollRow({
  courses,
  label,
  onCourseClick,
}: {
  courses: CourseCard[];
  label?: string;
  onCourseClick: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const resizeObs = new ResizeObserver(checkScroll);
    resizeObs.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      resizeObs.disconnect();
    };
  }, [courses]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {label && (
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          {label}
        </p>
      )}

      <div className="relative group/row">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll left"
          >
            {CHEVRON_LEFT}
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{
                y: -4,
                boxShadow: "0 12px 20px -8px rgba(0,0,0,0.08)",
              }}
              onClick={() => onCourseClick(course.id)}
              className="relative p-4 bg-white rounded-2xl border border-slate-200/80 flex flex-col justify-between transition-all group cursor-pointer min-w-[300px] max-w-[300px] snap-start shrink-0"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-indigo-50/50 transition-colors">
                    <Image
                      alt="logo"
                      src={course.icon}
                      width={100}
                      height={100}
                      className="size-full"
                    />
                  </div>

                  {course.tag && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        course.tag.type === "trending"
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      {course.tag.text}
                    </span>
                  )}
                </div>

                <h3 className="mt-2 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {course.description}
                </p>
              </div>

              <div className="mt-2 border-t border-slate-50 flex items-center text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Generate
                <svg
                  className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll right"
          >
            {CHEVRON_RIGHT}
          </button>
        )}
      </div>
    </div>
  );
}

const CourseSupported = () => {
  const router = useRouter();
  const [schoolCourses, setSchoolCourses] = useState<CourseCard[]>([]);
  const [competitiveCourses, setCompetitiveCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const allCourses = await getFilteredCourseOptions();
        if (cancelled) return;
        const school: CourseCard[] = [];
        const competitive: CourseCard[] = [];
        for (const name of allCourses) {
          const id = toCourseId(name);
          const card: CourseCard = {
            id,
            title: name,
            description: getDescription(name),
            icon: COURSE_ICONS[id] || "/images/subjects/book.png",
          };
          const tagText = COURSE_TAGS[name];
          if (tagText) {
            card.tag = {
              text: tagText,
              type: tagText === "Board Exam" ? "trending" : "new",
            };
          }
          if (SCHOOL_NAMES.has(name)) {
            school.push(card);
          } else {
            competitive.push(card);
          }
        }
        if (!cancelled) {
          setSchoolCourses(school);
          setCompetitiveCourses(competitive);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return null;

  return (
    <div className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      <div className="max-w-[2160px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PROMO BANNER */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-2xl bg-white p-8 text-zinc-800 flex flex-col justify-between min-h-[320px] lg:min-h-full shadow-md border border-indigo-700/20 inset-shadow-indigo-500 inset-shadow-sm">
          <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#1167ff50_1px,transparent_1px)] bg-size-[16px_16px]" />
          <div className="absolute inset-0 pointer-events-none bg-radial from-transparent to-indigo-200" />
          <div className="absolute -bottom-32 -right-32 rounded-full size-90 border-2 border-indigo-400 opacity-50" />
          <div className="absolute -bottom-24 -right-24 rounded-full size-70 border-2 border-indigo-400 bg-indigo-200 opacity-50" />
          <div className="bg-indigo-600 size-20 bottom-0 right-0 blur-[50px] absolute" />

          <div className="z-10">
            <span className="inline-block bg-indigo-500/30 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-indigo-800">
              Courses We Coverd So Far
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl font-sans font-extrabold tracking-tight leading-tight">
              Ready to Use All Courses
            </h2>
            <p className="mt-2 text-indigo-800/80 text-sm max-w-sm">
              Create a account to claim free credits.
            </p>
          </div>

          <div className="mt-4 z-10">
            <button className="w-full sm:w-auto bg-slate-100 text-indigo-700 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-slate-200 transition-colors">
              Start Learning Now
            </button>
          </div>
        </div>

        {/* RIGHT: TWO SCROLLABLE ROWS */}
        <div className="lg:col-span-8 flex flex-col gap-2 justify-center">
          <ScrollRow
            courses={competitiveCourses}
            label="Competitive Exams"
            onCourseClick={(id) => {
              // Find the original name from course data
              const all = [...competitiveCourses, ...schoolCourses];
              const found = all.find((c) => c.id === id);
              if (found) {
                router.push(`/sarthaks-ai/generate/new?class=${encodeURIComponent(found.title)}`);
              }
            }}
          />
          <ScrollRow
            courses={schoolCourses}
            label="School Exams"
            onCourseClick={(id) => {
              const all = [...competitiveCourses, ...schoolCourses];
              const found = all.find((c) => c.id === id);
              if (found) {
                router.push(`/sarthaks-ai/generate/new?class=${encodeURIComponent(found.title)}`);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseSupported;
