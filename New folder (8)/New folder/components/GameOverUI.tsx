'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { t } from "@/lib/translation";
import { Storage } from "@/lib/storage";
import { soundManager } from "@/lib/soundManager";
import { useGameStore } from "@/lib/gameStore";

export default function GameOverUI() {
  const { score: finalScore, highScore, coins, setUiState } = useGameStore();
  const isNewHighBase = finalScore >= highScore && finalScore > 0;

  const [displayScore, setDisplayScore] = useState(0);
  const [showNewHigh, setShowNewHigh] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  // Track viewport size so we can switch to compact layout on small
  // screens in landscape mode (where the default layout would overflow).
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const check = () => {
      setIsCompact(window.innerHeight < 500 || window.innerWidth < 380);
    };
    check();
    const onResize = () => check();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("GAME_RESIZE", onResize as EventListener);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("GAME_RESIZE", onResize as EventListener);
    };
  }, []);

  useEffect(() => {
    soundManager.playWoosh();
  }, []);

  useEffect(() => {
    if (finalScore <= 0) {
      setDisplayScore(0);
      setAnimationDone(true);
      return;
    }

    const duration = 2000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(0 + (finalScore - 0) * eased);
      setDisplayScore(current);

      if (progress >= 1) {
        setAnimationDone(true);
        setDisplayScore(finalScore);
        if (isNewHighBase) {
          setShowNewHigh(true);
          soundManager.playNewHighScore();
        }
      } else {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [finalScore, isNewHighBase]);

  const handleRestart = () => {
    soundManager.restoreBgmVolume();
    soundManager.playWoosh();
    setUiState("playing");
    window.dispatchEvent(new CustomEvent("GAME_RESTART"));
  };

  const handleHome = () => {
    soundManager.restoreBgmVolume();
    soundManager.playWoosh();
    setUiState("lobby");
    window.dispatchEvent(new CustomEvent("GAME_HOME"));
  };

  return (
    <motion.div
      id="gameover-ui-container"
      key="gameover"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto pointer-events-auto bg-red-950/60 backdrop-blur-xs min-h-[350px]"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      {/* Title with Skull icon */}
      <motion.div
        id="gameover-title"
        initial={{ scale: 0.8, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="flex items-center gap-2 sm:gap-4 mb-[clamp(0.75rem,3dvh,2rem)] px-2"
      >
        <img
          src="/icons/skull.png"
          className={`shrink-0 opacity-80 ${
            isCompact ? 'w-7 h-7' : 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12'
          }`}
          alt=""
        />
        <h2 className="text-[clamp(1.5rem,7vw,3.75rem)] leading-[1.05] font-black text-white drop-shadow-2xl tracking-wide uppercase break-words whitespace-nowrap">
          {t('gameOver')}
        </h2>
      </motion.div>

      {/* Scores summary box */}
      <motion.div
        id="scores-summary-box"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 15 }}
        className="bg-black/45 border-2 border-white/10 p-[clamp(0.875rem,4vw,2rem)] rounded-3xl backdrop-blur-md text-center mb-[clamp(0.75rem,3dvh,2.5rem)] max-w-sm w-full shadow-2xl relative"
      >
        {isCompact ? (
          /* Compact: score & high score side-by-side to save vertical space */
          <div className="flex items-center justify-around gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <img src="/icons/star-golden.png" className="w-3.5 h-3.5" alt="" />
                <p className="text-sky-300 text-[0.6rem] font-extrabold uppercase tracking-widest">{t('score')}</p>
              </div>
              <p className="text-[clamp(1.25rem,6vw,2.25rem)] font-black text-white tracking-tight">{displayScore}</p>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <img src="/icons/trophy.png" className="w-3.5 h-3.5" alt="" />
                <p className="text-sky-300 text-[0.55rem] font-semibold uppercase tracking-wider">{t('highScore')}</p>
              </div>
              <p className="text-[clamp(1rem,4vw,1.5rem)] font-bold text-yellow-300">{highScore}</p>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <img src="/icons/coin.png" className="w-3.5 h-3.5 object-contain" alt="" />
                <p className="text-amber-200 text-[0.55rem] font-semibold uppercase tracking-wider">Coins</p>
              </div>
              <p className="text-[clamp(1rem,4vw,1.5rem)] font-bold text-yellow-300">{coins}</p>
            </div>
          </div>
        ) : (
          /* Default: stacked score & high score */
          <>
            {/* Score */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <img src="/icons/star-golden.png" className="w-4 h-4 sm:w-5 sm:h-5" alt="" />
              <p className="text-sky-300 text-[clamp(0.65rem,2.5vw,0.875rem)] font-extrabold uppercase tracking-widest">{t('score')}</p>
            </div>
            <p className="text-[clamp(2rem,9vw,3rem)] font-black text-white tracking-tight mb-[clamp(0.5rem,2dvh,1.5rem)]">{displayScore}</p>

            {/* Bottom Row: High Score & Coins */}
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              {/* High Score */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-0.5">
                  <img src="/icons/trophy.png" className="w-4 h-4 sm:w-5 sm:h-5" alt="" />
                  <p className="text-sky-300 text-[clamp(0.6rem,2.2vw,0.75rem)] font-semibold uppercase tracking-wider">{t('highScore')}</p>
                </div>
                <p className="text-[clamp(1.25rem,5vw,1.5rem)] font-bold text-yellow-300">{highScore}</p>
              </div>

              <div className="w-px h-8 bg-white/15" />

              {/* Coins */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-0.5">
                  <img src="/icons/coin.png" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" alt="" />
                  <p className="text-amber-200 text-[clamp(0.6rem,2.2vw,0.75rem)] font-semibold uppercase tracking-wider">Coins</p>
                </div>
                <p className="text-[clamp(1.25rem,5vw,1.5rem)] font-bold text-yellow-300">{coins}</p>
              </div>
            </div>
          </>
        )}

        {/* New High Score indicator — only after animation finishes */}
        {showNewHigh && (
          <motion.div
            id="new-high-score-banner"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [-2, 2, -2] }}
            transition={{
              scale: { type: "spring", stiffness: 200, delay: 0.4 },
              rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="bg-yellow-400 text-sky-950 text-[clamp(0.55rem,2.2vw,0.75rem)] font-black uppercase tracking-widest py-1 px-2.5 sm:px-4 rounded-full mt-[clamp(0.5rem,2dvh,1rem)] inline-flex items-center gap-1.5 shadow-md"
          >
            <img src="/icons/crown.png" className="w-3 h-3 sm:w-4 sm:h-4" alt="" />
            <span>New High Score!</span>
            <img src="/icons/crown.png" className="w-3 h-3 sm:w-4 sm:h-4" alt="" />
          </motion.div>
        )}
      </motion.div>

      {/* Replay/Restart Button */}
      <motion.button
        id="gameover-restart-button"
        whileHover={{ scale: 1.1, boxShadow: "0px 10px 25px rgba(239,68,68,0.4)" }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRestart}
        className="bg-white text-red-600 font-black text-[clamp(1.125rem,5vw,1.875rem)] px-[clamp(1.75rem,8vw,4rem)] py-[clamp(0.625rem,2.5dvh,1.25rem)] rounded-full shadow-2xl cursor-pointer border-4 border-red-50 hover:bg-gray-50 transition-colors flex items-center gap-3"
      >
        <span>{t('restart')}</span>
      </motion.button>

      {/* Home button */}
      <motion.button
        id="gameover-home-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleHome}
        className="mt-[clamp(0.5rem,2dvh,1rem)] bg-white hover:bg-white/90 border border-sky-50 text-sky-500 px-4 sm:px-6 py-[clamp(0.5rem,2dvh,0.75rem)] rounded-2xl text-[clamp(0.7rem,3vw,0.875rem)] font-bold transition-colors shadow-lg flex items-center gap-2 cursor-pointer"
      >
        <img src="/icons/house.png" className="w-4 h-4 sm:w-5 sm:h-5 opacity-80 drop-shadow-sm" alt="" />
        <span>{t('home')}</span>
      </motion.button>
    </motion.div>
  );
}
