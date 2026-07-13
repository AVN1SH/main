'use client';
import dynamic from 'next/dynamic';
import GameUI from '@/components/GameUI';

const GameWrapper = dynamic(() => import('@/components/GameWrapper'), { ssr: false });

export default function Home() {
  return (
    <main className="fixed inset-0 bg-gray-900 flex items-center justify-center overflow-hidden">
      <div className="w-full h-full overflow-hidden relative font-sans text-white bg-[#87CEEB]">
        {/* Farm Background */}
        <div className="absolute inset-0 z-0 bg-[url('/game-assets/environment/background_tall.svg')] bg-cover bg-bottom opacity-80 pointer-events-none"></div>

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

