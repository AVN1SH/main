'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { mapManager } from '@/game/mapManager';

const GameWrapper = dynamic(() => import('@/components/GameWrapper'), { ssr: false });
const GameUI = dynamic(() => import('@/components/GameUI'), { ssr: false });

export default function Home() {
  const [bgImage, setBgImage] = useState(() => mapManager.getCurrentConfig().backgroundTall);

  useEffect(() => {
    // Force re-read of the config after mount in case mapManager uses localStorage
    setBgImage(mapManager.getCurrentConfig().backgroundTall);
    const unsub = mapManager.subscribe((_id, config) => setBgImage(config.backgroundTall));
    return unsub;
  }, []);

  return (
    <main className="fixed inset-0 bg-gray-900 flex items-center justify-center overflow-hidden">
      <div className="w-full h-full overflow-hidden relative font-sans text-white bg-[#87CEEB]">
        <div
          className="absolute inset-0 z-0 bg-cover bg-bottom opacity-80 pointer-events-none"
          style={{ backgroundImage: `url(${bgImage})` }}
        />

        <div className="absolute inset-0 z-10">
          <GameWrapper />
        </div>

        <div className="absolute inset-0 z-20 pointer-events-none">
          <GameUI />
        </div>
      </div>
    </main>
  );
}

