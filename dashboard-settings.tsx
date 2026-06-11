"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Save,
  BookOpen,
  Clock,
  Calculator,
  Layers,
  Plus,
  X,
  Sliders,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function TestSettingsPage() {
  const [testConfig, setTestConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [syllabusGrades, setSyllabusGrades] = useState<string[]>([]);
  const [initializingGrade, setInitializingGrade] = useState<string | null>(null);
  // gradeId -> active boolean (from GradeStep model)
  const [gradeActiveMeta, setGradeActiveMeta] = useState<Record<string, boolean>>({});
  const [togglingGrade, setTogglingGrade] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (testConfig?.grades && syllabusGrades.length > 0 && !selectedGrade) {
      // Auto-select the first syllabus grade that's already configured
      const firstConfigured = syllabusGrades
        .map((d) => normalizeTestGradeId(d))
        .find((g) => testConfig.grades[g]);
      if (firstConfigured) setSelectedGrade(firstConfigured);
    }
  }, [testConfig, syllabusGrades]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, gradesRes, gradeStepsRes] = await Promise.all([
        axios.get("/api/admin/test-config"),
        axios.get("/api/syllabus/grades"),
        axios.get("/api/admin/grade-steps"),
      ]);
      setTestConfig(configRes.data);
      setSyllabusGrades(gradesRes.data?.grades || []);
      // Build active meta map from grade-steps
      const meta: Record<string, boolean> = {};
      for (const gs of (gradeStepsRes.data || [])) {
        meta[gs.gradeId] = gs.active !== false; // undefined treated as true
      }
      setGradeActiveMeta(meta);
    } catch {
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentGradeConfig = () => {
    if (!testConfig || !selectedGrade) return null;
    return testConfig.grades?.[selectedGrade] || testConfig.grades?.["default"] || null;
  };

  const updateGradeConfig = (updates: any) => {
    if (!testConfig || !selectedGrade) return;
    
    setTestConfig({
      ...testConfig,
      grades: {
        ...testConfig.grades,
        [selectedGrade]: {
          ...(testConfig.grades?.[selectedGrade] || {}),
          ...updates,
        },
      },
    });
  };

  const updateQuestionCount = (section: string, field: string, value: number) => {
    const currentConfig = getCurrentGradeConfig();
    const currentQC = currentConfig?.questionCount?.[section] || { min: 10, max: 20, default: 15 };
    
    const newQC = { ...currentQC, [field]: value };
    
    updateGradeConfig({
      questionCount: {
        ...(currentConfig?.questionCount || {}),
        [section]: newQC,
      },
    });
  };

  const updateFullTest = (field: string, value: number) => {
    const currentConfig = getCurrentGradeConfig();
    const currentFT = currentConfig?.fullTest || { totalQuestions: 0, perSubjectQuestions: 0, totalTime: 180 };
    
    updateGradeConfig({
      fullTest: {
        ...currentFT,
        [field]: value,
      },
    });
  };

  const updateSubjectQuestionCount = (subjectKey: string, value: number) => {
    const currentConfig = getCurrentGradeConfig();
    const currentFT = currentConfig?.fullTest || { totalQuestions: 0, perSubjectQuestions: 0, totalTime: 180 };
    updateGradeConfig({
      fullTest: {
        ...currentFT,
        subjectQuestions: {
          ...(currentFT.subjectQuestions || {}),
          [subjectKey]: value,
        },
      },
    });
  };

  // ── Subject Sections helpers ──
  const updateSubjectSection = (
    subjectKey: string,
    idx: number,
    field: string,
    value: any,
  ) => {
    const currentConfig = getCurrentGradeConfig();
    const existing: any[] = currentConfig?.subjectSections?.[subjectKey] || [];
    const updated = existing.map((s: any, i: number) =>
      i === idx ? { ...s, [field]: value } : s,
    );
    updateGradeConfig({
      subjectSections: {
        ...(currentConfig?.subjectSections || {}),
        [subjectKey]: updated,
      },
    });
  };

  const addSubjectSection = (subjectKey: string) => {
    const currentConfig = getCurrentGradeConfig();
    const existing: any[] = currentConfig?.subjectSections?.[subjectKey] || [];
    updateGradeConfig({
      subjectSections: {
        ...(currentConfig?.subjectSections || {}),
        [subjectKey]: [
          ...existing,
          { sectionName: "", enabled: true, questionCount: 10 },
        ],
      },
    });
  };

  const removeSubjectSection = (subjectKey: string, idx: number) => {
    const currentConfig = getCurrentGradeConfig();
    const existing: any[] = currentConfig?.subjectSections?.[subjectKey] || [];
    updateGradeConfig({
      subjectSections: {
        ...(currentConfig?.subjectSections || {}),
        [subjectKey]: existing.filter((_: any, i: number) => i !== idx),
      },
    });
  };

  const updatePerQuestionTime = (value: number) => {
    updateGradeConfig({ perQuestionTime: value });
  };

  const updateSections = (sections: string[]) => {
    updateGradeConfig({ sections });
  };

  const handleSave = async () => {
    if (!testConfig) return;
    try {
      setSaving(true);
      toast.loading("Saving test settings...", { id: "save-settings" });
      await axios.post("/api/admin/test-config", testConfig);
      toast.success("Test settings saved", { id: "save-settings" });
    } catch {
      toast.error("Failed to save", { id: "save-settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (gradeId: string) => {
    const current = gradeActiveMeta[gradeId] !== false; // treat undefined as true
    const newActive = !current;
    // Optimistic update
    setGradeActiveMeta((prev) => ({ ...prev, [gradeId]: newActive }));
    try {
      setTogglingGrade(gradeId);
      await axios.post("/api/admin/grade-steps", { gradeId, active: newActive });
      toast.success(
        newActive ? `"${gradeId}" is now visible in the app` : `"${gradeId}" hidden from the app`,
        { id: `toggle-${gradeId}` },
      );
    } catch {
      // Revert on failure
      setGradeActiveMeta((prev) => ({ ...prev, [gradeId]: current }));
      toast.error("Failed to update course visibility", { id: `toggle-${gradeId}` });
    } finally {
      setTogglingGrade(null);
    }
  };

  const removeSection = (section: string) => {
    const currentConfig = getCurrentGradeConfig();
    const existingSections = currentConfig?.sections || [];
    updateSections(existingSections.filter((s: string) => s !== section));
  };

  const SECTION_TYPES = [
    { id: "mcq", name: "MCQ" },
    { id: "numerical", name: "Numerical" },
    { id: "caseStudy", name: "Case Study" },
    { id: "multiCorrect", name: "Multi Correct" },
    { id: "matchListOptionFormat", name: "Match List" },
  ];

  const getAvailableSections = () => {
    const currentSections = currentConfig?.sections || [];
    return SECTION_TYPES.filter(type => !currentSections.includes(type.id));
  };

  const handleAddSection = (sectionId: string) => {
    const currentSections = currentConfig?.sections || [];
    updateSections([...currentSections, sectionId]);
    setAddingSection(false);
  };

  const [addingSection, setAddingSection] = useState(false);

  const normalizeTestGradeId = (s: string) => {
    const trimmed = s.trim();
    if (!trimmed) return "";
    return trimmed.toLowerCase().replace(/\s+/g, "_");
  };

  const handleSelectSyllabusGrade = async (displayName: string) => {
    const gradeId = normalizeTestGradeId(displayName);
    // Already configured — just select it
    if (testConfig?.grades?.[gradeId]) {
      setSelectedGrade(gradeId);
      return;
    }
    // Not yet configured — auto-initialize with defaults
    try {
      setInitializingGrade(gradeId);
      toast.loading(`Initializing "${displayName}"...`, { id: "init-test-course" });
      const updated = {
        ...testConfig,
        grades: {
          ...testConfig.grades,
          [gradeId]: {
            sections: ["mcq"],
            questionCount: {
              mcq: { min: 15, max: 30 },
            },
            perQuestionTime: 60,
            scoring: {
              mcq: { correct: 1, incorrect: 0, unattempted: 0 },
            },
            promptContext: "",
            subjects: [],
            paperFormat: "default",
          },
        },
      };
      await axios.post("/api/admin/test-config", updated);
      toast.success(`"${displayName}" initialized`, { id: "init-test-course" });
      setTestConfig(updated);
      setSelectedGrade(gradeId);
    } catch {
      toast.error("Failed to initialize course", { id: "init-test-course" });
    } finally {
      setInitializingGrade(null);
    }
  };

  const currentConfig = getCurrentGradeConfig();

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold">Loading Test Settings...</p>
        </div>
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Test <span className="text-indigo-600">Settings</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Configure question counts, timing, and full test settings.
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
        {/* Left Sidebar - Selection */}
          <div className="lg:col-span-3 space-y-6">
            {/* Grade Selection */}
            <div className="space-y-3">
              <div className="pl-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Select Exam
                </h3>
              </div>
              {syllabusGrades.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm font-medium">
                  No courses in syllabus database yet.
                </div>
              )}
              {syllabusGrades.map((displayName) => {
                const gradeId = normalizeTestGradeId(displayName);
                const isConfigured = !!testConfig?.grades?.[gradeId];
                const isSelected = selectedGrade === gradeId;
                const isInitializing = initializingGrade === gradeId;
                const isActive = gradeActiveMeta[gradeId] !== false;
                const isToggling = togglingGrade === gradeId;
                return (
                  <div key={gradeId} className="flex items-center gap-1">
                    <button
                      onClick={() => !isInitializing && handleSelectSyllabusGrade(displayName)}
                      className={`flex-1 flex items-center gap-2 px-4 py-4 rounded-2xl font-bold transition-all text-sm border ${
                        isSelected
                          ? "bg-white text-indigo-600 border-indigo-100 shadow-lg"
                          : "text-slate-500 hover:bg-white hover:text-slate-900 border-transparent"
                      } ${!isActive ? "opacity-50" : ""}`}
                    >
                      {isInitializing ? (
                        <div className="size-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : !isConfigured ? (
                        <Plus className="size-3 shrink-0 text-slate-400" />
                      ) : (
                        <span
                          className={`size-2 rounded-full shrink-0 ${
                            isActive ? "bg-emerald-400" : "bg-slate-300"
                          }`}
                        />
                      )}
                      <span className="truncate">{displayName.toUpperCase()}</span>
                    </button>
                    {/* Active toggle */}
                    <button
                      onClick={() => !isToggling && handleToggleActive(gradeId)}
                      disabled={isToggling}
                      title={isActive ? "Visible in app — click to hide" : "Hidden from app — click to show"}
                      className={`shrink-0 transition-colors disabled:opacity-50 ${
                        isActive ? "text-emerald-500 hover:text-slate-400" : "text-slate-300 hover:text-emerald-500"
                      }`}
                    >
                      {isToggling ? (
                        <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : isActive ? (
                        <ToggleRight className="size-6" />
                      ) : (
                        <ToggleLeft className="size-6" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        {/* Right Content */}
        <div className="lg:col-span-9 space-y-6">
          {selectedGrade && currentConfig ? (
            <>
              {/* Sections */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg">
                      <Layers className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Sections</h2>
                      <p className="text-xs text-slate-500">Question types included in this grade</p>
                    </div>
                  </div>
                  {addingSection ? (
                    <div className="flex items-center gap-2">
                      <select
                        autoFocus
                        onChange={(e) => handleAddSection(e.target.value)}
                        onBlur={() => setAddingSection(false)}
                        className="px-4 py-2 bg-white border border-indigo-200 rounded-xl text-sm font-bold text-indigo-600 focus:outline-none"
                        defaultValue=""
                      >
                        <option value="" disabled>Select section type</option>
                        {getAvailableSections().map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                      <button onClick={() => setAddingSection(false)} className="text-slate-400 hover:text-red-500">
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingSection(true)}
                      disabled={getAvailableSections().length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="size-4" />
                      Add Section
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentConfig.sections?.map((section: string) => (
                    <div
                      key={section}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl"
                    >
                      <select
                        value={section}
                        onChange={(e) => {
                          const oldSections = [...(currentConfig.sections || [])];
                          const idx = oldSections.indexOf(section);
                          oldSections[idx] = e.target.value;
                          updateSections(oldSections);
                        }}
                        className="bg-transparent font-bold text-sm text-slate-700 focus:outline-none"
                      >
                        {SECTION_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                      <button onClick={() => removeSection(section)} className="text-slate-400 hover:text-red-500">
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                  {(!currentConfig.sections || currentConfig.sections.length === 0) && (
                    <p className="text-sm text-slate-400">No sections added. Click &quot;Add Section&quot; to start.</p>
                  )}
                </div>
              </div>

              {/* Question Count */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <Calculator className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Question Count</h2>
                    <p className="text-xs text-slate-500">Minimum and maximum questions per section</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentConfig.sections?.map((section: string) => {
                    const qc = currentConfig.questionCount?.[section] || { min: 10, max: 20, default: 15 };
                    return (
                      <div key={section} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-slate-700 uppercase text-sm">{section}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-slate-500 block mb-1">Min</label>
                            <input
                              type="number"
                              value={qc.min}
                              onChange={(e) => updateQuestionCount(section, "min", parseInt(e.target.value) || 0)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 block mb-1">Max</label>
                            <input
                              type="number"
                              value={qc.max}
                              onChange={(e) => updateQuestionCount(section, "max", parseInt(e.target.value) || 0)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 block mb-1">Default</label>
                            <input
                              type="number"
                              value={qc.default || qc.min}
                              onChange={(e) => updateQuestionCount(section, "default", parseInt(e.target.value) || 0)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timing Settings */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Timing Settings</h2>
                    <p className="text-xs text-slate-500">Time configuration for tests</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">
                      Per Question Time (seconds)
                    </label>
                    <input
                      type="number"
                      value={currentConfig.perQuestionTime || 60}
                      onChange={(e) => updatePerQuestionTime(parseInt(e.target.value) || 60)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                    />
                    <p className="text-xs text-slate-500 mt-1">Used for Chapter/Subject Tests</p>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">
                      Full Test Total Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={currentConfig.fullTest?.totalTime || 180}
                      onChange={(e) => updateFullTest("totalTime", parseInt(e.target.value) || 180)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                    />
                    <p className="text-xs text-slate-500 mt-1">Used for Full Syllabus Tests</p>
                  </div>
                </div>
              </div>

              {/* Full Test Configuration */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <BookOpen className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Full Test Configuration</h2>
                    <p className="text-xs text-slate-500">Settings for full syllabus tests</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">
                      Total Questions
                    </label>
                    <input
                      type="number"
                      value={currentConfig.fullTest?.totalQuestions || 0}
                      onChange={(e) => updateFullTest("totalQuestions", parseInt(e.target.value) || 0)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">
                      Total Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={currentConfig.fullTest?.totalTime || 180}
                      onChange={(e) => updateFullTest("totalTime", parseInt(e.target.value) || 180)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                    />
                  </div>
                </div>

                {/* Per-subject question count */}
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-3">
                    Questions Per Subject
                    <span className="ml-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                      (used for Full Syllabus Test generation)
                    </span>
                  </label>
                  {(!currentConfig.subjects || currentConfig.subjects.length === 0) ? (
                    <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl">
                      No subjects configured for this grade. Add subjects first via the Subjects field.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {currentConfig.subjects.map((subj: string) => {
                        const subjectKey = subj.toLowerCase().replace(/\s+/g, "_");
                        const count = currentConfig.fullTest?.subjectQuestions?.[subjectKey]
                          ?? currentConfig.fullTest?.perSubjectQuestions
                          ?? 0;
                        return (
                          <div key={subjectKey} className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="flex-1 font-bold text-slate-700 text-sm capitalize">{subj}</span>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-slate-400">Questions</label>
                              <input
                                type="number"
                                min={0}
                                value={count}
                                onChange={(e) => updateSubjectQuestionCount(subjectKey, parseInt(e.target.value) || 0)}
                                className="w-24 p-2 bg-white border border-slate-200 rounded-lg text-center font-bold"
                              />
                            </div>
                          </div>
                        );
                      })}
                      <p className="text-[10px] text-slate-400 mt-1">
                        Total: <strong>{currentConfig.subjects.reduce((sum: number, subj: string) => {
                          const k = subj.toLowerCase().replace(/\s+/g, "_");
                          return sum + (currentConfig.fullTest?.subjectQuestions?.[k] ?? currentConfig.fullTest?.perSubjectQuestions ?? 0);
                        }, 0)}</strong> questions across {currentConfig.subjects.length} subject(s)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject Sections (for Subject Test) */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <Sliders className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Subject Sections</h2>
                    <p className="text-xs text-slate-500">
                      Predefined sections per subject for <strong>Subject Test</strong> — enabled sections become filterable tabs in the test UI.
                    </p>
                  </div>
                </div>

                {(!currentConfig.subjects || currentConfig.subjects.length === 0) ? (
                  <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl">
                    No subjects configured. Add subjects to this grade first.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {currentConfig.subjects.map((subj: string) => {
                      const subjectKey = subj.toLowerCase().replace(/\s+/g, "_");
                      const sections: any[] = currentConfig.subjectSections?.[subjectKey] || [];
                      return (
                        <div key={subjectKey} className="border border-slate-100 rounded-2xl overflow-hidden">
                          {/* Subject header */}
                          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                            <span className="font-black text-slate-700 text-sm capitalize">{subj}</span>
                            <button
                              onClick={() => addSubjectSection(subjectKey)}
                              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              <Plus className="size-3" />
                              Add Section
                            </button>
                          </div>
                          {/* Section rows */}
                          {sections.length === 0 ? (
                            <p className="text-xs text-slate-400 px-5 py-4">
                              No sections defined. Click "Add Section" to create one.
                            </p>
                          ) : (
                            <div className="divide-y divide-slate-50">
                              {sections.map((sec: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 px-5 py-3">
                                  {/* Enable/Disable toggle */}
                                  <button
                                    onClick={() => updateSubjectSection(subjectKey, idx, "enabled", !sec.enabled)}
                                    className={`shrink-0 transition-colors ${sec.enabled ? "text-indigo-600" : "text-slate-300"}`}
                                    title={sec.enabled ? "Enabled" : "Disabled"}
                                  >
                                    {sec.enabled
                                      ? <ToggleRight className="size-7" />
                                      : <ToggleLeft className="size-7" />
                                    }
                                  </button>
                                  {/* Section name */}
                                  <input
                                    type="text"
                                    placeholder="Section name (e.g. Organic Chemistry)"
                                    value={sec.sectionName}
                                    onChange={(e) => updateSubjectSection(subjectKey, idx, "sectionName", e.target.value)}
                                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                  />
                                  {/* Question count */}
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <label className="text-xs text-slate-400 whitespace-nowrap">Qs</label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={sec.questionCount}
                                      onChange={(e) => updateSubjectSection(subjectKey, idx, "questionCount", parseInt(e.target.value) || 0)}
                                      className="w-16 p-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-sm"
                                    />
                                  </div>
                                  {/* Remove */}
                                  <button
                                    onClick={() => removeSubjectSection(subjectKey, idx)}
                                    className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                                  >
                                    <X className="size-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <BookOpen className="size-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Select Board and Grade
              </h3>
              <p className="text-slate-500 font-medium max-w-md">
                Choose a board and grade from the left to configure test settings.
              </p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
