"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Filter, RotateCcw, Pencil, Eraser } from "lucide-react";
import { toast } from "sonner";

type SQPSummaryItem = {
  _id: {
    year: number;
    class: number;
    subject: string;
    exam_type: string;
  };
  questionCount: number;
};

type PYQSummaryItem = {
  _id: {
    sourceId: string;
    year: number;
    class: number;
    subject: string;
    exam_type: string;
  };
  chunkCount: number;
};

type SyllabusSummaryItem = {
  year: number;
  class: number;
  subject: string;
  exam_type: string;
  chapterCount: number;
};

type PreviewResponse = {
  sqp: SQPSummaryItem[];
  pyq: PYQSummaryItem[];
  syllabus: SyllabusSummaryItem[];
};

const formatSubject = (subject: string) => {
  if (!subject) return "-";
  return subject
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

// Normalize class/grade strings so spaces and underscores are interchangeable.
// "jee main", "jee_main", "JEE MAIN" all collapse to "jeemain".
const normalizeClass = (s: string) =>
  s.toLowerCase().replace(/[\s_]+/g, "");

// Extract the last underscore-separated segment from a sourceId (paper set label)
const extractPaperSet = (sourceId: string) => {
  if (!sourceId) return "-";
  const parts = sourceId.split("_");
  return parts[parts.length - 1] || sourceId;
};

export default function PreviewDataPage() {
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sqp" | "pyq" | "syllabus">("sqp");

  const [filters, setFilters] = useState({
    year: "",
    class: "",
    subject: "",
    examType: ""
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<"sqp" | "pyq" | "syllabus" | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get<PreviewResponse>("/api/private/preview");
      setData(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load preview data.");
      toast.error("Database sync failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (type: "sqp" | "pyq" | "syllabus", params: any) => {
    try {
      setLoadingDetails(true);
      setEditingType(type);
      setIsModalOpen(true);
      const queryParams = new URLSearchParams({ type, ...params });
      const res = await axios.get(`/api/private/details?${queryParams.toString()}`);
      setEditingData(res.data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdate = async (id: string, updatedData: any) => {
    try {
      setSavingId(id);
      await axios.patch("/api/private/details", {
        type: editingType,
        id: id,
        data: updatedData,
      });
      toast.success("Updated successfully", { id: "update-op" });
      setIsModalOpen(false);
      setEditingData(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error("Update failed.");
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (type: string, params: any, id: string) => {
      if (!confirm("Are you sure you want to delete this record?")) return;
      try {
          setDeletingId(id);
          toast.loading("Deleting...", { id: "delete-op" });
          const queryParams = new URLSearchParams({ type, ...params });
          await axios.delete(`/api/private/details?${queryParams.toString()}`);
          toast.success("Deleted successfully", { id: "delete-op" });
          fetchData();
      } catch (err) {
          toast.error("Delete failed", { id: "delete-op" });
      } finally {
          setDeletingId(null);
      }
  };

  const filteredSqp = data?.sqp?.filter(item => (
      (!filters.year || String(item._id.year).includes(filters.year)) &&
      (!filters.class || normalizeClass(String(item._id.class)).includes(normalizeClass(filters.class))) &&
      (!filters.subject || formatSubject(item._id.subject).toLowerCase().includes(filters.subject.toLowerCase())) &&
      (!filters.examType || item._id.exam_type.toLowerCase().includes(filters.examType.toLowerCase()))
  ));

  const filteredPyq = data?.pyq?.filter(item => (
    (!filters.year || String(item._id.year).includes(filters.year)) &&
    (!filters.class || normalizeClass(String(item._id.class)).includes(normalizeClass(filters.class))) &&
    (!filters.subject || formatSubject(item._id.subject).toLowerCase().includes(filters.subject.toLowerCase())) &&
    (!filters.examType || item._id.exam_type.toLowerCase().includes(filters.examType.toLowerCase()))
));

  const filteredSyllabus = data?.syllabus?.filter(item => (
    (!filters.year || String(item.year).includes(filters.year)) &&
    (!filters.class || normalizeClass(String(item.class)).includes(normalizeClass(filters.class))) &&
    (!filters.subject || formatSubject(item.subject).toLowerCase().includes(filters.subject.toLowerCase())) &&
    (!filters.examType || item.exam_type.toLowerCase().includes(filters.examType.toLowerCase()))
));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Database <span className="text-indigo-600">Preview</span>
          </h1>
          <p className="text-slate-500 font-medium">Browse and manage data extracted into the system.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchData} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all">
                <RotateCcw className="size-4 text-slate-600" />
            </button>
            {/* <button className="flex items-center gap-2 px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-xl transition-all">
                <Download className="size-4" />
                Export CSV
            </button> */}
        </div>
      </header>

      {loading && (
        <div className="p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold">Loading database preview...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-red-600 font-bold">{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm text-red-700 underline">Try again</button>
        </div>
      )}

      {!loading && !error && (
        <>
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit">
          {[
              { id: "sqp", label: "Sample Papers", icon: <svg className="size-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
              { id: "pyq", label: "Previous Year (PYQ)", icon: <svg className="size-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg> },
              { id: "syllabus", label: "Syllabus Structure", icon: <svg className="size-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                    activeTab === tab.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                  {tab.icon}
                  {tab.label}
              </button>
          ))}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Year</label>
              <input 
                type="text" 
                placeholder="2024" 
                value={filters.year} 
                onChange={e => setFilters(f => ({...f, year: e.target.value}))}
                className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold w-32 focus:ring-2 focus:ring-indigo-500"
              />
          </div>
          <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Class</label>
              <input 
                type="text" 
                placeholder="12th" 
                value={filters.class}
                onChange={e => setFilters(f => ({...f, class: e.target.value}))}
                className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold w-32 focus:ring-2 focus:ring-indigo-500"
              />
          </div>
          <div className="space-y-2 flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Subject</label>
              <input 
                type="text" 
                placeholder="Search subject..." 
                value={filters.subject}
                onChange={e => setFilters(f => ({...f, subject: e.target.value}))}
                className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
              />
          </div>
          <button onClick={() => setFilters({year: "", class: "", subject: "", examType: ""})} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
              <Eraser className="size-4" />
          </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
              <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Context</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Count</th>
                      <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                  {activeTab === "sqp" && filteredSqp?.map((item, i) => (
                      <TableRow 
                        key={i} 
                        title={`SQP ${item._id.year}`} 
                        subtitle={formatSubject(item._id.subject)}
                        context={`${item._id.class} | ${item._id.exam_type}`}
                        count={item.questionCount}
                        onDelete={() => handleDelete("sqp", { year: item._id.year, grade: item._id.class, subject: item._id.subject, examType: item._id.exam_type }, JSON.stringify(item._id))}
                        type="SQP"
                        deleting={deletingId === JSON.stringify(item._id)}
                      />
                  ))}
                   {activeTab === "pyq" && filteredPyq?.map((item, i) => (
                      <TableRow 
                        key={i} 
                        title={extractPaperSet(item._id.sourceId)} 
                        subtitle={formatSubject(item._id.subject)}
                        context={`${item._id.year} | ${item._id.class}`}
                        count={item.chunkCount}
                        onDelete={() => handleDelete("pyq", { sourceId: item._id.sourceId }, item._id.sourceId)}
                        type="PYQ"
                        deleting={deletingId === item._id.sourceId}
                      />
                  ))}
                   {activeTab === "syllabus" && filteredSyllabus?.map((item, i) => (
                      <SyllabusTableRow 
                        key={i} 
                        title={`Syllabus ${item.year}`} 
                        subtitle={formatSubject(item.subject)}
                        context={`${item.class} | ${item.exam_type}`}
                        count={item.chapterCount}
                        onEdit={() => fetchDetails("syllabus", { year: item.year, grade: item.class, subject: item.subject, examType: item.exam_type })}
                        onDelete={() => handleDelete("syllabus", { year: item.year, grade: item.class, subject: item.subject, examType: item.exam_type }, `${item.year}-${item.class}-${item.subject}`)}
                        deleting={deletingId === `${item.year}-${item.class}-${item.subject}`}
                      />
                  ))}
              </tbody>
          </table>
          {((activeTab === "sqp" && !filteredSqp?.length) || (activeTab === "pyq" && !filteredPyq?.length) || (activeTab === "syllabus" && !filteredSyllabus?.length)) && (
              <div className="p-20 text-center space-y-4">
                  <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <Filter className="size-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold">No data matches your criteria</p>
              </div>
          )}
      </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 capitalize">
                Edit {editingType} Details
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingData(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-20 text-slate-500">
                  Loading details...
                </div>
              ) : (
                <div className="space-y-8">
                  {editingType === "syllabus" && editingData && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                            Year
                          </label>
                          <input
                            type="number"
                            value={editingData.year}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                year: Number(e.target.value),
                              })
                            }
                            className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                            Class
                          </label>
                          <input
                            type="text"
                            value={editingData.class}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                class: e.target.value,
                              })
                            }
                            className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Chapters & Weightage
                        </label>
                        {editingData.chapter_weightage?.map(
                          (chap: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-4 items-end">
                              <div className="flex items-center w-full gap-4">
                                <div className="flex-1">
                                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                                    Chapter Name
                                  </label>
                                  <input
                                    type="text"
                                    value={chap.chapter}
                                    onChange={(e) => {
                                      const newWeightage = [
                                        ...editingData.chapter_weightage,
                                      ];
                                      newWeightage[idx].chapter = e.target.value;
                                      setEditingData({
                                        ...editingData,
                                        chapter_weightage: newWeightage,
                                      });
                                    }}
                                    className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                                  />
                                </div>
                                <div className="w-32">
                                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                                    Weightage
                                  </label>
                                  <input
                                    type="number"
                                    value={chap.weightage}
                                    onChange={(e) => {
                                      const newWeightage = [
                                        ...editingData.chapter_weightage,
                                      ];
                                      newWeightage[idx].weightage = Number(
                                        e.target.value,
                                      );
                                      setEditingData({
                                        ...editingData,
                                        chapter_weightage: newWeightage,
                                      });
                                    }}
                                    className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 w-full">
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                                  Description
                                </label>
                                <textarea
                                  value={chap.description || ""}
                                  onChange={(e) => {
                                    const newWeightage = [
                                      ...editingData.chapter_weightage,
                                    ];
                                    newWeightage[idx].description = e.target.value;
                                    setEditingData({
                                      ...editingData,
                                      chapter_weightage: newWeightage,
                                    });
                                  }}
                                  className="w-full p-2 text-sm border border-slate-200 rounded-lg h-20"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const newWeightage =
                                    editingData.chapter_weightage.filter(
                                      (_: any, i: number) => i !== idx,
                                    );
                                  setEditingData({
                                    ...editingData,
                                    chapter_weightage: newWeightage,
                                  });
                                }}
                                className="p-2 text-red-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2
                                  className="w-5 h-5"
                                />
                              </button>
                            </div>
                          ),
                        )}
                        <button
                          onClick={() => {
                            setEditingData({
                              ...editingData,
                              chapter_weightage: [
                                ...editingData.chapter_weightage,
                                { chapter: "", weightage: 0, description: "" },
                              ],
                            });
                          }}
                          className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-amber-400 hover:text-amber-600 transition-all text-sm font-medium"
                        >
                          + Add Chapter
                        </button>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          disabled={savingId === editingData._id}
                          onClick={() =>
                            handleUpdate(editingData._id || `${editingData.year}-${editingData.class}-${editingData.subject}`, editingData)
                          }
                          className="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20 disabled:opacity-50"
                        >
                          {savingId === editingData._id
                            ? "Saving..."
                            : "Save Syllabus Changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TableRow({ title, subtitle, context, count, onDelete, type, deleting }: any) {
    return (
        <tr className="group hover:bg-slate-50/50 transition-all">
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {type}
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 truncate max-w-[200px]">{title}</p>
                        <p className="text-xs font-bold text-slate-500">{subtitle}</p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-5 text-center">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {context}
                </span>
            </td>
            <td className="px-8 py-5 text-right font-black text-slate-900 tabular-nums">
                {count}
            </td>
            <td className="px-8 py-5">
                <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={onDelete} 
                      disabled={deleting}
                      className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all disabled:opacity-50"
                    >
                        {deleting ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        ) : (
                            <Trash2 className="size-4" />
                        )}
                    </button>
                </div>
            </td>
        </tr>
    )
}

function SyllabusTableRow({ title, subtitle, context, count, onEdit, onDelete, deleting }: any) {
    return (
        <tr className="group hover:bg-slate-50/50 transition-all">
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center text-[10px] font-black group-hover:bg-amber-600 group-hover:text-white transition-all">
                        SYL
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 truncate max-w-[200px]">{title}</p>
                        <p className="text-xs font-bold text-slate-500">{subtitle}</p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-5 text-center">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {context}
                </span>
            </td>
            <td className="px-8 py-5 text-right font-black text-slate-900 tabular-nums">
                {count}
            </td>
            <td className="px-8 py-5">
                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={onEdit}
                      className="p-2 hover:bg-amber-50 rounded-lg text-slate-400 hover:text-amber-600 transition-all"
                    >
                        <Pencil className="size-4" />
                    </button>
                    <button 
                      onClick={onDelete} 
                      disabled={deleting}
                      className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all disabled:opacity-50"
                    >
                        {deleting ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        ) : (
                            <Trash2 className="size-4" />
                        )}
                    </button>
                </div>
            </td>
        </tr>
    )
}
