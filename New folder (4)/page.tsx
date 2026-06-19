"use client";
import React, { useState, useEffect } from "react";

function SmartNumberInput({ value, onChange, className, placeholder }: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? String(value);
  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "" || raw === "-") { setDraft(raw); return; }
        const num = Number(raw);
        if (!isNaN(num)) { setDraft(null); onChange(num); }
      }}
      onBlur={() => setDraft(null)}
      className={className}
    />
  );
}

import axios from "axios";
import { toast } from "sonner";
import { Save, Plus, Trash2, Target, Calculator, ChevronDown, ChevronUp, BookOpen } from "lucide-react";

const QUESTION_TYPES = ["mcq", "numerical", "caseStudy", "matchListOptionFormat", "multiCorrect", "matchList", "singleDigitInteger"];

const CASE_STUDY_SUB_TYPES: { key: string; label: string }[] = [
  { key: "mcq", label: "MCQ (Single Correct)" },
  { key: "numerical", label: "Numerical" },
  { key: "multiCorrect", label: "Multi-Correct" },
  { key: "matchList", label: "Match List" },
  { key: "matchListOptionFormat", label: "Match List Option Format" },
  { key: "singleDigitInteger", label: "Single Digit Integer" },
];

const getDefaultScoringForType = (type: string) => ({
  correct: 1,
  incorrect: 0,
  unattempted: 0,
  ...((type === "multiCorrect" || type === "matchListOptionFormat") ? { partialPerCorrect: 0 } : {}),
  ...(type === "caseStudy" ? { partialPerCorrect: 0 } : {}),
  ...(type === "matchList" ? { partialPerMatch: 0 } : {}),
});

export default function ScoringConfigPage() {
  const [testConfig, setTestConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [caseStudySubExpanded, setCaseStudySubExpanded] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const configRes = await axios.get("/api/admin/test-config");
      setTestConfig(configRes.data);
      if (configRes.data?.grades) {
        const grades = Object.keys(configRes.data.grades);
        setAvailableGrades(grades);
        if (grades.length > 0) setSelectedGrade(grades[0]);
      }
    } catch {
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      toast.loading("Saving scoring configuration...", { id: "save-scoring" });
      await axios.post("/api/admin/test-config", testConfig);
      toast.success("Scoring configuration saved", { id: "save-scoring" });
    } catch {
      toast.error("Failed to save configuration", { id: "save-scoring" });
    } finally {
      setSaving(false);
    }
  };

  const updateScoring = (grade: string, questionType: string, field: string, value: number) => {
    if (!testConfig) return;
    const newGrades = { ...testConfig.grades };
    if (!newGrades[grade]) newGrades[grade] = { scoring: {} };
    if (!newGrades[grade].scoring) newGrades[grade].scoring = {};
    if (!newGrades[grade].scoring[questionType]) {
      newGrades[grade].scoring[questionType] = getDefaultScoringForType(questionType);
    }
    newGrades[grade].scoring[questionType] = { ...newGrades[grade].scoring[questionType], [field]: value };
    setTestConfig({ ...testConfig, grades: newGrades });
  };

  const addQuestionType = (grade: string, questionType: string) => {
    if (!testConfig) return;
    const newGrades = { ...testConfig.grades };
    if (!newGrades[grade].scoring) newGrades[grade].scoring = {};
    newGrades[grade].scoring[questionType] = getDefaultScoringForType(questionType);
    setTestConfig({ ...testConfig, grades: newGrades });
  };

  const removeQuestionType = (grade: string, questionType: string) => {
    if (!testConfig) return;
    if (!confirm(`Remove scoring rules for "${questionType}"?`)) return;
    const newGrades = { ...testConfig.grades };
    if (newGrades[grade]?.scoring) delete newGrades[grade].scoring[questionType];
    setTestConfig({ ...testConfig, grades: newGrades });
  };

  // Case Study sub-type helpers — stored as "caseStudy_mcq", "caseStudy_numerical", etc.
  const addCaseStudySubType = (grade: string, subType: string) => {
    const key = `caseStudy_${subType}`;
    addQuestionType(grade, key);
  };

  const removeCaseStudySubType = (grade: string, subType: string) => {
    const key = `caseStudy_${subType}`;
    removeQuestionType(grade, key);
  };

  const getScoringForGrade = (grade: string) => {
    return testConfig?.grades?.[grade]?.scoring || {};
  };

  // Top-level types (exclude caseStudy_* sub-type keys)
  const getTopLevelScoring = (grade: string) => {
    const scoring = getScoringForGrade(grade);
    return Object.fromEntries(Object.entries(scoring).filter(([k]) => !k.startsWith("caseStudy_")));
  };

  // caseStudy_* sub-type keys
  const getCaseStudySubScoring = (grade: string) => {
    const scoring = getScoringForGrade(grade);
    return Object.fromEntries(
      Object.entries(scoring)
        .filter(([k]) => k.startsWith("caseStudy_"))
        .map(([k, v]) => [k.replace("caseStudy_", ""), v])
    );
  };

  const availableTopLevelTypes = (grade: string) => {
    const current = getTopLevelScoring(grade);
    return QUESTION_TYPES.filter((qt) => !current[qt]);
  };

  const availableCaseStudySubTypes = (grade: string) => {
    const current = getCaseStudySubScoring(grade);
    return CASE_STUDY_SUB_TYPES.filter((s) => !current[s.key]);
  };

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold">Loading Scoring Configuration...</p>
        </div>
      </div>
    );

  const topLevelScoring = getTopLevelScoring(selectedGrade);
  const caseStudySubScoring = getCaseStudySubScoring(selectedGrade);
  const hasCaseStudy = !!topLevelScoring["caseStudy"];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Scoring <span className="text-indigo-600">Configuration</span>
          </h1>
          <p className="text-slate-500 font-medium">Configure marking scheme for each grade and question type.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Grade Selector */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Select Grade</h3>
          {availableGrades.map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl font-bold transition-all text-sm border ${
                selectedGrade === grade
                  ? "bg-white text-indigo-600 border-indigo-100 shadow-lg shadow-indigo-500/5 translate-x-1"
                  : "text-slate-500 hover:bg-white hover:text-slate-900 border-transparent"
              }`}
            >
              {grade.toUpperCase().replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Scoring Configuration */}
        <div className="lg:col-span-9 space-y-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg">
                  <Target className="size-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedGrade.toUpperCase()} - Marking Scheme
                </h3>
              </div>
              {availableTopLevelTypes(selectedGrade).length > 0 && (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-600 hover:text-white transition-all">
                    <Plus className="size-4" />
                    Add Question Type
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {availableTopLevelTypes(selectedGrade).map((qt) => (
                      <button
                        key={qt}
                        onClick={() => addQuestionType(selectedGrade, qt)}
                        className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 first:rounded-t-xl last:rounded-b-xl"
                      >
                        {qt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {Object.entries(topLevelScoring).map(([questionType, scoring]: [string, any]) => (
                <div key={questionType} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-black">
                      {questionType.toUpperCase()}
                    </div>
                    <button
                      onClick={() => removeQuestionType(selectedGrade, questionType)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {/* Main scoring fields */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Correct (+)</label>
                      <SmartNumberInput
                        value={scoring.correct ?? 0}
                        onChange={(v) => updateScoring(selectedGrade, questionType, "correct", v)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Incorrect (-)</label>
                      <SmartNumberInput
                        value={scoring.incorrect ?? 0}
                        onChange={(v) => updateScoring(selectedGrade, questionType, "incorrect", v)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-black text-red-500 focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unattempted</label>
                      <SmartNumberInput
                        value={scoring.unattempted ?? 0}
                        onChange={(v) => updateScoring(selectedGrade, questionType, "unattempted", v)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-black text-slate-400 focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                  </div>

                  {/* Partial marking fields */}
                  {(questionType === "multiCorrect" || questionType === "matchListOptionFormat" || questionType === "caseStudy") && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                          {questionType === "caseStudy"
                            ? "Default Partial Mark per Sub-Question (when no sub-type override set)"
                            : "Partial Mark per Correct Option"}
                        </label>
                        <SmartNumberInput
                          value={scoring.partialPerCorrect ?? 0}
                          onChange={(v) => updateScoring(selectedGrade, questionType, "partialPerCorrect", v)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-black text-amber-600 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  {questionType === "matchList" && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Partial Mark per Correct Match</label>
                        <SmartNumberInput
                          value={scoring.partialPerMatch ?? 0}
                          onChange={(v) => updateScoring(selectedGrade, questionType, "partialPerMatch", v)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-black text-amber-600 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* ─── Case Study: Sub-Question Type Overrides ─── */}
                  {questionType === "caseStudy" && (
                    <div className="mt-5 pt-5 border-t-2 border-indigo-100">
                      <button
                        onClick={() => setCaseStudySubExpanded((v) => !v)}
                        className="flex items-center gap-2 w-full mb-4"
                      >
                        <BookOpen className="size-4 text-indigo-500" />
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest flex-1 text-left">
                          Sub-Question Type Scoring Overrides
                        </span>
                        {caseStudySubExpanded
                          ? <ChevronUp className="size-4 text-indigo-400" />
                          : <ChevronDown className="size-4 text-indigo-400" />}
                      </button>

                      {caseStudySubExpanded && (
                        <div className="space-y-4">
                          <p className="text-[11px] text-slate-400 font-medium">
                            Configure marks per sub-question type inside a Case Study. If a sub-type is not set, the default rule above is used.
                          </p>

                          {/* Existing sub-type overrides */}
                          {Object.entries(caseStudySubScoring).map(([subType, subScoring]: [string, any]) => {
                            const subLabel = CASE_STUDY_SUB_TYPES.find((s) => s.key === subType)?.label || subType;
                            return (
                              <div key={subType} className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="px-2 py-0.5 bg-indigo-500 text-white rounded-md text-[10px] font-black">
                                      {subType.toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">{subLabel}</span>
                                  </div>
                                  <button
                                    onClick={() => removeCaseStudySubType(selectedGrade, subType)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 transition-all"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Correct</label>
                                    <SmartNumberInput
                                      value={subScoring.correct ?? 0}
                                      onChange={(v) => updateScoring(selectedGrade, `caseStudy_${subType}`, "correct", v)}
                                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-center font-black text-emerald-600 text-sm focus:ring-2 focus:ring-emerald-500"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-red-500 uppercase tracking-widest">Incorrect</label>
                                    <SmartNumberInput
                                      value={subScoring.incorrect ?? 0}
                                      onChange={(v) => updateScoring(selectedGrade, `caseStudy_${subType}`, "incorrect", v)}
                                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-center font-black text-red-500 text-sm focus:ring-2 focus:ring-red-500"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unattempted</label>
                                    <SmartNumberInput
                                      value={subScoring.unattempted ?? 0}
                                      onChange={(v) => updateScoring(selectedGrade, `caseStudy_${subType}`, "unattempted", v)}
                                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-center font-black text-slate-400 text-sm focus:ring-2 focus:ring-slate-500"
                                    />
                                  </div>
                                </div>
                                {(subType === "multiCorrect" || subType === "matchListOptionFormat") && (
                                  <div className="mt-3 space-y-1">
                                    <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Partial per Correct Option</label>
                                    <SmartNumberInput
                                      value={subScoring.partialPerCorrect ?? 0}
                                      onChange={(v) => updateScoring(selectedGrade, `caseStudy_${subType}`, "partialPerCorrect", v)}
                                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-center font-black text-amber-600 text-sm focus:ring-2 focus:ring-amber-500"
                                    />
                                  </div>
                                )}
                                {subType === "matchList" && (
                                  <div className="mt-3 space-y-1">
                                    <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Partial per Match</label>
                                    <SmartNumberInput
                                      value={subScoring.partialPerMatch ?? 0}
                                      onChange={(v) => updateScoring(selectedGrade, `caseStudy_${subType}`, "partialPerMatch", v)}
                                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-center font-black text-amber-600 text-sm focus:ring-2 focus:ring-amber-500"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Add sub-type button */}
                          {availableCaseStudySubTypes(selectedGrade).length > 0 && (
                            <div className="relative group">
                              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-indigo-200 text-indigo-600 font-bold rounded-lg text-xs hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                                <Plus className="size-3.5" />
                                Add Sub-Type Override
                              </button>
                              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                {availableCaseStudySubTypes(selectedGrade).map((s) => (
                                  <button
                                    key={s.key}
                                    onClick={() => addCaseStudySubType(selectedGrade, s.key)}
                                    className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 first:rounded-t-xl last:rounded-b-xl"
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {Object.keys(topLevelScoring).length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <Calculator className="size-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">No question types configured</p>
                  <p className="text-slate-300 text-sm">Click "Add Question Type" to start configuring</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[32px] text-white">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <Calculator className="size-5" />
              Quick Preview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(topLevelScoring).map(([qt, scoring]: [string, any]) => (
                <div key={qt} className="bg-white/10 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-indigo-200 uppercase mb-2">{qt}</p>
                  <div className="space-y-1 text-sm font-bold">
                    <p><span className="text-emerald-300">+{scoring.correct}</span> correct</p>
                    <p><span className="text-red-300">{scoring.incorrect < 0 ? scoring.incorrect : `-${scoring.incorrect}`}</span> wrong</p>
                    {(qt === "multiCorrect" || qt === "matchListOptionFormat") && scoring.partialPerCorrect !== undefined && (
                      <p><span className="text-amber-300">+{scoring.partialPerCorrect}/opt</span> partial</p>
                    )}
                    {qt === "caseStudy" && scoring.partialPerCorrect !== undefined && (
                      <p><span className="text-amber-300">+{scoring.partialPerCorrect}/sub</span> default</p>
                    )}
                    {qt === "matchList" && scoring.partialPerMatch !== undefined && (
                      <p><span className="text-amber-300">+{scoring.partialPerMatch}/match</span> partial</p>
                    )}
                  </div>
                </div>
              ))}
              {/* Case Study sub-type previews */}
              {hasCaseStudy && Object.entries(caseStudySubScoring).map(([subType, scoring]: [string, any]) => (
                <div key={`cs_${subType}`} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-[9px] font-bold text-purple-200 uppercase mb-1">Passage — {subType}</p>
                  <div className="space-y-1 text-sm font-bold">
                    <p><span className="text-emerald-300">+{scoring.correct}</span> correct</p>
                    <p><span className="text-red-300">{scoring.incorrect < 0 ? scoring.incorrect : `-${scoring.incorrect}`}</span> wrong</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
