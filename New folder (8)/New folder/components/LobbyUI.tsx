'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { t, getLang, LANG_NAMES } from '@/lib/translation';
import { Storage } from '@/lib/storage';
import { soundManager } from '@/lib/soundManager';
import { useGameStore } from '@/lib/gameStore';
import LanguageDialog from './LanguageDialog';

export default function LobbyUI() {
    const { setUiState } = useGameStore();
    const [highScore] = useState(() => {
        if (typeof window !== 'undefined') {
            return Storage.getHighScore();
        }
        return 0;
    });
    const [coins] = useState(() => {
        if (typeof window !== 'undefined') {
            return Storage.getCoins();
        }
        return 0;
    });
    const [musicOn, setMusicOn] = useState(() => {
        if (typeof window !== 'undefined') {
            return Storage.getSettings().music;
        }
        return true;
    });
    const [lang, setLangState] = useState(() => {
        if (typeof window !== 'undefined') {
            return getLang();
        }
        return 'en';
    });
    const [langDialogOpen, setLangDialogOpen] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const activeCardRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    useEffect(() => {
        if (scrollRef.current && activeCardRef.current) {
            // Wait a tiny bit for layout to settle, then instantly scroll to the active card
            const timer = setTimeout(() => {
                if (scrollRef.current && activeCardRef.current) {
                    const container = scrollRef.current;
                    const card = activeCardRef.current;
                    const targetScroll = card.offsetLeft - (container.clientWidth / 2) + (card.clientWidth / 2);
                    container.scrollTo({ left: targetScroll, behavior: 'instant' });
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, []);

    const onMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        isDragging.current = true;
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;
        scrollRef.current.style.cursor = 'grabbing';
    };

    const onMouseLeave = () => {
        isDragging.current = false;
        if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
    };

    const onMouseUp = () => {
        isDragging.current = false;
        if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walkX = (x - startX.current) * 2;
        scrollRef.current.scrollLeft = scrollLeft.current - walkX;
    };

    const handlePlay = () => {
        soundManager.playWoosh();
        setUiState('playing');
        // Wait for the Lobby UI exit animation to finish before starting the Phaser scene
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('GAME_START'));
        }, 400);
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

    const openLangDialog = () => {
        setLangDialogOpen(true);
        soundManager.playClick();
    };

    const closeLangDialog = () => {
        setLangDialogOpen(false);
        setLangState(getLang());
        forceUpdate((n) => n + 1);
    };

    return (
        <motion.div
            id="lobby-ui-container"
            key="lobby"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="absolute inset-0 flex flex-col overflow-hidden bg-sky-500/10 backdrop-blur-xs pointer-events-auto text-white min-h-[350px]"
            style={{
                paddingTop: "max(1rem, env(safe-area-inset-top))",
                paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
        >
            {/* Top Bar: High Score and Coins */}
            <div
                className="absolute top-0 left-0 right-0 flex justify-between items-start z-50 pointer-events-none"
                style={{
                    paddingTop: "max(1rem, env(safe-area-inset-top))",
                    paddingLeft: "max(1rem, env(safe-area-inset-left))",
                    paddingRight: "max(1rem, env(safe-area-inset-right))",
                }}
            >
                {/* High Score Panel (Top Left) */}
                <motion.div
                    id="high-score-panel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-sky-950/40 backdrop-blur-md px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.4rem,1.5dvh,0.75rem)] rounded-3xl border border-white/15 text-center shadow-xl pointer-events-auto"
                >
                    <span className="text-sky-300 text-[clamp(0.55rem,2vw,0.75rem)] font-semibold tracking-wider uppercase block mb-0.5">
                        {t('highScore')}
                    </span>
                    <span className="text-[clamp(1rem,4vw,1.5rem)] font-black text-yellow-300 drop-shadow leading-none">
                        {highScore}
                    </span>
                </motion.div>

                {/* Coins Panel (Top Right) */}
                <motion.div
                    id="coins-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-sky-950/40 backdrop-blur-md px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.4rem,1.5dvh,0.75rem)] rounded-3xl border border-white/15 flex flex-col items-center justify-center shadow-xl min-w-[80px] pointer-events-auto"
                >
                    <span className="text-amber-200 text-[clamp(0.55rem,2vw,0.75rem)] font-semibold tracking-wider uppercase block mb-0.5">
                        Coins
                    </span>
                    <div className="flex items-center gap-1.5 leading-none">
                        <img src="/icons/coin.png" className="w-4 h-4 sm:w-5 sm:h-5 object-contain drop-shadow" alt="Coin" />
                        <span className="text-[clamp(1rem,4vw,1.5rem)] font-black text-amber-300 drop-shadow">
                            {coins}
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Main content area — takes all available space and centers content */}
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 pt-[clamp(3.5rem,12dvh,5rem)] px-4">
                {/* Title & Decorative Cloud */}
                <div className="text-center mb-[clamp(0.5rem,2dvh,2rem)] relative w-full max-w-md px-2">
                    <motion.div
                        id="lobby-cloud"
                        animate={{
                            x: [-20, 20, -20],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -top-8 sm:-top-12 left-1/2 transform -translate-x-1/2 opacity-30 w-24 sm:w-32 h-8 sm:h-10 bg-white rounded-full blur-xs"
                    />

                    <motion.h1
                        id="lobby-title"
                        initial={{ y: -30 }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 120, damping: 10 }}
                        className="text-[clamp(2rem,min(8vw,12dvh),5rem)] leading-[1.05] font-black tracking-tight drop-shadow-lg text-white break-words font-fredoka"
                    >
                        Jump Over
                    </motion.h1>
                    <p className="text-sky-100 font-bold tracking-widest uppercase mt-1 text-[clamp(0.6rem,min(2.5vw,3.5dvh),0.9rem)] drop-shadow-md">{"Altitude Challenge"}</p>
                </div>

                {/* Level Selection Section */}
                <div className="w-full max-w-lg mb-[clamp(1rem,2dvh,1.5rem)] flex flex-col items-center gap-2 relative">
                    <div
                        ref={scrollRef}
                        onMouseDown={onMouseDown}
                        onMouseLeave={onMouseLeave}
                        onMouseUp={onMouseUp}
                        onMouseMove={onMouseMove}
                        className="flex items-center gap-4 w-full overflow-x-auto snap-x snap-mandatory px-4 pb-6 pt-2 hide-scrollbar [&::-webkit-scrollbar]:hidden cursor-grab scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >

                        {/* Start Spacer to center the first card */}
                        <div className="shrink-0 w-[calc(50%-clamp(4rem,13.33dvh,6.66rem)-1.5rem)]" />

                        {/* 0. Left Mock Card (Coming Soon) */}
                        <div className="snap-center relative shrink-0 w-auto h-[clamp(12rem,40dvh,20rem)] aspect-[2/3] bg-sky-950/40 backdrop-blur-sm rounded-[clamp(1.5rem,3dvh,2rem)] border-[clamp(2px,0.5dvh,4px)] border-sky-800/50 shadow-inner overflow-hidden flex flex-col items-center justify-center p-4">
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-900/80 flex items-center justify-center shadow-inner">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-sky-200 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                                    </svg>
                                </div>
                                <span className="font-fredoka font-black text-center text-sky-400 text-[clamp(1rem,3.5vw,1.2rem)] tracking-wider">COMING<br />SOON</span>
                            </div>
                        </div>

                        {/* 1. Current Level Card (Portrait) */}
                        <motion.div
                            ref={activeCardRef}
                            whileHover={{ scale: 1.02 }}
                            className="snap-center relative shrink-0 w-auto h-[clamp(12rem,40dvh,20rem)] aspect-[2/3] bg-[#8ce6ff] rounded-[clamp(1.5rem,3dvh,2rem)] border-[clamp(2px,0.5dvh,4px)] border-white shadow-xl overflow-hidden flex flex-col justify-end p-4 group"
                        >
                            {/* Background Image from assets */}
                            <img
                                src="/game-assets/environment/background_tall.svg"
                                alt="Level Background"
                                draggable={false}
                                className="absolute inset-0 w-full h-full object-cover opacity-80 select-none pointer-events-none"
                            />

                            {/* UI Overlay */}
                            <div className="absolute top-4 left-4 z-20 drop-shadow-md text-left pointer-events-none">
                                <h3 className="font-fredoka font-black text-white text-[clamp(0.9rem,3vw,1.1rem)] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Sky Islands</h3>
                            </div>

                            {/* Player Character */}
                            <img
                                src="/game-assets/characters/white_sheep.svg"
                                alt="Player"
                                draggable={false}
                                className="absolute bottom-3 right-3 w-8 h-8 sm:w-10 sm:h-10 object-contain z-30 drop-shadow-lg group-hover:-translate-y-1 transition-transform select-none pointer-events-none"
                            />

                            {/* Short Screen Play Button (Appears centered on the card when height < 700px) */}
                            <div className="absolute inset-0 flex items-center justify-center z-40 hidden [@media(max-height:700px)]:flex pointer-events-none">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => { e.stopPropagation(); handlePlay(); }}
                                    className="bg-white text-sky-900 font-extrabold text-[clamp(0.8rem,3vw,1rem)] px-[clamp(1.25rem,4vw,1.75rem)] py-[clamp(0.3rem,1dvh,0.5rem)] rounded-full shadow-xl border-[3px] border-sky-100/50 pointer-events-auto"
                                >
                                    {t('play')}
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* 2. Coming Soon Card (Portrait) */}
                        <div className="snap-center relative shrink-0 w-auto h-[clamp(12rem,40dvh,20rem)] aspect-[2/3] bg-sky-950/40 backdrop-blur-sm rounded-[clamp(1.5rem,3dvh,2rem)] border-[clamp(2px,0.5dvh,4px)] border-sky-800/50 shadow-inner overflow-hidden flex flex-col items-center justify-center p-4">
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-900/80 flex items-center justify-center shadow-inner">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 text-sky-200 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                                    </svg>
                                </div>
                                <span className="font-fredoka font-black text-center text-sky-400 text-[clamp(1rem,3.5vw,1.2rem)] tracking-wider">COMING<br />SOON</span>
                            </div>
                        </div>

                        {/* End Spacer to center the last card */}
                        <div className="shrink-0 w-[calc(50%-clamp(4rem,13.33dvh,6.66rem)-1.5rem)]" />

                    </div>

                    {/* Main Play Button (Hides on short screens) */}
                    <motion.button
                        id="play-button"
                        whileHover={{ scale: 1.1, boxShadow: "0px 10px 30px rgba(255,255,255,0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePlay}
                        className="bg-white text-sky-900 font-extrabold text-[clamp(1.1rem,min(5vw,6dvh),2rem)] px-[clamp(2rem,min(8vw,10dvh),4rem)] py-[clamp(0.5rem,2dvh,1rem)] rounded-full shadow-2xl cursor-pointer border-4 border-sky-100/50 z-10 shrink-0 [@media(max-height:700px)]:hidden"
                    >
                        {t('play')}
                    </motion.button>
                </div>
            </div>

            {/* Bottom bar options — normal flow (no absolute positioning) so it never overlaps content */}
            <div className="flex flex-wrap gap-2 sm:gap-4 w-full justify-center px-2 pt-[clamp(0.75rem,2dvh,1.5rem)]">
                <motion.button
                    id="toggle-settings-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleSettings}
                    className="bg-sky-950/60 backdrop-blur-md border border-white/10 hover:border-white/25 text-white px-3.5 sm:px-5 py-[clamp(0.5rem,2dvh,0.75rem)] rounded-2xl text-[clamp(0.65rem,2.8vw,0.875rem)] font-bold flex items-center gap-2 sm:gap-2.5 cursor-pointer transition-colors shadow-lg"
                >
                    <img
                        src={musicOn ? '/icons/music-on.png' : '/icons/music-off.png'}
                        className="w-4 h-4 sm:w-5 sm:h-5 opacity-90"
                        alt="Music"
                    />
                    <span>{musicOn ? t('musicOn') : t('musicOff')}</span>
                </motion.button>

                <motion.button
                    id="toggle-lang-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openLangDialog}
                    className="bg-sky-950/60 backdrop-blur-md border border-white/10 hover:border-white/25 text-white px-3.5 sm:px-5 py-[clamp(0.5rem,2dvh,0.75rem)] rounded-2xl text-[clamp(0.65rem,2.8vw,0.875rem)] font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg"
                >
                    <img src="/icons/checkmark.png" className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" alt="" />
                    <span>{LANG_NAMES[lang] || lang.toUpperCase()}</span>
                </motion.button>
            </div>

            <LanguageDialog open={langDialogOpen} onClose={closeLangDialog} />
        </motion.div>
    );
}
