"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const STATS = [
  {
    icon: "⭐",
    value: "4.9/5",
    label: "Avg Rating",
    sub: "Google Store",
  },
  {
    icon: "🎓",
    value: "10M+",
    label: "Students",
    sub: "Active Learners",
  },
  {
    icon: "🏫",
    value: "50K+",
    label: "Schools",
    sub: "Institutes & Colleges",
  },
];

const TRUST_LOGOS = [
  { src: "/images/boards/cbse.png", alt: "CBSE" },
  { src: "/images/boards/icse.png", alt: "ICSE" },
  { src: "/images/boards/bseb.png", alt: "BSEB" },
];

// Animated number counter
function AnimatedStat({ value, label, sub, icon }: (typeof STATS)[0]) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-3 min-w-[100px]">
      <span className="text-xl">{icon}</span>
      <span className="text-lg font-extrabold text-slate-800 leading-tight">
        {value}
      </span>
      <span className="text-[11px] font-bold text-slate-600">{label}</span>
      <span className="text-[10px] text-slate-400">{sub}</span>
    </div>
  );
}

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 pt-20 pb-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* ── LEFT: Hero Text ── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-5"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              AI-Powered Learning Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.1] text-slate-900">
              Your All-in-One{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
                AI Learning
              </span>{" "}
              Assistant
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
              Generate professional question papers, mock tests, and sample
              papers in seconds. Supports CBSE, BSEB, ICSE &amp; all state
              boards — free to use!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mt-1">
              <Link
                href="/sarthaks-ai/generate/new"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Start for Free
              </Link>
              <button
                onClick={() => {
                  document
                    .getElementById("tools-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 15l5-3-5-3v6z"
                  />
                </svg>
                Explore Tools
              </button>
            </div>

            {/* Trust logos */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">
                Supports:
              </span>
              {TRUST_LOGOS.map((logo) => (
                <div
                  key={logo.alt}
                  className="relative w-14 h-7 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                </div>
              ))}
              <span className="text-xs text-slate-400 font-medium">
                + all state boards
              </span>
            </div>
          </motion.div>

          {/* ── RIGHT: Stats Panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {/* Stats card */}
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-xl shadow-slate-900/5 p-6">
              {/* Stars row */}
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm font-bold text-slate-700">
                  Rated 4.9 / 5
                </span>
              </div>

              {/* Trusted by text */}
              <p className="text-[13px] text-slate-500 mb-4">
                Trusted by students and teachers across India
              </p>

              {/* Stats row */}
              <div className="flex items-center justify-around divide-x divide-slate-100">
                {STATS.map((stat) => (
                  <AnimatedStat key={stat.label} {...stat} />
                ))}
              </div>

              {/* Avatar row */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    "bg-indigo-400",
                    "bg-purple-400",
                    "bg-pink-400",
                    "bg-amber-400",
                  ].map((color, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-white ${color} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {["R", "P", "A", "S"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Join 10M+ Learners
                  </p>
                  <p className="text-[11px] text-slate-400">
                    New students every day
                  </p>
                </div>
              </div>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {[
                "📝 Sample Papers",
                "🧪 Mock Tests",
                "📚 Chapter Tests",
                "🤖 AI-Generated",
                "🌐 Multilingual",
                "✅ Free to use",
              ].map((pill) => (
                <span
                  key={pill}
                  className="text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm"
                >
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
