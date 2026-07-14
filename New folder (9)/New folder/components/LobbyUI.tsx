'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { t, getLang, LANG_NAMES } from '@/lib/translation';
import { Storage } from '@/lib/storage';
import { soundManager } from '@/lib/soundManager';
import { useGameStore } from '@/lib/gameStore';
import { mapManager, MapId } from '@/game/mapManager';
import { MAP_1_CONFIG, MAP_2_CONFIG, MAP_3_CONFIG } from '@/game/maps';
import { CHARACTER_SVGS } from '@/game/characters';
import LanguageDialog from './LanguageDialog';

const MAPS: { id: MapId; config: typeof MAP_1_CONFIG; character: string }[] = [
  { id: 'map-1', config: MAP_1_CONFIG, character: './game-assets/map-1/characters/white_sheep.svg' },
  { id: 'map-2', config: MAP_2_CONFIG, character: './game-assets/map-2/characters/parrot.svg' },
  { id: 'map-3', config: MAP_3_CONFIG, character: './game-assets/map-3/characters/demon.svg' },
];

const MAP_BG_IMAGES: Record<MapId, string> = {
  'map-1': './game-assets/map-1/environment/background_tall.svg',
  'map-2': './game-assets/map-2/background/background_tall.svg',
  'map-3': './game-assets/map-3/environment/background.svg',
};

const MAP_COSTS: Record<MapId, number> = {
  'map-1': 0,
  'map-2': 200,
  'map-3': 500,
};

export default function LobbyUI() {
  const { setUiState, highScore, setCoins } = useGameStore();
  const [selectedMap, setSelectedMap] = useState<MapId>(() => mapManager.getCurrentId());

  useEffect(() => {
    soundManager.resumeContext();
    const t = setTimeout(() => soundManager.startBgm(), 300);
    return () => clearTimeout(t);
  }, []);
  const [coins, setCoinsState] = useState(() => {
    if (typeof window !== 'undefined') {
      return Storage.getCoins();
    }
    return 0;
  });
  const [unlockedMaps, setUnlockedMaps] = useState<string[]>(() => {
    if (typeof window !== 'undefined') return Storage.getUnlockedMaps();
    return ['map-1'];
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
  const [spendingAnimation, setSpendingAnimation] = useState<{ startX: number, startY: number, targetX: number, targetY: number, cost: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const coinsPanelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const selectedMapRef = useRef(selectedMap);

  useEffect(() => {
    selectedMapRef.current = selectedMap;
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const card = container.querySelector(`[data-map-id="${selectedMap}"]`) as HTMLElement;
    if (card) {
      const targetScroll = card.offsetLeft - container.clientWidth / 2 + card.offsetWidth / 2;
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [selectedMap]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(snapToClosest, 150);
    };
    container.addEventListener('scroll', onScroll);
    return () => {
      container.removeEventListener('scroll', onScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  const snapToClosest = () => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.querySelectorAll('[data-map-id]');
    const containerRect = container.getBoundingClientRect();
    const center = containerRect.left + containerRect.width / 2;
    let closest: string | null = null;
    let closestDist = Infinity;
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = card.getAttribute('data-map-id');
      }
    });
    if (closest && closest !== selectedMapRef.current) {
      setSelectedMap(closest as MapId);
      mapManager.setCurrent(closest as MapId);
      soundManager.playWoosh();
      soundManager.switchBgm(mapManager.get(closest as MapId).music);
    }
  };

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
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    snapToClosest();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walkX = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walkX;
  };

  const handleSelectMap = (id: MapId) => {
    setSelectedMap(id);
    mapManager.setCurrent(id);
    soundManager.playWoosh();
    soundManager.switchBgm(mapManager.get(id).music);
  };

  const handlePlay = () => {
    if (!unlockedMaps.includes(selectedMap)) return;
    mapManager.setCurrent(selectedMap);
    soundManager.playClick();
    setUiState('playing');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('GAME_START'));
    }, 400);
  };

  const handleUnlock = (e: React.MouseEvent, id: MapId, cost: number) => {
    if (coins >= cost) {
      if (spendingAnimation) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;
      
      let targetX = startX;
      let targetY = 10;
      if (coinsPanelRef.current) {
        const pRect = coinsPanelRef.current.getBoundingClientRect();
        targetX = pRect.left + pRect.width / 2;
        targetY = pRect.top + pRect.height / 2;
      }
      
      setSpendingAnimation({ startX, startY, targetX, targetY, cost });
      soundManager.playCollect();
      
      setTimeout(() => {
        const newCoins = coins - cost;
        Storage.setCoins(newCoins);
        setCoinsState(newCoins);
        setCoins(newCoins);
        Storage.unlockMap(id);
        setUnlockedMaps([...unlockedMaps, id]);
        soundManager.playUnlock();
      }, 1300);

      setTimeout(() => {
        setSpendingAnimation(null);
      }, 2500);
    } else {
      soundManager.playDamage();
      const coinsPanel = document.getElementById('coins-panel');
      if (coinsPanel) {
        coinsPanel.animate(
          [{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
          { duration: 400, easing: 'ease-in-out' }
        );
      }
    }
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
  };

  return (
    <motion.div
      id="lobby-ui-container"
      key="lobby"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="absolute inset-0 flex flex-col overflow-hidden backdrop-blur-xs pointer-events-auto text-white min-h-[350px]"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={selectedMap}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${MAP_BG_IMAGES[selectedMap]})` }}
          />
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none bg-black/5" />
      <div
        className="absolute top-0 left-0 right-0 flex justify-between items-start z-50 pointer-events-none"
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top))",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <motion.div
          id="high-score-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-sky-950/40 backdrop-blur-md px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.4rem,1.5dvh,0.75rem)] rounded-3xl border border-white/15 text-center shadow-xl pointer-events-auto"
        >
            <span className="text-[clamp(0.55rem,2vw,0.75rem)] text-sky-300 font-semibold tracking-wider uppercase block mb-0.5">
              {t('highScore')}
            </span>
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <img src="./icons/trophy.png" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain drop-shadow" alt="" />
            <span className="text-[clamp(1rem,4vw,1.5rem)] font-black text-yellow-300 drop-shadow leading-none">
                {highScore}
            </span>
          </div>
        </motion.div>

        <motion.div
          id="coins-panel"
          ref={coinsPanelRef}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-sky-950/40 backdrop-blur-md px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.4rem,1.5dvh,0.75rem)] rounded-3xl border border-white/15 flex flex-col items-center justify-center shadow-xl min-w-[80px] pointer-events-auto"
        >
          <span className="text-amber-200 text-[clamp(0.55rem,2vw,0.75rem)] font-semibold tracking-wider uppercase block mb-0.5">
            Coins
          </span>
          <div className="flex items-center gap-1.5 leading-none">
            <img src="./icons/coin.png" className="w-4 h-4 sm:w-5 sm:h-5 object-contain drop-shadow" alt="Coin" />
            <span className="text-[clamp(1rem,4vw,1.5rem)] font-black text-amber-300 drop-shadow">
              {coins}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 pt-[clamp(3.5rem,12dvh,5rem)] px-4">
        <div className="text-center mb-[clamp(0.5rem,2dvh,2rem)] relative w-full max-w-md px-2">
          <motion.div
            id="lobby-cloud"
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
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

        <div className="w-full max-w-lg mb-[clamp(1rem,2dvh,1.5rem)] flex flex-col items-center gap-2 relative">
          <div
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            className="flex items-center gap-4 w-full overflow-x-auto snap-x snap-mandatory px-4 pb-6 pt-2 hide-scrollbar [&::-webkit-scrollbar]:hidden cursor-grab scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 22%, black 78%, transparent 100%)',
            }}
          >
            <div className="shrink-0 w-[calc(50%-clamp(4rem,13.33dvh,6.66rem)-1.5rem)]" />

            {MAPS.map((map) => {
              const isSelected = selectedMap === map.id;
              const isUnlocked = unlockedMaps.includes(map.id);
              const cost = MAP_COSTS[map.id as MapId] || 0;
              return (
                <motion.div
                  key={map.id}
                  data-map-id={map.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleSelectMap(map.id)}
                  className={`snap-center relative shrink-0 w-auto h-[clamp(12rem,40dvh,20rem)] aspect-[2/3] rounded-[clamp(1.5rem,3dvh,2rem)] border-[clamp(2px,0.5dvh,4px)] overflow-hidden flex flex-col justify-end p-4 group cursor-pointer transition-all ${
                    isSelected
                      ? 'border-white ring-2 ring-white/40'
                      : 'border-white/80 hover:border-white'
                  }`}
                  style={{ background: '#1e293b' }}
                >
                  <img
                    src={map.config.backgroundTall}
                    alt={map.config.name}
                    draggable={false}
                    className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none ${!isUnlocked ? 'blur-[4px] opacity-40' : 'opacity-70'}`}
                  />

                  <div className="absolute top-4 left-4 z-20 drop-shadow-md text-left pointer-events-none">
                    <h3 className="font-fredoka font-black text-white text-[clamp(0.8rem,3vw,1.1rem)] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                      {map.config.name}
                    </h3>
                  </div>

                  <div
                    className={`absolute bottom-3 right-3 w-8 h-8 sm:w-10 sm:h-10 z-30 drop-shadow-lg select-none pointer-events-none ${isSelected && isUnlocked ? 'character-excited' : 'character-bounce'}`}
                    style={{ filter: !isUnlocked ? 'grayscale(100%) opacity(70%)' : 'none' }}
                    dangerouslySetInnerHTML={{ __html: CHARACTER_SVGS[map.id] }}
                  />

                  <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    {isUnlocked ? (
                      <div className="hidden [@media(max-height:700px)]:flex">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); handleSelectMap(map.id); handlePlay(); }}
                          className="bg-white text-sky-900 font-extrabold text-[clamp(0.8rem,3vw,1rem)] px-[clamp(1.25rem,4vw,1.75rem)] py-[clamp(0.3rem,1dvh,0.5rem)] rounded-full shadow-xl border-[3px] border-sky-100/50 pointer-events-auto"
                        >
                          {t('play')}
                        </motion.button>
                      </div>
                    ) : (
                      <div
                        className="backdrop-blur-sm text-amber-500 font-extrabold text-[clamp(0.8rem,3vw,1rem)] px-[clamp(1rem,4vw,1.5rem)] py-[clamp(0.3rem,1dvh,0.5rem)] rounded-full aspect-square flex flex-col items-center gap-1.5 pointer-events-auto"
                      >
                        <img src="./icons/lock.png" className="w-9 h-9 object-contain" alt="Lock" />
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); handleSelectMap(map.id); handleUnlock(e, map.id, cost); }}
                          className="flex items-center gap-1 bg-white rounded-full px-2 py-0.5 inset-shadow-sm inset-shadow-amber-600 cursor-pointer"
                        >
                          <img src="./icons/coin.png" className="w-4 h-4 object-contain" alt="" />
                          <span>{cost}</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            <div className="shrink-0 w-[calc(50%-clamp(4rem,13.33dvh,6.66rem)-1.5rem)]" />
          </div>

          <motion.button
            id="play-button"
            animate={{ opacity: unlockedMaps.includes(selectedMap) ? 1 : 0 }}
            style={{ pointerEvents: unlockedMaps.includes(selectedMap) ? 'auto' : 'none' }}
            whileHover={{ scale: 1.1, boxShadow: "0px 10px 30px rgba(255,255,255,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
            className="bg-white text-sky-900 font-extrabold text-[clamp(1.1rem,min(5vw,6dvh),2rem)] px-[clamp(2rem,min(8vw,10dvh),4rem)] py-[clamp(0.5rem,2dvh,1rem)] rounded-full shadow-2xl cursor-pointer border-4 border-sky-100/50 z-10 shrink-0 [@media(max-height:700px)]:hidden"
          >
            {t('play')}
          </motion.button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4 w-full justify-center px-2 pt-[clamp(0.75rem,2dvh,1.5rem)]">
        <motion.button
          id="toggle-settings-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSettings}
          className="bg-sky-950/60 backdrop-blur-md border border-white/10 hover:border-white/25 text-white px-3.5 sm:px-5 py-[clamp(0.5rem,2dvh,0.75rem)] rounded-2xl text-[clamp(0.65rem,2.8vw,0.875rem)] font-bold flex items-center gap-2 sm:gap-2.5 cursor-pointer transition-colors shadow-lg"
        >
          <img
            src={musicOn ? './icons/music-on.png' : './icons/music-off.png'}
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
          <img src="./icons/checkmark.png" className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" alt="" />
          <span>{LANG_NAMES[lang] || lang.toUpperCase()}</span>
        </motion.button>
      </div>

      <LanguageDialog open={langDialogOpen} onClose={closeLangDialog} />

      {spendingAnimation && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 50 + (i % 2) * 30;
            const scatterX = Math.cos(angle) * radius;
            const scatterY = Math.sin(angle) * radius;
            
            return (
              <motion.img
                key={i}
                src="./icons/coin.png"
                className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 object-contain drop-shadow-md"
                initial={{ x: spendingAnimation.startX - 12, y: spendingAnimation.startY - 12, scale: 0, opacity: 0 }}
                animate={{ 
                  x: [
                    spendingAnimation.startX - 12,
                    spendingAnimation.startX - 12 + scatterX,
                    spendingAnimation.startX - 12 + scatterX,
                    spendingAnimation.targetX - 12
                  ],
                  y: [
                    spendingAnimation.startY - 12,
                    spendingAnimation.startY - 12 + scatterY,
                    spendingAnimation.startY - 12 + scatterY - 15,
                    spendingAnimation.targetY - 12
                  ],
                  scale: [0, 1.5, 1.5, 0.5],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.05,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.6, 1]
                }}
              />
            );
          })}
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: 35, scale: [0.5, 1.2, 1, 1] }}
            transition={{ duration: 1.2, delay: 1.2, times: [0, 0.15, 0.8, 1] }}
            className="absolute text-red-500 font-black text-[clamp(1.5rem,5vw,2rem)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{ left: spendingAnimation.targetX - 25, top: spendingAnimation.targetY + 20 }}
          >
            -{spendingAnimation.cost}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
