import { BotResponse, CollectedData } from "@/types/global";

import configJson from "@/static/steps/config.json";
import grade10Json from "@/static/steps/grade-10.json";
import grade12Json from "@/static/steps/grade-12.json";
import gradeNeetJson from "@/static/steps/grade-neet.json";
import gradeJeeMainJson from "@/static/steps/grade-jee-main.json";
import gradeJeeAdvancedJson from "@/static/steps/grade-jee-advanced.json";

interface StepCondition {
  key: string;
  value: string | string[];
}

interface FetchOptions {
  url: string;
  key: string;
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

// ── Static fallbacks ──

const staticGradeConfigs: Record<string, GradeConfig> = {
  "grade-10": grade10Json as GradeConfig,
  "grade-12": grade12Json as GradeConfig,
  "grade-neet": gradeNeetJson as GradeConfig,
  "grade-jee-main": gradeJeeMainJson as GradeConfig,
  "grade-jee-advanced": gradeJeeAdvancedJson as GradeConfig,
};

const staticConfig = configJson as StepConfig;

// ── API cache ──

let cachedStepConfig: StepConfig | null = null;
const gradeCache: Record<string, GradeConfig> = {};

const fetchStepConfig = async (): Promise<StepConfig> => {
  if (cachedStepConfig) return cachedStepConfig;
  try {
    const res = await fetch("/api/steps");
    if (!res.ok) throw new Error("Failed to fetch step config");
    const data = await res.json();
    cachedStepConfig = data;
    return data;
  } catch (e) {
    console.error("Error fetching step config, using static fallback:", e);
    return staticConfig;
  }
};

const loadGradeConfig = async (
  gradeKey: string,
): Promise<GradeConfig | null> => {
  if (gradeCache[gradeKey]) return gradeCache[gradeKey];
  try {
    const res = await fetch(`/api/steps/${encodeURIComponent(gradeKey)}`);
    if (!res.ok) throw new Error("Failed to fetch grade config");
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    gradeCache[gradeKey] = data;
    return data;
  } catch (e) {
    console.error(
      `Error fetching grade "${gradeKey}", using static fallback:`,
      e,
    );
    const staticKey = staticConfig.grades[gradeKey] || gradeKey;
    const fallback =
      staticGradeConfigs[staticKey] || staticGradeConfigs[gradeKey] || null;
    if (fallback) gradeCache[gradeKey] = fallback;
    return fallback;
  }
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
): Promise<string[]> => {
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
      // Filter out disabled options
      const inActive = step.inActiveOptions || [];
      return inActive.length > 0
        ? allOptions.filter((opt) => !inActive.includes(opt))
        : allOptions;
    }
    return [];
  }

  if (step.fetchOptions) {
    const url = replacePlaceholders(step.fetchOptions.url, collectedData);
    const res = await fetch(url);
    const data = await res.json();
    return data[step.fetchOptions.key] || [];
  }

  return [...step.options];
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

  for (const step of gradeConfig.steps) {
    if (step.skip) continue;
    if (answeredKeys.has(step.key_name)) continue;

    // Explicitly skip language selection if subject or chapter is English
    if (step.key_name === "language") {
      const isEnglish = collectedData.some(
        (d) =>
          (d.key === "subject" || d.key === "chapter") &&
          d.value.toLowerCase().includes("english"),
      );
      if (isEnglish) continue;
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
    try {
      options = await fetchDynamicOptions(step, collectedData);
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

    return {
      id: step.id,
      text: step.text,
      options,
      key_name: step.key_name,
      finished: false,
      isMultiSelect:
        step.fetchType === "chapters-multi" || step.isMultiSelect === true,
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
  const allCourses = Object.keys(stepConfig.grades);

  if (!paperType) return allCourses;

  // For each course, load its grade config and check the paperType step
  const filtered: string[] = [];
  for (const courseName of allCourses) {
    const gradeKey = stepConfig.grades[courseName];
    const gradeConfig = await loadGradeConfig(gradeKey);
    if (!gradeConfig) continue;

    const paperTypeStep = gradeConfig.steps.find(
      (s) => s.key_name === "paperType",
    );
    // If this course has no paperType step it can't support any specific type
    if (!paperTypeStep) continue;

    // Respect inActiveOptions (disabled entries)
    const inActive = paperTypeStep.inActiveOptions || [];
    const available = paperTypeStep.options.filter(
      (o) => !inActive.includes(o),
    );

    if (available.includes(paperType)) {
      filtered.push(courseName);
    }
  }

  return filtered;
};


export const resetStepCache = () => {
  cachedStepConfig = null;
  Object.keys(gradeCache).forEach((key) => delete gradeCache[key]);
};
