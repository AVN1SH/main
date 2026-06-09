"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Settings,
  Save,
  GraduationCap,
  Layout,
  Settings2,
  FileJson,
  HelpCircle,
  Plus,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

const STATIC_OPTIONS: Record<string, string[]> = {
  "step-board": ["CBSE", "BSEB", "ICSE"],
  "step-paperType": ["Sample Paper", "Chapter Test", "Subject Test"],
  "step-language": ["Hindi", "English"],
};

const STEP_PRESETS: Record<string, { label: string; icon: string; config: any }> = {
  "step-board": {
    label: "Board Selection",
    icon: "📋",
    config: {
      id: "step-board",
      key_name: "board",
      text: "Which board are you studying under?",
      options: ["CBSE", "BSEB"],
    },
  },
  "step-subject": {
    label: "Subject Selection",
    icon: "📚",
    config: {
      id: "step-subject",
      key_name: "subject",
      text: "Got it. And which subject would you like to continue with?",
      options: [],
      fetchType: "subjects",
    },
  },
  "step-paperType": {
    label: "Paper Type",
    icon: "📝",
    config: {
      id: "step-paperType",
      key_name: "paperType",
      text: "**Perfect!** I have all the details.\n\nWhat would you like to generate?",
      options: ["Sample Paper", "Chapter Test", "Subject Test"],
    },
  },
  "step-chapter": {
    label: "Chapter Selection",
    icon: "📖",
    config: {
      id: "step-chapter",
      key_name: "chapter",
      text: "Great! Which **Chapter** would you like to generate the test for?",
      options: [],
      fetchType: "chapters",
      condition: { key: "paperType", value: "Chapter Test" },
    },
  },
  "step-language": {
    label: "Language Selection",
    icon: "🌐",
    config: {
      id: "step-language",
      key_name: "language",
      text: "Which **language** would you like the paper to be generated in?",
      options: ["Hindi", "English"],
    },
  },
};

type StepPresetId = keyof typeof STEP_PRESETS;

const isPresetStep = (id: string): id is StepPresetId => id in STEP_PRESETS;

const getStepPresetId = (step: any): StepPresetId | null => {
  if (step.id && isPresetStep(step.id)) return step.id;
  return null;
};

export default function ConfigPage() {
  const [gradeSteps, setGradeSteps] = useState<any[]>([]);
  const [testConfig, setTestConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"grades" | "settings">("grades");
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jsonEditorOpen, setJsonEditorOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ gradeId: "", defaultExamType: "" });
  const [addStepOpen, setAddStepOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stepsRes, configRes] = await Promise.all([
        axios.get("/api/admin/grade-steps"),
        axios.get("/api/admin/test-config"),
      ]);
      setGradeSteps(stepsRes.data);
      setTestConfig(configRes.data);
      if (stepsRes.data.length > 0 && !selectedGrade) {
        setSelectedGrade(stepsRes.data[0]);
      }
    } catch {
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveGrade = async () => {
    if (!selectedGrade) return;
    try {
      toast.loading("Saving grade...", { id: "save-grade" });
      await axios.post("/api/admin/grade-steps", selectedGrade);
      toast.success("Grade steps updated", { id: "save-grade" });
      fetchData();
    } catch {
      toast.error("Failed to save grade steps", { id: "save-grade" });
    }
  };

  const handleSaveConfig = async () => {
    try {
      toast.loading("Saving settings...", { id: "save-config" });
      await axios.post("/api/admin/test-config", testConfig);
      toast.success("Settings updated", { id: "save-config" });
      fetchData();
    } catch {
      toast.error("Failed to save test config", { id: "save-config" });
    }
  };

  const handleUpdateStepText = (index: number, text: string) => {
    if (!selectedGrade) return;
    const newSteps = [...selectedGrade.steps];
    newSteps[index] = { ...newSteps[index], text };
    setSelectedGrade({ ...selectedGrade, steps: newSteps });
  };

  const handleDeleteStep = (index: number) => {
    if (!selectedGrade) return;
    const newSteps = selectedGrade.steps.filter(
      (_: any, i: number) => i !== index,
    );
    setSelectedGrade({ ...selectedGrade, steps: newSteps });
  };

  const handleAddPresetStep = (presetId: StepPresetId) => {
    if (!selectedGrade) return;
    const preset = STEP_PRESETS[presetId];
    const newStep: any = { ...preset.config };

    if (presetId === "step-subject" || presetId === "step-chapter") {
      newStep._checkingSyllabus = true;
      const gradeId = selectedGrade.gradeId;
      const examType = selectedGrade.defaultExamType;
      let url = `/api/syllabus/subjects?class=${encodeURIComponent(gradeId)}`;
      if (examType) url += `&examType=${encodeURIComponent(examType)}`;

      axios.get(url).then((res) => {
        const subjects = res.data?.subjects || [];
        if (subjects.length === 0) {
          setSelectedGrade((prev: any) => {
            if (!prev) return prev;
            const updatedSteps = [...prev.steps];
            const stepIndex = updatedSteps.findIndex((s: any) => s.id === presetId && s._checkingSyllabus);
            if (stepIndex === -1) return prev;
            updatedSteps[stepIndex] = {
              ...updatedSteps[stepIndex],
              _checkingSyllabus: false,
              _syllabusMissing: true,
            };
            return { ...prev, steps: updatedSteps };
          });
        } else {
          setSelectedGrade((prev: any) => {
            if (!prev) return prev;
            const updatedSteps = [...prev.steps];
            const stepIndex = updatedSteps.findIndex((s: any) => s.id === presetId && s._checkingSyllabus);
            if (stepIndex === -1) return prev;
            updatedSteps[stepIndex] = {
              ...updatedSteps[stepIndex],
              _checkingSyllabus: false,
            };
            return { ...prev, steps: updatedSteps };
          });
        }
      }).catch(() => {
        setSelectedGrade((prev: any) => {
          if (!prev) return prev;
          const updatedSteps = [...prev.steps];
          const stepIndex = updatedSteps.findIndex((s: any) => s.id === presetId && s._checkingSyllabus);
          if (stepIndex === -1) return prev;
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            _checkingSyllabus: false,
          };
          return { ...prev, steps: updatedSteps };
        });
      });
    }

    setSelectedGrade((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: [...(prev.steps || []), newStep],
      };
    });
    setAddStepOpen(false);
  };

  const normalizeGradeId = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, "_");

  const normalizeExamType = (s: string) =>
    s.trim().toUpperCase().replace(/\s+/g, "_");

  const handleAddCourse = async () => {
    const gradeId = newCourse.gradeId.trim();
    if (!gradeId) {
      toast.error("Grade is required");
      return;
    }
    try {
      toast.loading("Creating course...", { id: "add-course" });
      const courseData = {
        gradeId,
        defaultExamType: normalizeExamType(newCourse.defaultExamType || newCourse.gradeId),
        steps: [],
        finalStep: {
          id: "final-step",
          text: `**Thank you**, I'm generating for **{class}** - **{subject}**.`,
          key_name: "last",
        },
      };
      await axios.post("/api/admin/grade-steps", courseData);
      toast.success("Course created", { id: "add-course" });
      setAddCourseOpen(false);
      setNewCourse({ gradeId: "", defaultExamType: "" });
      fetchData();
    } catch {
      toast.error("Failed to create course", { id: "add-course" });
    }
  };

  const handleDeleteCourse = async (gradeId: string) => {
    if (!confirm(`Delete course "${gradeId}"? This cannot be undone.`)) return;
    try {
      toast.loading("Deleting course...", { id: "delete-course" });
      await axios.delete(`/api/admin/grade-steps?gradeId=${encodeURIComponent(gradeId)}`);
      toast.success("Course deleted", { id: "delete-course" });
      if (selectedGrade?.gradeId === gradeId) {
        setSelectedGrade(null);
      }
      fetchData();
    } catch {
      toast.error("Failed to delete course", { id: "delete-course" });
    }
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    if (!selectedGrade) return;
    const newSteps = [...selectedGrade.steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSelectedGrade({ ...selectedGrade, steps: newSteps });
  };

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold">Synchronizing Config...</p>
        </div>
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Steps <span className="text-amber-500">Configuration</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Define multi-step workflows and global engine settings.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={activeTab === "grades" ? handleSaveGrade : handleSaveConfig}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 shadow-xl shadow-indigo-500/10 transition-all"
          >
            <Save className="size-4" />
            Save Changes
          </button>
        </div>
      </header>

      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit">
        <button
          onClick={() => setActiveTab("grades")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
            activeTab === "grades" ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <GraduationCap className="size-4" />
          Grade-wise Steps
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
            activeTab === "settings" ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Settings2 className="size-4" />
          Global Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {activeTab === "grades" ? (
          <>
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between pl-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Select Grade
                </h3>
                <button
                  onClick={() => setAddCourseOpen(true)}
                  className="flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
                >
                  <Plus className="size-3" />
                  Add
                </button>
              </div>
              {gradeSteps.map((grade) => (
                <div
                  key={grade.gradeId}
                  className={`group w-full flex items-center justify-between px-4 py-4 rounded-2xl font-bold transition-all text-sm border cursor-pointer ${
                    selectedGrade?.gradeId === grade.gradeId
                      ? "bg-white text-indigo-600 border-indigo-100 shadow-lg shadow-indigo-500/5 translate-x-1"
                      : "text-slate-500 hover:bg-white hover:text-slate-900 border-transparent"
                  }`}
                  onClick={() => setSelectedGrade(grade)}
                >
                  <span>{grade.gradeId}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(grade.gradeId);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                    title="Delete course"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              {gradeSteps.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm font-medium">
                  No courses yet. Click &quot;Add&quot; to create one.
                </div>
              )}
            </div>

            <div className="lg:col-span-9 space-y-8">
              {selectedGrade && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900">
                          Sequence of Steps
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">
                          {selectedGrade.steps?.length || 0} steps configured
                        </span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setAddStepOpen(!addStepOpen)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all"
                        >
                          <Plus className="size-3.5" />
                          Add Step
                          <ChevronDown className="size-3" />
                        </button>
                        {addStepOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setAddStepOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 z-20 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-0.5">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1">
                                Step Type
                              </p>
                              {Object.entries(STEP_PRESETS)
                                .filter(([id]) => !(selectedGrade.steps || []).some((s: any) => s.id === id))
                                .map(([id, preset]) => (
                                <button
                                  key={id}
                                  onClick={() => handleAddPresetStep(id as StepPresetId)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left"
                                >
                                  <span className="text-base">{preset.icon}</span>
                                  <span>{preset.label}</span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedGrade.steps?.map((step: any, index: number) => {
                        const presetId = getStepPresetId(step);
                        const preset = presetId ? STEP_PRESETS[presetId] : null;
                        const isDynamic = step.fetchType === "subjects" || step.fetchType === "chapters";

                        return (
                          <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="size-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                                {index + 1}
                              </div>
                              {preset ? (
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-indigo-600 uppercase">
                                      {preset.icon} {preset.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono bg-slate-200 px-1.5 py-0.5 rounded">
                                      {step.id}
                                    </span>
                                    {isDynamic && step.fetchType === "subjects" && (
                                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase">
                                        Dynamic
                                      </span>
                                    )}
                                    {isDynamic && step.fetchType === "chapters" && (
                                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded uppercase">
                                        Dynamic
                                      </span>
                                    )}
                                    {step.condition && (
                                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded uppercase">
                                        Conditional
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-slate-400 font-mono">key: {step.key_name}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 min-w-0">
                                  <input
                                    className="text-xs font-black text-indigo-600 uppercase bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-400 outline-hidden w-full"
                                    value={step.id || ""}
                                    onChange={(e) => {
                                      const newSteps = [...selectedGrade.steps];
                                      newSteps[index] = { ...newSteps[index], id: e.target.value };
                                      setSelectedGrade({ ...selectedGrade, steps: newSteps });
                                    }}
                                    placeholder="step-id"
                                  />
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-slate-400 font-mono">key:</span>
                                    <input
                                      className="text-[10px] text-slate-400 font-mono bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-400 outline-hidden"
                                      value={step.key_name || ""}
                                      onChange={(e) => {
                                        const newSteps = [...selectedGrade.steps];
                                        newSteps[index] = { ...newSteps[index], key_name: e.target.value };
                                        setSelectedGrade({ ...selectedGrade, steps: newSteps });
                                      }}
                                      placeholder="key_name"
                                    />
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleMoveStep(index, "up")}
                                  disabled={index === 0}
                                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a.75.75 0 01-.75-.75V5.81L5.03 9.78a.75.75 0 01-1.06-1.06l5.5-5.5a.75.75 0 011.06 0l5.5 5.5a.75.75 0 01-1.06 1.06l-4.22-3.97v11.44A.75.75 0 0110 18z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleMoveStep(index, "down")}
                                  disabled={index === selectedGrade.steps.length - 1}
                                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v11.44l4.22-3.97a.75.75 0 111.06 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-5.5-5.5a.75.75 0 011.06-1.06l4.22 3.97V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteStep(index)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                                  title="Delete step"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="ml-0 space-y-4">
                              <textarea
                                className="w-full p-4 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 resize-none"
                                value={step.text}
                                onChange={(e) => handleUpdateStepText(index, e.target.value)}
                                placeholder="Question text..."
                                rows={2}
                              />

                              {isDynamic ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs font-medium">
                                      <span className="text-base">
                                        {step.fetchType === "subjects" ? "📚" : "📖"}
                                      </span>
                                      <span>
                                        Fetches <strong>{step.fetchType}</strong> dynamically from syllabus database.
                                        {step.fetchType === "subjects" && " Options are loaded based on grade and board."}
                                        {step.fetchType === "chapters" && " Options are loaded based on grade, board, and subject."}
                                      </span>
                                    </div>
                                    {step.condition && (
                                      <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-700 text-xs font-medium">
                                        <span>🔗</span>
                                        <span>
                                          Only shown when <strong>{step.condition.key}</strong> = <strong>{String(step.condition.value)}</strong>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {step._checkingSyllabus && (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs font-medium">
                                      <div className="size-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                      Checking syllabus database for <strong>{selectedGrade.gradeId}</strong>...
                                    </div>
                                  )}
                                  {step._syllabusMissing && (
                                    <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
                                      <span className="text-base mt-0.5">⚠️</span>
                                      <span>
                                        No syllabus found for <strong>{selectedGrade.gradeId}</strong>
                                        {selectedGrade.defaultExamType ? ` (${selectedGrade.defaultExamType})` : ""}.
                                        Please first add the syllabus in the{" "}
                                        <Link href="/private/dashboard/data" className="text-amber-900 underline font-bold hover:text-amber-700">
                                          Feed Database
                                        </Link>{" "}
                                        tab to show options dynamically when users reach this step.
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                                      Static Options
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                      {presetId && STATIC_OPTIONS[presetId] ? (
                                        STATIC_OPTIONS[presetId].map((opt) => {
                                          const selected = (step.options || []).includes(opt);
                                          return (
                                            <button
                                              key={opt}
                                              type="button"
                                              onClick={() => {
                                                const newSteps = [...selectedGrade.steps];
                                                const current = newSteps[index].options || [];
                                                newSteps[index] = {
                                                  ...newSteps[index],
                                                  options: selected
                                                    ? current.filter((o: string) => o !== opt)
                                                    : [...current, opt],
                                                };
                                                setSelectedGrade({ ...selectedGrade, steps: newSteps });
                                              }}
                                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                selected
                                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                              }`}
                                            >
                                              {opt}
                                            </button>
                                          );
                                        })
                                      ) : (
                                        (step.options || []).map((opt: string) => (
                                          <span
                                            key={opt}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-600 border border-slate-200"
                                          >
                                            {opt}
                                          </span>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                  {step.condition && (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-700 text-xs font-medium">
                                      <span>🔗</span>
                                      <span>
                                        Only shown when <strong>{step.condition.key}</strong> = <strong>{String(step.condition.value)}</strong>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(!selectedGrade.steps || selectedGrade.steps.length === 0) && (
                        <div className="text-center py-12 text-slate-400 text-sm font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          No steps configured yet. Click &quot;Add Step&quot; to build the workflow.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[32px] text-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        <Layout className="size-5 text-indigo-400" />
                        Success Template
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">key: {selectedGrade.finalStep?.key_name || "last"}</span>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">
                      This text is shown just before generation. Use curly braces for variables.
                    </p>
                    <textarea
                      className="w-full p-6 bg-slate-800 border border-slate-700 rounded-2xl text-indigo-100 font-bold focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={2}
                      value={selectedGrade.finalStep?.text || ""}
                      onChange={(e) => setSelectedGrade({ ...selectedGrade, finalStep: { ...selectedGrade.finalStep, text: e.target.value } })}
                    />
                  </div>
                </div>
              )}
              {!selectedGrade && gradeSteps.length > 0 && (
                <div className="flex items-center justify-center min-h-[300px] bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium">Select a grade from the sidebar to edit its steps.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="lg:col-span-12 space-y-8 animate-fadeIn">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg">
                    <Settings className="size-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">System Settings</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between border border-slate-100">
                    <div>
                      <p className="text-sm font-black text-slate-900">Current Academic Year</p>
                      <p className="text-xs text-slate-500 font-bold mt-1">Default value for new papers</p>
                    </div>
                    <input
                      type="number"
                      className="w-24 p-3 bg-white border border-slate-200 rounded-xl text-center font-black text-indigo-600 shadow-sm"
                      value={testConfig?.settings?.defaultYear || 2026}
                      onChange={(e) => setTestConfig({ ...testConfig, settings: { ...testConfig.settings, defaultYear: Number(e.target.value) } })}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-indigo-600 p-8 rounded-[32px] text-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileJson className="size-6 text-indigo-200" />
                    <h3 className="text-2xl font-black">Raw JSON Access</h3>
                  </div>
                  <p className="text-indigo-100 text-sm font-medium mb-8">
                    Need full control? Edit entire test configuration as JSON.
                  </p>
                </div>
                <button
                  onClick={() => setJsonEditorOpen(true)}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                >
                  Open JSON Editor
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg">
                  <HelpCircle className="size-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Global Prompt Context</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testConfig?.grades && Object.keys(testConfig.grades).map((gradeKey) => (
                  <div key={gradeKey} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 ml-1 mb-2 uppercase tracking-widest">{gradeKey}</p>
                    <input
                      type="text"
                      className="w-full bg-transparent font-bold text-slate-700 text-sm focus:outline-hidden"
                      value={testConfig.grades[gradeKey]?.promptContext || ""}
                      onChange={(e) => {
                        const newGrades = { ...testConfig.grades };
                        newGrades[gradeKey] = { ...newGrades[gradeKey], promptContext: e.target.value };
                        setTestConfig({ ...testConfig, grades: newGrades });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {jsonEditorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Raw JSON Editor</h2>
                <p className="text-sm text-slate-500 font-medium">Edit entire test configuration</p>
              </div>
              <button
                onClick={() => setJsonEditorOpen(false)}
                className="size-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-500"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-6 overflow-hidden">
              <textarea
                className={`w-full h-full min-h-[400px] p-6 bg-slate-900 rounded-2xl text-indigo-100 font-mono text-sm focus:ring-2 focus:ring-indigo-500 resize-none ${jsonError ? 'ring-2 ring-red-500' : ''}`}
                value={JSON.stringify(testConfig, null, 2)}
                onChange={(e) => {
                  setJsonError(null);
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setTestConfig(parsed);
                  } catch {
                    setJsonError("Invalid JSON - syntax error");
                  }
                }}
                spellCheck={false}
              />
              {jsonError && (
                <p className="text-red-500 text-sm font-bold mt-2">{jsonError}</p>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-4 justify-end">
              <button
                onClick={() => setJsonEditorOpen(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveConfig();
                  setJsonEditorOpen(false);
                }}
                className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Save className="size-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {addCourseOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Add New Course</h2>
                <p className="text-sm text-slate-500 font-medium">Create a new grade configuration</p>
              </div>
              <button
                onClick={() => setAddCourseOpen(false)}
                className="size-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-500"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                  Grade
                </label>
                <input
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  value={newCourse.gradeId}
                  onChange={(e) => setNewCourse({ ...newCourse, gradeId: e.target.value })}
                  placeholder="e.g. 11th, 9th, CUET"
                />
                <p className="text-[10px] text-slate-400 mt-1 ml-1">
                  Will be saved as <strong>{newCourse.gradeId.trim() || "—"}</strong>
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                  Default Exam Type (optional)
                </label>
                <input
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  value={newCourse.defaultExamType}
                  onChange={(e) => setNewCourse({ ...newCourse, defaultExamType: e.target.value })}
                  onBlur={(e) => setNewCourse({ ...newCourse, defaultExamType: normalizeExamType(e.target.value) })}
                  placeholder="e.g. CBSE, ICSE, CUET"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-4 justify-end">
              <button
                onClick={() => setAddCourseOpen(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Plus className="size-4" />
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
