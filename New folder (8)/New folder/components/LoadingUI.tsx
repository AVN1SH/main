"use client";

import React from "react";
import { motion } from "motion/react";
import { t } from "@/lib/translation";
import { useGameStore } from "@/lib/gameStore";

export default function LoadingUI() {
  const { loadProgress } = useGameStore();

  return (
    <motion.div
      id="loading-ui-container"
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto bg-sky-500/10 backdrop-blur-xs pointer-events-auto text-white min-h-[350px]"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      {/* Title & Decorative Cloud (Matching LobbyUI) */}
      <div className="text-center mb-[clamp(1rem,5dvh,3rem)] relative w-full max-w-md px-2">
        <motion.div
          id="loading-cloud"
          animate={{
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-8 sm:-top-12 left-1/2 transform -translate-x-1/2 opacity-30 w-24 sm:w-32 h-8 sm:h-10 bg-white rounded-full blur-xs"
        />

        <motion.h1
          id="loading-title"
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
          className="text-[clamp(2rem,9vw,4.5rem)] leading-[1.05] font-black tracking-tight drop-shadow-lg text-white break-words"
        >
          Jump Over
        </motion.h1>
        <p className="text-sky-100 font-medium tracking-widest uppercase mt-2 text-[clamp(0.6rem,2.5vw,0.875rem)]">
          {"Altitude Challenge"}
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="flex flex-col items-center w-full max-w-sm px-2">
        <div className="w-full bg-sky-950/40 backdrop-blur-md rounded-full h-[clamp(1rem,3.5dvh,1.5rem)] p-1 border border-white/15 shadow-xl relative overflow-hidden mb-[clamp(0.5rem,2dvh,0.75rem)]">
          <motion.div
            className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            initial={{ width: "0%" }}
            animate={{ width: `${loadProgress}%` }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="text-[clamp(0.75rem,3vw,0.95rem)] font-bold text-sky-100 tracking-wider mb-[clamp(0.5rem,2dvh,1rem)] drop-shadow">
          {loadProgress}%
        </div>

        {/* Animated Loading Text */}
        <motion.p
          id="loading-text"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[clamp(0.7rem,3vw,0.875rem)] font-semibold text-sky-50 tracking-widest uppercase text-center"
        >
          {t("loading")}
        </motion.p>
      </div>
    </motion.div>
  );
}
