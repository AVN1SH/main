"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Save,
  BookOpen,
  BookOpenCheck,
  Clock,
  Calculator,
  Layers,
  Plus,
  X,
  Sliders,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

function SmartNumberInput({ value, onChange, className, placeholder }: {
  value: number | undefined;
  onChange: (v: number) => void;
  className?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const display = draft ?? (value != null ? String(value) : "");

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "" || raw === "-") {
          setDraft(raw);
          return;
        }
        const num = Number(raw);
        if (!isNaN(num)) {
          setDraft(null);
          onChange(num);
        }
      }}
      onBlur={() => setDraft(null)}
      className={className}
    />
  );
}

export default function TestSettingsPage() {
  const [testConfig, setTestConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [syllabusGrades, setSyllabusGrades] = useState<string[]>([]);
  const [initializingGrade, setInitializingGrade] = useState<string | null>(null);
  const [gradeStepsData, setGradeStepsData] = useState<any>(null);

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

  // Sync subjects from syllabus when a configured grade is selected
  useEffect(() => {
    if (!selectedGrade || !testConfig?.grades?.[selectedGrade]) return;
    const wasJustInitialized = initializingGrade === selectedGrade;
    if (wasJustInitialized) return;
    fetchAndSyncSubjects(selectedGrade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade]);

  // Fetch grade steps to detect paper step
  useEffect(() => {
    if (!selectedGrade) { setGradeStepsData(null); return; }
    const displayName = syllabusGrades.find(
      (g) => normalizeTestGradeId(g) === selectedGrade
    ) || selectedGrade;
    fetch(`/api/steps/${encodeURIComponent(displayName)}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setGradeStepsData(data))
      .catch(() => setGradeStepsData(null));
  }, [selectedGrade, syllabusGrades]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, gradesRes] = await Promise.all([
        axios.get("/api/admin/test-config"),
        axios.get("/api/syllabus/grades"),
      ]);
      setTestConfig(configRes.data);
      setSyllabusGrades(gradesRes.data?.grades || []);
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

  const updatePaperConfig = (paperKey: string, field: string, value: any) => {
    const currentConfig = getCurrentGradeConfig();
    const currentFT = currentConfig?.fullTest || { totalQuestions: 0, perSubjectQuestions: 0, totalTime: 180 };
    updateGradeConfig({
      fullTest: {      
        ...currentFT,
        [paperKey]: {
          ...(currentFT[paperKey] || {}),
          [field]: value,
        },
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
    if (!confirm("Remove this subject section?")) return;
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

  // ── Case Study Config helpers ──
  const updateCaseStudyConfig = (field: string, value: any) => {
    const currentConfig = getCurrentGradeConfig();
    const existing = currentConfig?.caseStudyConfig || {
      enabled: true,
      count: 2,
      subQuestionsPerCase: 3,
      subQuestionTypes: ["mcq"],
    };
    updateGradeConfig({
      caseStudyConfig: {
        ...existing,
        [field]: value,
      },
    });
  };

  const toggleCaseStudySubType = (typeId: string) => {
    const currentConfig = getCurrentGradeConfig();
    const existing = currentConfig?.caseStudyConfig || {
      enabled: true,
      count: 2,
      subQuestionsPerCase: 3,
      subQuestionTypes: ["mcq"],
    };
    const current = existing.subQuestionTypes || [];
    const updated = current.includes(typeId)
      ? current.filter((t: string) => t !== typeId)
      : [...current, typeId];
    // Ensure at least one type is always selected
    if (updated.length === 0) return;
    updateCaseStudyConfig("subQuestionTypes", updated);
  };

  // ── Per-paper Case Study Config helpers ──
  const updatePaperCaseStudyConfig = (paperKey: string, field: string, value: any) => {
    const currentConfig = getCurrentGradeConfig();
    const currentFT = currentConfig?.fullTest || { totalQuestions: 0, perSubjectQuestions: 0, totalTime: 180 };
    const pc = currentFT[paperKey] || {};
    const existing = pc.caseStudyConfig || {
      enabled: true,
      count: 2,
      subQuestionsPerCase: 3,
      subQuestionTypes: ["mcq"],
    };
    updateGradeConfig({
      fullTest: {
        ...currentFT,
        [paperKey]: {
          ...pc,
          caseStudyConfig: {
            ...existing,
            [field]: value,
          },
        },
      },
    });
  };

  const togglePaperCaseStudySubType = (paperKey: string, typeId: string) => {
    const currentConfig = getCurrentGradeConfig();
    const currentFT = currentConfig?.fullTest || {};
    const pc = currentFT[paperKey] || {};
    const existing = pc.caseStudyConfig || {
      enabled: true,
      count: 2,
      subQuestionsPerCase: 3,
      subQuestionTypes: ["mcq"],
    };
    const current = existing.subQuestionTypes || [];
    const updated = current.includes(typeId)
      ? current.filter((t: string) => t !== typeId)
      : [...current, typeId];
    if (updated.length === 0) return;
    updatePaperCaseStudyConfig(paperKey, "subQuestionTypes", updated);
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

  const removeSection = (section: string) => {
    if (!confirm(`Remove "${section}" section?`)) return;
    const currentConfig = getCurrentGradeConfig();
    const existingSections = currentConfig?.sections || [];
    updateSections(existingSections.filter((s: string) => s !== section));
  };

  const SECTION_TYPES = [
    { id: "mcq", name: "MCQ" },
    { id: "numerical", name: "Numerical" },
    { id: "singleDigitInteger", name: "Single Digit Int (0-9)" },
    { id: "caseStudy", name: "Case Study" },
    { id: "multiCorrect", name: "Multi Correct" },
    { id: "matchList", name: "Match List" },
    { id: "matchListOptionFormat", name: "Match List (Opt Format)" },
  ];

  const getAvailableSections = () => {
    const currentSections = currentConfig?.sections || [];
    return SECTION_TYPES.filter(type => !currentSections.includes(type.id));
  };

  const handleAddSection = (sectionId: string) => {
    if (!testConfig || !selectedGrade) return;
    const grade = testConfig.grades?.[selectedGrade] || {};
    const currentSections = grade.sections || [];
    const currentQC = grade.questionCount || {};
    setTestConfig({
      ...testConfig,
      grades: {
        ...testConfig.grades,
        [selectedGrade]: {
          ...grade,
          sections: [...currentSections, sectionId],
          questionCount: currentQC[sectionId]
            ? currentQC
            : { ...currentQC, [sectionId]: { min: 10, max: 20, default: 15 } },
        },
      },
    });
    setAddingSection(false);
  };

  const [addingSection, setAddingSection] = useState(false);
  const [addingSectionPaper, setAddingSectionPaper] = useState<string | null>(null);
  const [activePaperTab, setActivePaperTab] = useState<string>("");

  // ── Syllabus-linked sections (sections[] on Syllabus model) ──
  const [syllabusDocsPerSubject, setSyllabusDocsPerSubject] = useState<Record<string, any[]>>({});
  const [linkedSectionsPerSubject, setLinkedSectionsPerSubject] = useState<Record<string, string[]>>({});
  const [savingLinkedSections, setSavingLinkedSections] = useState<string | null>(null);

  const normalizeTestGradeId = (s: string) => {
    const trimmed = s.trim();
    if (!trimmed) return "";
    return trimmed.toLowerCase().replace(/\s+/g, "_");
  };

  const fetchAndSyncSubjects = async (gradeId: string) => {
    try {
      const res = await fetch(`/api/syllabus/subjects?class=${encodeURIComponent(gradeId)}`);
      if (!res.ok) return;
      const data = await res.json();
      const freshSubjects: string[] = data.subjects || [];
      if (freshSubjects.length === 0) return;
      const grade = testConfig?.grades?.[gradeId];
      if (!grade) return;
      const currentSubjects: string[] = grade.subjects || [];
      const changed =
        currentSubjects.length !== freshSubjects.length ||
        !currentSubjects.every((s, i) => s === freshSubjects[i]) ||
        !freshSubjects.every((s) => currentSubjects.includes(s));
      if (changed) {
        setTestConfig((prev: any) => ({
          ...prev,
          grades: {
            ...prev.grades,
            [gradeId]: {
              ...prev.grades[gradeId],
              subjects: freshSubjects,
            },
          },
        }));
      }
    } catch {
      // silent fail – subjects stay as-is
    }
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

      let subjects: string[] = [];
      try {
        const res = await fetch(`/api/syllabus/subjects?class=${encodeURIComponent(gradeId)}`);
        if (res.ok) {
          const data = await res.json();
          subjects = data.subjects || [];
        }
      } catch {
        // subjects remain empty
      }

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
            subjects,
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

  // ── Load linked syllabus sections whenever grade/subjects change ──
  // (We stringify subjects for stable dependency)
  const subjectsKey = currentConfig?.subjects?.join(",") ?? "";
  useEffect(() => {
    if (!selectedGrade || !currentConfig?.subjects?.length) return;
    loadAllSyllabusLinkedSections(selectedGrade, currentConfig.subjects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade, subjectsKey]);

  const loadAllSyllabusLinkedSections = async (
    gradeId: string,
    subjects: string[],
  ) => {
    const docs: Record<string, any[]> = {};
    const linked: Record<string, string[]> = {};
    await Promise.all(
      subjects.map(async (subj) => {
        const subjKey = subj.toLowerCase().replace(/\s+/g, "_");
        try {
          const [listRes, secRes] = await Promise.all([
            fetch(`/api/private/syllabus/lists?class=${encodeURIComponent(gradeId)}&subject=${encodeURIComponent(subjKey)}`),
            fetch(`/api/private/syllabus/sections?class=${encodeURIComponent(gradeId)}&subject=${encodeURIComponent(subjKey)}`),
          ]);
          if (listRes.ok) {
            const d = await listRes.json();
            docs[subjKey] = d.syllabi || [];
            console.log(d, "syllabi")
          }
          if (secRes.ok) {
            const d = await secRes.json();
            linked[subjKey] = (d.sections || []).map((s: any) => s._id);
            console.log(d)
          }
        } catch { /* silent */ }
      }),
    );
    setSyllabusDocsPerSubject(docs);
    setLinkedSectionsPerSubject(linked);
    console.log(docs, "docs", linked, "linked")
  };

  const toggleLinkedSection = (subjectKey: string, idx: number, docId: string) => {
    const currentConfig = getCurrentGradeConfig();
    const existing: any[] = currentConfig?.subjectSections?.[subjectKey] || [];
    const section = existing[idx];
    const currentIds = section.linkedSyllabusIds || [];
    
    const updatedIds = currentIds.includes(docId)
      ? currentIds.filter((id: string) => id !== docId)
      : [...currentIds, docId];

    updateSubjectSection(subjectKey, idx, "linkedSyllabusIds", updatedIds);
  };

  const saveLinkedSections = async (subjKey: string) => {
    if (!selectedGrade) return;
    setSavingLinkedSections(subjKey);
    try {
      const res = await fetch("/api/private/syllabus/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class: selectedGrade,
          subject: subjKey,
          sectionIds: linkedSectionsPerSubject[subjKey] || [],
        }),
      });
      if (res.ok) {
        toast.success("Linked sections saved");
      } else {
        toast.error("Failed to save linked sections");
      }
    } catch {
      toast.error("Failed to save linked sections");
    } finally {
      setSavingLinkedSections(null);
    }
  };

  const paperStep = gradeStepsData?.steps?.find(
    (s: any) => s.key_name === "paper"
  );
  const paperOptions: string[] = paperStep?.options || [];
  const normalizePaperKey = (label: string) =>
    label.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

  const updatePaperSubjectQuestionCount = (paperKey: string, subjectKey: string, value: number) => {
    const ft = currentConfig?.fullTest || {};
    const pc = ft[paperKey] || {};
    updateGradeConfig({
      fullTest: {
        ...ft,
        [paperKey]: {
          ...pc,
          subjectQuestions: {
            ...(pc.subjectQuestions || {}),
            [subjectKey]: value,
          },
        },
      },
    });
  };

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
                return (
                  <button
                    key={gradeId}
                    onClick={() => !isInitializing && handleSelectSyllabusGrade(displayName)}
                    className={`w-full flex items-center gap-2 px-4 py-4 rounded-2xl font-bold transition-all text-sm border ${
                      isSelected
                        ? "bg-white text-indigo-600 border-indigo-100 shadow-lg"
                        : "text-slate-500 hover:bg-white hover:text-slate-900 border-transparent"
                    }`}
                  >
                    {isInitializing ? (
                      <div className="size-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : !isConfigured ? (
                      <Plus className="size-3 shrink-0 text-slate-400" />
                    ) : null}
                    <span>{displayName.toUpperCase()}</span>
                  </button>
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
                  {currentConfig.sections?.map((section: string) => {
                    const type = SECTION_TYPES.find((t) => t.id === section);
                    return (
                      <div
                        key={section}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl"
                      >
                        <span className="font-bold text-sm text-slate-700">
                          {type?.name || section}
                        </span>
                        <button onClick={() => removeSection(section)} className="text-slate-400 hover:text-red-500">
                          <X className="size-4" />
                        </button>
                      </div>
                    );
                  })}
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
                    <h2 className="text-xl font-black text-slate-900">Question Count (chapter test)</h2>
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
                            <SmartNumberInput
                              value={qc.min}
                              onChange={(v) => updateQuestionCount(section, "min", v)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 block mb-1">Max</label>
                            <SmartNumberInput
                              value={qc.max}
                              onChange={(v) => updateQuestionCount(section, "max", v)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 block mb-1">Default</label>
                            <SmartNumberInput
                              value={qc.default || qc.min}
                              onChange={(v) => updateQuestionCount(section, "default", v)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Case Study Configuration (shown when caseStudy is in sections) */}
              {currentConfig.sections?.includes("caseStudy") && (
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 text-white p-2 rounded-lg">
                        <BookOpenCheck className="size-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Case Study Configuration</h2>
                        <p className="text-xs text-slate-500">
                          Configure case study passages and sub-question types. Sub-questions count as individual questions.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateCaseStudyConfig("enabled", !currentConfig.caseStudyConfig?.enabled)}
                      className={`shrink-0 transition-colors ${currentConfig.caseStudyConfig?.enabled !== false ? "text-indigo-600" : "text-slate-300"}`}
                      title={currentConfig.caseStudyConfig?.enabled !== false ? "Enabled" : "Disabled"}
                    >
                      {currentConfig.caseStudyConfig?.enabled !== false
                        ? <ToggleRight className="size-8" fill="#4f39f670" />
                        : <ToggleLeft className="size-8" fill="#cad5e250" />
                      }
                    </button>
                  </div>

                  {currentConfig.caseStudyConfig?.enabled !== false && (
                    <>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-bold text-slate-700 block mb-2">
                            Number of Case Study Passages
                          </label>
                          <SmartNumberInput
                            value={currentConfig.caseStudyConfig?.count || 2}
                            onChange={(v) => updateCaseStudyConfig("count", v)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                          />
                          <p className="text-xs text-slate-500 mt-1">How many case study passages to generate</p>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700 block mb-2">
                            Sub-Questions Per Case Study
                          </label>
                          <SmartNumberInput
                            value={currentConfig.caseStudyConfig?.subQuestionsPerCase || 3}
                            onChange={(v) => updateCaseStudyConfig("subQuestionsPerCase", v)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                          />
                          <p className="text-xs text-slate-500 mt-1">Each sub-question counts as 1 in total question count</p>
                        </div>
                      </div>

                      <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
                          Total case study questions: {(currentConfig.caseStudyConfig?.count || 2) * (currentConfig.caseStudyConfig?.subQuestionsPerCase || 3)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {currentConfig.caseStudyConfig?.count || 2} passage(s) &times; {currentConfig.caseStudyConfig?.subQuestionsPerCase || 3} sub-question(s) = {(currentConfig.caseStudyConfig?.count || 2) * (currentConfig.caseStudyConfig?.subQuestionsPerCase || 3)} questions counted in total
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-slate-700 block mb-3">
                          Allowed Sub-Question Types
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "mcq", name: "MCQ (Single Correct)" },
                            { id: "numerical", name: "Numerical" },
                            { id: "singleDigitInteger", name: "Single Digit Int (0-9)" },
                            { id: "multiCorrect", name: "Multi Correct" },
                            { id: "matchList", name: "Match List" },
                            { id: "matchListOptionFormat", name: "Match List (Opt Format)" },
                          ].map((qType) => {
                            const isSelected = (currentConfig.caseStudyConfig?.subQuestionTypes || ["mcq"]).includes(qType.id);
                            return (
                              <button
                                key={qType.id}
                                onClick={() => toggleCaseStudySubType(qType.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                  isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                }`}
                              >
                                {qType.name}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Select which question types can appear as sub-questions within case studies. At least one must be selected.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

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
                    <SmartNumberInput
                      value={currentConfig.perQuestionTime || 60}
                      onChange={(v) => updatePerQuestionTime(v)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                    />
                    <p className="text-xs text-slate-500 mt-1">Used for Chapter/Subject Tests</p>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">
                      Full Test Total Time (minutes)
                    </label>
                    <SmartNumberInput
                      value={currentConfig.fullTest?.totalTime || 180}
                      onChange={(v) => updateFullTest("totalTime", v)}
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
                    <SmartNumberInput
                      value={currentConfig.fullTest?.totalQuestions || 0}
                      onChange={(v) => updateFullTest("totalQuestions", v)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">
                      Total Time (minutes)
                    </label>
                    <SmartNumberInput
                      value={currentConfig.fullTest?.totalTime || 180}
                      onChange={(v) => updateFullTest("totalTime", v)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                    />
                  </div>
                </div>

                {/* Per-subject question count */}
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-3">
                    Questions Per Subject (used for subject test also)
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
                              <SmartNumberInput
                                value={count}
                                onChange={(v) => updateSubjectQuestionCount(subjectKey, v)}
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

                {paperOptions.length > 0 && (() => {
                  const effectiveTab = activePaperTab && paperOptions.find(
                    (l) => normalizePaperKey(l) === activePaperTab
                  )
                    ? activePaperTab
                    : normalizePaperKey(paperOptions[0]);
                  return (
                  <div className="border-t border-slate-100 pt-6 space-y-6">
                    <p className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                      Per-Paper Configuration
                    </p>

                    {/* Tab Bar */}
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                      {paperOptions.map((paperLabel) => {
                        const pk = normalizePaperKey(paperLabel);
                        return (
                          <button
                            key={pk}
                            onClick={() => {
                              setActivePaperTab(pk);
                              setAddingSectionPaper(null);
                            }}
                            className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                              effectiveTab === pk
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {paperLabel}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Paper Content */}
                    {(() => {
                      const pk = effectiveTab;
                      const pc = currentConfig.fullTest?.[pk] || {};

                      return (
                        <div key={pk} className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-bold text-slate-700 block mb-1.5">Total Questions</label>
                              <SmartNumberInput
                                value={pc.totalQuestions}
                                onChange={(v) => updatePaperConfig(pk, "totalQuestions", v)}
                                placeholder="—"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-slate-700 block mb-1.5">Total Time (minutes)</label>
                              <SmartNumberInput
                                value={pc.totalTime}
                                onChange={(v) => updatePaperConfig(pk, "totalTime", v)}
                                placeholder="—"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm font-bold text-slate-700">
                                Question Types & Counts
                              </label>
                              {addingSectionPaper === pk ? (
                                <div className="flex items-center gap-2">
                                  <select
                                    autoFocus
                                    onChange={(e) => {
                                      const sec = e.target.value;
                                      if (!sec) return;
                                      const s = pc.sections || [];
                                      updatePaperConfig(pk, "sections", [...s, sec]);
                                      setAddingSectionPaper(null);
                                    }}
                                    onBlur={() => setAddingSectionPaper(null)}
                                    className="px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-sm font-bold text-indigo-600 focus:outline-none"
                                    defaultValue=""
                                  >
                                    <option value="" disabled>Select type</option>
                                    {SECTION_TYPES.filter((t) => !(pc.sections || []).includes(t.id)).map((t) => (
                                      <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                  </select>
                                  <button onClick={() => setAddingSectionPaper(null)} className="text-slate-400 hover:text-red-500">
                                    <X className="size-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setAddingSectionPaper(pk)}
                                  disabled={SECTION_TYPES.filter((t) => !(pc.sections || []).includes(t.id)).length === 0}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-xs hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="size-3.5" />
                                  Add Section
                                </button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {(pc.sections || []).length === 0 ? (
                                <p className="text-sm text-slate-400 bg-slate-50 p-3 rounded-lg">No sections added for this paper.</p>
                              ) : (
                                (pc.sections || []).map((sec: string) => {
                                  const hasCount = pc.questionCount?.[sec]?.default != null;
                                  return (
                                    <div key={sec} className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                                      <span className="flex-1 font-bold text-sm uppercase text-slate-800">
                                        {SECTION_TYPES.find((t) => t.id === sec)?.name || sec}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <label className="text-xs text-slate-500 font-bold">Count</label>
                                        <SmartNumberInput
                                          value={hasCount ? pc.questionCount[sec].default : undefined}
                                          onChange={(v) => {
                                            const curPc = currentConfig?.fullTest?.[pk] || {};
                                            const curQc = curPc.questionCount || {};
                                            updatePaperConfig(pk, "questionCount", {
                                              ...curQc,
                                              [sec]: { default: v },
                                            });
                                          }}
                                          placeholder="—"
                                          className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-sm"
                                        />
                                      </div>
                                      <button
                                        onClick={() => {
                                          const s = pc.sections || [];
                                          const updated = s.filter((x: string) => x !== sec);
                                          const curQc = { ...((currentConfig?.fullTest?.[pk] || {}).questionCount || {}) };
                                          delete curQc[sec];
                                          updatePaperConfig(pk, "questionCount", Object.keys(curQc).length ? curQc : undefined);
                                          updatePaperConfig(pk, "sections", updated.length ? updated : undefined);
                                        }}
                                        className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                      >
                                        <X className="size-4" />
                                      </button>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-bold text-slate-700 block mb-2">
                              Questions Per Subject
                            </label>
                            {(!currentConfig.subjects || currentConfig.subjects.length === 0) ? (
                              <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl">
                                No subjects configured.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {currentConfig.subjects.map((subj: string) => {
                                  const sk = subj.toLowerCase().replace(/\s+/g, "_");
                                  const hasVal = pc.subjectQuestions?.[sk] != null;
                                  return (
                                    <div key={sk} className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                      <span className="flex-1 font-bold text-slate-700 text-sm capitalize">{subj}</span>
                                      <SmartNumberInput
                                        value={hasVal ? pc.subjectQuestions[sk] : undefined}
                                        onChange={(v) => updatePaperSubjectQuestionCount(pk, sk, v)}
                                        placeholder="—"
                                        className="w-24 p-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-sm"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Per-Paper Case Study Config */}
                          {(pc.sections || currentConfig.sections || []).includes("caseStudy") && (() => {
                            const pcs = pc.caseStudyConfig || currentConfig.caseStudyConfig || { enabled: true, count: 2, subQuestionsPerCase: 3, subQuestionTypes: ["mcq"] };
                            const hasPaperOverride = !!pc.caseStudyConfig;
                            return (
                              <div className="border-t border-slate-100 pt-5 space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <BookOpenCheck className="size-4 text-indigo-600" />
                                    <span className="text-sm font-bold text-slate-700">Case Study Config</span>
                                    {!hasPaperOverride && (
                                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Using global defaults</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => updatePaperCaseStudyConfig(pk, "enabled", !(pcs.enabled !== false))}
                                    className={`shrink-0 transition-colors ${pcs.enabled !== false ? "text-indigo-600" : "text-slate-300"}`}
                                  >
                                    {pcs.enabled !== false
                                      ? <ToggleRight className="size-6" fill="#4f39f670" />
                                      : <ToggleLeft className="size-6" fill="#cad5e250" />
                                    }
                                  </button>
                                </div>
                                {pcs.enabled !== false && (
                                  <>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Passages</label>
                                        <SmartNumberInput
                                          value={pcs.count || 2}
                                          onChange={(v) => updatePaperCaseStudyConfig(pk, "count", v)}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Sub-Qs Per Case</label>
                                        <SmartNumberInput
                                          value={pcs.subQuestionsPerCase || 3}
                                          onChange={(v) => updatePaperCaseStudyConfig(pk, "subQuestionsPerCase", v)}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-sm"
                                        />
                                      </div>
                                    </div>
                                    <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg">
                                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                        Total: {(pcs.count || 2) * (pcs.subQuestionsPerCase || 3)} case study sub-questions
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-500 block mb-2">Allowed Sub-Question Types</label>
                                      <div className="flex flex-wrap gap-1.5">
                                        {[
                                          { id: "mcq", name: "MCQ" },
                                          { id: "numerical", name: "Numerical" },
                                          { id: "singleDigitInteger", name: "Single Digit Int" },
                                          { id: "multiCorrect", name: "Multi Correct" },
                                          { id: "matchList", name: "Match List" },
                                          { id: "matchListOptionFormat", name: "MTL Options" },
                                        ].map((qType) => {
                                          const isSelected = (pcs.subQuestionTypes || ["mcq"]).includes(qType.id);
                                          return (
                                            <button
                                              key={qType.id}
                                              onClick={() => togglePaperCaseStudySubType(pk, qType.id)}
                                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                isSelected
                                                  ? "bg-indigo-600 text-white border-indigo-600"
                                                  : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                              }`}
                                            >
                                              {qType.name}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </div>
                  );
                })()}
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
                                      ? <ToggleRight className="size-7" fill="#4f39f670" />
                                      : <ToggleLeft className="size-7" fill="#cad5e250" />
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
                                    <SmartNumberInput
                                      value={sec.questionCount}
                                      onChange={(v) => updateSubjectSection(subjectKey, idx, "questionCount", v)}
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
                                  {/* Linked Syllabus per section */}
                                  <div className="w-full mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                                        Linked Syllabus
                                      </span>
                                    </div>
                                    {(syllabusDocsPerSubject[subjectKey] || []).length === 0 ? (
                                      <p className="text-[10px] text-slate-400 italic">No syllabus subjects found.</p>
                                    ) : (
                                      <div className="flex flex-wrap gap-1.5">
                                        {(syllabusDocsPerSubject[subjectKey] || []).map((doc: any) => {
                                          const isLinked = (sec.linkedSyllabusIds || []).includes(doc._id);
                                          return (
                                            <button
                                              key={doc._id}
                                              onClick={() => toggleLinkedSection(subjectKey, idx, doc._id)}
                                              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                                                isLinked
                                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                  : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                              }`}
                                            >
                                              {isLinked ? "✓ " : ""}{doc.label} <span className="opacity-50">({doc.exam_type})</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
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
