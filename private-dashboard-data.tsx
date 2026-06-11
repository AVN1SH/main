"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import DragDropUploader from "@/components/uploadData/DragDropUploader";
import {
  AppState,
  finalExtractResult,
  pyqResult,
  SyllabusItem,
  SyllabusResult,
} from "@/types";
import axios from "axios";
import ResultViewer from "@/components/uploadData/ResiltViewer";
import { toast } from "sonner";

const DOC_TYPES = ["PYQ", "SQP", "syllabus"];
const YEARS = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];
const CLASSES = [
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "Jee Main",
  "Jee Advanced",
  "Neet",
];
const EXAM_TYPES = ["CBSE", "ICSE", "BSEB", "CUET"];
const COMPETITIVE_EXAMS = ["Jee Main", "Jee Advanced", "Neet"];
const SET = ["1", "2", "3", "4", "5", "6"];

const SUBJECTS_BY_CLASS: Record<string, string[]> = {
  "7th": ["English", "Hindi", "Mathematics", "Science", "Social Science"],
  "8th": ["English", "Hindi", "Mathematics", "Science", "Social Science"],
  "9th": ["English", "Hindi", "Mathematics", "Science", "Social Science"],
  "10th": [
    "Science",
    "Mathematics",
    "English",
    "Social Science",
    "Computer Application",
  ],
  "11th": [
    "Physics",
    "Chemistry",
    "Biology",
    "Mathematics",
    "English",
    "Accountancy",
    "Economics",
  ],
  "12th": [
    "Physics",
    "Chemistry",
    "Biology",
    "Mathematics",
    "English",
    "Accountancy",
    "Economics",
  ],
  "Jee Main": ["Physics", "Chemistry", "Mathematics"],
  "Jee Advanced": ["Physics", "Chemistry", "Mathematics"],
  Neet: ["Physics", "Chemistry", "Zoology", "Botany"],
};

export interface ExtractionMetadata {
  docType: string;
  year: string;
  subject: string;
  examType: string;
  grade: string;
  set: string;
}

export default function FeedDatabasePage() {
  const [file, setFile] = useState<File | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<finalExtractResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pyqResult, setPyqResult] = useState<pyqResult | null>(null);
  const [syllabusList, setSyllabusList] = useState<SyllabusItem[]>([]);
  const [syllabusInput, setSyllabusInput] = useState<SyllabusItem>({
    chapter: "",
    weightage: "",
    description: "",
  });
  const [syllabusResult, setSyllabusResult] = useState<SyllabusResult | null>(
    null,
  );
  const [formData, setFormData] = useState<ExtractionMetadata>({
    docType: "",
    year: new Date().getFullYear().toString(),
    subject: "",
    set: "",
    examType: "",
    grade: "",
  });
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState<"file" | "text">("file");
  const [pastedText, setPastedText] = useState("");
  const [dynamicGrades, setDynamicGrades] = useState<string[]>([]);

  // Paper Set custom entry
  const [isCustomSet, setIsCustomSet] = useState(false);
  const [customSetInput, setCustomSetInput] = useState("");

  // Subject debounced autocomplete
  const [subjectQuery, setSubjectQuery] = useState("");
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const subjectDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const subjectSuggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get("/api/admin/grade-steps").then((res) => {
      const grades = (res.data || []).map((g: any) => g.gradeId).filter(Boolean);
      if (grades.length > 0) setDynamicGrades(grades);
    }).catch(() => {});
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };

      // Sync examType based on grade selection
      if (name === "grade") {
        if (isCompetitiveExam(value)) {
          newState.examType = value;
        } else if (!isSchoolGrade(value)) {
          newState.examType = "";
        }
      }

      // Reset grade/examType if docType changes to something other than allowed for competitive exams
      if (name === "docType") {
        const lowerDocType = value.toLowerCase();
        if (
          isCompetitiveExam(prev.grade) &&
          !["pyq", "syllabus"].includes(lowerDocType)
        ) {
          newState.grade = "";
          newState.examType = "";
        }
      }

      return newState;
    });
  };

  const handleProcess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const effectiveExamType = normalizeExamType(deriveExamType());

    if (formData.docType.toLowerCase() === "syllabus") {
      setSyllabusResult({
        chapter_weightage: syllabusList,
        year: Number(formData.year),
        class: formData.grade,
        subject: formData.subject,
        exam_type: effectiveExamType,
      });
      return;
    }

    if (inputType === "file" && !file) {
      alert("Please upload a document to proceed.");
      return;
    }

    if (inputType === "text" && !pastedText) {
      alert("Please paste some text to proceed.");
      return;
    }

    setAppState(AppState.PROCESSING);
    setError(null);
    setResult(null);

    try {
      const formDetails = new FormData();
      if (inputType === "file" && file) {
        formDetails.append("pdfFile", file);
      } else if (inputType === "text" && pastedText) {
        formDetails.append("pastedText", pastedText);
      }
      formDetails.append("year", formData.year);
      formDetails.append("subject", formData.subject);
      formDetails.append("examType", effectiveExamType);
      formDetails.append("grade", formData.grade);
      formDetails.append("docType", formData.docType.toLowerCase());
      // Normalize spaces to dashes for paperSet only
      const normalizedPaperSet = formData.set.trim().replace(/\s+/g, "-");
      formDetails.append("paperSet", normalizedPaperSet);

      const response = await axios.post("/api/private/upload", formDetails, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (formData.docType.toLowerCase() === "sqp") {
        if (response.data) {
          const data = response.data;
          setResult(data);
          setAppState(AppState.SUCCESS);
        }
      } else if (formData.docType.toLowerCase() === "pyq") {
        if (response.data) {
          const data = response.data.data;
          setPyqResult(data);
          setAppState(AppState.SUCCESS);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response.data);
      setError(
        err.message || "Something went wrong while processing the document.",
      );
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setAppState(AppState.IDLE);
    setError(null);
    setPyqResult(null);
    setSyllabusList([]);
    setSyllabusInput({ chapter: "", weightage: "", description: "" });
    setSyllabusResult(null);
    setPastedText("");
    setInputType("file");
    setIsCustomSet(false);
    setCustomSetInput("");
    setSubjectQuery("");
    setSubjectSuggestions([]);
    setIsCustomSubject(false);
  };

  const handleInsertDatabase = async () => {
    if (!formData.docType) return;

    if (formData.docType.toLowerCase() === "pyq") {
      if (!pyqResult) return;
    }

    if (formData.docType.toLowerCase() === "sqp") {
      if (!result) return;
    }

    try {
      setLoading(true);
      toast.loading("Inserting in database...", {
        id: "loading-toast",
      });
      const response = await axios.post("/api/private/insert-to-db", {
        data:
          formData.docType.toLowerCase() === "pyq"
            ? pyqResult
            : formData.docType.toLowerCase() === "sqp"
              ? result?.data
              : syllabusResult,
        type: formData.docType.toLowerCase(),
      });
      if (response.data) {
        toast.success("Data inserted successfully", {
          id: "loading-toast",
        });
        reset();
      } else {
        toast.error("Something went wrong", {
          id: "loading-toast",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data, { id: "loading-toast" });
    } finally {
      setLoading(false);
    }
  };
  const handleSyllabusInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setSyllabusInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSyllabusItem = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!syllabusInput.chapter || !syllabusInput.weightage) return;

    setSyllabusList((prev) => [...prev, syllabusInput]);
    setSyllabusInput({ chapter: "", weightage: "", description: "" });
  };

  const handleRemoveSyllabusItem = (index: number) => {
    setSyllabusList((prev) => prev.filter((_, i) => i !== index));
  };

  const normalizeGrade = (g: string) => g.toLowerCase().replace(/\s+/g, "_");

  const mergedGrades = (() => {
    const seen = new Set<string>();
    const result: string[] = [];
    const all = [...dynamicGrades, ...CLASSES];
    for (const g of all) {
      const key = normalizeGrade(g);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(g);
      }
    }
    return result;
  })();

  const isCompetitiveExam = (grade: string) =>
    COMPETITIVE_EXAMS.some((c) => normalizeGrade(c) === normalizeGrade(grade));

  const isSchoolGrade = (grade: string) => {
    if (!grade) return false;
    const norm = normalizeGrade(grade);
    return ["7th", "8th", "9th", "10th", "11th", "12th"].some(
      (s) => normalizeGrade(s) === norm,
    );
  };

  const deriveExamType = () => {
    if (formData.examType) return formData.examType;
    return formData.grade;
  };

  const normalizeExamType = (val: string) =>
    val.toUpperCase().replace(/\s+/g, "_");

  const availableSubjects = (() => {
    if (!formData.grade) return [];
    if (SUBJECTS_BY_CLASS[formData.grade]) return SUBJECTS_BY_CLASS[formData.grade];
    const norm = normalizeGrade(formData.grade);
    const key = Object.keys(SUBJECTS_BY_CLASS).find((k) => normalizeGrade(k) === norm);
    return key ? SUBJECTS_BY_CLASS[key] : [];
  })();

  const availableSet =
    formData.docType.toLowerCase() === "pyq" ? SET || [] : [];

  // Debounced subject search from syllabus API
  const fetchSubjectSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSubjectSuggestions([]);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (formData.grade) params.set("class", formData.grade);
      const res = await fetch(`/api/syllabus/subjects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const subjects: string[] = data.subjects || [];
        const filtered = subjects.filter((s) =>
          s.toLowerCase().includes(query.toLowerCase())
        );
        setSubjectSuggestions(filtered);
      }
    } catch {
      // silently fail suggestions
    }
  }, [formData.grade]);

  const handleSubjectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSubjectQuery(val);
    setFormData((prev) => ({ ...prev, subject: val }));
    setShowSubjectSuggestions(true);
    if (subjectDebounceRef.current) clearTimeout(subjectDebounceRef.current);
    subjectDebounceRef.current = setTimeout(() => {
      fetchSubjectSuggestions(val);
    }, 300);
  };

  const handleSubjectSuggestionSelect = (subject: string) => {
    setSubjectQuery(subject);
    setFormData((prev) => ({ ...prev, subject }));
    setShowSubjectSuggestions(false);
    setSubjectSuggestions([]);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        subjectSuggestionsRef.current &&
        !subjectSuggestionsRef.current.contains(e.target as Node) &&
        subjectInputRef.current &&
        !subjectInputRef.current.contains(e.target as Node)
      ) {
        setShowSubjectSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset custom subject when grade changes
  useEffect(() => {
    setSubjectQuery("");
    setFormData((prev) => ({ ...prev, subject: "" }));
    setIsCustomSubject(false);
    setSubjectSuggestions([]);
  }, [formData.grade]);

  return (
    <div className="min-h-screen w-full overflow-hidden bg-linear-to-br from-slate-50 to-slate-100 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              <span className="text-indigo-600">FEED </span>DATABASE
            </h1>
            {/* <p className="text-slate-500 mt-2 text-sm md:text-base">
              Extract formatted questions from PDFs instantly using Gemini AI.
            </p> */}
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 h-full">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <form onSubmit={handleProcess} className="contents">
              {/* File Upload Section */}
              {formData.docType.toLowerCase() !== "syllabus" && (
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                      <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                        1
                      </span>
                      Upload Document{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </h2>

                    {/* Toggle Bar */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setInputType("file")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                          inputType === "file"
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        PDF File
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputType("text")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                          inputType === "text"
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Paste Text
                      </button>
                    </div>
                  </div>

                  {inputType === "file" ? (
                    <DragDropUploader
                      onFileSelect={setFile}
                      selectedFile={file}
                      disabled={appState === AppState.PROCESSING}
                    />
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Paste your questions or content here..."
                        className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                        disabled={appState === AppState.PROCESSING}
                      />
                      <p className="text-[10px] text-slate-400 italic">
                        Tip: You can paste raw text from a PDF or any document.
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* Paper Details Form */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                    2
                  </span>
                  Paper Details
                </h2>
                <div className="space-y-4">
                  {/* Document Type - New Field */}
                  <div>
                    <label
                      htmlFor="docType"
                      className="block text-xs font-medium text-slate-500 mb-1"
                    >
                      Document Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="docType"
                      id="docType"
                      value={formData.docType}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all invalid:border-red-300 focus:invalid:ring-red-200 appearance-none"
                      disabled={appState === AppState.PROCESSING}
                      required
                    >
                      <option value="">Select Type</option>
                      {DOC_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.docType === "syllabus" && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
                      <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                        Syllabus Structure
                      </label>

                      {/* Inputs */}
                      <div className="flex flex-col gap-2 mb-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            name="chapter"
                            value={syllabusInput.chapter}
                            onChange={handleSyllabusInputChange}
                            placeholder="Chapter Name"
                            className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={appState === AppState.PROCESSING}
                          />
                          <input
                            type="number"
                            name="weightage"
                            value={syllabusInput.weightage}
                            onChange={handleSyllabusInputChange}
                            placeholder="eg. 20, 10"
                            className="w-full sm:w-1/3 p-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={appState === AppState.PROCESSING}
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="description"
                            value={syllabusInput.description}
                            onChange={handleSyllabusInputChange}
                            placeholder="Description (Optional)"
                            className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={appState === AppState.PROCESSING}
                          />
                          <button
                            type="button"
                            onClick={handleAddSyllabusItem}
                            disabled={
                              !syllabusInput.chapter ||
                              !syllabusInput.weightage ||
                              appState === AppState.PROCESSING
                            }
                            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* List of Added Items */}
                      {syllabusList.length > 0 && (
                        <div className="space-y-2 mt-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                          {syllabusList.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center bg-white p-2 rounded-md border border-slate-200 text-sm group"
                            >
                              <div className="flex-1 truncate mr-2">
                                <div className="flex items-center">
                                  <span className="font-medium text-slate-700">
                                    {item.chapter}
                                  </span>
                                  <span className="text-xs text-slate-500 ml-2 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {item.weightage}
                                  </span>
                                </div>
                                {item.description && (
                                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveSyllabusItem(index)}
                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {syllabusList.length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center py-2">
                          No chapters added yet.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="year"
                        className="block text-xs font-medium text-slate-500 mb-1"
                      >
                        Year <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="year"
                        id="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all invalid:border-red-300 focus:invalid:ring-red-200"
                        disabled={appState === AppState.PROCESSING}
                        required
                      >
                        <option value="">Select Year</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="grade"
                        className="block text-xs font-medium text-slate-500 mb-1"
                      >
                        Class/Grade <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="grade"
                        id="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all invalid:border-red-300 focus:invalid:ring-red-200"
                        disabled={appState === AppState.PROCESSING}
                        required
                      >
                        <option value="">Select Class</option>
                        {mergedGrades.filter((cls) => {
                          if (isCompetitiveExam(cls)) {
                            return ["pyq", "syllabus"].includes(
                              formData.docType.toLowerCase(),
                            );
                          }
                          return true;
                        }).map((cls) => (
                          <option key={normalizeGrade(cls)} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Subject Field with debounced autocomplete */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-xs font-medium text-slate-500 mb-1"
                      >
                        Subject <span className="text-red-500">*</span>
                      </label>
                      {availableSubjects.length > 0 && !isCustomSubject ? (
                        <div className="flex gap-1">
                          <select
                            name="subject"
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => {
                              if (e.target.value === "__custom__") {
                                setIsCustomSubject(true);
                                setFormData((prev) => ({ ...prev, subject: "" }));
                                setSubjectQuery("");
                              } else {
                                handleInputChange(e);
                              }
                            }}
                            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all invalid:border-red-300 focus:invalid:ring-red-200 disabled:opacity-50"
                            disabled={
                              appState === AppState.PROCESSING || !formData.grade
                            }
                            required={formData.grade ? true : false}
                          >
                            <option value="">
                              {!formData.grade ? "Select Class First" : "Select Subject"}
                            </option>
                            {availableSubjects.map((sub) => (
                              <option key={sub} value={sub}>
                                {sub}
                              </option>
                            ))}
                            <option value="__custom__">✏️ Custom...</option>
                          </select>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="flex gap-1">
                            <input
                              ref={subjectInputRef}
                              type="text"
                              name="subject"
                              id="subject"
                              value={subjectQuery}
                              onChange={handleSubjectInputChange}
                              onFocus={() => {
                                if (subjectQuery) setShowSubjectSuggestions(true);
                              }}
                              placeholder={
                                formData.grade
                                  ? "Type to search subjects..."
                                  : "Select class first"
                              }
                              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50"
                              disabled={
                                appState === AppState.PROCESSING || !formData.grade
                              }
                              required={!!formData.grade}
                              autoComplete="off"
                            />
                            {isCustomSubject && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomSubject(false);
                                  setSubjectQuery("");
                                  setFormData((prev) => ({ ...prev, subject: "" }));
                                }}
                                className="px-2 text-slate-400 hover:text-slate-600 text-xs"
                                title="Back to list"
                              >
                                ↩
                              </button>
                            )}
                          </div>
                          {/* Suggestions dropdown */}
                          {showSubjectSuggestions && subjectSuggestions.length > 0 && (
                            <div
                              ref={subjectSuggestionsRef}
                              className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                            >
                              {subjectSuggestions.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onMouseDown={() => handleSubjectSuggestionSelect(s)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Paper Set Field with custom entry */}
                    <div>
                      <label
                        htmlFor="set"
                        className="block text-xs font-medium text-slate-500 mb-1"
                      >
                        Paper Set <span className="text-red-500">*</span>
                      </label>
                      {formData.docType.toLowerCase() === "pyq" && !isCustomSet ? (
                        <select
                          name="set"
                          id="set"
                          value={formData.set}
                          onChange={(e) => {
                            if (e.target.value === "__custom__") {
                              setIsCustomSet(true);
                              setCustomSetInput("");
                              setFormData((prev) => ({ ...prev, set: "" }));
                            } else {
                              handleInputChange(e);
                            }
                          }}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all invalid:border-red-300 focus:invalid:ring-red-200 disabled:opacity-50"
                          disabled={appState === AppState.PROCESSING}
                          required
                        >
                          <option value="">Select Set</option>
                          {availableSet.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                          <option value="__custom__">✏️ Custom...</option>
                        </select>
                      ) : formData.docType.toLowerCase() === "pyq" && isCustomSet ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            id="set-custom"
                            value={customSetInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomSetInput(val);
                              setFormData((prev) => ({ ...prev, set: val }));
                            }}
                            placeholder="e.g. Set A, Morning Shift"
                            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            required
                            disabled={appState === AppState.PROCESSING}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomSet(false);
                              setCustomSetInput("");
                              setFormData((prev) => ({ ...prev, set: "" }));
                            }}
                            className="px-2 text-slate-400 hover:text-slate-600 text-xs"
                            title="Back to list"
                          >
                            ↩
                          </button>
                        </div>
                      ) : (
                        <input
                          type="text"
                          id="set"
                          value=""
                          readOnly
                          placeholder="Select Doc Type First"
                          className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 text-sm cursor-not-allowed"
                          disabled
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="examType"
                      className="block text-xs font-medium text-slate-500 mb-1"
                    >
                      Exam Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="examType"
                      id="examType"
                      value={formData.examType}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all invalid:border-red-300 focus:invalid:ring-red-200 disabled:opacity-50"
                      disabled={
                        appState === AppState.PROCESSING ||
                        !formData.grade ||
                        !isSchoolGrade(formData.grade)
                      }
                      required={
                        !!formData.grade && isSchoolGrade(formData.grade)
                      }
                    >
                      <option value="">Select Exam Type</option>
                      {EXAM_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Action Button */}
              <button
                type="submit"
                disabled={appState === AppState.PROCESSING}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-200
                  ${
                    appState === AppState.PROCESSING
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-indigo-500/30"
                  }
                `}
              >
                {appState === AppState.PROCESSING ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : formData.docType === "syllabus" ? (
                  "Submit"
                ) : (
                  "Extract Questions"
                )}
              </button>
            </form>

            {appState === AppState.ERROR && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
            {result || pyqResult || syllabusResult ? (
              <div className="flex flex-col gap-4">
                <div className="overflow-hidden h-[740px]">
                  {formData.docType.toLowerCase() === "sqp" && (
                    <ResultViewer
                      data={result}
                      type={formData.docType.toLowerCase()}
                    />
                  )}
                  {formData.docType.toLowerCase() === "pyq" && (
                    <ResultViewer
                      pyqData={pyqResult}
                      type={formData.docType.toLowerCase()}
                    />
                  )}
                  {formData.docType.toLowerCase() === "syllabus" && (
                    <ResultViewer
                      syllabusData={syllabusResult}
                      type={formData.docType.toLowerCase()}
                    />
                  )}
                </div>
                <button
                  disabled={loading}
                  onClick={handleInsertDatabase}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-semibold text-center transition-all flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                    />
                  </svg>
                  Insert in Database
                </button>
              </div>
            ) : (
              <div className="h-full bg-white/50 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-10 h-10 text-indigo-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Ready to Extract
                </h3>
                <p className="text-slate-500 max-w-sm">
                  Upload a document and provide paper details to extract
                  questions in JSON format.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}