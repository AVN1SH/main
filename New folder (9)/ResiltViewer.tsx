import React, { useState } from "react";
import {
  finalExtractResult,
  pyqResult,
  SubQuestion,
  SyllabusResult,
} from "@/types";

interface ResultViewerProps {
  data?: finalExtractResult | null;
  pyqData?: pyqResult | null;
  syllabusData?: SyllabusResult | null;
  type: string;
}

const ResultViewer: React.FC<ResultViewerProps> = ({
  data,
  pyqData,
  syllabusData,
  type,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "json">("preview");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert("Copied to clipboard!");
  };

  const renderOptions = (options: string[] | null) => {
    if (!options || options.length === 0) return null;
    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {options.map((opt, idx) => (
          <li
            key={idx}
            className="flex items-start text-slate-600 text-sm bg-slate-50 p-2 rounded border border-slate-100"
          >
            <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500 font-bold mr-2 mt-0.5">
              {String.fromCharCode(65 + idx)}
            </span>
            <span>{opt}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderSubQuestions = (subQuestions: SubQuestion[] | null) => {
    if (!subQuestions || subQuestions.length === 0) return null;
    return (
      <div className="mt-4 pl-4 border-l-2 border-indigo-100 space-y-4">
        <h4 className="text-xs font-bold text-indigo-400 uppercase">
          Sub-Questions
        </h4>
        {subQuestions.map((sq, idx) => (
          <div
            key={idx}
            className="bg-slate-50 p-3 rounded-lg border border-slate-100"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-slate-500">
                Q{idx + 1}
              </span>
              <div className="flex gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {sq.type}
                </span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                  {sq.marks} marks
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-800 font-medium mb-2">
              {sq.question_text}
            </p>
            {renderOptions(sq.question_options)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === "preview"
              ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab("json")}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === "json"
              ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Raw JSON
        </button>
      </div>

      <div className="p-0 overflow-auto flex-1 custom-scrollbar bg-slate-50/50">
        {type === "sqp" && activeTab === "preview" ? (
          <div className="p-6 space-y-6">
            {!data?.data || !Array.isArray(data.data) || data.data.length === 0 ? (
              <div className="text-center text-slate-400 py-10">
                No questions found.
              </div>
            ) : (
              data.data.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden"
                >
                  {/* Metadata Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-semibold border border-indigo-100">
                      Class {q.class}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-semibold border border-slate-200">
                      {q.subject}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-semibold border border-slate-200">
                      {q.year}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-semibold border border-slate-200">
                      {q.exam_type}
                    </span>
                    <span className="ml-auto px-2 py-1 bg-green-50 text-green-700 rounded-md font-bold border border-green-100">
                      {q.marks} Marks
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="shrink-0 flex items-center justify-center h-6 w-6 text-xs font-bold text-white bg-slate-800 rounded-full mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-slate-900 font-semibold text-lg leading-snug mb-2">
                          {q.question_text}
                        </h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 ml-2 whitespace-nowrap">
                          {q.question_type?.replace("_", " ") || "UNKNOWN"}
                        </span>
                      </div>

                      {renderOptions(q.question_options)}
                      {renderSubQuestions(q.sub_questions)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          type === "sqp" && (
            <div className="relative group h-full">
              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-md shadow-sm border border-slate-200 text-xs font-medium text-slate-600 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                Copy JSON
              </button>
              <pre className="p-6 text-sm text-slate-700 font-mono leading-relaxed whitespace-pre-wrap break-all h-full">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )
        )}

        {type === "pyq" && activeTab === "preview" ? (
          <div className="p-8 h-fit w-full">{pyqData?.text}</div>
        ) : (
          type === "pyq" && (
            <div className="relative group h-full">
              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-md shadow-sm border border-slate-200 text-xs font-medium text-slate-600 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                Copy JSON
              </button>
              <pre className="p-6 text-sm text-slate-700 font-mono leading-relaxed whitespace-pre-wrap break-all h-full overflow-auto">
                {JSON.stringify(pyqData, null, 2)}
              </pre>
            </div>
          )
        )}

        {type === "syllabus" && activeTab === "preview" ? (
          <div className="p-8 h-fit w-full space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-200 pb-2">
                Chapter Weightage
              </h3>
              {syllabusData?.chapter_weightage.map((chapter, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">
                        {chapter.chapter}
                      </h4>
                      {chapter.description && (
                        <p className="text-xs text-slate-500 mt-1">
                          {chapter.description}
                        </p>
                      )}
                    </div>
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold border border-indigo-100">
                      {chapter.weightage} marks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          type === "syllabus" && (
            <div className="relative group h-full">
              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-md shadow-sm border border-slate-200 text-xs font-medium text-slate-600 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                Copy JSON
              </button>
              <pre className="p-6 text-sm text-slate-700 font-mono leading-relaxed whitespace-pre-wrap break-all h-full overflow-auto">
                {JSON.stringify(syllabusData, null, 2)}
              </pre>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ResultViewer;
