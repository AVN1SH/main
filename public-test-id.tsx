"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Loader2, Users, Trophy, Clock, FileText } from "lucide-react";
import { TestEnvironment } from "@/components/test/TestEnvironment";
import { isAuthenticated } from "@/utils/cookieUtils";
import { useRouter } from "nextjs-toploader/app";

export default function PublicTestPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [studentAttempt, setStudentAttempt] = useState<any>(null);
  const [submited, setSubmited] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const router = useRouter();

  // For students giving name if not logged in
  const [studentName, setStudentName] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  // For owner viewing student attempt
  const [viewingAttempt, setViewingAttempt] = useState<any>(null);

  useEffect(() => {
    const fetchTest = async () => {
      const guestId = localStorage.getItem("guestId") || "";
      try {
        const res = await axios.post(`/api/share-test/${id}`, {
          guestId,
          page: currentPage,
          limit: 10,
        });
        if (res.data.success) {
          setTestData(res.data.data);
          setIsOwner(res.data.isOwner);
          setPagination(res.data.pagination);

          if (res.data.studentAttempt) {
            setStudentAttempt(res.data.studentAttempt);
            setHasStarted(true);
          }
          if (res.data.migrate) {
            const guestId = localStorage.getItem("guestId") || "";
            if (guestId) {
              localStorage.removeItem("guestId");
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTest();
    setSubmited(false);
  }, [id, submited, currentPage]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 w-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-800">Test Not Found</h1>
        <p className="text-slate-500 mt-2">
          This shared test might have been removed or doesn't exist.
        </p>
      </div>
    );
  }

  // Parse paperJson
  const paper =
    typeof testData.paperJson === "string"
      ? JSON.parse(testData.paperJson)
      : testData.paperJson;
  // Render Owner Dashboard
  if (isOwner) {
    if (viewingAttempt) {
      return (
        <div className="h-screen w-full relative">
          <button
            onClick={() => setViewingAttempt(null)}
            className="absolute top-[62px] md:top-17 left-4 z-50 bg-white px-4 py-[2px] md:py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            ← <span className="hidden sm:block">Go Back</span>
          </button>
          <TestEnvironment
            questions={paper.questions}
            subjects={paper.subjects}
            isFullSyllabus={paper.isFullSyllabus}
            scoring={paper.scoring}
            timerConfig={paper.timerConfig}
            examType={testData.exam_type}
            grade={testData.class}
            initialState={{
              isSubmitted: true,
              userAnswers: viewingAttempt.userAnswers,
              results: viewingAttempt.results,
              timeTaken: viewingAttempt.timeTaken,
            }}
            onSubmit={() => {}}
            disableHint={true}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8 w-full">
        <button
          onClick={() => router.replace("/sarthaks-ai/my-tests")}
          className="fixed top-[18px] md:top-4 left-5 z-50 bg-white px-4 py-[2px] md:py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2"
        >
          ← <span className="hidden md:block">Go Back</span>
        </button>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                {testData.title}
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded flex items-center gap-1">
                  Teacher View
                </span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium">
                {testData.subject} • {testData.class}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Total Attempts
              </span>
              <span className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Users size={20} className="text-slate-400" />
                {pagination?.totalAttempts || 0}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-800">
                  Leaderboard & Results
                </h2>
              </div>
            </div>
            {testData.attempts?.length === 0 ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-4">
                <Users size={48} className="opacity-20" />
                <p className="font-medium text-lg">
                  No one has attempted this test yet.
                </p>
                <p className="text-sm">
                  Share the link with students and their results will appear
                  here.
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {testData.attempts
                    ?.sort(
                      (a: any, b: any) =>
                        (b.results?.score || 0) - (a.results?.score || 0),
                    )
                    .map((attempt: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500">
                            {(pagination?.page - 1 || 0) *
                              (pagination?.limit || 10) +
                              idx +
                              1}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                              {attempt.studentName}
                              {attempt.studentId && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest leading-none">
                                  Registered
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 font-medium">
                              {new Date(attempt.submittedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 sm:gap-8 w-full justify-between md:justify-end">
                          <div className="flex flex-col items-center sm:items-end">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                              Score
                            </span>
                            <div className="flex items-center gap-1.5 font-bold">
                              <Trophy
                                size={16}
                                className={
                                  idx === 0
                                    ? "text-amber-500"
                                    : "text-slate-300"
                                }
                              />
                              <span
                                className={
                                  attempt.results?.score > 0
                                    ? "text-emerald-600 text-lg"
                                    : "text-slate-600 text-lg"
                                }
                              >
                                {attempt.results?.score || 0}
                              </span>
                              <span className="text-slate-400 text-sm">
                                / {attempt.results?.maxScore || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center sm:items-end">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                              Time Taken
                            </span>
                            <div className="flex items-center gap-1.5 font-bold text-slate-600 text-sm">
                              <Clock size={14} />
                              <span>
                                {attempt.timeTaken
                                  ? `${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s`
                                  : "-"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setViewingAttempt(attempt)}
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-indigo-100 shadow-sm"
                          >
                            View Test
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-t border-slate-100 bg-slate-50">
                    {/* Page Status */}
                    <span className="text-sm font-medium text-slate-600 text-center sm:text-left">
                      Page {pagination.page} of {pagination.totalPages}{" "}
                      {/* <span className="hidden xs:inline">•</span>{" "}
                      <br className="xs:hidden" /> {pagination.totalAttempts}{" "}
                      total attempts */}
                    </span>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm sm:font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="hidden sm:inline">← Previous</span>
                        <span className="sm:hidden">←</span>
                      </button>

                      {/* Page Numbers - Hidden on mobile if there are too many */}
                      <div className="hidden md:flex items-center gap-1">
                        {Array.from(
                          { length: pagination.totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                              currentPage === page
                                ? "bg-indigo-600 text-white"
                                : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(pagination.totalPages, currentPage + 1),
                          )
                        }
                        disabled={currentPage === pagination.totalPages}
                        className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm sm:font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="hidden sm:inline">Next →</span>
                        <span className="sm:hidden">→</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Start Page for non-owners (students)
  if (!hasStarted && !studentAttempt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 w-full">
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200 shadow-2xl shadow-indigo-100/50 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 border border-indigo-100 shadow-inner">
            <FileText size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {testData.title}
          </h1>
          <p className="text-slate-500 text-sm mb-8 font-medium bg-slate-50 inline-block px-3 py-1 rounded-full">
            {paper.questions?.length || 0} Questions • Shared Test
          </p>

          <div className="space-y-5">
            <div className="text-left">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">
                Your Full Name
              </label>
              <input
                className="mt-1 w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder:text-slate-300"
                placeholder="e.g. Rahul Sharma"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <p className="text-[11px] font-medium mt-2 pl-1 bg-amber-50/50 p-2 rounded-lg text-amber-600/80 border border-amber-100/50">
                The teacher will identify your submission using this name.
                Please use your real name.
              </p>
            </div>
            <button
              onClick={() => {
                if (studentName.trim().length > 0) setHasStarted(true);
              }}
              disabled={studentName.trim().length === 0}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50 transition-all shadow-md group mt-4 flex items-center justify-center gap-2 text-lg"
            >
              Start Test
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (submitData: any) => {
    try {
      if (submitData.isSubmitted) {
        setStudentAttempt({
          results: submitData.results,
          userAnswers: submitData.userAnswers,
          timeTaken: submitData.timeTaken,
        });

        if (isAuthenticated()) {
          await axios.post("/api/share-test/submit", {
            shareId: id,
            studentName: studentName.trim() || "Anonymous",
            guestId: null,
            results: submitData.results,
            userAnswers: submitData.userAnswers,
            timeTaken: submitData.timeTaken,
          });
        } else {
          const guestId =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          localStorage.setItem("guestId", guestId);
          await axios.post("/api/share-test/submit", {
            shareId: id,
            studentName: studentName.trim() || "Anonymous",
            guestId: guestId,
            results: submitData.results,
            userAnswers: submitData.userAnswers,
            timeTaken: submitData.timeTaken,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    setSubmited(true);
  };

  return (
    <div className="h-screen w-full relative">
      <TestEnvironment
        questions={paper.questions}
        subjects={paper.subjects}
        isFullSyllabus={paper.isFullSyllabus}
        scoring={paper.scoring}
        timerConfig={paper.timerConfig}
        examType={testData.exam_type}
        grade={testData.class}
        initialState={{
          isSubmitted: !!studentAttempt,
          userAnswers: studentAttempt?.userAnswers,
          results: studentAttempt?.results,
          timeTaken: studentAttempt?.timeTaken,
          timerEnabled: true, // Always ON
          showHint: false, // Always OFF
          isPreferencesSaved: true,
        }}
        onSubmit={handleSubmit}
        disableHint={true}
        isPublicTest={true}
        testData={testData}
        questionSections={paper.questionSections ?? null}
      />
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);
