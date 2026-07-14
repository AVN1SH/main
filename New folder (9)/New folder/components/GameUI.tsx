'use client';

import React from 'react';
import { AnimatePresence } from 'motion/react';
import { useGameStore } from '@/lib/gameStore';
import LoadingUI from './LoadingUI';
import LobbyUI from './LobbyUI';
import InGameUI from './InGameUI';
import GameOverUI from './GameOverUI';
import BonusUI from './BonusUI';
import ResumingUI from './ResumingUI';

export default function GameUI() {
    const { uiState } = useGameStore();

    return (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-25 flex flex-col justify-between">
            <AnimatePresence>
                {uiState === 'loading' && (
                    <LoadingUI key="loading-screen" />
                )}

                {uiState === 'lobby' && (
                    <LobbyUI key="lobby-screen" />
                )}

                {(uiState === 'playing' || uiState === 'paused' || uiState === 'resuming') && (
                    <InGameUI key="ingame-screen" />
                )}

                {uiState === 'resuming' && (
                    <ResumingUI key="resuming-screen" />
                )}

                {uiState === 'gameover' && (
                    <GameOverUI key="gameover-screen" />
                )}

                {uiState === 'bonus' && (
                    <BonusUI key="bonus-screen" />
                )}
            </AnimatePresence>
        </div>
    );
}
