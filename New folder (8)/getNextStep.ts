import { BotResponse, CollectedData } from "@/types/global";

interface StepCondition {
  key: string;
  value: string | string[];
}

interface FetchOptions {
  url: string;
  key: string;
}

interface BoardStepConfig {
  options?: string[];
  inActiveOptions?: string[];
  manualEntry?: boolean;
  condition?: StepCondition;
  text?: string;
  skipOnSubjects?: string[];
}

interface Step {
  id: string;
  text: string;
  options: string[];
  inActiveOptions?: string[];
  key_name: string;
  skip?: boolean;
  condition?: StepCondition;
  fetchOptions?: FetchOptions;
  fetchType?: string;
  isMultiSelect?: boolean;
  manualEntry?: boolean;
  boardConfig?: Record<string, BoardStepConfig>;
  skipOnSubjects?: string[];
}

interface FinalStep {
  id: string;
  text: string;
  key_name: string;
}

interface QuestionTypeInfo {
  min: number;
  max: number;
  description: string;
}

interface GradeConfig {
  gradeId: string;
  defaultExamType: string;
  examPattern?: string;
  sections?: string[];
  questionTypes?: Record<string, QuestionTypeInfo>;
  steps: Step[];
  finalStep: FinalStep;
}

interface StepConfig {
  initialSteps: Step[];
  grades: Record<string, string>;
}

// ── API cache ──

let cachedStepConfig: StepConfig | null = null;
const gradeCache: Record<string, GradeConfig> = {};

const fetchStepConfig = async (): Promise<StepConfig> => {
  if (cachedStepConfig) return cachedStepConfig;
  const res = await fetch("/api/steps");
  if (!res.ok) throw new Error("Failed to fetch step config");
  const data = await res.json();
  cachedStepConfig = data;
  return data;
};

const loadGradeConfig = async (
  gradeKey: string,
): Promise<GradeConfig | null> => {
  if (gradeCache[gradeKey]) return gradeCache[gradeKey];
  const res = await fetch(`/api/steps/${encodeURIComponent(gradeKey)}`);
  if (!res.ok) throw new Error("Failed to fetch grade config");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  gradeCache[gradeKey] = data;
  return data;
};

// ── Helpers ──

const replacePlaceholders = (
  text: string,
  collectedData: CollectedData[],
): string => {
  let result = text;
  for (const d of collectedData) {
    result = result.replaceAll(`{${d.key}}`, d.value);
  }
  return result;
};

const fetchDynamicOptions = async (
  step: Step,
  collectedData: CollectedData[],
  boardOptionsOverride?: string[],
  boardInActiveOverride?: string[],
): Promise<string[]> => {
  const inActive = boardInActiveOverride ?? step.inActiveOptions ?? [];

  const filterInActive = (opts: string[]) =>
    inActive.length > 0
      ? opts.filter((opt) => !inActive.includes(opt))
      : opts;

  if (step.fetchType) {
    const classVal = collectedData.find((d) => d.key === "class")?.value || "";
    const boardVal = collectedData.find((d) => d.key === "board")?.value;
    const subjectVal = collectedData.find((d) => d.key === "subject")?.value;

    let url = "";
    let dataKey = step.fetchType;

    if (step.fetchType === "subjects") {
      url = `/api/syllabus/subjects?class=${encodeURIComponent(classVal)}`;
      if (boardVal) url += `&examType=${encodeURIComponent(boardVal)}`;
    } else if (step.fetchType === "chapters") {
      url = `/api/syllabus/chapters?class=${encodeURIComponent(classVal)}&subject=${encodeURIComponent(subjectVal || "")}`;
      if (boardVal) url += `&examType=${encodeURIComponent(boardVal)}`;
    } else if (step.fetchType === "chapters-multi") {
      url = `/api/syllabus/chapters?class=${encodeURIComponent(classVal)}&subject=${encodeURIComponent(subjectVal || "")}`;
      if (boardVal) url += `&examType=${encodeURIComponent(boardVal)}`;
      dataKey = "chapters";
    }

    if (url) {
      const res = await fetch(url);
      const data = await res.json();
      const allOptions: string[] = data[dataKey] || [];
      return filterInActive(allOptions);
    }
    return [];
  }

  if (step.fetchOptions) {
    const url = replacePlaceholders(step.fetchOptions.url, collectedData);
    const res = await fetch(url);
    const data = await res.json();
    return filterInActive(data[step.fetchOptions.key] || []);
  }

  return filterInActive(boardOptionsOverride ?? [...step.options]);
};

// ── Public API ──

export const getNextStep = async (
  collectedData: CollectedData[],
): Promise<BotResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const answeredKeys = new Set(collectedData.map((d) => d.key));
  const selectedClass = collectedData.find((d) => d.key === "class")?.value;

  if (!selectedClass) {
    return {
      id: "error",
      text: "Something went wrong. Please refresh and try again.",
      options: [],
      key_name: "error",
      finished: false,
    };
  }

  const stepConfig = await fetchStepConfig();
  const gradeKey = stepConfig.grades[selectedClass];

  if (!gradeKey) {
    return {
      id: "error",
      text: `Configuration not found for "${selectedClass}". Please try a different option.`,
      options: [],
      key_name: "error",
      finished: false,
    };
  }

  const gradeConfig = await loadGradeConfig(gradeKey);
  if (!gradeConfig) {
    return {
      id: "error",
      text: "Configuration not found. Please try again.",
      options: [],
      key_name: "error",
      finished: false,
    };
  }

  const boardVal = collectedData.find((d) => d.key === "board")?.value;

  for (const rawStep of gradeConfig.steps) {
    if (rawStep.skip) continue;
    if (answeredKeys.has(rawStep.key_name)) continue;

    // Resolve board-specific overrides for this step
    const boardConf = boardVal ? rawStep.boardConfig?.[boardVal] : undefined;
    const step: Step = boardConf
      ? {
          ...rawStep,
          options: boardConf.options ?? rawStep.options,
          inActiveOptions: boardConf.inActiveOptions ?? rawStep.inActiveOptions,
          manualEntry: boardConf.manualEntry ?? rawStep.manualEntry,
          condition: boardConf.condition ?? rawStep.condition,
          text: boardConf.text ?? rawStep.text,
          skipOnSubjects: boardConf.skipOnSubjects ?? rawStep.skipOnSubjects,
        }
      : rawStep;

    // Skip language selection if subject/chapter matches configured skip list
    if (step.key_name === "language" && step.skipOnSubjects?.length) {
      const shouldSkip = collectedData.some(
        (d) =>
          (d.key === "subject" || d.key === "chapter") &&
          step.skipOnSubjects!.some((s: string) =>
            d.value.toLowerCase().includes(s.toLowerCase()),
          ),
      );
      if (shouldSkip) continue;
    }

    // Skip step-subject-chapters if step-chapter has manualEntry enabled for this board
    if (step.id === "step-subject-chapters") {
      const chapterStep = gradeConfig.steps.find((s) => s.id === "step-chapter");
      if (chapterStep) {
        const chapterBoardConf = boardVal ? chapterStep.boardConfig?.[boardVal] : undefined;
        const chapterManualEntry = chapterBoardConf
          ? chapterBoardConf.manualEntry ?? chapterStep.manualEntry
          : chapterStep.manualEntry;
        if (chapterManualEntry) continue;
      }
    }

    if (step.condition) {
      const condValue = collectedData.find(
        (d) => d.key === step.condition!.key,
      )?.value;
      const conditionValues = Array.isArray(step.condition.value)
        ? step.condition.value
        : [step.condition.value];
      if (!conditionValues.includes(condValue)) continue;
    }

    let options: string[];
    if (step.manualEntry) {
      options = [];
    } else {
      try {
        options = await fetchDynamicOptions(step, collectedData, boardConf?.options, boardConf?.inActiveOptions);
      } catch (error) {
        console.error("Error fetching dynamic options:", error);
        return {
          id: step.id,
          text: "I couldn't fetch the options right now. What else would you like to do?",
          options: ["Try Again"],
          key_name: "error",
          finished: false,
        };
      }
    }

    return {
      id: step.id,
      text: step.text,
      options,
      key_name: step.key_name,
      finished: false,
      isMultiSelect:
        step.fetchType === "chapters-multi" || step.isMultiSelect === true,
      isManualEntry: step.manualEntry === true,
      ...(step.key_name === "language" && options.length === 1 ? { autoFillValue: options[0] } : {}),
    };
  }

  const finalText = replacePlaceholders(
    gradeConfig.finalStep.text,
    collectedData,
  );

  return {
    id: gradeConfig.finalStep.id,
    text: finalText,
    options: [],
    key_name: gradeConfig.finalStep.key_name,
    finished: true,
    metadata: {
      defaultExamType: gradeConfig.defaultExamType,
      sections: gradeConfig.sections || [],
      questionTypes: gradeConfig.questionTypes || {},
    },
  };
};

export const loadInitialSteps = async (): Promise<Step[]> => {
  const stepConfig = await fetchStepConfig();
  return stepConfig.initialSteps;
};

export const getFilteredCourseOptions = async (
  paperType?: string,
): Promise<string[]> => {
  const stepConfig = await fetchStepConfig();
  const classStep = stepConfig.initialSteps.find(
    (s) => s.key_name === "class",
  );
  if (!classStep) return [];
  const allOptions = classStep.options.map((o) =>
    typeof o === "string" ? o : (o as any).label || (o as any).value,
  );
  if (!paperType) return allOptions;

  const filtered: string[] = [];
  for (const course of allOptions) {
    const gradeKey = stepConfig.grades[course];
    if (!gradeKey) continue;
    let gradeConfig: GradeConfig | null = null;
    try {
      gradeConfig = await loadGradeConfig(gradeKey);
    } catch {
      continue;
    }
    if (!gradeConfig) continue;
    const paperTypeStep = gradeConfig.steps.find(
      (s) => s.key_name === "paperType",
    );
    if (paperTypeStep && paperTypeStep.options.includes(paperType)) {
      filtered.push(course);
    }
  }
  return filtered.length > 0 ? filtered : allOptions;
};

export const resetStepCache = () => {
  cachedStepConfig = null;
  Object.keys(gradeCache).forEach((key) => delete gradeCache[key]);
};
