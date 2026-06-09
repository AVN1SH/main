"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { FormDetails, QuestionPaper } from "@/types/global";
import { InteractiveLoader } from "../ui/InteractiveLoader";

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

interface TestPanelProps {
  testData: any;
  config: FormDetails | null;
  isGenerating: boolean;
  testProcessingError: string | null;
  showTestEnv: boolean;
  fallbackScoring: Record<string, Record<string, number>> | null;
  currentChatActiveSessionId: string;
  onTestSubmit: (results: any) => void;
  onRetry: () => void;
  messages: any[];
}

export const TestPanel = React.memo(
  ({
    testData,
    config,
    isGenerating,
    testProcessingError,
    showTestEnv,
    fallbackScoring,
    currentChatActiveSessionId,
    onTestSubmit,
    onRetry,
    messages,
  }: TestPanelProps) => {
    return showTestEnv && testData?.questions ? (
      <TestEnvironment
        key={currentChatActiveSessionId}
        questions={testData.questions}
        onSubmit={onTestSubmit}
        initialState={testData}
        scoring={testData?.scoring || fallbackScoring || undefined}
        subjects={testData?.subjects}
        isFullSyllabus={testData?.isFullSyllabus}
        examType={config?.paperType}
        grade={config?.class}
        timerConfig={testData?.timerConfig}
        disableHint={testData?.disableHint}
        historyId={currentChatActiveSessionId}
        isSamplePaper={!!testData?.isSamplePaper}
        questionSections={testData?.questionSections ?? null}
      />
    ) : (
      <InteractiveLoader
        isLoading={true}
        error={testProcessingError}
        isFinished={!!testData?.questions}
        onComplete={() => {}}
        onRetry={onRetry}
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
    );
  },
);

TestPanel.displayName = "TestPanel";
