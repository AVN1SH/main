"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Save, BookOpen, FileText } from "lucide-react";

export default function QuestionFormatsPage() {
  const [boards, setBoards] = useState<string[]>([]);
  const [testConfig, setTestConfig] = useState<any>(null);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [dynamicSubjects, setDynamicSubjects] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, examTypesRes, gradeStepsRes] = await Promise.all([
        axios.get("/api/admin/test-config"),
        axios.get("/api/syllabus/exam-types"),
        axios.get("/api/admin/grade-steps")
      ]);
      
      setTestConfig(configRes.data);

      const fetchedBoards = (examTypesRes.data?.examTypes || []).map((b: string) => b.toLowerCase());
      setBoards(fetchedBoards);
      if (fetchedBoards.length > 0) {
        setSelectedBoard(fetchedBoards[0]);
      }

      const gradeSteps = gradeStepsRes.data || [];
      const gradesWithBoard = gradeSteps
        .filter((gs: any) => gs.steps?.some((step: any) => 
          step.key_name === "examType" || 
          step.id === "examType" || 
          step.key_name === "board" || 
          step.id === "board"
        ))
        .map((gs: any) => gs.gradeId);

      const grades = Object.keys(configRes.data.grades || {}).filter(
        (g) => g !== "default" && gradesWithBoard.includes(g),
      );
      
      setAvailableGrades(grades);
      if (grades.length > 0) {
        setSelectedGrade(grades[0]);
      }
    } catch {
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGrade && selectedBoard) {
      const fetchDynamicSubjects = async () => {
        try {
          setLoadingSubjects(true);
          const res = await axios.get(
            `/api/syllabus/subjects?class=${encodeURIComponent(selectedGrade)}&examType=${encodeURIComponent(selectedBoard)}`
          );
          setDynamicSubjects(res.data?.subjects || []);
        } catch {
          setDynamicSubjects([]);
          toast.error("Failed to load subjects");
        } finally {
          setLoadingSubjects(false);
        }
      };
      fetchDynamicSubjects();
    } else {
      setDynamicSubjects([]);
    }
  }, [selectedGrade, selectedBoard]);

  const getPaperFormatBase = () => {
    if (!selectedGrade || !testConfig?.grades) return "";
    const gradeConfig = testConfig.grades[selectedGrade];
    return gradeConfig?.paperFormat || "default";
  };

  const getPaperFormatKey = () => {
    const base = getPaperFormatBase();
    if (!base || !selectedBoard) return "";
    return `${base}_${selectedBoard}`;
  };

  const getSubjectStorageKey = (subject: string) => {
    return subject.toLowerCase().replace(/\s+/g, "_");
  };

  const getExistingFormatKey = () => {
    const paperKey = getPaperFormatKey();
    const subjKey = getSubjectStorageKey(selectedSubject);
    if (!paperKey || !subjKey || !testConfig?.paperFormats) return null;
    return testConfig.paperFormats[paperKey]?.[subjKey] || null;
  };

  const getCurrentQuestionFormat = () => {
    const formatKey = getExistingFormatKey();
    if (!formatKey || !testConfig?.questionFormats) return "";
    return testConfig.questionFormats[formatKey] || "";
  };

  const hasExistingFormat = () => {
    return !!getExistingFormatKey() && !!getCurrentQuestionFormat();
  };

  const generateFormatKey = () => {
    const subjKey = getSubjectStorageKey(selectedSubject);
    const paperBase = getPaperFormatBase();
    const numPart = paperBase.replace("grade", "");
    if (!numPart || numPart === "default") {
      return `${subjKey}QuesFormat`;
    }
    const isBseb = selectedBoard === "bseb";
    return `${subjKey}QuesFormat${numPart}${isBseb ? "BSEB" : ""}`;
  };

  const updateQuestionFormat = (value: string) => {
    if (!testConfig || !selectedSubject || !selectedGrade || !selectedBoard)
      return;

    const existingKey = getExistingFormatKey();
    const formatKey = existingKey || generateFormatKey();
    const paperKey = getPaperFormatKey();
    const subjKey = getSubjectStorageKey(selectedSubject);

    const newQuestionFormats = {
      ...(testConfig.questionFormats || {}),
      [formatKey]: value,
    };

    const newPaperFormats = {
      ...(testConfig.paperFormats || {}),
      [paperKey]: {
        ...(testConfig.paperFormats?.[paperKey] || {}),
        [subjKey]: formatKey,
      },
    };

    setTestConfig({
      ...testConfig,
      questionFormats: newQuestionFormats,
      paperFormats: newPaperFormats,
    });
  };



  const handleSave = async () => {
    if (!testConfig) return;
    try {
      setSaving(true);
      toast.loading("Saving question formats...", { id: "save-formats" });
      await axios.post("/api/admin/test-config", testConfig);
      toast.success("Question formats saved", { id: "save-formats" });
    } catch {
      toast.error("Failed to save", { id: "save-formats" });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold">
            Loading Question Formats...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Question <span className="text-indigo-600">Formats</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Configure question paper formats organized by grade, board, and
            subject.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 shadow-xl shadow-indigo-500/10 transition-all disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-6 sticky top-8 h-fit max-h-[calc(100vh-10rem)] overflow-y-auto thin-scroll">
          {/* Board Selection */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
              Select Board
            </h3>
            {boards.map((board) => (
              <button
                key={board}
                onClick={() => setSelectedBoard(board)}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl font-bold transition-all text-sm border ${
                  selectedBoard === board
                    ? "bg-white text-indigo-600 border-indigo-100 shadow-lg"
                    : "text-slate-500 hover:bg-white hover:text-slate-900 border-transparent"
                }`}
              >
                <span>{board.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* Grade Selection */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
              Select Grade
            </h3>
            {availableGrades.length > 0 ? (
              availableGrades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => {
                    setSelectedGrade(grade);
                    setSelectedSubject("");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all text-sm border ${
                    selectedGrade === grade
                      ? "bg-white text-indigo-600 border-indigo-100 shadow-lg"
                      : "text-slate-500 hover:bg-white hover:text-slate-900 border-transparent"
                  }`}
                >
                  <span>{grade.replace(/_/g, " ").toUpperCase()}</span>
                </button>
              ))
            ) : (
              <p className="text-[10px] text-slate-400 font-medium px-2 italic">
                No grades found
              </p>
            )}
          </div>

          {/* Subject Selection */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
              Select Subject
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {loadingSubjects ? (
                <p className="text-[10px] text-slate-400 font-medium px-2 italic">
                  Loading subjects...
                </p>
              ) : dynamicSubjects.length > 0 ? (
                dynamicSubjects.map((subject: string) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all text-sm border ${
                      selectedSubject === subject
                        ? "bg-white text-indigo-600 border-indigo-100 shadow-lg"
                        : "text-slate-500 hover:bg-white hover:text-slate-900 border-transparent"
                    }`}
                  >
                    <span>{subject}</span>
                  </button>
                ))
              ) : selectedGrade ? (
                <p className="text-[10px] text-slate-400 font-medium px-2 italic">
                  No subjects configured yet
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-9 space-y-6">
          {selectedSubject && selectedGrade ? (
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg">
                  <FileText className="size-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {selectedSubject} — {selectedGrade.replace(/_/g, " ").toUpperCase()} (
                    {selectedBoard.toUpperCase()})
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    {hasExistingFormat()
                      ? "Edit the question format for this combination"
                      : "No format exists yet for this combination. Add one below."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">
                    Paper Format Key
                  </label>
                  <code className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">
                    {getPaperFormatKey()}
                  </code>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">
                    Format Key (used in document)
                  </label>
                  <code className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">
                    {getExistingFormatKey() || generateFormatKey()}
                  </code>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Question Format Instructions
                  </label>
                  <p className="text-xs text-slate-500">
                    Describe the question paper structure, sections, marks
                    distribution, etc.
                  </p>
                  <textarea
                    className="w-full h-96 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={getCurrentQuestionFormat()}
                    onChange={(e) => updateQuestionFormat(e.target.value)}
                    placeholder="Enter question format instructions..."
                  />
                  {!hasExistingFormat() && (
                    <p className="text-xs text-amber-600 mt-2">
                      No existing format found for this combination. The format
                      you enter will be saved with key:{" "}
                      <code className="font-mono">
                        {generateFormatKey()}
                      </code>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  <Save className="size-4" />
                  {saving ? "Saving..." : "Save Format"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <BookOpen className="size-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Select a Subject
              </h3>
              <p className="text-slate-500 font-medium max-w-md">
                Choose a board, grade, and subject from the left to view and
                edit the question format.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
