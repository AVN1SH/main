"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, BookOpen, Users, Zap } from "lucide-react";

// ─── Mock Activity Data ──────────────────────────────────────────────────────

interface ActivityItem {
  id: number;
  type: "generated" | "scored" | "started" | "completed";
  text: string;
  meta: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}

const ACTIVITY_TEMPLATES: Omit<ActivityItem, "id">[] = [
  {
    type: "generated",
    text: "Class 12 Physics Full Syllabus Test generated",
    meta: "2 seconds ago",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: <Zap size={13} className="text-indigo-500" />,
  },
  {
    type: "scored",
    text: "Rahul S. scored 92% on NEET Biology Chapter Test",
    meta: "12 seconds ago",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <Activity size={13} className="text-emerald-500" />,
  },
  {
    type: "generated",
    text: "JEE Advanced Chemistry Sample Paper generated",
    meta: "28 seconds ago",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: <BookOpen size={13} className="text-violet-500" />,
  },
  {
    type: "started",
    text: "New student started Class 10 Math Subject Test",
    meta: "45 seconds ago",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    icon: <Users size={13} className="text-sky-500" />,
  },
  {
    type: "generated",
    text: "Class 9 Science Chapter Test (Atoms) generated",
    meta: "1 min ago",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: <Zap size={13} className="text-indigo-500" />,
  },
  {
    type: "scored",
    text: "Priya M. scored 78% on Class 11 Chemistry Full Test",
    meta: "1 min ago",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <Activity size={13} className="text-emerald-500" />,
  },
  {
    type: "generated",
    text: "CUET English Sample Paper generated",
    meta: "2 min ago",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <BookOpen size={13} className="text-amber-500" />,
  },
  {
    type: "completed",
    text: "Arjun K. completed JEE Main Full Syllabus Test",
    meta: "3 min ago",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: <Activity size={13} className="text-rose-500" />,
  },
  {
    type: "generated",
    text: "Class 12 Mathematics Chapter Test (Calculus) generated",
    meta: "4 min ago",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: <Zap size={13} className="text-indigo-500" />,
  },
  {
    type: "scored",
    text: "Sneha R. scored 88% on NEET Physics Subject Test",
    meta: "5 min ago",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <Activity size={13} className="text-emerald-500" />,
  },
  {
    type: "started",
    text: "Teacher created Class 10 Board Exam Sample Paper",
    meta: "6 min ago",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    icon: <Users size={13} className="text-sky-500" />,
  },
  {
    type: "generated",
    text: "Class 7 Science Chapter Test (Motion) generated",
    meta: "7 min ago",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: <Zap size={13} className="text-violet-500" />,
  },
];

// Build initial list with IDs and duplicate for infinite scroll
const buildItems = (): ActivityItem[] =>
  ACTIVITY_TEMPLATES.map((t, i) => ({ ...t, id: i }));

// ─── Activity Card ───────────────────────────────────────────────────────────

function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${item.bg} ${item.border} shrink-0 min-w-[260px] max-w-[320px] snap-start`}
    >
      <div className={`size-7 rounded-lg flex items-center justify-center bg-white border ${item.border} shrink-0`}>
        {item.icon}
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-semibold leading-snug ${item.color} truncate`}>{item.text}</p>
        <p className="text-xs text-slate-500 mt-1">{item.meta}</p>
      </div>
    </div>
  );
}

// ─── Ticker Row (auto-scrolling marquee) ────────────────────────────────────

function TickerRow({ items, direction = "left", speed = 35 }: {
  items: ActivityItem[];
  direction?: "left" | "right";
  speed?: number;
}) {
  // Duplicate for seamless loop
  const doubled = [...items, ...items];
  const duration = (items.length * speed);

  return (
    <div className="overflow-hidden relative">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

      <motion.div
        className="flex gap-2.5 w-max py-0.5"
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{
          x: { duration, ease: "linear", repeat: Infinity },
        }}
      >
        {doubled.map((item, idx) => (
          <ActivityCard key={`${item.id}-${idx}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

// ─── Live Counter ────────────────────────────────────────────────────────────

function LiveCounter({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const step = Math.ceil(value / 40);
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= value) { setDisplayed(value); clearInterval(interval); }
      else setDisplayed(current);
    }, 30);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="flex flex-col items-center px-5 py-3">
      <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
        {displayed.toLocaleString()}{suffix}
      </span>
      <span className="text-xs font-semibold text-slate-500 mt-0.5 text-center">{label}</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const LiveActivityTicker = () => {
  const items = buildItems();
  // Split into two rows for visual variety
  const row1 = items.slice(0, 7);
  const row2 = items.slice(5);

  return (
    <div className="w-full bg-slate-50 py-10 border-t border-slate-100">
      <div className="max-w-[2160px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="size-8 rounded-lg bg-rose-500 flex items-center justify-center shadow-md shadow-rose-200">
                <Activity size={16} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Live Activity
              </span>
              {/* Pulsing live dot */}
              <span className="flex items-center gap-1 ml-1">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2.5 bg-rose-500" />
                </span>
                <span className="text-xs font-bold text-rose-600">LIVE</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Students are generating right now
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Real-time activity from students and teachers across India.
            </p>
          </div>

          {/* Live counters */}
          <div className="flex items-center divide-x divide-slate-200 border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-sm shrink-0">
            <LiveCounter label="Papers Generated" value={12481} />
            <LiveCounter label="Tests Taken" value={8934} />
            <LiveCounter label="Students" value={3200} suffix="+" />
          </div>
        </div>
      </div>

      {/* Ticker rows — full bleed */}
      <div className="flex flex-col gap-2.5">
        <TickerRow items={row1} direction="left" speed={38} />
        <TickerRow items={row2} direction="right" speed={45} />
      </div>
    </div>
  );
};

export default LiveActivityTicker;
