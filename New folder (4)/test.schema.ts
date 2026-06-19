import { Schema, Type } from "@google/genai";

const mcqItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER, description: "Unique question ID" },
    question: {
      type: Type.STRING,
      description: "Question text in markdown format",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 4 options",
    },
    correctAnswerIndex: {
      type: Type.INTEGER,
      description: "Index of the correct option (0-3)",
    },
    explanation: {
      type: Type.STRING,
      description:
        "Short explanation for the answer  (must be in markdown format)",
    },
    hint: {
      type: Type.STRING,
      description: "A small hint like the formula or concept used",
      nullable: true,
    },
    section: {
      type: Type.STRING,
      description:
        "Predefined section name this question belongs to (e.g. 'Organic Chemistry'). Set to null if no sections are configured.",
      nullable: true,
    },
  },
  required: ["id", "question", "options", "correctAnswerIndex", "explanation"],
};

const numericalItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER, description: "Unique question ID" },
    question: {
      type: Type.STRING,
      description: "Question text in markdown format",
    },
    correctAnswer: {
      type: Type.STRING,
      description:
        "The correct numerical answer as a string (e.g. '42', '3.14', '-7')",
    },
    explanation: {
      type: Type.STRING,
      description:
        "Short explanation for the answer  (must be in markdown format)",
    },
    hint: {
      type: Type.STRING,
      description: "A small hint like the formula or concept used",
      nullable: true,
    },
    section: {
      type: Type.STRING,
      description:
        "Predefined section name this question belongs to. Set to null if no sections are configured.",
      nullable: true,
    },
  },
  required: ["id", "question", "correctAnswer", "explanation"],
};

const singleDigitIntegerItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER, description: "Unique question ID" },
    question: {
      type: Type.STRING,
      description: "Question text in markdown format",
    },
    correctAnswer: {
      type: Type.STRING,
      description:
        "The correct answer as a single digit (0-9). Must be exactly one digit, no decimals or negative signs.",
    },
    explanation: {
      type: Type.STRING,
      description:
        "Short explanation for the answer  (must be in markdown format)",
    },
    hint: {
      type: Type.STRING,
      description: "A small hint like the formula or concept used",
      nullable: true,
    },
    section: {
      type: Type.STRING,
      description:
        "Predefined section name this question belongs to. Set to null if no sections are configured.",
      nullable: true,
    },
  },
  required: ["id", "question", "correctAnswer", "explanation"],
};

const multiCorrectItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER, description: "Unique question ID" },
    question: {
      type: Type.STRING,
      description: "Question text in markdown format",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 4 options",
    },
    correctAnswerIndices: {
      type: Type.ARRAY,
      items: { type: Type.INTEGER },
      description:
        "Array of indices of ALL correct options (0-3). Must have 2 or more correct answers.",
    },
    explanation: {
      type: Type.STRING,
      description:
        "Short explanation for the answer  (must be in markdown format)",
    },
    hint: {
      type: Type.STRING,
      description: "A small hint like the formula or concept used",
      nullable: true,
    },
    section: {
      type: Type.STRING,
      description:
        "Predefined section name this question belongs to. Set to null if no sections are configured.",
      nullable: true,
    },
  },
  required: [
    "id",
    "question",
    "options",
    "correctAnswerIndices",
    "explanation",
  ],
};

const matchListItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER, description: "Unique question ID" },
    question: {
      type: Type.STRING,
      description:
        "Question instruction text in markdown format (e.g. 'Match the following')",
    },
    listA: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Items in List A (left column)",
    },
    listB: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Items in List B (right column). Can have more items than List A.",
    },
    correctMatches: {
      type: Type.ARRAY,
      description:
        "Array of correct match pairs. Each pair maps a List A index to a List B index.",
      items: {
        type: Type.OBJECT,
        properties: {
          listAIndex: {
            type: Type.INTEGER,
            description: "Index in listA (0-based)",
          },
          listBIndex: {
            type: Type.INTEGER,
            description: "Index in listB (0-based)",
          },
        },
        required: ["listAIndex", "listBIndex"],
      },
    },
    explanation: {
      type: Type.STRING,
      description:
        "Short explanation for the correct matches  (must be in markdown format)",
    },
    section: {
      type: Type.STRING,
      description:
        "Predefined section name this question belongs to. Set to null if no sections are configured.",
      nullable: true,
    },
  },
  required: [
    "id",
    "question",
    "listA",
    "listB",
    "correctMatches",
    "explanation",
  ],
};

const matchListOptionFormatItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER, description: "Unique question ID" },
    question: {
      type: Type.STRING,
      description:
        "Question instruction text in markdown format (e.g. 'Match the following')",
    },
    listI: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Items in List I (A, B, C, D - 4 items)",
    },
    listII: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Items in List II (P, Q, R, S - 4 items)",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Exactly 4 options, each is a mapping string like '(P) → (5) (Q) → (3) (R) → (2) (S) → (4)'",
    },
    correctIndex: {
      type: Type.INTEGER,
      description: "Index of the correct option (0-3 for A, B, C, D)",
    },
    explanation: {
      type: Type.STRING,
      description:
        "Short explanation for the correct answer (must be in markdown format)",
    },
    hint: {
      type: Type.STRING,
      description: "A small hint like the formula or concept used",
      nullable: true,
    },
    section: {
      type: Type.STRING,
      description:
        "Predefined section name this question belongs to. Set to null if no sections are configured.",
      nullable: true,
    },
  },
  required: [
    "id",
    "question",
    "listI",
    "listII",
    "options",
    "correctIndex",
    "explanation",
  ],
};

/**
 * Build sub-question schemas that reuse the EXACT field definitions from each
 * top-level question type. This forces Gemini to produce the correct structure
 * per sub-question type instead of relying on nullable hints in descriptions.
 *
 * Each sub-question schema mirrors its parent type but strips `id` (replaced
 * with a string sub-id) and removes `section` (inherited from parent case study).
 */
const caseStudyMcqSubSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Sub-question ID like 'sub1'" },
    question: mcqItemSchema.properties!.question!,
    options: mcqItemSchema.properties!.options!,
    correctAnswerIndex: mcqItemSchema.properties!.correctAnswerIndex!,
    explanation: mcqItemSchema.properties!.explanation!,
    hint: mcqItemSchema.properties!.hint!,
  },
  required: ["id", "question", "options", "correctAnswerIndex", "explanation"],
};

const caseStudyNumericalSubSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Sub-question ID like 'sub1'" },
    question: numericalItemSchema.properties!.question!,
    correctAnswer: numericalItemSchema.properties!.correctAnswer!,
    explanation: numericalItemSchema.properties!.explanation!,
    hint: numericalItemSchema.properties!.hint!,
  },
  required: ["id", "question", "correctAnswer", "explanation"],
};

const caseStudySingleDigitIntegerSubSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Sub-question ID like 'sub1'" },
    question: singleDigitIntegerItemSchema.properties!.question!,
    correctAnswer: singleDigitIntegerItemSchema.properties!.correctAnswer!,
    explanation: singleDigitIntegerItemSchema.properties!.explanation!,
    hint: singleDigitIntegerItemSchema.properties!.hint!,
  },
  required: ["id", "question", "correctAnswer", "explanation"],
};

const caseStudyMultiCorrectSubSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Sub-question ID like 'sub1'" },
    question: multiCorrectItemSchema.properties!.question!,
    options: multiCorrectItemSchema.properties!.options!,
    correctAnswerIndices:
      multiCorrectItemSchema.properties!.correctAnswerIndices!,
    explanation: multiCorrectItemSchema.properties!.explanation!,
    hint: multiCorrectItemSchema.properties!.hint!,
  },
  required: [
    "id",
    "question",
    "options",
    "correctAnswerIndices",
    "explanation",
  ],
};

const caseStudyMatchListSubSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Sub-question ID like 'sub1'" },
    question: matchListItemSchema.properties!.question!,
    listA: matchListItemSchema.properties!.listA!,
    listB: matchListItemSchema.properties!.listB!,
    correctMatches: matchListItemSchema.properties!.correctMatches!,
    explanation: matchListItemSchema.properties!.explanation!,
  },
  required: [
    "id",
    "question",
    "listA",
    "listB",
    "correctMatches",
    "explanation",
  ],
};

const caseStudyMatchListOptionFormatSubSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Sub-question ID like 'sub1'" },
    question: matchListOptionFormatItemSchema.properties!.question!,
    listI: matchListOptionFormatItemSchema.properties!.listI!,
    listII: matchListOptionFormatItemSchema.properties!.listII!,
    options: matchListOptionFormatItemSchema.properties!.options!,
    correctIndex: matchListOptionFormatItemSchema.properties!.correctIndex!,
    explanation: matchListOptionFormatItemSchema.properties!.explanation!,
    hint: matchListOptionFormatItemSchema.properties!.hint!,
  },
  required: [
    "id",
    "question",
    "listI",
    "listII",
    "options",
    "correctIndex",
    "explanation",
  ],
};

const caseStudyItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER, description: "Unique question ID" },
    question: {
      type: Type.STRING,
      description: "Title or heading for the case study",
    },
    passage: {
      type: Type.STRING,
      description: "The case study passage/paragraph in markdown format",
    },
    // ── Typed sub-question arrays ──
    // Each array uses the EXACT schema of the parent type, so Gemini is forced
    // to produce the correct fields. Only populate the arrays whose types are
    // allowed by admin config.
    mcqSubQuestions: {
      type: Type.ARRAY,
      items: caseStudyMcqSubSchema,
      description:
        "MCQ sub-questions (single-correct, 4 options). Populate when sub-questions of type MCQ are needed.",
      nullable: true,
    },
    numericalSubQuestions: {
      type: Type.ARRAY,
      items: caseStudyNumericalSubSchema,
      description:
        "Numerical sub-questions (student types a number). Populate when sub-questions of type numerical are needed.",
      nullable: true,
    },
    multiCorrectSubQuestions: {
      type: Type.ARRAY,
      items: caseStudyMultiCorrectSubSchema,
      description:
        "Multi-correct sub-questions (multiple options correct). Populate when sub-questions of type multiCorrect are needed.",
      nullable: true,
    },
    matchListSubQuestions: {
      type: Type.ARRAY,
      items: caseStudyMatchListSubSchema,
      description:
        "Match-list sub-questions (two columns to match). Populate when sub-questions of type matchList are needed.",
      nullable: true,
    },
    matchListOptionFormatSubQuestions: {
      type: Type.ARRAY,
      items: caseStudyMatchListOptionFormatSubSchema,
      description:
        "Match-list option-format sub-questions. Populate when sub-questions of type matchListOptionFormat are needed.",
      nullable: true,
    },
    singleDigitIntegerSubQuestions: {
      type: Type.ARRAY,
      items: caseStudySingleDigitIntegerSubSchema,
      description:
        "Single-digit integer sub-questions (answer is exactly one digit 0-9). Populate when sub-questions of type singleDigitInteger are needed.",
      nullable: true,
    },
    explanation: {
      type: Type.STRING,
      description:
        "General explanation for the case study  (must be in markdown format)",
    },
    section: {
      type: Type.STRING,
      description:
        "Predefined section name this question belongs to. Set to null if no sections are configured.",
      nullable: true,
    },
  },
  required: ["id", "question", "passage", "explanation"],
};

// ── Section Schema Registry ──
// Central registry so we can dynamically build schemas per grade config.

const SECTION_ARRAY_SCHEMAS: Record<string, Schema> = {
  mcq: {
    type: Type.ARRAY,
    description: "Single-correct Multiple Choice Questions",
    items: mcqItemSchema,
    nullable: true,
  },
  numerical: {
    type: Type.ARRAY,
    description:
      "Numerical answer questions where student enters a number via keypad",
    items: numericalItemSchema,
    nullable: true,
  },
  multiCorrect: {
    type: Type.ARRAY,
    description:
      "Multiple-correct MCQs where more than one option can be correct",
    items: multiCorrectItemSchema,
    nullable: true,
  },
  matchList: {
    type: Type.ARRAY,
    description:
      "Match the following / Matrix match questions with two lists to match",
    items: matchListItemSchema,
    nullable: true,
  },
  matchListOptionFormat: {
    type: Type.ARRAY,
    description:
      "Matrix match with option format where you provide 4 pre-made options (A, B, C, D). Each option is a mapping string like '(P) → (5) (Q) → (3) (R) → (2) (S) → (4)'.",
    items: matchListOptionFormatItemSchema,
    nullable: true,
  },
  caseStudy: {
    type: Type.ARRAY,
    description:
      "Case study / passage-based questions with sub-questions of various types",
    items: caseStudyItemSchema,
    nullable: true,
  },
  singleDigitInteger: {
    type: Type.ARRAY,
    description:
      "Single-digit integer answer questions where the answer is exactly one digit (0-9). No decimals or negative values.",
    items: singleDigitIntegerItemSchema,
    nullable: true,
  },
};

const SECTION_ITEM_SCHEMAS: Record<string, Schema> = {
  mcq: mcqItemSchema,
  numerical: numericalItemSchema,
  multiCorrect: multiCorrectItemSchema,
  matchList: matchListItemSchema,
  matchListOptionFormat: matchListOptionFormatItemSchema,
  caseStudy: caseStudyItemSchema,
  singleDigitInteger: singleDigitIntegerItemSchema,
};

export const testResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subject: {
      type: Type.STRING,
      description: "Subject of the test",
    },
    ...Object.fromEntries(
      Object.keys(SECTION_ARRAY_SCHEMAS).map((k) => {
        const { nullable, ...schemaWithoutNullable } = SECTION_ARRAY_SCHEMAS[k] as any;
        return [k, schemaWithoutNullable];
      }),
    ),
  },
  required: ["subject", ...Object.keys(SECTION_ARRAY_SCHEMAS)],
};

/**
 * Build a response schema that ONLY includes the section types listed.
 * This prevents Gemini from being overwhelmed by unused nullable arrays
 * and ensures it reliably populates every configured question type.
 * countHints embeds per-array quantity expectations directly in the schema
 * description so all models (including lightweight ones) see the target counts.
 */
export const buildDynamicResponseSchema = (
  sections: string[],
  sectionEnum?: string[],
  countHints?: Record<string, { desc: string; minItems?: number; maxItems?: number }>,
): Schema => {
  const effectiveEnum =
    sectionEnum && sectionEnum.length > 0 ? sectionEnum : undefined;

  const properties: Record<string, Schema> = {
    subject: {
      type: Type.STRING,
      description: "Subject of the test",
    },
  };

  const requiredFields: string[] = ["subject"];
  const seen = new Set<string>();

  for (const section of sections) {
    if (seen.has(section)) continue;
    seen.add(section);

    const arraySchema = SECTION_ARRAY_SCHEMAS[section];
    if (!arraySchema) continue;

    let desc = arraySchema.description;
    const hintObj = countHints?.[section];
    if (hintObj?.desc) {
      desc = `${desc} — ${hintObj.desc}`;
    }
    
    // Remove nullable to strictly require the model to output this array
    const { nullable, ...schemaWithoutNullable } = arraySchema as any;
    let finalArraySchema: Schema = { ...schemaWithoutNullable, description: desc };

    if (hintObj?.minItems !== undefined) {
      (finalArraySchema as any).minItems = hintObj.minItems;
    }
    if (hintObj?.maxItems !== undefined) {
      (finalArraySchema as any).maxItems = hintObj.maxItems;
    }

    // Patch section enum into item schemas when subject-sectional config exists
    if (effectiveEnum) {
      const itemSchema = SECTION_ITEM_SCHEMAS[section];
      if (itemSchema?.properties?.section) {
        const patchedItem: Schema = {
          ...itemSchema,
          properties: {
            ...itemSchema.properties,
            section: {
              ...itemSchema.properties.section,
              enum: effectiveEnum,
            },
          },
        };
        finalArraySchema = { ...finalArraySchema, items: patchedItem };
      }
    }

    properties[section] = finalArraySchema;
    requiredFields.push(section);
  }

  return {
    type: Type.OBJECT,
    properties,
    required: requiredFields,
  };
};

/**
 * Builds a test response schema that constrains the `section` enum to given labels.
 * Includes ALL section types (backward-compatible for the update-test route).
 */
export const buildTestResponseSchema = (sectionNames: string[]): Schema => {
  return buildDynamicResponseSchema(
    Object.keys(SECTION_ARRAY_SCHEMAS),
    sectionNames,
  );
};

// const subjectQuestionsSchema: Schema = {
//   type: Type.OBJECT,
//   properties: {
//     subjectName: {
//       type: Type.STRING,
//       description: "Name of the subject (e.g., Physics, Chemistry)",
//     },
//     mcq: { type: Type.ARRAY, items: mcqItemSchema, nullable: true },
//     numerical: { type: Type.ARRAY, items: numericalItemSchema, nullable: true },
//     multiCorrect: {
//       type: Type.ARRAY,
//       items: multiCorrectItemSchema,
//       nullable: true,
//     },
//     matchList: { type: Type.ARRAY, items: matchListItemSchema, nullable: true },
//     matchListOptionFormat: {
//       type: Type.ARRAY,
//       items: matchListOptionFormatItemSchema,
//       nullable: true,
//     },
//     caseStudy: { type: Type.ARRAY, items: caseStudyItemSchema, nullable: true },
//   },
//   required: ["subjectName"],
// };

export const fullTestResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subjects: {
      type: Type.ARRAY,
      items: testResponseSchema,
      description: "List of subjects with their respective questions",
    },
  },
  required: ["subjects"],
};
