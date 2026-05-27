"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import API_URL from "@/lib/api";

interface Option  { label: string; text: string; }
interface Question {
  _id: string;
  text: string;
  type: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  marks: number;
  order: number;
  options: Option[];
  correctAnswer?: string;
}
interface Section {
  _id: string;
  name: string;
  instructions: string;
  order: number;
  questions: Question[];
}
interface AssignmentData {
  _id: string;
  title: string;
  subject?: string;
  gradeLevel?: string;
  dueDate: string;
  assignedDate: string;
  totalMarks: number;
  numberOfQuestions: number;
  difficulty: string;
  status: "draft" | "generating" | "completed" | "failed";
  sections: Section[];
}

type ViewMode = "paper" | "answers";

const DIFF_STYLE: Record<string, string> = {
  Easy:     "bg-green-100 text-green-700",
  Moderate: "bg-amber-100 text-amber-700",
  Hard:     "bg-red-100 text-red-600",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function GeneratingView({ message }: { message: string }) {
  const steps = ["Contacting AI...", "Generating questions...", "Saving to database..."];
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={28} className="text-orange-500 animate-spin" style={{ animationDirection: "reverse" }} />
        </div>
      </div>

      <div className="text-center">
        <p className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">Generating Your Paper</p>
        <p className="text-sm text-gray-400 font-medium">{message || "AI is crafting your questions…"}</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {steps.map((s, i) => {
          const active = message === s;
          const done   = steps.indexOf(message) > i;
          return (
            <div key={s} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? "bg-orange-50 border border-orange-200" : "bg-white border border-gray-100"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${done ? "bg-green-500 text-white" : active ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-sm font-semibold ${active ? "text-orange-700" : done ? "text-gray-500" : "text-gray-400"}`}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Failed view ──────────────────────────────────────────────────────────────
function FailedView({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <div className="text-center">
        <p className="text-xl font-extrabold text-gray-900 mb-1">Generation Failed</p>
        <p className="text-sm text-gray-400">Something went wrong. Check your API key or try again.</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-black transition-colors"
      >
        <RotateCcw size={16} />
        Retry Generation
      </button>
    </div>
  );
}

// ─── Exam paper view ──────────────────────────────────────────────────────────
function ExamPaperView({ data, view, setView }: { data: AssignmentData; view: ViewMode; setView: (v: ViewMode) => void }) {
  const totalTime = Math.max(30, data.numberOfQuestions * 3);

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 p-1">
          {(["paper", "answers"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${view === v ? "bg-[#1a1a1a] text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              {v === "paper" ? "Exam Paper" : "Answer Key"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-gray-600 border border-gray-200 bg-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Download size={15} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Paper */}
      <div className="bg-white rounded-[1.75rem] shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:rounded-none" id="exam-paper">
        {/* Header matching mockup */}
        <div className="px-10 pt-10 pb-6 text-black font-sans">
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-bold tracking-[-0.02em] mb-1.5">Delhi Public School, Sector-4, Bokaro</h1>
            <p className="text-[17px] font-semibold mb-1">Subject: {data.subject || "General"}</p>
            <p className="text-[17px] font-semibold">Class: {data.gradeLevel || "General"}</p>
          </div>

          <div className="flex justify-between items-center text-[15px] font-semibold mb-6">
            <span>Time Allowed: {totalTime} minutes</span>
            <span>Maximum Marks: {data.totalMarks}</span>
          </div>

          <p className="text-[15px] font-semibold mb-8">All questions are compulsory unless stated otherwise.</p>

          {view === "paper" && (
            <div className="flex flex-col gap-2.5 text-[15px] font-semibold mb-6">
              <div className="flex items-end">
                <span>Name: </span>
                <span className="border-b border-black w-48 inline-block ml-1 h-4" />
              </div>
              <div className="flex items-end">
                <span>Roll Number: </span>
                <span className="border-b border-black w-40 inline-block ml-1 h-4" />
              </div>
              <div className="flex items-end">
                <span>Class: {data.gradeLevel || ""} Section: </span>
                <span className="border-b border-black w-32 inline-block ml-1 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="px-10 py-8 space-y-10">
          {data.sections.map((section) => (
            <div key={section._id}>
              {/* Section header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-black text-center mb-6">{section.name}</h2>
                <h3 className="text-[15px] font-bold text-black mb-1">Short Answer Questions</h3>
                {section.instructions && (
                  <p className="text-[13px] text-gray-700 font-medium italic">{section.instructions}</p>
                )}
              </div>

              <div className="space-y-5">
                {section.questions.map((q, qi) => (
                  <div key={q._id} className="group">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-bold text-gray-700 mt-0.5 w-6 flex-shrink-0">{qi + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.text}</p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFF_STYLE[q.difficulty]}`}>
                              {q.difficulty}
                            </span>
                            <span className="text-[11px] font-bold text-gray-400">[{q.marks}m]</span>
                          </div>
                        </div>

                        {/* Options for MCQ / T-F */}
                        {q.options.length > 0 && view === "paper" && (
                          <div className="grid grid-cols-2 gap-1.5 mt-2">
                            {q.options.map((opt) => (
                              <div key={opt.label} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="font-bold text-gray-400 w-4 flex-shrink-0">{opt.label}.</span>
                                <span>{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Answer key mode */}
                        {view === "answers" && (
                          <div className="mt-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                            {q.options.length > 0 ? (
                              <p className="text-xs font-bold text-green-700">
                                Answer: {q.correctAnswer}
                                {q.options.find((o) => o.label === q.correctAnswer) && (
                                  <span className="font-medium text-green-600 ml-1">
                                    — {q.options.find((o) => o.label === q.correctAnswer)?.text}
                                  </span>
                                )}
                              </p>
                            ) : q.correctAnswer ? (
                              <p className="text-xs font-bold text-green-700">{q.correctAnswer}</p>
                            ) : (
                              <p className="text-xs text-green-500 italic">Subjective — see marking scheme</p>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [data, setData]         = useState<AssignmentData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [generating, setGen]    = useState(false);
  const [view, setView]         = useState<ViewMode>("paper");
  const pollRef                 = useRef<ReturnType<typeof setInterval> | null>(null);
  const forceTimerRef           = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (forceTimerRef.current) { clearTimeout(forceTimerRef.current); forceTimerRef.current = null; }
  };

  const fetchAndShow = async () => {
    stopPolling();
    const res = await fetch(`${API_URL}/api/assignments/${id}`).catch(() => null);
    if (res?.ok) {
      const json: AssignmentData = await res.json();
      // treat anything non-failed as showable
      setData({ ...json, status: json.status === "failed" ? "failed" : "completed" });
    }
    setGen(false);
  };

  const fetchData = async (): Promise<AssignmentData | undefined> => {
    try {
      const res = await fetch(`${API_URL}/api/assignments/${id}`);
      if (!res.ok) return undefined;
      const json: AssignmentData = await res.json();
      setData(json);
      return json;
    } catch {
      return undefined;
    }
  };

  const startPolling = () => {
    if (pollRef.current) return;
    // Poll every 4s; force-show after 30s regardless
    pollRef.current = setInterval(async () => {
      const d = await fetchData();
      if (d?.status === "completed" || d?.status === "failed") {
        stopPolling();
        setGen(false);
      }
    }, 4000);

    forceTimerRef.current = setTimeout(fetchAndShow, 10000);
  };

  const triggerGenerate = async () => {
    setGen(true);
    try {
      await fetch(`${API_URL}/api/assignments/${id}/generate`, { method: "POST" });
      setData((d) => d ? { ...d, status: "generating" } : d);
      startPolling();
    } catch {
      setData((d) => d ? { ...d, status: "failed" } : d);
      setGen(false);
    }
  };

  useEffect(() => {
    fetchData().then((d) => {
      setLoading(false);
      if (d?.status === "draft") {
        triggerGenerate();
      } else if (d?.status === "generating") {
        setGen(true);
        startPolling();
      }
    });

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="min-h-full relative">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-semibold mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Assignments
      </button>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-gray-300" />
        </div>
      ) : generating ? (
        <GeneratingView message="Generating your assignment…" />
      ) : !data ? (
        <div className="text-center py-24 text-gray-400">Assignment not found.</div>
      ) : data.status === "failed" ? (
        <FailedView onRetry={triggerGenerate} />
      ) : (
        <ExamPaperView data={data} view={view} setView={setView} />
      )}
    </div>
  );
}
