"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Message, MessageRole } from "@/types/global";
import { Bot, User, AlertCircle, Undo2, Coins, CheckSquare, Square, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import SafeMath from "../SafeMath";

interface ChatBubbleProps {
  message: Message;
  isLast: boolean;
  onOptionSelect: (
    option: string,
    id: string,
    action?: "next" | "back" | "try-again" | "buy-now",
  ) => void;
  canGoBack: boolean;
  isLoading: boolean;
  isSmall: boolean;
}

export const ChatBubble = React.memo(
  ({
    message,
    isLast,
    onOptionSelect,
    canGoBack,
    isSmall,
  }: ChatBubbleProps) => {
    const isBot = message.role === MessageRole.BOT;
    const isError = message.isError;
    const isMultiSelect = message.isMultiSelect && isBot;

    // State for multi-select chapter picker
    const [selected, setSelected] = useState<string[]>([]);

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.06,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
    };

    const toggleChapter = (chapter: string) => {
      setSelected((prev) =>
        prev.includes(chapter)
          ? prev.filter((c) => c !== chapter)
          : [...prev, chapter],
      );
    };

    const handleMultiSelectConfirm = () => {
      if (selected.length === 0) return;
      // Join selected chapters with comma
      onOptionSelect(selected.join(","), message.id, "next");
    };

    const handleSelectAll = () => {
      onOptionSelect("All", message.id, "next");
    };

    return (
      <div
        className={`flex w-full ${
          isBot ? "justify-start" : "justify-end"
        } mb-6 animate-fade-in group`}
      >
        <div
          className={`flex max-w-[90%] md:max-w-[80%] ${
            isBot ? "flex-row" : "flex-row-reverse"
          } gap-3`}
        >
          {/* Avatar */}
          <div
            className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm ${
              isBot ? "bg-indigo-100 text-indigo-600" : "bg-blue-600 text-white"
            }`}
          >
            {isBot ? (
              <Image
                alt="logo"
                src="/images/ai/ai-logo.svg"
                width={34}
                height={34}
              />
            ) : (
              <User size={20} />
            )}
          </div>

          <div className="flex flex-col space-y-2 max-w-full">
            <div
              className={`p-3 md:p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed wrap-break-word ${
                isBot
                  ? "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                  : "bg-blue-600 text-white rounded-tr-none"
              } ${isError ? "bg-red-50 border-red-200 text-red-600" : ""}`}
            >
              {isError && (
                <div className="flex items-center gap-2 mb-2 font-semibold">
                  <AlertCircle size={16} /> Error
                </div>
              )}
              <div
                className={`markdown-body text-sm md:text-base  ${
                  isSmall ? "text-sm" : ""
                }`}
              >
                {isError && message.content.includes("[coins]") ? (
                  <>
                    <SafeMath>{message.content.split("\n")[0]}</SafeMath>
                    <div className="flex items-center justify-start gap-1 mb-1">
                      <SafeMath>
                        {message.content.split("\n")[1].split("[coins]")[0]}
                      </SafeMath>
                      <span className="flex items-center gap-1 bg-amber-500/10 px-2.5 rounded-full border-[1px] border-amber-300 shadow-sm text-amber-600 font-bold">
                        <Coins size={14} className="text-amber-500" />
                        {message.content?.split("[coins]")[1].split("\n")[0]}
                      </span>
                    </div>
                    <div className="flex items-center justify-start gap-1">
                      <SafeMath>
                        {
                          message.content
                            .split("[coins]")[1]
                            .split("\n")[1]
                            .split("[coins2]")[0]
                        }
                      </SafeMath>
                      <span className="flex items-center gap-1 bg-amber-500/10 px-2.5 rounded-full border-[1px] border-amber-300 shadow-sm text-amber-600 font-bold">
                        <Coins size={14} className="text-amber-500" />
                        {
                          message.content
                            .split("[coins]")[1]
                            .split("\n")[1]
                            .split("[coins2]")[1]
                        }
                      </span>
                    </div>
                  </>
                ) : (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                )}
              </div>
            </div>

            {/* Multi-select chapter picker */}
            {isMultiSelect && isLast && message.options && message.options.length > 0 && (
              <motion.div
                className="flex flex-col gap-3 mt-1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Chapter grid */}
                <div className="flex flex-wrap gap-2 max-w-sm md:max-w-md">
                  {(message.options as string[]).map((chapter, i) => {
                    const isChecked = selected.includes(chapter);
                    return (
                      <motion.button
                        key={i}
                        variants={itemVariants}
                        onClick={() => toggleChapter(chapter)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer active:scale-95 ${
                          isChecked
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare size={13} strokeWidth={2.5} />
                        ) : (
                          <Square size={13} strokeWidth={1.5} />
                        )}
                        {chapter}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Action row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* All button */}
                  <motion.button
                    variants={itemVariants}
                    onClick={handleSelectAll}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-200 text-sm font-medium shadow-sm active:scale-95 cursor-pointer"
                  >
                    All Chapters
                  </motion.button>

                  {/* Next button — enabled only if selection is non-empty */}
                  <motion.button
                    variants={itemVariants}
                    onClick={handleMultiSelectConfirm}
                    disabled={selected.length === 0}
                    className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 ${
                      selected.length > 0
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Next
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </motion.button>

                  {selected.length > 0 && (
                    <motion.span
                      variants={itemVariants}
                      className="text-xs text-slate-400 font-medium"
                    >
                      {selected.length} selected
                    </motion.span>
                  )}
                </div>

                {/* Back button */}
                {canGoBack && !isSmall && (
                  <motion.button
                    variants={itemVariants}
                    onClick={() => onOptionSelect("", message.id, "back")}
                    className="flex items-center gap-1.5 w-fit px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 text-sm font-medium shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Undo2 size={14} strokeWidth={2.5} />
                    Back
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Normal single-option buttons */}
            {isBot &&
              !isMultiSelect &&
              message.options &&
              message.options.length > 0 &&
              isLast && (
                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {message.options.map((option, i) =>
                    option === "Buy Credits" ? (
                      <motion.button
                        key={i}
                        variants={itemVariants}
                        onClick={() =>
                          onOptionSelect(option as string, message.id, "buy-now")
                        }
                        className="px-4 py-2 bg-indigo-600 border border-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:border-indigo-700 transition-all duration-200 text-sm md:text-base font-medium shadow-sm active:scale-95"
                      >
                        {option as string}
                      </motion.button>
                    ) : option === "Try Again" ? (
                      <motion.button
                        key={i}
                        variants={itemVariants}
                        onClick={() =>
                          onOptionSelect(option as string, message.id, "next")
                        }
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-200 text-sm md:text-base font-medium shadow-sm active:scale-95 cursor-pointer"
                      >
                        {option as string}
                      </motion.button>
                    ) : (
                      <motion.button
                        key={i}
                        variants={itemVariants}
                        onClick={() =>
                          onOptionSelect(option as string, message.id, "try-again")
                        }
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-200 text-sm md:text-base font-medium shadow-sm active:scale-95 cursor-pointer"
                      >
                        {option as string}
                      </motion.button>
                    ),
                  )}

                  {canGoBack && !isSmall && (
                    <motion.button
                      variants={itemVariants}
                      onClick={() => onOptionSelect("", message.id, "back")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 text-sm md:text-base font-medium shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Undo2 size={14} strokeWidth={2.5} />
                      Back
                    </motion.button>
                  )}
                </motion.div>
              )}
          </div>
        </div>
      </div>
    );
  },
);

ChatBubble.displayName = "ChatBubble";
