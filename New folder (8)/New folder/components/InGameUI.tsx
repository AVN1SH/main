'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/lib/gameStore';
import { t, getLang } from '@/lib/translation';
import { Storage } from '@/lib/storage';
import { soundManager } from '@/lib/soundManager';

export default function InGameUI() {
    const { uiState, score, lives, coins, showTutorial, setUiState } = useGameStore();
    const [musicOn, setMusicOn] = useState(() => {
        if (typeof window !== 'undefined') {
            return Storage.getSettings().music;
        }
        return true;
    });

    const [isCompact, setIsCompact] = useState(false);
    useEffect(() => {
        const check = () => {
            setIsCompact(window.innerHeight < 500 || window.innerWidth < 380);
        };
        check();
        const onResize = () => check();
        window.addEventListener("resize", onResize);
        window.addEventListener("orientationchange", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("orientationchange", onResize);
        };
    }, []);

    const handlePauseClick = () => {
        soundManager.playClick();
        window.dispatchEvent(new CustomEvent('GAME_PAUSE'));
    };

    const handleResumeClick = () => {
        soundManager.playClick();
        window.dispatchEvent(new CustomEvent('GAME_RESUME'));
    };

    const handleHomeClick = () => {
        soundManager.restoreBgmVolume();
        soundManager.playClick();
        setUiState("lobby");
        window.dispatchEvent(new CustomEvent("GAME_HOME"));
    };

    const toggleSettings = () => {
        const settings = Storage.getSettings();
        settings.music = !settings.music;
        settings.sfx = settings.music;
        Storage.setSettings(settings);
        setMusicOn(settings.music);
        if (settings.music) {
            soundManager.startBgm();
        } else {
            soundManager.stopBgm();
        }
        soundManager.playClick();
    };

    const handleTutorialTap = () => {
        soundManager.playClick();
        useGameStore.getState().setShowTutorial(false);
        Storage.setTutorialDone();
    };

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col font-sans select-none overflow-hidden">
            {/* In-Game Heads Up Display */}
            {uiState === 'playing' && (
                <div id="hud-container" className="absolute inset-x-0 top-0 p-6 flex justify-between items-start z-30">
                    {/* Left: Score & Lives */}
                    <div className="flex flex-col gap-2">
                        {/* Score display with slight pop-up animation */}
                        <motion.div
                            id="game-score-display"
                            key={score}
                            initial={{ scale: 1.15 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="bg-black/25 backdrop-blur-xs px-5 py-2 rounded-2xl border border-white/10"
                        >
                            <span className="text-yellow-300 font-black tracking-wider drop-shadow-md" style={{ fontSize: "Clamp(16px, 2vw, 28px)" }}>
                                {score}
                            </span>
                        </motion.div>

                        {/* Lives display */}
                        <div id="lives-container" className="flex gap-1.5 pl-1">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={false}
                                    animate={{
                                        opacity: i < lives ? 1 : 0.15,
                                        scale: i < lives ? [1, 1.2, 1] : 0.85
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <img
                                        src="/game-assets/items/heart.svg"
                                        className="drop-shadow-sm filter drop-shadow-[0_2px_4px_rgba(239,68,68,0.5)]"
                                        style={{ width: "clamp(20px, 2.5vw, 36px)", height: "clamp(20px, 2.5vw, 36px)" }}
                                        alt="Life"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Coins & Pause Button */}
                    <div className="flex flex-col items-end gap-2 pointer-events-auto">
                        {/* Coin display */}
                        <motion.div
                            id="game-coin-display"
                            key={`coin-${coins}`}
                            initial={{ scale: 1.15 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="bg-black/25 backdrop-blur-xs px-3 py-2 rounded-2xl border border-white/10 flex items-center justify-center gap-1.5 pointer-events-none"
                        >
                            <img src="/icons/coin.png" className="w-5 h-5 sm:w-6 sm:h-6 object-contain drop-shadow" alt="Coin" />
                            <span className="text-amber-300 font-black tracking-wider drop-shadow-md" style={{ fontSize: "Clamp(16px, 2vw, 28px)" }}>
                                {coins}
                            </span>
                        </motion.div>

                        <motion.button
                            id="pause-button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handlePauseClick}
                            className="bg-white/20 hover:bg-white/30 border border-white/10 backdrop-blur-md text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg cursor-pointer transition-colors"
                        >
                            ||
                        </motion.button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {/* Tutorial Modal */}
                {uiState === 'playing' && showTutorial && (
                    <motion.div
                        id="tutorial-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleTutorialTap}
                        className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/10 backdrop-blur-xs z-40 p-4 sm:p-6 cursor-pointer"
                    >
                        <motion.div
                            id="tutorial-panel"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 150, damping: 20 }}
                            className={`${
                                isCompact 
                                    ? 'p-4 rounded-2xl max-w-[290px]' 
                                    : 'p-8 rounded-3xl max-w-sm'
                            } bg-sky-400/75 border-2 border-t-0 border-sky-400 backdrop-blur-md w-full text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center`}
                        >
                            {/* Decorative Top Accent line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-100 to-transparent" />

                            {/* Header */}
                            <h3 className={`${
                                isCompact ? 'text-lg mb-2' : 'text-2xl mb-4'
                            } font-black text-white uppercase tracking-wider drop-shadow`}>
                                {getLang() === 'es' ? 'Cómo Jugar' : 'How to Play'}
                            </h3>

                            {/* Animated Responsive Tutorial Icons */}
                            <div className={`flex items-center justify-center ${
                                isCompact ? 'gap-3 mb-3' : 'gap-5 mb-5'
                            }`}>
                                {/* Icon 1: Tap/Click/Drag */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.08, 1],
                                        y: [0, -3, 0],
                                    }}
                                    transition={{
                                        duration: 1.6,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className={`${
                                        isCompact ? 'w-12 h-12 p-1.5' : 'w-16 h-16 p-2.5'
                                    } flex items-center justify-center`}
                                >
                                    <img
                                        src="/tutorial-assets/SVG/LeftClick-Blue_noOutline.svg"
                                        alt="Tap & Hold"
                                        className="w-full h-full object-contain filter drop-shadow-sm select-none pointer-events-none"
                                    />
                                </motion.div>

                                {/* Animated connection/arrow */}
                                <span className={`text-sky-100 font-extrabold ${isCompact ? 'text-sm' : 'text-lg'}`}>
                                    ➔
                                </span>

                                {/* Icon 2: Move Left/Right */}
                                <motion.div
                                    animate={{
                                        x: [-12, 12, -12],
                                    }}
                                    transition={{
                                        duration: 2.2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className={`${
                                        isCompact ? 'w-12 h-12 p-1.5' : 'w-16 h-16'
                                    } flex items-center justify-center`}
                                >
                                    <img
                                        src="/tutorial-assets/SVG/MoveLeftRight_noOutline.svg"
                                        alt="Drag Left & Right"
                                        className="w-full h-full object-contain filter drop-shadow-sm select-none pointer-events-none"
                                    />
                                </motion.div>
                            </div>

                            {/* Tutorial Instructions */}
                            <p className={`text-white font-bold whitespace-pre-line leading-relaxed ${
                                isCompact ? 'text-[12px] mb-3' : 'text-sm sm:text-base mb-6'
                            }`}>
                                {t('tutorial')}
                            </p>

                            {/* Interactive blinking footer action */}
                            <span className={`${
                                isCompact ? 'text-[9px]' : 'text-xs'
                            } text-sky-100 font-extrabold uppercase tracking-widest animate-pulse`}>
                                {getLang() === 'es' ? '¡Toca para empezar!' : 'Tap screen to start!'}
                            </span>
                        </motion.div>
                    </motion.div>
                )}

                {/* Pause screen overlay */}
                {uiState === 'paused' && (
                    <motion.div
                        id="pause-menu-overlay"
                        key="paused-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto bg-sky-950/80 backdrop-blur-md z-45"
                    >
                        <motion.h2
                            id="pause-title"
                            initial={{ y: -50 }}
                            animate={{ y: 0 }}
                            className="text-5xl font-black text-white mb-10 drop-shadow-lg tracking-wide uppercase"
                        >
                            {t('pause')}
                        </motion.h2>

                        {/* Resume / Play Button */}
                        <motion.button
                            id="resume-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleResumeClick}
                            className="bg-white text-sky-900 px-12 py-4 rounded-full text-2xl font-black shadow-2xl mb-6 cursor-pointer border-4 border-sky-100"
                        >
                            {t('resume')}
                        </motion.button>

                        <div className="flex flex-col gap-3">
                            {/* Audio Toggle Settings button */}
                            <motion.button
                                id="pause-settings-button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleSettings}
                                className="bg-sky-900/60 border border-white/10 hover:border-white/20 text-white px-8 py-3.5 rounded-2xl text-base font-bold shadow-lg cursor-pointer transition-colors flex items-center justify-center gap-2.5 w-full"
                            >
                                <img
                                    src={musicOn ? '/icons/music-on.png' : '/icons/music-off.png'}
                                    className="w-5 h-5 opacity-90"
                                    alt=""
                                />
                                <span>{musicOn ? t('musicOn') : t('musicOff')}</span>
                            </motion.button>

                            {/* Home button */}
                            <motion.button
                                id="pause-home-button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleHomeClick}
                                className="bg-sky-900/60 border border-white/10 hover:border-white/20 text-white px-8 py-3.5 rounded-2xl text-base font-bold shadow-lg cursor-pointer transition-colors flex items-center justify-center gap-2.5 w-full"
                            >
                                <img 
                                    src="/icons/house.png" 
                                    className="w-5 h-5 opacity-90 drop-shadow-sm" 
                                    alt="" 
                                />
                                <span>{t('home')}</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
