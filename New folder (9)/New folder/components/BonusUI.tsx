"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameStore } from "@/lib/gameStore";

export default function BonusUI() {
  const { bonusTimeLeft, isBonusStarted, setIsBonusStarted } = useGameStore();
  const [countdown, setCountdown] = useState<number>(3);

  // Manage the 3-2-1-GO! countdown
  useEffect(() => {
    if (isBonusStarted) return;

    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 800);
      return () => clearTimeout(t);
    } else if (countdown === 0) {
      const t = setTimeout(() => setIsBonusStarted(true), 600);
      return () => clearTimeout(t);
    }
  }, [countdown, isBonusStarted, setIsBonusStarted]);

  return (
    <>
      {/* INTRO TEXTS CONTAINER */}
      {/* Remains fixed at center so exit animations don't jump downwards when the timer moves */}
      <div
        className="absolute inset-0 pointer-events-none z-[100] flex flex-col items-center justify-center overflow-hidden"
        style={{
          paddingBottom: "clamp(6rem, 15vh, 12rem)", // Ensures it stays strictly above the timer
        }}
      >
        <AnimatePresence>
          {!isBonusStarted && (
            <motion.div
              key="intro-texts"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -150, transition: { duration: 0.6, ease: "easeIn" } }}
              className="flex flex-col items-center justify-center"
              style={{ gap: "clamp(0.5rem, min(2.5vw, 2.5vh), 1rem)" }}
            >
              {/* 1. "BONUS ROUND" Title */}
              <motion.h1
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
                className="font-fredoka font-black text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] text-center tracking-wide leading-tight"
                style={{ fontSize: "clamp(1.5rem, min(7vw, 8vh), 4.5rem)" }}
              >
                BONUS ROUND
              </motion.h1>

              {/* 2. Instruction Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-white font-fredoka font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center"
                style={{ fontSize: "clamp(0.8rem, min(3vw, 3.4vh), 1.5rem)" }}
              >
                Jump on hay! Collect coins! Don't fall!
              </motion.p>

              {/* 3. Countdown (3, 2, 1, GO!) */}
              <div
                className="flex items-center justify-center"
                style={{
                  minHeight: "clamp(2.5rem, min(10vw, 11vh), 5rem)",
                  marginTop: "clamp(0.25rem, min(1.5vw, 1.5vh), 0.5rem)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-fredoka font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                    style={{ fontSize: "clamp(2rem, min(9vw, 10vh), 3.75rem)", lineHeight: 1 }}
                  >
                    {countdown > 0 ? countdown : "GO!"}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TIMER CONTAINER */}
      <div
        className="absolute inset-0 pointer-events-none z-[100] flex flex-col items-center overflow-hidden"
        style={{
          justifyContent: isBonusStarted ? "flex-end" : "center",
          paddingBottom: isBonusStarted
            ? "max(clamp(1rem, min(3vw, 3.5vh), 1.5rem), env(safe-area-inset-bottom))"
            : "0",
          paddingTop: isBonusStarted ? "0" : "clamp(10rem, 25vh, 18rem)", // Pushes timer below text when centered
          transition: "padding-bottom 0.3s ease, padding-top 0.3s ease",
        }}
      >
        <motion.div
          layout
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            layout: { type: "spring", bounce: 0.2, duration: 0.8 },
            scale: { delay: 0.3, type: "spring", bounce: 0.6 },
          }}
          className="flex items-center justify-center bg-sky-950/80 backdrop-blur-md border-2 border-yellow-400 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)]"
          style={{
            gap: "clamp(0.4rem, min(1.5vw, 1.8vh), 0.75rem)",
            paddingLeft: "clamp(0.9rem, min(3vw, 3.4vh), 1.5rem)",
            paddingRight: "clamp(0.9rem, min(3vw, 3.4vh), 1.5rem)",
            paddingTop: "clamp(0.35rem, min(1.2vw, 1.3vh), 0.75rem)",
            paddingBottom: "clamp(0.35rem, min(1.2vw, 1.3vh), 0.75rem)",
          }}
        >
          <img
            src="./icons/golden-clock.png"
            alt="Clock"
            className="object-contain drop-shadow"
            style={{
              width: "clamp(1.25rem, min(5vw, 5.5vh), 2.5rem)",
              height: "clamp(1.25rem, min(5vw, 5.5vh), 2.5rem)",
            }}
          />
          <span
            className="text-yellow-300 font-fredoka font-black drop-shadow-[0_2px_2px_rgba(124,45,18,1)]"
            style={{ fontSize: "clamp(1.25rem, min(6vw, 6.5vh), 2.25rem)" }}
          >
            {bonusTimeLeft}s
          </span>
        </motion.div>
      </div>
    </>
  );
}