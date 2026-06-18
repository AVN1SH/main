"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChatBubble } from "@/components/chat/ChatBubble";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PaperDisplay = dynamic(
  () =>
    import("@/components/papers/PaperDisplay").then((mod) => mod.PaperDisplay),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full w-full gap-3 text-slate-500">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium animate-pulse">
          Loading Document Viewer...
        </p>
      </div>
    ),
    ssr: false,
  },
);

const TestEnvironment = dynamic(
  () =>
    import("@/components/test/TestEnvironment").then(
      (mod) => mod.TestEnvironment,
    ),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full w-full gap-3 text-slate-500">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium animate-pulse">
          Loading Test Environment...
        </p>
      </div>
    ),
    ssr: false,
  },
);

import {
  Message,
  MessageRole,
  CollectedData,
  FormDetails,
  StepOption,
  QuestionPaper,
} from "@/types/global";
import axios from "axios";
import {
  getNextStep,
  loadInitialSteps,
  resetStepCache,
} from "@/utils/getNextStep";
import { SidebarTrigger } from "../ui/sidebar";
import { useDispatch, useSelector } from "react-redux";
import {
  ChatDetails,
  create,
  resetDetails,
  updateSessionId,
  setNewTestCreating,
  clearReattemptData,
  updatePaper,
  setCredits,
} from "@/features/sessionDetails";
import { saveCurrentSession, updateSession } from "@/utils/localStorage";
import MobileToggle from "../MobileToggle";
import Image from "next/image";
import { InteractiveLoader } from "../ui/InteractiveLoader";
import { ChatInput } from "./ChatInput";
import AIThinkingLoader from "@/components/chat/AIThinkingLoader";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "nextjs-toploader/app";
const TEST_TYPES = ["Chapter Test", "Subject Test", "Full Syllabus Test"];

const getQuotaExceededMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return null;

  const payload = error.response?.data;
  if (payload?.code !== "CREDIT_QUOTA_REACHED") return null;

  return `${payload.message}\n**Credits Left:** [coins]${payload.creditsRemaining}\n**Required Credits:** [coins2]${payload.requiredCredits}`;
};

let _testConfigClientCache: Record<string, any> | null = null;

const fetchGradeConfigClient = async (
  grade: string,
): Promise<Record<string, any> | null> => {
  if (!grade) return null;
  if (!_testConfigClientCache) {
    try {
      const res = await fetch("/api/test-config");
      _testConfigClientCache = await res.json();
    } catch {
      return null;
    }
  }
  return (
    _testConfigClientCache?.grades?.[grade] ||
    _testConfigClientCache?.grades?.["default"] ||
    null
  );
};

interface ChatLayoutProps {
  historyId?: string;
  initialPaper?: QuestionPaper | null;
  initialConfig?: FormDetails | null;
  initialMessages?: Message[] | null;
  isNew?: boolean; // Flag to indicate if this is a new session (from /new route)
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  historyId,
  initialPaper,
  initialConfig,
  initialMessages,
  isNew = false,
}) => {
  const [hasSubmittedDetails, setHasSubmittedDetails] = useState(
    initialConfig ? true : false,
  );
  const [config, setConfig] = useState<FormDetails | null>(
    initialConfig || null,
  );
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [paperContent, setPaperContent] = useState<QuestionPaper | null>(
    initialPaper || null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStartingTest, setIsStartingTest] = useState(false);
  const [testProcessingError, setTestProcessingError] = useState<string | null>(
    null,
  );
  const [resetSequenceTrigger, setResetSequenceTrigger] = useState(false);
  const [showTestEnv, setShowTestEnv] = useState(
    initialConfig &&
      (initialConfig.paperType === "Chapter Test" ||
        initialConfig.paperType === "Subject Test" ||
        initialConfig.paperType === "Full Syllabus Test") &&
      initialPaper &&
      (initialPaper.questions || (initialPaper as any).mcqs)
      ? true
      : false,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [collectedData, setCollectedData] = useState<CollectedData[]>([]);
  const [testData, setTestData] = useState<any>(
    initialConfig &&
      (initialConfig.paperType === "Chapter Test" ||
        initialConfig.paperType === "Subject Test" ||
        initialConfig.paperType === "Full Syllabus Test") &&
      initialPaper &&
      (initialPaper.questions || (initialPaper as any).mcqs)
      ? {
          questions: initialPaper.questions || (initialPaper as any).mcqs,
          disableHint: (initialPaper as any).disableHint ?? true,
        }
      : null,
  );
  const [fallbackScoring, setFallbackScoring] = useState<Record<
    string,
    Record<string, number>
  > | null>(null);
  const currentChat: ChatDetails = useSelector((state: any) => state.chatSlice);
  const updatedPaperFormat = useSelector(
    (state: any) => state.paperFormatSlice.paperFormat,
  );

  const isTestActive =
    hasSubmittedDetails && TEST_TYPES.includes(config?.paperType || "");

  const { createNew } = useSelector((state: any) => state.chatSlice);
  const dispatch = useDispatch();
  const isInitializing = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (historyId && initialPaper && initialConfig) {
      // Set the session ID from the history
      dispatch(updateSessionId(historyId));

      // Config and messages are already set in state initialization,
      // so we only need to set up the display state
      setHasSubmittedDetails(true);

      // If it's a test type, set up test data
      if (
        initialConfig.paperType === "Chapter Test" ||
        initialConfig.paperType === "Subject Test" ||
        initialConfig.paperType === "Full Syllabus Test"
      ) {
        if (
          initialPaper &&
          !initialPaper.questions &&
          (initialPaper as any).mcqs
        ) {
          const savedPaper = initialPaper;
          fetchGradeConfigClient(initialConfig.class).then(
            (gradeConfigForHistory) => {
              setTestData({
                ...savedPaper,
                questions: (savedPaper as any).mcqs,
                timerConfig: (savedPaper as any)?.timerConfig || {
                  isFullTest: false,
                  perQuestionTime: gradeConfigForHistory?.perQuestionTime || 60,
                },
                disableHint: (savedPaper as any).disableHint ?? true,
                scoring: (savedPaper as any).scoring || gradeConfigForHistory?.scoring || undefined,
              });
              setShowTestEnv(true);
            },
          );
        } else {
          setTestData({
            ...initialPaper,
            scoring: (initialPaper as any).scoring || undefined,
          });
          setShowTestEnv(true);
        }
      } else {
        setShowTestEnv(true);
      }

      hasInitialized.current = true;
    } else if (historyId && !initialConfig) {
      // If we have historyId but no initial data, try to load from client
      const loadHistoryData = async () => {
        try {
          const response = await fetch(`/api/history/${historyId}`);
          if (response.ok) {
            const data = await response.json();
            setConfig(data.config);
            setMessages(data.messages);
            setPaperContent(data.paper);
            dispatch(updateSessionId(historyId));
            setHasSubmittedDetails(true);

            if (
              data.config.paperType === "Chapter Test" ||
              data.config.paperType === "Subject Test" ||
              data.config.paperType === "Full Syllabus Test"
            ) {
              fetchGradeConfigClient(data.config.class).then(
                (gradeConfig) => {
                  if (data.paper && !data.paper.questions && data.paper.mcqs) {
                    setTestData({
                      ...data.paper,
                      questions: data.paper.mcqs,
                      timerConfig: data.paper.timerConfig || {
                        isFullTest: false,
                        perQuestionTime: gradeConfig?.perQuestionTime || 60,
                      },
                      disableHint: data.paper.disableHint ?? true,
                      scoring: gradeConfig?.scoring || undefined,
                    });
                    setShowTestEnv(true);
                  } else {
                    setTestData({
                      ...data.paper,
                      scoring: gradeConfig?.scoring || undefined,
                    });
                    setShowTestEnv(true);
                  }
                },
              );
            } else {
              setShowTestEnv(true);
            }

            hasInitialized.current = true;
          }
        } catch (error) {
          console.error("Error loading history from client:", error);
        }
      };

      loadHistoryData();
    }
  }, [historyId, initialPaper, initialConfig, dispatch]);
  // Handle URL update when session ID is created (from /new to /[id])
  useEffect(() => {
    if (
      !historyId && // We're on the /new route
      currentChat.activeSessionId &&
      currentChat.activeSessionId !== "" &&
      !currentChat.activeSessionId.includes("NOSQL")
    ) {
      // Replace the URL from /new to /[id] without full page reload
      // Use a setTimeout to ensure this happens after the animation frame
      const timer = setTimeout(() => {
        window.history.replaceState(
          null,
          "",
          `/sarthaks-ai/generate/${currentChat.activeSessionId}`,
        );
        // router.replace(`/sarthaks-ai/generate/${currentChat.activeSessionId}`, { scroll : false});
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [currentChat.activeSessionId, historyId, router]);
  useEffect(() => {
    // If we have initial config (loading from history), skip the new session initialization
    if (historyId) return;

    // If already initialized and not a new session, skip
    if (hasInitialized.current && !isNew) return;

    // If this is not a new session and chat has existing data, mark as initialized
    if (
      !isNew &&
      (currentChat.messages.length > 0 || currentChat.activeSessionId)
    ) {
      hasInitialized.current = true;
      return;
    }

    if (isInitializing.current && !isNew) return;
    isInitializing.current = true;

    // Reset all state
    resetStepCache();
    setConfig(null);
    dispatch(resetDetails());
    setHasSubmittedDetails(false);
    setMessages([]);
    setCollectedData([]);
    setIsGenerating(false);
    setShowTestEnv(false);
    setCollectedData([]);
    setPaperContent(null);

    const sequence = async () => {
      try {
        const initialSteps = await loadInitialSteps();

        // First message
        // setIsGenerating(true);
        // await new Promise((r) => setTimeout(r, 1000));
        setMessages((prev) => {
          if (prev.some((m) => m.id === initialSteps[0].id)) return prev;
          return [
            ...prev,
            {
              id: initialSteps[0].id,
              role: MessageRole.BOT,
              content: initialSteps[0].text,
              options: initialSteps[0].options,
            },
          ];
        });
        // setIsGenerating(false);

        // Second message
        // setIsGenerating(true);
        await new Promise((r) => setTimeout(r, 1000));
        setMessages((prev) => {
          if (prev.some((m) => m.id === initialSteps[1].id)) return prev;
          return [
            ...prev,
            {
              id: initialSteps[1].id,
              role: MessageRole.BOT,
              content: initialSteps[1].text,
              options: initialSteps[1].options,
              stepKey: initialSteps[1].key_name,
            },
          ];
        });
        // setIsGenerating(false);
      } catch (error) {
        console.error("Error loading step config:", error);
        setIsGenerating(false);
      }
    };
    sequence();

    // Mark as initialized
    hasInitialized.current = true;

    // Reset createNew flag after initialization
    // if (createNew) {
    //   dispatch(create(false));
    // }
  }, [createNew, isNew, resetSequenceTrigger]);

  useEffect(() => {
    if (!currentChat.paper) {
      if (
        !currentChat.activeSessionId &&
        currentChat.messages.length === 0 &&
        messages.length > 0
      ) {
        return;
      }
      setMessages(currentChat.messages);
      setConfig(currentChat.config);
      setHasSubmittedDetails(false);
      setPaperContent(null);
      setTestData(null);
      return;
    }
    setMessages(currentChat.messages);
    setConfig(currentChat.config);

    if (
      currentChat.config?.paperType === "Chapter Test" ||
      currentChat.config?.paperType === "Subject Test" ||
      currentChat.config?.paperType === "Full Syllabus Test"
    ) {
      const paperWithScoring = currentChat.paper;
      if (
        currentChat.paper &&
        !currentChat.paper.questions &&
        currentChat.paper.mcqs
      ) {
        const savedPaper = currentChat.paper;
        fetchGradeConfigClient(currentChat.config?.class).then(
          (gradeConfigForHistory) => {
            setTestData((prev) => ({
              ...savedPaper,
              questions: savedPaper.mcqs,
              timerConfig: savedPaper?.timerConfig || {
                isFullTest: false,
                perQuestionTime: gradeConfigForHistory?.perQuestionTime || 60,
              },
              disableHint: savedPaper.disableHint ?? true,
              scoring: prev?.scoring || gradeConfigForHistory?.scoring || undefined,
            }));
          },
        );
      } else {
        setTestData((prev) => ({
          ...paperWithScoring,
          scoring: prev?.scoring || undefined,
        }));
      }
      setPaperContent(null);
    } else {
      setPaperContent(currentChat.paper);
      setTestData(null);
    }

    if (currentChat.paper) setShowTestEnv(true);
    setHasSubmittedDetails(true);
  }, [
    currentChat.config,
    currentChat.messages,
    currentChat.paper,
    currentChat.createNew,
    // currentChat.activeSessionId,
  ]);

  useEffect(() => {
    const grade = currentChat?.config?.class || config?.class;
    if (grade) {
      fetchGradeConfigClient(grade).then((gc) => {
        if (gc?.scoring) setFallbackScoring(gc.scoring);
      });
    }
  }, [currentChat?.config?.class, config?.class]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, hasSubmittedDetails]);

  useEffect(() => {
    if (currentChat.reattemptData && currentChat.config) {
      setTestData(currentChat.reattemptData);

      setConfig({
        ...currentChat.config,
        paperType: "Chapter Test",
      });

      setHasSubmittedDetails(true);
      setShowTestEnv(true);
      setPaperContent(null);

      dispatch(clearReattemptData());
    }
  }, [currentChat.reattemptData]);

  const handleSendMessage = async (
    e?: React.FormEvent,
    manualPrompt?: string,
    manualConfig?: FormDetails,
    isFirst: boolean = false,
    capturedData?: CollectedData[],
    skipUiUpdate: boolean = false,
    overrideMessages?: Message[],
  ) => {
    if (e) e.preventDefault();

    const activePrompt = manualPrompt;
    const activeConfig = manualConfig || config;

    if (!activePrompt?.trim() || !activeConfig) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: activePrompt,
    };

    setIsGenerating(true);
    if (!skipUiUpdate) {
      setMessages((prev) => [...prev, userMsg]);
    }
    setTestProcessingError(null);

    const currentMessages = overrideMessages || messages;
    const messagesToSend = skipUiUpdate
      ? currentMessages
      : [...currentMessages, userMsg];

    setShowTestEnv(false); // Reset to ensure loader shows for new request

    // Create a timer promise to ensure at least 1 second wait time
    const timerPromise = new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      let response;
      if (
        isFirst &&
        activeConfig.paperType !== "Chapter Test" &&
        activeConfig.paperType !== "Subject Test" &&
        activeConfig.paperType !== "Full Syllabus Test"
      ) {
        response = await axios.post("/api/gemini", {
          formDetails: {
            class: activeConfig?.class,
            subject: activeConfig.subject.toLowerCase(),
            paperType: activeConfig.paperType,
            examType: activeConfig.examType,
            language: activeConfig.language,
          },
          type: "initial",
          prompt: activePrompt,
          messages: messagesToSend,
        });
      } else if (
        activeConfig.paperType === "Chapter Test" ||
        activeConfig.paperType === "Subject Test" ||
        activeConfig.paperType === "Full Syllabus Test"
      ) {
        const dataToUse = capturedData || collectedData;
        const chapter = dataToUse.find((d) => d.key === "chapter")?.value;
        // Extract selected chapters for Subject Test chapter picker
        const selectedChaptersEntry = dataToUse.find((d) => d.key === "selectedChapters");
        const selectedChapters = selectedChaptersEntry?.value
          ? selectedChaptersEntry.value === "All"
            ? undefined
            : selectedChaptersEntry.value.split(",").map((c: string) => c.trim())
          : undefined;
        response = await axios.post("/api/gemini/generate-mcq", {
          formDetails: { ...activeConfig, selectedChapters },
          chapter: chapter,
          messages: messagesToSend,
        });
      } else {
        response = await axios.post("/api/gemini", {
          formDetails: {
            class: activeConfig.class,
            subject: activeConfig.subject.toLowerCase(),
            examType: activeConfig.examType,
            language: activeConfig.language,
          },
          type: "update",
          testPaperid: currentChat.activeSessionId,
          currentPaper: updatedPaperFormat || paperContent,
          userPrompt: activePrompt,
          messages: messagesToSend,
        });
      }
      if (response?.data) {
        if (
          response.data.data.refusalReason &&
          response.data.data.refusalReason !== "null"
        ) {
          const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: MessageRole.BOT,
            content: response.data.data.refusalReason,
          };
          // setPaperContent(response.data.data);
          setMessages((prev) => [...prev, botMsg]);
        } else {
          const newPaperContent: QuestionPaper = response.data.data;
          setPaperContent(newPaperContent);
          const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: MessageRole.BOT,
            content:
              "I've updated the question paper on the left based on your request. Let me know if you need any other changes!",
          };

          if (
            activeConfig.paperType === "Chapter Test" ||
            activeConfig.paperType === "Subject Test" ||
            activeConfig.paperType === "Full Syllabus Test"
          ) {
            const qs = response.data.data.questions || response.data.data.mcqs;
            setTestData({
              questions: qs,
              scoring: response.data.scoring,
              subjects: response.data.data.subjects,
              isFullSyllabus: response.data.data.isFullSyllabus,
              timerConfig: response.data.timerConfig,
              questionSections: response.data.data.questionSections ?? null,
            });
            botMsg.content =
              "I've generated the test for you. You can now start in the panel on the left!";
          }

          if (isFirst && response.data.userHistory) {
            dispatch(updateSessionId(response.data.userHistory.id));
            setMessages((prev) => [...prev, botMsg]);
          } else if (messages.length === 6) {
            const id = saveCurrentSession(
              [...messages, botMsg],
              activeConfig,
              newPaperContent,
            );
            setMessages((prev) => [...prev, botMsg]);
            dispatch(updateSessionId(id));
          } else {
            updateSession(
              currentChat.activeSessionId,
              [...messages, userMsg, botMsg],
              activeConfig,
              newPaperContent,
            );
            setMessages((prev) => [...prev, botMsg]);
          }
        }
      }
    } catch (error) {
      console.error("ERROR_WHILE_GETTING_RESPONSE_FROM_GEMINI_API", error);
      const quotaMessage = getQuotaExceededMessage(error);

      if (
        activeConfig.paperType === "Chapter Test" ||
        activeConfig.paperType === "Subject Test" ||
        activeConfig.paperType === "Full Syllabus Test"
      ) {
        setTestProcessingError(
          quotaMessage
            ? `CREDIT_QUOTA_REACHED:${quotaMessage}`
            : "Failed to generate test questions. Please try again.",
        );
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.BOT,
        content:
          quotaMessage ||
          "I encountered an error while generating the content. Please **check your connection** or Your **limit** is reached. or **try again.**",
        isError: true,
        options: quotaMessage ? ["Buy Credits", "Try Again"] : ["Try Again"],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      // Ensure the loader shows for at least 1 second
      await timerPromise;
      setIsGenerating(false);

      // Refetch user credits across all active courses and dispatch to store
      try {
        const creditRes = await axios.get("/api/ai-credits");
        if (creditRes.data.success) {
          dispatch(setCredits(creditRes.data));
        }
      } catch (err) {
        console.error("Failed to re-fetch credits:", err);
      }
    }
  };

  const handleOptionSelect = async (
    option: string | StepOption,
    msgId: string,
    action: "next" | "try-again" | "back" | "buy-now" = "next",
  ) => {
    if (action === "buy-now") {
      router.push("/sarthaks-ai/ai-plans");
      return;
    }

    if (action === "back") {
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === msgId);
        if (index === -1) return prev;
        return prev.slice(0, index - 1);
      });
      setCollectedData((prev) => prev.slice(0, -1));
      return;
    }

    if (!option) return;

    const displayText = typeof option === "object" ? option.label : option;
    const storageValue = typeof option === "object" ? option.value : option;

    const lastBotMsg = messages[messages.length - 1];
    const keyName = lastBotMsg.stepKey || "unknown";

    // For multi-select chapter step, show friendly display text
    const isMultiSelectStep = lastBotMsg?.isMultiSelect;
    const friendlyDisplay = isMultiSelectStep
      ? storageValue === "All"
        ? "All Chapters"
        : `${storageValue.split(",").length} chapter(s) selected`
      : displayText;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: friendlyDisplay,
    };
    setMessages((prev) => [...prev, userMsg]);
    const messagesWithUser = [...messages, userMsg];

    // For multi-select chapter step, store under a fixed key "selectedChapters"
    const effectiveKey = lastBotMsg.isMultiSelect ? "selectedChapters" : keyName;

    const newDataItem: CollectedData = {
      id: lastBotMsg.id,
      key: effectiveKey,
      value: storageValue,
    };
    const updatedData = [...collectedData, newDataItem];
    setCollectedData(updatedData);

    // Show loader for static message transition
    setIsGenerating(true);
    const timerPromise = new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const nextStepResponse = await getNextStep(updatedData);

      if (nextStepResponse.finished) {
        // For final step, ensure we wait at least 1s before handleSendMessage takes over
        await timerPromise;
        const newBotMsg = {
          id: nextStepResponse.id,
          role: MessageRole.BOT,
          content: nextStepResponse.text,
          options: nextStepResponse.options,
          stepKey: nextStepResponse.key_name,
        };
        setMessages((prev) => [...prev, newBotMsg]);
        const messagesWithBot = [...messagesWithUser, newBotMsg];

        const finalConfig: FormDetails = {
          class: updatedData.find((d) => d.key === "class")?.value || "",
          subject: updatedData.find((d) => d.key === "subject")?.value || "",
          paperType:
            updatedData.find((d) => d.key === "paperType")?.value || "",
          examType:
            updatedData.find((d) => d.key === "board")?.value ||
            nextStepResponse.metadata?.defaultExamType ||
            "CBSE",
          language: updatedData.find((d) => d.key === "language")?.value,
          paper: updatedData.find((d) => d.key === "paper")?.value,
        };

        setConfig(finalConfig);
        setHasSubmittedDetails(true);

        // handleSendMessage will handle its own loader
        await handleSendMessage(
          undefined,
          option === "Try Again" ? `${option}` : `${option}`,
          finalConfig,
          true,
          updatedData,
          true,
          messagesWithBot,
        );
      } else {
        // For intermediate static steps, ensure at least 1s of loader
        await timerPromise;
        setMessages((prev) => [
          ...prev,
          {
            id: nextStepResponse.id,
            role: MessageRole.BOT,
            content: nextStepResponse.text,
            options: nextStepResponse.options,
            stepKey: nextStepResponse.key_name,
            isMultiSelect: nextStepResponse.isMultiSelect ?? false,
          },
        ]);
      }
    } catch (error) {
      console.error("Error getting next step:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.BOT,
        content:
          "Something went wrong while loading the next step. Please **try again.**",
        isError: true,
        options: ["Try Again"],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartTest = async () => {
    if (!paperContent || !paperContent.mcqs || paperContent.mcqs.length === 0)
      return;

    try {
      // 1. Set shimmer loading state
      dispatch(setNewTestCreating(true));

      // 2. Check if user already has an unsubmitted test, or create new one
      const samplePaperIdToSend =
        config?.samplePaperId ||
        paperContent?.samplePaperId ||
        currentChat.paper?.samplePaperId ||
        null;

      const languageToSend =
        config?.language ||
        paperContent?.language ||
        currentChat.paper?.language ||
        null;

      const response = await axios.post("/api/history/create-test-attempt", {
        paperContent: paperContent,
        config: {
          ...config,
          paperType: "Subject Test",
        },
        samplePaperId: samplePaperIdToSend,
        language: languageToSend,
      });

      if (response.data.success) {
        // 2. Update session ID to the new history item
        dispatch(updateSessionId(response.data.historyId));

        // 3. Set test data - either from existing test or new paperContent
        const gradeConfig = await fetchGradeConfigClient(config?.class);
        const testQuestions =
          response.data.paper.mcqs || response.data.paper.questions;

        const savedPaper = response.data.paper;

        setTestData({
          questions: testQuestions,
          timerConfig: savedPaper?.timerConfig || {
            isFullTest: false,
            perQuestionTime: gradeConfig?.perQuestionTime || 60,
          },
          disableHint: savedPaper?.disableHint ?? true,
          historyId: response.data.historyId,
          attemptId: response.data.attemptId,
          scoring: gradeConfig?.scoring || undefined,
        });

        // 4. Update config to "Chapter Test" to trigger TestEnvironment view
        if (config) {
          setConfig({
            ...config,
            paperType: "Chapter Test",
          });
        }
        setHasSubmittedDetails(true);
        // 5. Navigate to the new test session URL so sidebar highlights correctly
        // router.replace(`/sarthaks-ai/generate/${response.data.historyId}`);
        window.history.replaceState(null, "", `/sarthaks-ai/generate/${response.data.historyId}`)
        // Note: isNewTestCreating will be reset by History component after fetching history
      }
    } catch (error) {
      console.error("FAILED_TO_START_TEST:", error);
      dispatch(setNewTestCreating(false));
      alert("Failed to start the test. Please try again.");
    }
  };

  const handleGoBack = () => {
    setTestProcessingError(null);
    setShowTestEnv(false);
    setConfig(null);
    setMessages([]);
    setCollectedData([]);
    setHasSubmittedDetails(false);
    setTestData(null);
    setPaperContent(null);
    hasInitialized.current = false;
    resetStepCache();
    dispatch(resetDetails());
    setResetSequenceTrigger((prev) => !prev);
  };

  return (
    <div className="relative flex h-screen w-full bg-slate-50 overflow-hidden">
      <div
        className={`
          transition-all duration-700 ease-in-out bg-white shadow-xl z-20 overflow-hidden
          ${
            hasSubmittedDetails
              ? `${isTestActive ? "flex-1 w-full" : "flex-[1.5] lg:flex-2"} opacity-100 translate-x-0 border-r border-slate-200 min-w-[320px]`
              : "w-0 min-w-0 opacity-0 -translate-x-full border-none"
          }
        `}
      >
        {config &&
          (config.paperType === "Chapter Test" ||
          config.paperType === "Subject Test" ||
          config.paperType === "Full Syllabus Test" ? (
            showTestEnv && testData?.questions ? (
              <TestEnvironment
                key={currentChat.activeSessionId}
                questions={testData.questions}
                onSubmit={async (results) => {
                  // Check if this is just saving preferences (first time) or actual test results
                  const isJustPreferences =
                    results.isPreferencesSaved && !results.isSubmitted;

                  if (!isJustPreferences) {
                    // Only update the displayed test data for actual results
                    setTestData((prev: any) => ({ ...prev, ...results }));
                    // Update Redux state so the generated questions persist across unmounts/renders
                    if (results.questions && currentChat.paper) {
                      dispatch(
                        updatePaper({
                          data: {
                            ...currentChat.paper,
                            questions: results.questions,
                            mcqs: results.questions,
                          },
                        }),
                      );
                    }
                  }

                  if (currentChat.activeSessionId) {
                    try {
                      await axios.post("/api/history/update-test", {
                        historyId: currentChat.activeSessionId,
                        attemptId: testData.attemptId,
                        testResults: results,
                      });
                    } catch (error) {
                      console.error("Failed to save test results:", error);
                    }
                  }
                }}
                initialState={testData}
                scoring={testData?.scoring || fallbackScoring || undefined}
                subjects={testData?.subjects}
                isFullSyllabus={testData?.isFullSyllabus}
                examType={config?.paperType}
                grade={config?.class}
                timerConfig={testData?.timerConfig}
                disableHint={testData?.disableHint}
                historyId={currentChat.activeSessionId}
                isSamplePaper={!!testData?.isSamplePaper}
                title={`${config?.paperType} - ${(config?.class.charAt(0).toUpperCase() + config?.class.slice(1)).replace("_", " ")}`}
                questionSections={testData?.questionSections ?? null}
                // testData={testData}
              />
            ) : (
              <InteractiveLoader
                isLoading={true}
                error={testProcessingError}
                isFinished={!!testData?.questions}
                onComplete={() => setShowTestEnv(true)}
                onRetry={() => {
                  setTestProcessingError(null);
                  const lastUserMessage = messages
                    .slice()
                    .reverse()
                    .find((m) => m.role === MessageRole.USER);
                  handleSendMessage(
                    undefined,
                    lastUserMessage?.content,
                    config!,
                  );
                }}
                onGoBack={handleGoBack}
                messages={[
                  "Analyzing user requirements...",
                  "Analysing syllabus...",
                  "Analysing Previous Year Questions...",
                  "Analysing NCERT...",
                  "Crafting questions...",
                  "Validating answers...",
                  "Finalizing test...",
                ]}
              />
            )
          ) : (
            <PaperDisplay
              content={paperContent}
              config={config}
              isLoading={isGenerating && !paperContent}
              onStartTest={handleStartTest}
              isStartingTest={isStartingTest}
              onGoBack={handleGoBack}
            />
          ))}
      </div>

      {!testData && (
        <div
          className={`${
            hasSubmittedDetails ? "block md:hidden" : "hidden"
          } block md:hidden absolute bottom-2 right-2 z-50`}
        >
          <MobileToggle
            hasSubmittedDetails={hasSubmittedDetails}
            config={config!}
            messages={messages}
            isGenerating={isGenerating}
            handleSendMessage={handleSendMessage}
            // messagesEndRef={messagesEndRef}
            collectedData={collectedData}
            handleOptionSelect={handleOptionSelect}
          />
        </div>
      )}

      <div
        className={`${
          isTestActive
            ? "hidden"
            : hasSubmittedDetails
              ? "hidden md:flex"
              : "flex"
        } flex-col h-full transition-all duration-700 ease-in-out flex-1`}
      >
        <div className="h-16 px-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            {!config && <SidebarTrigger className="cursor-pointer" />}

            <div className="size-10 flex items-center justify-center bg-white rounded-xl p-1 shadow-sm">
              <Image
                src="/images/ai/ai-logo.svg"
                alt="bot"
                width={150}
                height={150}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 tracking-tight">
                Sarthaks AI
              </h1>
              <p className="text-xs text-slate-500">
                Your Exam Preparation Partner
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasSubmittedDetails && (
              <div className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full">
                Active Session
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 scroll-smooth thin-scroll">
          <div className="max-w-2xl mx-auto flex flex-col justify-end min-h-full">
            <AnimatePresence mode="popLayout">
              {messages
                .filter((msg) => {
                  if (
                    hasSubmittedDetails &&
                    TEST_TYPES.includes(config?.paperType || "")
                  ) {
                    return false;
                  }
                  return true;
                })
                .map((msg, index) => {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="w-full"
                    >
                      <ChatBubble
                        message={msg}
                        isLast={index === messages.length - 1}
                        onOptionSelect={handleOptionSelect}
                        canGoBack={collectedData.length > 0}
                        isLoading={isGenerating}
                        isSmall={hasSubmittedDetails}
                      />
                    </motion.div>
                  );
                })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl"
              >
                <AIThinkingLoader />
              </motion.div>
            )}
          </div>
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isGenerating}
          hasSubmittedDetails={hasSubmittedDetails}
        />
      </div>
    </div>
  );
};

export default ChatLayout;
