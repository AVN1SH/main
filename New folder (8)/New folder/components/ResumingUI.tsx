"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameStore } from "@/lib/gameStore";

export default function ResumingUI() {
  const [countdown, setCountdown] = useState<number>(3);
  const { setUiState } = useGameStore();

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 800);
      return () => clearTimeout(t);
    } else if (countdown === 0) {
      const t = setTimeout(() => setUiState("playing"), 600);
      return () => clearTimeout(t);
    }
  }, [countdown, setUiState]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="absolute inset-0 pointer-events-none z-[200] flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm px-[4vw]"
    >
      {/* <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-fredoka font-black text-amber-400 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide"
        style={{
          fontSize: "clamp(1.5rem, 6vw, 3.25rem)",
          marginBottom: "clamp(0.25rem, 1.5vh, 0.75rem)",
        }}
      >
        GET READY
      </motion.h2> */}

      <div
        className="flex items-center justify-center"
        style={{
          height: "clamp(5rem, 22vh, 10rem)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="font-fredoka font-black text-white drop-shadow-[0_6px_15px_rgba(0,0,0,0.8)]"
            style={{
              fontSize: "clamp(3rem, 12vw, 9rem)",
              lineHeight: 1,
            }}
          >
            {countdown > 0 ? countdown : "GO!"}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}