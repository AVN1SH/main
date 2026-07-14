"use client";

import { motion, AnimatePresence } from "motion/react";
import { soundManager } from "@/lib/soundManager";
import {
  t,
  getLang,
  setLang,
  LANG_NAMES,
  type LangCode,
} from "@/lib/translation";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LanguageDialog({ open, onClose }: Props) {
  const current = getLang();

  const handleSelect = (code: LangCode) => {
    if (code === current) {
      onClose();
      return;
    }
    setLang(code);
    soundManager.playClick();
    onClose();
  };

  const handleBackdrop = () => {
    soundManager.playCancel();
    onClose();
  };

  const handleClose = () => {
    soundManager.playCancel();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lang-dialog-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
                onClick={handleClose}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs p-4 pointer-events-auto"
        >
          <motion.div
            key="lang-dialog-panel"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-sky-400/80 border-2 border-sky-300 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-xs relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <h2 className="text-white text-lg font-black tracking-wide uppercase">
                {t("settings")}
              </h2>
              <button
          onClick={handleBackdrop}
                className="w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer"
              >
                <img
                  src="./icons/close.png"
                  className="size-full"
                  alt="Close"
                />
              </button>
            </div>

            {/* Language list with custom playful game scrollbar */}
            <div
              className="px-3 pb-4 max-h-[60dvh] overflow-y-auto pr-1.5
                [&::-webkit-scrollbar]:w-2.5
                [&::-webkit-scrollbar-track]:bg-sky-100/0
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:my-2
                [&::-webkit-scrollbar-thumb]:bg-white
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:border-2
                [&::-webkit-scrollbar-thumb]:border-sky-500
                hover:[&::-webkit-scrollbar-thumb]:bg-sky-100"
            >
              {(Object.keys(LANG_NAMES) as LangCode[]).map((code) => {
                const isActive = code === current;
                return (
                  <button
                    key={code}
                    onClick={() => handleSelect(code)}
                    className={`w-full text-left px-4 py-3 rounded-2xl mb-1 flex items-center gap-3 transition-colors cursor-pointer ${
                      isActive
                        ? "bg-sky-400/20 border border-sky-400/40"
                        : "hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        isActive ? "text-white" : "text-white/80"
                      }`}
                    >
                      {LANG_NAMES[code]}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-white text-xs font-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
