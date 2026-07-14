import { create } from "zustand";

export type UIState = "loading" | "lobby" | "playing" | "paused" | "gameover" | "bonus" | "resuming";

interface GameState {
  uiState: UIState;
  score: number;
  highScore: number;
  coins: number;
  lives: number;
  showTutorial: boolean;
  loadProgress: number;
  bonusTimeLeft: number;
  isBonusStarted: boolean;
  showAdLifeline: boolean;  // show "watch ad to get a life" popup
  setUiState: (state: UIState) => void;
  setScore: (score: number) => void;
  setHighScore: (score: number) => void;
  setCoins: (coins: number) => void;
  setLives: (lives: number) => void;
  setShowTutorial: (show: boolean) => void;
  setLoadProgress: (progress: number) => void;
  setBonusTimeLeft: (time: number) => void;
  setIsBonusStarted: (started: boolean) => void;
  setShowAdLifeline: (show: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  uiState: "loading",
  score: 0,
  highScore: 0,
  coins: 0,
  lives: 3,
  showTutorial: false,
  loadProgress: 0,
  bonusTimeLeft: 10,
  isBonusStarted: false,
  showAdLifeline: false,
  setUiState: (state) => set({ uiState: state }),
  setScore: (score) => set({ score }),
  setHighScore: (score) => set({ highScore: score }),
  setCoins: (coins) => set({ coins }),
  setLives: (lives) => set({ lives }),
  setShowTutorial: (show) => set({ showTutorial: show }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  setBonusTimeLeft: (time) => set({ bonusTimeLeft: time }),
  setIsBonusStarted: (started) => set({ isBonusStarted: started }),
  setShowAdLifeline: (show) => set({ showAdLifeline: show }),
}));
