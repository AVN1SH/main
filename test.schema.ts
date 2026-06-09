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
      description: "Predefined section name this question belongs to (e.g. 'Organic Chemistry'). Set to null if no sections are configured.",
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
      description: "Predefined section name this question belongs to. Set to null if no sections are configured.",
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
      description: "Predefined section name this question belongs to. Set to null if no sections are configured.",
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
      description: "Predefined section name this question belongs to. Set to null if no sections are configured.",
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
      description: "Short explanation for the correct answer (must be in markdown format)",
    },
    hint: {
      type: Type.STRING,
      description: "A small hint like the formula or concept used",
      nullable: true,
    },
    section: {
      type: Type.STRING,
      description: "Predefined section name this question belongs to. Set to null if no sections are configured.",
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

const caseStudySubQuestionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Sub-question ID like 'sub1'" },
    question: {
      type: Type.STRING,
      description: "Sub-question text in markdown format",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 4 options for the sub-question",
    },
    correctAnswerIndex: {
      type: Type.INTEGER,
      description: "Index of the correct option (0-3)",
    },
  },
  required: ["id", "question", "options", "correctAnswerIndex"],
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
    subQuestions: {
      type: Type.ARRAY,
      items: caseStudySubQuestionSchema,
      description: "3-5 MCQ sub-questions based on the passage",
    },
    explanation: {
      type: Type.STRING,
      description:
        "General explanation for the case study  (must be in markdown format)",
    },
    section: {
      type: Type.STRING,
      description: "Predefined section name this question belongs to. Set to null if no sections are configured.",
      nullable: true,
    },
  },
  required: ["id", "question", "passage", "subQuestions", "explanation"],
};

export const testResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subject: {
      type: Type.STRING,
      description: "Subject of the test",
    },
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
        "Case study / passage-based questions with MCQ sub-questions",
      items: caseStudyItemSchema,
      nullable: true,
    },
  },
  required: ["subject"],
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
