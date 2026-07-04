import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    question: { type: "string" },
    options: {
      type: "array",
      items: { type: "string" },
      minItems: 4,
      maxItems: 4,
    },
    correctIndex: { type: "number" },
    explanation: { type: "string" },
    topic: { type: "string" },
  },
  required: ["question", "options", "correctIndex", "explanation", "topic"],
};

/**
 * POST /api/demo/mcq
 * Lightweight, unauthenticated Gemini call to power the landing-page AI demo.
 * Body: { topic: string }
 */
export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    const sanitizedTopic = topic.trim().slice(0, 120);

    const prompt = `Generate ONE exam-quality Multiple Choice Question (MCQ) on the topic: "${sanitizedTopic}".
The question must be challenging but fair, suitable for a Class 10–12 or competitive exam student.
Return a JSON with:
- question: the question text (markdown allowed, LaTeX in $...$ for math)
- options: exactly 4 answer choices (do NOT prefix with a/b/c/d)
- correctIndex: 0-based index of the correct option
- explanation: a short (max 60 words) step-by-step explanation of why the answer is correct
- topic: the specific topic/subject area of this question (e.g. "Class 11 Physics – Thermodynamics")`;

    const result = await ai.models.generateContent({
      model: process.env.LiteModel || "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    if (!result.text) {
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 }
      );
    }

    const data = JSON.parse(result.text);
    return NextResponse.json(data);
  } catch (error) {
    console.error("DEMO_MCQ_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
