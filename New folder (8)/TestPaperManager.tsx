"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Eye,
  Filter,
  FlaskConical,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import SafeMath from "../SafeMath";
import { TestEnvironment } from "../test/TestEnvironment";
import PaperFormat from "../papers/PaperFormat";

type PaperSummary = {
  id: string;
  title: string;
  class: string;
  subject: string;
  exam_type: string;
  paperType: string;
  language?: string | null;
  questionCount: number;
  hasSubjects: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type PaperDetail = {
  id: string;
  class: string;
  subject: string;
  exam_type: string;
  paperType: string;
  chapterName?: string;
  selectedChapters?: string[];
  language?: string | null;
  paper: any;
  paperJson: string;
};

export const formatLabel = (value?: string | null) => {
  if (!value) return "-";
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const getDisplayTitle = (paperDetail: PaperDetail | null, paper: any) => {
  let displayTitle = paper?.title || paperDetail?.paperType || "Untitled Paper";
  if (paperDetail?.paperType?.toLowerCase() === "chapter test") {
    if (paperDetail.chapterName) {
      displayTitle += ` - ${paperDetail.chapterName}`;
    } else if (paperDetail.selectedChapters && paperDetail.selectedChapters.length > 0) {
      displayTitle += ` - ${paperDetail.selectedChapters.join(", ")}`;
    }
  }
  return displayTitle;
};

const normalizeQuestions = (paper: any) => {
  if (!paper || typeof paper !== "object") return [];
  if (Array.isArray(paper.questions)) return cloneValue(paper.questions);

  return [
    ...(Array.isArray(paper.mcqs)
      ? paper.mcqs.map((item: any) => ({ ...item, qType: item.qType || "mcq" }))
      : []),
    ...(Array.isArray(paper.subjective)
      ? paper.subjective.map((item: any) => ({
          ...item,
          qType: item.qType || "subjective",
        }))
      : []),
    ...(Array.isArray(paper.caseStudies)
      ? paper.caseStudies.map((item: any) => ({
          ...item,
          qType: item.qType || "caseStudy",
        }))
      : []),
    ...(Array.isArray(paper.mapBased)
      ? paper.mapBased.map((item: any) => ({ ...item, qType: item.qType || "map" }))
      : []),
  ];
};

const buildPaperFromQuestions = (paper: any, questions: any[]) => {
  const nextPaper = cloneValue(paper || {});
  nextPaper.questions = questions;
  nextPaper.mcqs = questions.filter((item) => (item.qType || item.type) === "mcq");
  nextPaper.subjective = questions.filter(
    (item) => (item.qType || item.type) === "subjective",
  );
  nextPaper.caseStudies = questions.filter((item) =>
    ["caseStudy", "case"].includes(item.qType || item.type),
  );
  nextPaper.mapBased = questions.filter((item) =>
    ["map", "mapBased"].includes(item.qType || item.type),
  );
  return nextPaper;
};

const LIMIT = 20;

export default function TestPaperManager() {
  const [papers, setPapers] = useState<PaperSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<PaperDetail | null>(null);
  const [editorPaper, setEditorPaper] = useState<any>(null);
  const [jsonDraft, setJsonDraft] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "json">("editor");
  const [filters, setFilters] = useState({
    search: "",
    class: "",
    subject: "",
    examType: "",
    paperType: "",
    dateFrom: "",
    dateTo: "",
  });
  const [showDeleteRangeModal, setShowDeleteRangeModal] = useState(false);
  const [deleteRangeFrom, setDeleteRangeFrom] = useState("");
  const [deleteRangeTo, setDeleteRangeTo] = useState("");
  const [deletingByRange, setDeletingByRange] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionId, setNewQuestionId] = useState<string | null>(null);
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPapers, setTotalPapers] = useState(0);
  const [paperFilters, setPaperFilters] = useState<{
    classes: string[];
    subjects: string[];
    examTypes: string[];
    paperTypes: string[];
  }>({ classes: [], subjects: [], examTypes: [], paperTypes: [] });

  const fetchPapers = async (p = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append("page", String(p));
      params.append("limit", String(LIMIT));
      if (filters.search) params.append("search", filters.search);
      if (filters.class) params.append("class", filters.class);
      if (filters.subject) params.append("subject", filters.subject);
      if (filters.examType) params.append("examType", filters.examType);
      if (filters.paperType) params.append("paperType", filters.paperType);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const response = await axios.get<{
        papers: PaperSummary[];
        total: number;
        page: number;
        limit: number;
        filters: { classes: string[]; subjects: string[]; examTypes: string[]; paperTypes: string[] };
      }>(`/api/private/test-paper?${params.toString()}`);
      setPapers(response.data.papers || []);
      setTotalPapers(response.data.total || 0);
      setPage(response.data.page || 1);
      if (response.data.filters) {
        setPaperFilters(response.data.filters);
      }
    } catch (fetchError) {
      console.error(fetchError);
      setError("Failed to load generated papers.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (updates: Partial<typeof filters>) => {
    const next = { ...filters, ...updates };
    setFilters(next);
    // fetch with page 1 when filters change
    setPage(1);
    fetchPapers(1);
  };

  const openPaper = async (paperId: string) => {
    try {
      setSelectedPaperId(paperId);
      setDetailLoading(true);
      const response = await axios.get<PaperDetail>(`/api/private/test-paper/${paperId}`);
      setSelectedPaper(response.data);
      setEditorPaper(response.data.paper);
      setJsonDraft(JSON.stringify(response.data.paper, null, 2));
      setActiveTab("editor");
    } catch (fetchError) {
      console.error(fetchError);
      toast.error("Failed to open paper details.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers(1);
  }, []);

  const totalPages = Math.ceil(totalPapers / LIMIT);

  const groupedPapers = useMemo(() => {
    const grouped = new Map<string, PaperSummary[]>();

    papers.forEach((paper) => {
      const key = `${paper.class}__${paper.subject}__${paper.exam_type}`;
      const current = grouped.get(key) || [];
      current.push(paper);
      grouped.set(key, current);
    });

    return Array.from(grouped.entries()).map(([key, items]) => {
      const [className, subject, examType] = key.split("__");
      return { key, className, subject, examType, items };
    });
  }, [papers]);

  const questions = useMemo(() => normalizeQuestions(editorPaper), [editorPaper]);

  const isFullTest = selectedPaper?.exam_type?.toLowerCase().includes("full") || 
                     selectedPaper?.paperType?.toLowerCase().includes("full");

  const uniqueSubjectsInQuestions = useMemo(() => {
    const subjects = new Set<string>();
    questions.forEach((q: any) => {
      if (q.subject) subjects.add(q.subject);
    });
    return Array.from(subjects).sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (!selectedSubjectFilter) return questions;
    return questions.filter((q: any) => q.subject === selectedSubjectFilter);
  }, [questions, selectedSubjectFilter]);

  useEffect(() => {
    if (newQuestionId) {
      const element = document.getElementById(`question-${newQuestionId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setNewQuestionId(null);
    }
  }, [newQuestionId, questions]);

  const updateEditorPaper = (paper: any) => {
    setEditorPaper(paper);
    setJsonDraft(JSON.stringify(paper, null, 2));
  };

  const updateSelectedMeta = (
    field: "class" | "subject" | "exam_type" | "paperType" | "language",
    value: string,
  ) => {
    if (!selectedPaper) return;
    const nextSelectedPaper = { ...selectedPaper, [field]: value };
    setSelectedPaper(nextSelectedPaper);

    if (!editorPaper) return;
    const nextPaper = cloneValue(editorPaper);
    if (field === "class") nextPaper.class = value;
    if (field === "subject") nextPaper.subject = value;
    if (field === "language") nextPaper.language = value;
    updateEditorPaper(nextPaper);
  };

  const updateQuestion = (index: number, updater: (question: any) => any) => {
    const nextQuestions = normalizeQuestions(editorPaper);
    nextQuestions[index] = updater(cloneValue(nextQuestions[index]));
    updateEditorPaper(buildPaperFromQuestions(editorPaper, nextQuestions));
  };

  const questionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach((q: any) => {
      const type = q.qType || q.type || "mcq";
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [questions]);

  const addQuestion = (type: string) => {
    const newId = `${Date.now()}`;
    let newQuestion: any = {
      id: newId,
      qType: type,
      type: type,
      question: "",
      subject: selectedPaper?.subject || "",
    };

    if (type === "mcq") {
      newQuestion = {
        ...newQuestion,
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
        explanation: "",
        hint: "",
      };
    } else if (type === "numerical") {
      newQuestion = {
        ...newQuestion,
        correctAnswer: "",
        explanation: "",
        hint: "",
      };
    } else if (type === "multiCorrect") {
      newQuestion = {
        ...newQuestion,
        options: ["", "", "", ""],
        correctAnswerIndices: [],
        explanation: "",
        hint: "",
      };
    } else if (type === "matchList") {
      newQuestion = {
        ...newQuestion,
        listA: ["", ""],
        listB: ["", ""],
        correctMatches: [],
        explanation: "",
      };
    } else if (type === "matchListOptionFormat") {
      newQuestion = {
        ...newQuestion,
        listI: ["", "", "", ""],
        listII: ["", "", "", ""],
        options: ["", "", "", ""],
        correctIndex: 0,
        explanation: "",
        hint: "",
      };
    } else if (type === "caseStudy") {
      newQuestion = {
        ...newQuestion,
        passage: "",
        subQuestions: [],
        explanation: "",
      };
    } else if (type === "subjective") {
      newQuestion = {
        ...newQuestion,
        correctAnswer: "",
        section: "",
        explanation: "",
      };
    } else if (type === "map") {
      newQuestion = {
        ...newQuestion,
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
        explanation: "",
        hint: "",
      };
    }

    const nextQuestions = [...normalizeQuestions(editorPaper), newQuestion];
    updateEditorPaper(buildPaperFromQuestions(editorPaper, nextQuestions));
    setShowAddQuestionModal(false);
    setNewQuestionId(newId);
  };

  const removeQuestion = (index: number) => {
    if (!confirm("Remove this question?")) return;
    const nextQuestions = normalizeQuestions(editorPaper).filter(
      (_question, questionIndex) => questionIndex !== index,
    );
    updateEditorPaper(buildPaperFromQuestions(editorPaper, nextQuestions));
  };

  const savePaper = async () => {
    if (!selectedPaper) return;

    try {
      setSaving(true);
      const paperToSave = activeTab === "json" ? JSON.parse(jsonDraft) : editorPaper;

      await axios.patch(`/api/private/test-paper/${selectedPaper.id}`, {
        class: selectedPaper.class,
        subject: selectedPaper.subject,
        exam_type: selectedPaper.exam_type,
        paperType: selectedPaper.paperType,
        language: selectedPaper.language || null,
        paper: paperToSave,
      });

      toast.success("Generated paper updated.");
      await fetchPapers();
      await openPaper(selectedPaper.id);
    } catch (saveError) {
      console.error(saveError);
      toast.error("Save failed. Check the editor values or JSON draft.");
    } finally {
      setSaving(false);
    }
  };

  const deletePaper = async () => {
    if (!selectedPaper) return;
    if (!confirm("Delete this generated paper permanently?")) return;

    try {
      setDeleting(true);
      await axios.delete(`/api/private/test-paper/${selectedPaper.id}`);
      toast.success("Generated paper deleted.");
      setSelectedPaperId(null);
      setSelectedPaper(null);
      setEditorPaper(null);
      setJsonDraft("");
      await fetchPapers();
    } catch (deleteError) {
      console.error(deleteError);
      toast.error("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  const deletePapersByDateRange = async () => {
    if (!deleteRangeFrom || !deleteRangeTo) {
      toast.error("Please select both start and end dates.");
      return;
    }

    const fromDate = new Date(deleteRangeFrom);
    const toDate = new Date(deleteRangeTo + "T23:59:59");

    const papersInRange = papers.filter((paper) => {
      const paperDate = paper.createdAt ? new Date(paper.createdAt) : null;
      return paperDate && paperDate >= fromDate && paperDate <= toDate;
    });

    if (papersInRange.length === 0) {
      toast.error("No papers found in the selected date range.");
      return;
    }

    if (!confirm(`Delete ${papersInRange.length} paper(s) in the selected date range? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingByRange(true);
      const idsToDelete = papersInRange.map((p) => p.id);
      await axios.post("/api/private/test-paper/delete-by-dates", {
        ids: idsToDelete,
      });
      toast.success(`${papersInRange.length} paper(s) deleted successfully.`);
      setShowDeleteRangeModal(false);
      setDeleteRangeFrom("");
      setDeleteRangeTo("");
      await fetchPapers();
    } catch (deleteError) {
      console.error(deleteError);
      toast.error("Failed to delete papers by date range.");
    } finally {
      setDeletingByRange(false);
    }
  };

  return (
    <div className="flex h-screen gap-0 overflow-hidden">
      <aside className="flex w-[360px] flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="size-5 text-indigo-600" />
              <span className="font-black text-slate-900">Test Papers</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {totalPapers}
              </span>
            </div>
            <button
              onClick={() => fetchPapers(page)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) =>
                handleFilterChange({ search: event.target.value })
              }
              placeholder="Search papers..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={filters.class}
              onChange={(e) => handleFilterChange({ class: e.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 outline-none"
            >
              <option value="">All Classes</option>
              {paperFilters.classes.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
            </select>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange({ subject: e.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 outline-none"
            >
              <option value="">All Subjects</option>
              {paperFilters.subjects.map(s => <option key={s} value={s}>{formatLabel(s)}</option>)}
            </select>
            <select
              value={filters.examType}
              onChange={(e) => handleFilterChange({ examType: e.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 outline-none"
            >
              <option value="">All Exams</option>
              {paperFilters.examTypes.map(e => <option key={e} value={e}>{formatLabel(e)}</option>)}
            </select>
            <select
              value={filters.paperType}
              onChange={(e) => handleFilterChange({ paperType: e.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 outline-none"
            >
              <option value="">All Types</option>
              {paperFilters.paperTypes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">From</span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange({ dateFrom: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2 text-xs text-slate-700 outline-none"
              />
            </div>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">To</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange({ dateTo: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2 text-xs text-slate-700 outline-none"
              />
            </div>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setShowDeleteRangeModal(true)}
              className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              <Trash2 className="size-3" />
              Delete Range
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-slate-400">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : papers.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-slate-400">
              <Filter className="mb-2 size-5" />
              <span className="text-sm">No papers found</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {papers.map((paper) => {
                const isActive = selectedPaperId === paper.id;
                return (
                  <button
                    key={paper.id}
                    onClick={() => openPaper(paper.id)}
                    className={`w-full p-3 text-left transition-colors ${
                      isActive
                        ? "bg-indigo-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                            {paper.class}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                            {paper.paperType}
                          </span>
                        </div>
                        <p className={`mt-1.5 truncate text-sm font-semibold ${isActive ? "text-indigo-700" : "text-slate-900"}`}>
                          {paper.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {formatLabel(paper.subject)} · {paper.exam_type}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                          <span>{paper.questionCount} Qs</span>
                          <span>{paper.language ? formatLabel(paper.language) : "Default"}</span>
                        </div>
                      </div>
                      <Pencil className={`size-4 shrink-0 ${isActive ? "text-indigo-500" : "text-slate-300"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 0 && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchPapers(page - 1)}
                disabled={page <= 1 || loading}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-xs text-slate-500 px-1">
                {page}/{totalPages}
              </span>
              <button
                onClick={() => fetchPapers(page + 1)}
                disabled={page >= totalPages || loading}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <span className="text-xs text-slate-500">
              {totalPapers} papers
            </span>
          </div>
        )}
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        {!selectedPaper ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <Pencil className="mb-3 size-10" />
            <p className="font-semibold">Select a paper to edit</p>
            <p className="mt-1 text-sm">Choose from the list on the left</p>
          </div>
        ) : detailLoading ? (
          <div className="flex h-full items-center justify-center gap-3 text-slate-500">
            <Loader2 className="size-5 animate-spin" />
            Loading...
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-slate-900">
                  {getDisplayTitle(selectedPaper, selectedPaper.paper)}
                </h2>
                <p className="truncate text-sm text-slate-500">
                  {selectedPaper.class} · {formatLabel(selectedPaper.subject)} · {selectedPaper.exam_type}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    activeTab === "editor" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    activeTab === "preview" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    activeTab === "json" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => {
                    setSelectedPaperId(null);
                    setSelectedPaper(null);
                    setEditorPaper(null);
                    setJsonDraft("");
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === "json" ? (
                <div className="h-full p-4">
                  <textarea
                    value={jsonDraft}
                    onChange={(event) => setJsonDraft(event.target.value)}
                    className="h-full w-full rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-100 outline-none"
                  />
                </div>
              ) : activeTab === "preview" ? (
                <PaperPreview paper={editorPaper} questions={questions} selectedPaper={selectedPaper} />
              ) : (
                <div className="flex h-full flex-col">
                  <div className="shrink-0 border-b border-slate-200 bg-white p-4">
                    {selectedPaper?.paperType?.toLowerCase().includes("sample") ? (
                      <div className="mb-4 grid grid-cols-5 gap-3">
                        <div className="col-span-2">
                          <CompactInput
                            label="Title"
                            value={editorPaper?.title || ""}
                            onChange={(value) => updateEditorPaper({ ...editorPaper, title: value })}
                          />
                        </div>
                        <CompactInput
                          label="Duration (min)"
                          type="number"
                          value={String(editorPaper?.durationMinutes ?? "")}
                          onChange={(value) => updateEditorPaper({ ...editorPaper, durationMinutes: Number(value || 0) })}
                        />
                        <CompactInput
                          label="Total Marks"
                          type="number"
                          value={String(editorPaper?.totalMarks ?? "")}
                          onChange={(value) => updateEditorPaper({ ...editorPaper, totalMarks: Number(value || 0) })}
                        />
                        <div className="flex items-end">
                          <button
                            onClick={() => setShowAddQuestionModal(true)}
                            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                          >
                            + Add Question
                          </button>
                        </div>
                      </div>
                    ) : isFullTest ? (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto">
                          <button
                            onClick={() => setSelectedSubjectFilter("")}
                            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                              !selectedSubjectFilter ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            All ({questions.length})
                          </button>
                          {uniqueSubjectsInQuestions.map((subject: string) => {
                            const count = questions.filter((q: any) => q.subject === subject).length;
                            return (
                              <button
                                key={subject}
                                onClick={() => setSelectedSubjectFilter(subject)}
                                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                                  selectedSubjectFilter === subject ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {subject} ({count})
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => setShowAddQuestionModal(true)}
                          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          + Add Question
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setShowAddQuestionModal(true)}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          + Add Question
                        </button>
                      </div>
                    )}

                    {selectedPaper?.paperType?.toLowerCase().includes("sample") && (
                      <div className="mb-2 rounded-lg border border-slate-200 bg-white">
                        <button
                          onClick={() => setInstructionsCollapsed(!instructionsCollapsed)}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
                        >
                          <span>Instructions ({editorPaper?.instructions?.length || 0})</span>
                          <span className={`transform transition-transform ${instructionsCollapsed ? "rotate-180" : ""}`}>
                            ▼
                          </span>
                        </button>
                        {!instructionsCollapsed && (
                          <div className="border-t border-slate-100 px-4 pb-4">
                            <div className="space-y-3 pt-2">
                              {(editorPaper?.instructions || []).map((inst: any, idx: number) => (
                                <div key={idx} className="flex gap-3">
                                  <input
                                    value={inst.sequenceNum || ""}
                                    onChange={(e) => {
                                      const next = [...(editorPaper.instructions || [])];
                                      next[idx] = { ...next[idx], sequenceNum: e.target.value };
                                      updateEditorPaper({ ...editorPaper, instructions: next });
                                    }}
                                    placeholder="Order"
                                    className="w-20 rounded border border-slate-200 px-3 py-2 text-sm"
                                  />
                                  <input
                                    value={inst.instruction || ""}
                                    onChange={(e) => {
                                      const next = [...(editorPaper.instructions || [])];
                                      next[idx] = { ...next[idx], instruction: e.target.value };
                                      updateEditorPaper({ ...editorPaper, instructions: next });
                                    }}
                                    placeholder="Instruction text"
                                    className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm"
                                  />
                                  <button
                                    onClick={() => {
                                      if (!confirm("Remove this instruction?")) return;
                                      const next = (editorPaper.instructions || []).filter((_: any, i: number) => i !== idx);
                                      updateEditorPaper({ ...editorPaper, instructions: next });
                                    }}
                                    className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => updateEditorPaper({ ...editorPaper, instructions: [...(editorPaper.instructions || []), { sequenceNum: "", instruction: "" }] })}
                                className="text-sm font-semibold text-indigo-600 hover:underline"
                              >
                                + Add instruction
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 pt-0">
                    <div className="space-y-3">
                      {filteredQuestions.map((question: any, index: number) => (
                        <CompactQuestionCard
                          key={`${question.id || index}-${index}`}
                          question={question}
                          index={index}
                          updateQuestion={updateQuestion}
                          removeQuestion={removeQuestion}
                          selectedPaper={selectedPaper}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
                {selectedSubjectFilter ? (
                  <>
                    <span>Showing: {filteredQuestions.length} of {questions.length}</span>
                    <button onClick={() => setSelectedSubjectFilter("")} className="text-indigo-600 hover:underline">
                      (Clear filter)
                    </button>
                  </>
                ) : (
                  <>
                    <span>Total: {questions.length}</span>
                    {Object.entries(questionCounts).map(([type, count]) => (
                      <span key={type} className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                        {type}: {count}
                      </span>
                    ))}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={deletePaper}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={savePaper}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Add Question</h3>
            <p className="mb-4 text-sm text-slate-600">Select the type of question you want to add:</p>
            {selectedPaper?.paperType?.toLowerCase().includes("sample") ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addQuestion("mcq")}
                  className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">MCQ</div>
                  <div className="text-xs text-slate-500">Multiple choice with options</div>
                </button>
                <button
                  onClick={() => addQuestion("subjective")}
                  className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Subjective</div>
                  <div className="text-xs text-slate-500">Open ended question</div>
                </button>
                <button
                  onClick={() => addQuestion("caseStudy")}
                  className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Case Study</div>
                  <div className="text-xs text-slate-500">Passage with sub-questions</div>
                </button>
                {/* <button
                  onClick={() => addQuestion("map")}
                  className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Map Based</div>
                  <div className="text-xs text-slate-500">Map/image based question</div>
                </button> */}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addQuestion("mcq")}
                  className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">MCQ</div>
                  <div className="text-xs text-slate-500">Single correct answer</div>
                </button>
                <button
                  onClick={() => addQuestion("numerical")}
                  className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Numerical</div>
                  <div className="text-xs text-slate-500">Numeric answer input</div>
                </button>
                <button
                  onClick={() => addQuestion("multiCorrect")}
                  className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Multi Correct</div>
                  <div className="text-xs text-slate-500">Multiple correct options</div>
                </button>
                <button
                  onClick={() => addQuestion("matchList")}
                  className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Match List</div>
                  <div className="text-xs text-slate-500">Match two lists</div>
                </button>
                <button
                  onClick={() => addQuestion("matchListOptionFormat")}
                  className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Match List (Option Format)</div>
                  <div className="text-xs text-slate-500">Matrix match with options</div>
                </button>
                <button
                  onClick={() => addQuestion("caseStudy")}
                  className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Case Study</div>
                  <div className="text-xs text-slate-500">Passage with sub-questions</div>
                </button>
              </div>
            )}
            <button
              onClick={() => setShowAddQuestionModal(false)}
              className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDeleteRangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Delete Papers by Date Range</h3>
            <p className="mb-4 text-sm text-slate-600">Select the date range to delete test papers:</p>
            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">From Date</label>
                <input
                  type="date"
                  value={deleteRangeFrom}
                  onChange={(e) => setDeleteRangeFrom(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">To Date</label>
                <input
                  type="date"
                  value={deleteRangeTo}
                  onChange={(e) => setDeleteRangeTo(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteRangeModal(false);
                  setDeleteRangeFrom("");
                  setDeleteRangeTo("");
                }}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={deletePapersByDateRange}
                disabled={deletingByRange}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingByRange ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        Loading generated papers...
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
      <Filter className="mx-auto size-8 text-slate-300" />
      <p className="mt-4 text-lg font-bold text-slate-700">No generated papers found</p>
      <p className="mt-1 text-sm font-medium text-slate-400">
        Try changing the filters or refresh the paper library.
      </p>
    </div>
  );
}

function BlankEditorState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-10 text-center">
      <div className="rounded-full bg-slate-100 p-5 text-slate-400">
        <Pencil className="size-8" />
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-800">Open a generated paper</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Select any paper from the grouped library to inspect metadata,
          questions, instructions, and the raw paper JSON.
        </p>
      </div>
    </div>
  );
}

function CompactInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400"
      />
    </label>
  );
}

function CompactQuestionCard({
  question,
  index,
  updateQuestion,
  removeQuestion,
  selectedPaper,
}: {
  question: any;
  index: number;
  updateQuestion: (index: number, updater: (question: any) => any) => void;
  removeQuestion: (index: number) => void;
  selectedPaper: PaperDetail | null;
}) {
  const qType = question.qType || question.type || "mcq";
  const isSample = selectedPaper?.paperType?.toLowerCase().includes("sample");

  return (
    <div id={`question-${question.id}`} className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-slate-900 px-2 py-1 text-xs font-bold uppercase text-white">
            Q{index + 1}
          </span>
          <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-bold uppercase text-indigo-700">
            {qType}
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeQuestion(index)}
          className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <input
          value={String(question.id ?? "")}
          onChange={(e) => updateQuestion(index, (c) => ({ ...c, id: e.target.value }))}
          placeholder="Question ID"
          className="col-span-1 rounded border border-slate-200 px-3 py-2 text-sm"
        />
        {!selectedPaper?.paperType?.toLowerCase().includes("sample") && (
          <input
            value={question.subject || ""}
            onChange={(e) => updateQuestion(index, (c) => ({ ...c, subject: e.target.value }))}
            placeholder="Subject"
            className="col-span-1 rounded border border-slate-200 px-3 py-2 text-sm"
          />
        )}
      </div>

      <textarea
        value={question.question || ""}
        onChange={(e) => updateQuestion(index, (c) => ({ ...c, question: e.target.value }))}
        placeholder="Question text..."
        className="mb-3 w-full rounded border border-slate-200 px-3 py-2.5 text-sm"
        rows={3}
      />

      {qType === "mcq" && (
        <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 text-xs font-bold uppercase text-slate-500">Options (A-D)</div>
          <div className="space-y-2">
            {(question.options || []).map((opt: string, optIdx: number) => (
              <div key={optIdx} className="flex items-center gap-2">
                <span className="w-6 rounded bg-slate-200 px-1.5 py-1 text-xs font-bold text-slate-700">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <input
                  value={opt}
                  onChange={(e) => {
                    const next = [...(question.options || [])];
                    next[optIdx] = e.target.value;
                    updateQuestion(index, (c) => ({ ...c, options: next }));
                  }}
                  className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">Correct Answer Index (0-3):</label>
            <input
              value={String(question.correctAnswerIndex ?? 0)}
              onChange={(e) => updateQuestion(index, (c) => ({ ...c, correctAnswerIndex: Number(e.target.value || 0) }))}
              type="number"
              min="0"
              max="3"
              className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
            />
          </div>
        </div>
      )}

      {qType === "numerical" && (
        <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 text-xs font-bold uppercase text-slate-500">Numerical Answer</div>
          <input
            value={question.correctAnswer || ""}
            onChange={(e) => updateQuestion(index, (c) => ({ ...c, correctAnswer: e.target.value }))}
            placeholder="Enter correct numerical answer..."
            className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      )}

      {qType === "multiCorrect" && (
        <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 text-xs font-bold uppercase text-slate-500">Options (Select all correct)</div>
          <div className="space-y-2">
            {(question.options || []).map((opt: string, optIdx: number) => (
              <div key={optIdx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(question.correctAnswerIndices || []).includes(optIdx)}
                  onChange={(e) => {
                    const current = question.correctAnswerIndices || [];
                    const next = e.target.checked
                      ? [...current, optIdx]
                      : current.filter((i: number) => i !== optIdx);
                    updateQuestion(index, (c) => ({ ...c, correctAnswerIndices: next }));
                  }}
                  className="size-4 rounded"
                />
                <span className="w-5 rounded bg-slate-200 px-1.5 py-0.5 text-xs font-bold text-slate-700">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <input
                  value={opt}
                  onChange={(e) => {
                    const next = [...(question.options || [])];
                    next[optIdx] = e.target.value;
                    updateQuestion(index, (c) => ({ ...c, options: next }));
                  }}
                  className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Correct indices: {JSON.stringify(question.correctAnswerIndices || [])}
          </div>
        </div>
      )}

      {qType === "matchList" && (
        <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-3 text-xs font-bold uppercase text-slate-500">Match List (Column A ↔ Column B)</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-2 text-xs font-semibold text-slate-600">List A</div>
              {(question.listA || ["", ""]).map((item: string, i: number) => (
                <input
                  key={i}
                  value={item}
                  onChange={(e) => {
                    const next = [...(question.listA || ["", ""])];
                    next[i] = e.target.value;
                    updateQuestion(index, (c) => ({ ...c, listA: next }));
                  }}
                  placeholder={`A${i + 1}`}
                  className="mb-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                />
              ))}
              <button
                onClick={() => updateQuestion(index, (c) => ({ ...c, listA: [...(c.listA || ["", ""]), ""] }))}
                className="text-xs text-indigo-600 hover:underline"
              >
                + Add item
              </button>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold text-slate-600">List B</div>
              {(question.listB || ["", ""]).map((item: string, i: number) => (
                <input
                  key={i}
                  value={item}
                  onChange={(e) => {
                    const next = [...(question.listB || ["", ""])];
                    next[i] = e.target.value;
                    updateQuestion(index, (c) => ({ ...c, listB: next }));
                  }}
                  placeholder={`P${i + 1}`}
                  className="mb-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                />
              ))}
              <button
                onClick={() => updateQuestion(index, (c) => ({ ...c, listB: [...(c.listB || ["", ""]), ""] }))}
                className="text-xs text-indigo-600 hover:underline"
              >
                + Add item
              </button>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-2 text-xs font-semibold text-slate-600">Correct Matches (format: A1-P1, A2-P2)</div>
            <input
              value={JSON.stringify(question.correctMatches || [])}
              onChange={(e) => {
                try {
                  updateQuestion(index, (c) => ({ ...c, correctMatches: JSON.parse(e.target.value) }));
                } catch {}
              }}
              placeholder='[{"listAIndex": 0, "listBIndex": 0}, ...]'
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>
      )}

      {qType === "matchListOptionFormat" && (
        <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-3 text-xs font-bold uppercase text-slate-500">Match List (Option Format)</div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="mb-2 text-xs font-semibold text-slate-600">List I (A, B, C, D)</div>
              {(question.listI || ["", "", "", ""]).map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="w-6 text-xs font-bold text-slate-500">{String.fromCharCode(65 + i)}</span>
                  <input
                    value={item}
                    onChange={(e) => {
                      const next = [...(question.listI || ["", "", "", ""])];
                      next[i] = e.target.value;
                      updateQuestion(index, (c) => ({ ...c, listI: next }));
                    }}
                    className="flex-1 rounded border border-slate-200 px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold text-slate-600">List II (P, Q, R, S)</div>
              {(question.listII || ["", "", "", ""]).map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="w-6 text-xs font-bold text-slate-500">{String.fromCharCode(80 + i)}</span>
                  <input
                    value={item}
                    onChange={(e) => {
                      const next = [...(question.listII || ["", "", "", ""])];
                      next[i] = e.target.value;
                      updateQuestion(index, (c) => ({ ...c, listII: next }));
                    }}
                    className="flex-1 rounded border border-slate-200 px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mb-2 text-xs font-semibold text-slate-600">Options (A-D)</div>
          {(question.options || ["", "", "", ""]).map((opt: string, optIdx: number) => (
            <div key={optIdx} className="flex items-center gap-2 mb-1">
              <span className="w-5 rounded bg-slate-200 px-1.5 py-0.5 text-xs font-bold text-slate-700">
                {String.fromCharCode(65 + optIdx)}
              </span>
              <input
                value={opt}
                onChange={(e) => {
                  const next = [...(question.options || ["", "", "", ""])];
                  next[optIdx] = e.target.value;
                  updateQuestion(index, (c) => ({ ...c, options: next }));
                }}
                placeholder='(P)→(1) (Q)→(2) (R)→(3) (S)→(4)'
                className="flex-1 rounded border border-slate-200 px-2 py-1.5 text-sm"
              />
            </div>
          ))}
          <div className="mt-3 flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">Correct Option (0-3):</label>
            <input
              value={String(question.correctIndex ?? 0)}
              onChange={(e) => updateQuestion(index, (c) => ({ ...c, correctIndex: Number(e.target.value || 0) }))}
              type="number"
              min="0"
              max="3"
              className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
            />
          </div>
        </div>
      )}

      {qType === "caseStudy" && (
        <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          {!isSample && <>
            <div className="mb-3 text-xs font-bold uppercase text-slate-500">Case Study</div>
            <textarea
              value={question.passage || ""}
              onChange={(e) => updateQuestion(index, (c) => ({ ...c, passage: e.target.value }))}
              placeholder="Passage text..."
              className="mb-3 w-full rounded border border-slate-200 px-3 py-2.5 text-sm"
              rows={4}
            />
          </>}
          <div className="mb-2 text-xs font-semibold text-slate-600">Sub-Questions</div>
          {(question.subQuestions || []).map((subQ: any, subIdx: number) => (
            <div key={subIdx} className="mb-3 rounded border border-slate-200 bg-white p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Sub-Q {subIdx + 1}</span>
                <button
                  onClick={() => {
                    if (!confirm("Remove this sub-question?")) return;
                    const next = (question.subQuestions || []).filter((_: any, i: number) => i !== subIdx);
                    updateQuestion(index, (c) => ({ ...c, subQuestions: next }));
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
              <input
                value={subQ.question || ""}
                onChange={(e) => {
                  const next = [...(question.subQuestions || [])];
                  next[subIdx] = { ...next[subIdx], question: e.target.value };
                  updateQuestion(index, (c) => ({ ...c, subQuestions: next }));
                }}
                placeholder="Sub-question text..."
                className="mb-2 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
              />
              <div className="flex gap-1">
                {(subQ.options || ["", "", "", ""]).map((opt: string, optIdx: number) => (
                  <input
                    key={optIdx}
                    value={opt}
                    onChange={(e) => {
                      const next = [...(question.subQuestions || [])];
                      const newOptions = [...(subQ.options || ["", "", "", ""])];
                      newOptions[optIdx] = e.target.value;
                      next[subIdx] = { ...next[subIdx], options: newOptions };
                      updateQuestion(index, (c) => ({ ...c, subQuestions: next }));
                    }}
                    placeholder={String.fromCharCode(65 + optIdx)}
                    className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs"
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-500">Correct:</span>
                <input
                  value={String(subQ.correctAnswerIndex ?? "")}
                  onChange={(e) => {
                    const next = [...(question.subQuestions || [])];
                    next[subIdx] = { ...next[subIdx], correctAnswerIndex: Number(e.target.value || 0) };
                    updateQuestion(index, (c) => ({ ...c, subQuestions: next }));
                  }}
                  type="number"
                  min="0"
                  max="3"
                  placeholder="0-3"
                  className="w-16 rounded border border-slate-200 px-2 py-1 text-xs"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => updateQuestion(index, (c) => ({ ...c, subQuestions: [...(c.subQuestions || []), { id: `sub${(c.subQuestions?.length || 0) + 1}`, question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }] }))}
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            + Add Sub-Question
          </button>
        </div>
      )}

      {/* {qType === "subjective" && (
        <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 text-xs font-bold uppercase text-slate-500">Subjective Answer</div>
          <textarea
            value={question.correctAnswer || ""}
            onChange={(e) => updateQuestion(index, (c) => ({ ...c, correctAnswer: e.target.value }))}
            placeholder="Enter the correct answer text..."
            className="w-full rounded border border-slate-200 px-3 py-2.5 text-sm"
            rows={3}
          />
        </div>
      )} */}

      {qType === "map" && (
        <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 text-xs font-bold uppercase text-slate-500">Map Based Options</div>
          <div className="space-y-2">
            {(question.options || []).map((opt: string, optIdx: number) => (
              <div key={optIdx} className="flex items-center gap-2">
                <span className="w-6 rounded bg-slate-200 px-1.5 py-1 text-xs font-bold text-slate-700">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <input
                  value={opt}
                  onChange={(e) => {
                    const next = [...(question.options || [])];
                    next[optIdx] = e.target.value;
                    updateQuestion(index, (c) => ({ ...c, options: next }));
                  }}
                  className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">Correct Answer Index (0-3):</label>
            <input
              value={String(question.correctAnswerIndex ?? 0)}
              onChange={(e) => updateQuestion(index, (c) => ({ ...c, correctAnswerIndex: Number(e.target.value || 0) }))}
              type="number"
              min="0"
              max="3"
              className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
            />
          </div>
        </div>
      )}

      {qType !== "subjective" && (<div className="mt-3 border-t border-slate-100 pt-3">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            value={question.hint || ""}
            onChange={(e) => updateQuestion(index, (c) => ({ ...c, hint: e.target.value }))}
            placeholder="Hint (optional)..."
            className="rounded border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={question.section || ""}
            onChange={(e) => updateQuestion(index, (c) => ({ ...c, section: e.target.value }))}
            placeholder="Section (optional)..."
            className="rounded border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <textarea
          value={question.explanation || ""}
          onChange={(e) => updateQuestion(index, (c) => ({ ...c, explanation: e.target.value }))}
          placeholder="Explanation (optional)..."
          className="w-full rounded border border-slate-200 px-3 py-2.5 text-sm text-slate-600"
          rows={2}
        />
      </div>)}
    </div>
  );
}

function PaperPreview({
  paper,
  questions,
  selectedPaper,
}: {
  paper: any;
  questions: any[];
  selectedPaper: PaperDetail | null;
}) {
  const isSample = selectedPaper?.paperType?.toLowerCase().includes("sample");

  const uniqueSubjectsInQuestions = useMemo(() => {
    const subjectsSet = new Set<string>();
    questions.forEach((q: any) => {
      if (q.subject) subjectsSet.add(q.subject);
    });
    return Array.from(subjectsSet).sort();
  }, [questions]);

  const uniqueSectionsInQuestions = useMemo(() => {
    const sectionsSet = new Set<string>();
    questions.forEach((q: any) => {
      if (q.section) sectionsSet.add(q.section);
    });
    return Array.from(sectionsSet).sort();
  }, [questions]);

  const isMultiSubject = uniqueSubjectsInQuestions.length > 1;

  if (!paper) return null;

  if (isSample) {
    return (
      <div className="h-full w-full overflow-y-auto bg-white">
        <PaperFormat data={paper} language={selectedPaper?.language || undefined} />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-50 relative overflow-hidden">
      <TestEnvironment
        questions={questions}
        onSubmit={() => {}}
        isReview={true}
        testData={paper}
        title={getDisplayTitle(selectedPaper, paper)}
        examType={selectedPaper?.exam_type}
        grade={selectedPaper?.class}
        isFullSyllabus={isMultiSubject}
        subjects={isMultiSubject ? uniqueSubjectsInQuestions : (selectedPaper?.subject ? [selectedPaper.subject] : [])}
        questionSections={uniqueSectionsInQuestions.length > 0 ? uniqueSectionsInQuestions : null}
      />
    </div>
  );
}
