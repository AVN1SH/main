'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/lib/gameStore';
import { t, getLang } from '@/lib/translation';
import { Storage } from '@/lib/storage';
import { soundManager } from '@/lib/soundManager';
import { ytRequestRewardedAd, isInPlayablesEnv } from '@/lib/ytgame';
import { mapManager, MapId } from '@/game/mapManager';

export default function InGameUI() {
    const { uiState, score, highScore, lives, coins, showTutorial, showAdLifeline, setUiState, setShowAdLifeline } = useGameStore();
    const [adLifelineBusy, setAdLifelineBusy] = useState(false);
    const currentMap = mapManager.getCurrentId() as MapId;
    const [musicOn, setMusicOn] = useState(() => {
        if (typeof window !== 'undefined') {
            return Storage.getSettings().music;
        }
        return true;
    });

    const [isTouchDevice, setIsTouchDevice] = useState(false);

    const [isCompact, setIsCompact] = useState(false);
    useEffect(() => {
        const check = () => {
            setIsCompact(window.innerHeight < 500 || window.innerWidth < 380);
            setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
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

                        {/* High Score display */}
                        <motion.div
                            id="game-highscore-display"
                            className="bg-black/25 backdrop-blur-xs px-3 py-1.5 rounded-2xl border border-white/10 flex items-center gap-1.5"
                        >
                            <img src="./icons/trophy.png" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain drop-shadow" alt="" />
                            <span className="text-yellow-300 font-bold tracking-wider drop-shadow-md" style={{ fontSize: "Clamp(12px, 1.5vw, 18px)" }}>
                                {highScore}
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
                                        src="./game-assets/map-1/items/heart.svg"
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
                            <img src="./icons/coin.png" className="w-5 h-5 sm:w-6 sm:h-6 object-contain drop-shadow" alt="Coin" />
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
                            {isTouchDevice ? (
                                <div className={`flex flex-col items-center justify-center ${isCompact ? 'mb-4' : 'mb-6'}`}>
                                    <div className={`${isCompact ? 'w-36 h-20' : 'w-48 h-24'} border-4 sm:border-[5px] border-sky-100/90 rounded-[2rem] relative flex items-center justify-center bg-sky-900/30 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm`}>
                                        {/* Mobile screen inner area */}
                                        <div className="absolute inset-2 border border-white/20 rounded-[1.2rem] bg-sky-400/20 pointer-events-none" />
                                        {/* Glowing Touch Indicator */}
                                        <motion.div
                                            animate={{ 
                                                x: [-40, 40, -40], 
                                                scale: [1, 0.8, 1],
                                                opacity: [0.6, 1, 0.6] 
                                            }}
                                            transition={{ 
                                                duration: 2.2, 
                                                repeat: Infinity, 
                                                ease: "easeInOut" 
                                            }}
                                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.9)]"
                                        />
                                    </div>
                                </div>
                            ) : (
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
                            )}

                            {/* Tutorial Instructions */}
                            <p className={`text-white font-bold whitespace-pre-line leading-relaxed ${
                                isCompact ? 'text-[14px] mb-3' : 'text-sm sm:text-base mb-6'
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
                                    src={musicOn ? './icons/music-on.png' : './icons/music-off.png'}
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
                                    src="./icons/house.png" 
                                    className="w-5 h-5 opacity-90 drop-shadow-sm" 
                                    alt="" 
                                />
                                <span>{t('home')}</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Ad Lifeline Popup ─────────────────────────────────────────
                Shows once per round when the player dies. Only fully
                interactive inside the YouTube Playables env; outside of it
                the popup is still shown but the "Watch Ad" button is hidden
                so the player can still choose to continue / decline.
            */}
            <AnimatePresence>
                {showAdLifeline && (
                    <motion.div
                        id="ad-lifeline-overlay"
                        key="ad-lifeline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                            className={`${
                                currentMap === 'map-3' 
                                    ? 'bg-orange-600/75 border-orange-500' 
                                    : currentMap === 'map-2' 
                                        ? 'bg-teal-500/75 border-teal-400' 
                                        : 'bg-sky-400/75 border-sky-400'
                            } border-2 border-t-0 backdrop-blur-md p-8 max-w-[320px] w-full text-center shadow-2xl relative overflow-hidden flex flex-col items-center gap-4 ${isCompact ? 'rounded-2xl' : 'rounded-3xl'}`}
                        >
                            {/* Decorative Top Accent line */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent ${
                                currentMap === 'map-3' 
                                    ? 'via-orange-200' 
                                    : currentMap === 'map-2' 
                                        ? 'via-teal-100' 
                                        : 'via-sky-100'
                            } to-transparent`} />

                            {/* Heart icon with pulse */}
                            <motion.div
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-16 h-16 flex items-center justify-center"
                            >
                                <img src="./game-assets/map-1/items/heart.svg" className="w-9 h-9 drop-shadow" alt="Extra life" />
                            </motion.div>

                            <h3 className="text-2xl font-black text-white tracking-wide drop-shadow uppercase">Continue?</h3>
                            <p className="text-white/90 text-sm font-medium leading-relaxed drop-shadow-sm">
                                {isInPlayablesEnv()
                                    ? 'Watch a short ad to revive with 1 life and keep going!'
                                    : 'Do you want to keep playing from where you fell?'
                                }
                            </p>

                            {/* Watch Ad button – only shown inside Playables env */}
                            {isInPlayablesEnv() && (
                                <motion.button
                                    id="ad-lifeline-watch-btn"
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    disabled={adLifelineBusy}
                                    onClick={async () => {
                                        if (adLifelineBusy) return;
                                        setAdLifelineBusy(true);
                                        soundManager.playClick();
                                        const earned = await ytRequestRewardedAd('lifeline-extra-life-v1');
                                        setAdLifelineBusy(false);
                                        setShowAdLifeline(false);
                                        if (earned) {
                                            window.dispatchEvent(new CustomEvent('AD_LIFELINE_REVIVE'));
                                        } else {
                                            // Ad not earned (skipped) — still decline gracefully
                                            window.dispatchEvent(new CustomEvent('AD_LIFELINE_DECLINE'));
                                        }
                                    }}
                                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 disabled:opacity-60 text-white font-black text-lg py-3.5 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {adLifelineBusy ? (
                                        <span className="animate-pulse drop-shadow-sm">Loading ad…</span>
                                    ) : (
                                        <>
                                            <img src="./icons/continue-arrow-white.png" alt="Play" className="w-6 h-6 drop-shadow-sm object-contain" />
                                            <span className="drop-shadow-sm">Watch Ad &amp; Revive</span>
                                        </>
                                    )}
                                </motion.button>
                            )}

                            {/* No-ad continue (outside Playables) */}
                            {!isInPlayablesEnv() && (
                                <motion.button
                                    id="ad-lifeline-continue-btn"
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => {
                                        soundManager.playClick();
                                        setShowAdLifeline(false);
                                        window.dispatchEvent(new CustomEvent('AD_LIFELINE_REVIVE'));
                                    }}
                                    className={`w-full bg-white ${
                                        currentMap === 'map-3' 
                                            ? 'text-orange-950' 
                                            : currentMap === 'map-2' 
                                                ? 'text-teal-900' 
                                                : 'text-sky-900'
                                    } font-black text-lg py-3.5 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2`}
                                >
                                    <img src="./icons/continue-arrow-black.png" alt="Continue" className="w-6 h-6 opacity-70 object-contain" />
                                    <span>Continue</span>
                                </motion.button>
                            )}

                            {/* Decline button */}
                            <motion.button
                                id="ad-lifeline-decline-btn"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                disabled={adLifelineBusy}
                                onClick={() => {
                                    if (adLifelineBusy) return;
                                    soundManager.playClick();
                                    setShowAdLifeline(false);
                                    window.dispatchEvent(new CustomEvent('AD_LIFELINE_DECLINE'));
                                }}
                                className="flex items-center justify-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold underline underline-offset-2 cursor-pointer disabled:opacity-40 transition-colors mt-1"
                            >
                                <img src="./icons/close-button-white.png" alt="Close" className="w-4 h-4 opacity-80 object-contain" />
                                <span>No thanks, end game</span>
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
