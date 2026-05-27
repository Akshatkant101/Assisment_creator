"use client";

import { useUser } from "@clerk/nextjs";
import { Search, MoreVertical, Plus, ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "@/lib/api";

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  assignedDate: string;
  dueDate: string;
  status: string;
  totalMarks: number;
  numberOfQuestions: number;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilterChips, setShowFilterChips] = useState(false);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/api/assignments/${id}`, { method: "DELETE" });
      setAssignments(assignments.filter(a => a._id !== id));
      setOpenMenu(null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { setLoading(false); return; }

    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      sessionStorage.setItem("hasSeenWelcome", "true");
      setTimeout(() => setShowWelcome(false), 4000);
    }

    fetch(`${API_URL}/api/users/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      }),
    })
      .then(() => fetch(`${API_URL}/api/assignments?clerkId=${user.id}`))
      .then((r) => r.json())
      .then((data) => setAssignments(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoaded, user]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB").replace(/\//g, "-");

  const filtered = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-full relative">

      {/* ── Welcome Banner (desktop only) ─────────────────────────── */}
      <div
        className={`hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-100 text-gray-800 px-6 py-3.5 rounded-full shadow-xl transform transition-all duration-700 ease-out items-center gap-3 ${
          showWelcome ? "translate-y-0 opacity-100 scale-100" : "-translate-y-10 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-lg">👋</div>
        <span className="font-semibold text-sm">
          Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split("@")[0]}!
        </span>
      </div>

      {/* ════════════════════════════════════════════════════════════
          DESKTOP LAYOUT
      ════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
          <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Assignments</h2>
        </div>
        <p className="text-sm text-gray-400 font-medium mb-8 pl-6">
          Manage and create assignments for your classes.
        </p>

        {/* Desktop Filter + Search */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center w-full bg-white border border-gray-200 rounded-full shadow-sm max-w-full">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Search Assignment"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-6 py-2.5 bg-transparent text-[13px] font-medium placeholder:text-gray-400 focus:outline-none transition-all rounded-full"
              />
            </div>
          </div>
          {/* Desktop status chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {["all", "completed", "generating", "failed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                  statusFilter === s
                    ? "bg-[#303030] text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-[1.25rem] border border-gray-100 h-[160px] animate-pulse">
                <div className="h-5 bg-gray-100 rounded-full w-2/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded-full w-1/3 mb-2" />
                <div className="mt-auto pt-8 flex justify-between">
                  <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <img src="/No_assignment.svg" alt="No assignments" className="w-64 h-64 mb-2 pointer-events-none" />
            <h3 className="text-gray-800 font-bold text-lg mb-2">No assignments yet</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 pb-24">
            {filtered.map((a) => (
              <div
                key={a._id}
                onClick={() => a.status === "completed" && (window.location.href = `/dashboard/assignment/${a._id}`)}
                className={`bg-white p-5 rounded-[1.25rem] shadow-sm border border-gray-100 flex flex-col justify-between h-[130px] hover:shadow-md hover:border-gray-200 transition-all group ${a.status === "completed" ? "cursor-pointer" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0 mr-2">
                    <h3 className="text-xl font-extrabold text-gray-800 tracking-tight truncate">{a.title}</h3>
                    {a.subject && (
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{a.subject} · {a.gradeLevel}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      a.status === "completed" ? "bg-green-100 text-green-700" :
                      a.status === "generating" ? "bg-orange-100 text-orange-700" :
                      a.status === "failed" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === a._id ? null : a._id); }}
                        className="text-gray-300 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors relative z-50"
                      >
                        <MoreVertical size={20} />
                      </button>
                      {openMenu === a._id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenMenu(null); }} />
                          <div className="absolute right-0 top-8 bg-white border border-gray-100 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] rounded-xl w-40 py-2 z-50 animate-in fade-in zoom-in duration-200">
                            <button
                              onClick={(e) => { e.stopPropagation(); window.location.href = `/dashboard/assignment/${a._id}`; }}
                              className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 font-semibold"
                            >
                              View Assignment
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, a._id)}
                              className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-xs font-bold text-gray-900">
                    Assigned on : <span className="text-gray-500 font-medium">{fmt(a.assignedDate)}</span>
                  </p>
                  <p className="text-xs font-bold text-gray-900">
                    Due : <span className="text-gray-500 font-medium">{fmt(a.dueDate)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desktop FAB */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 ml-[140px] z-50">
          <a href="/dashboard/create" className="bg-[#1a1a1a] hover:bg-black text-white px-7 py-3.5 rounded-full flex items-center gap-2 shadow-2xl shadow-black/30 transition-transform hover:scale-105 active:scale-95">
            <Plus size={20} />
            <span className="font-semibold text-sm tracking-wide">Create Assignment</span>
          </a>
        </div>

        {/* Desktop fade */}
        <div className="fixed bottom-0 left-[300px] right-0 h-16 bg-gradient-to-t from-[#f4f4f5] to-transparent pointer-events-none z-20" />
      </div>

      {/* ════════════════════════════════════════════════════════════
          MOBILE LAYOUT
      ════════════════════════════════════════════════════════════ */}
      <div className="md:hidden">

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-5 mt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/75 rounded-3xl p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded-full w-2/3 mb-8" />
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 rounded-full w-1/3" />
                  <div className="h-3 bg-gray-200 rounded-full w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Mobile Empty State ── */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center">
            <img
              src="/No_assignment.svg"
              alt="No assignments"
              className="w-[220px] h-[220px] mb-3 pointer-events-none"
            />
            <h3
              className="font-bold text-[#303030] mb-3"
              style={{ fontSize: "20px", lineHeight: "140%", letterSpacing: "-0.04em" }}
            >
              No assignments yet
            </h3>
            <p
              className="text-center px-6"
              style={{
                fontSize: "16px",
                lineHeight: "140%",
                letterSpacing: "-0.04em",
                color: "rgba(94,94,94,0.8)",
              }}
            >
              Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
            </p>
          </div>
        )}

        {/* ── Mobile Filled State ── */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-6">

            {/* Page header row: back arrow + Assignments title */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <ArrowLeft size={20} className="text-[#303030]" />
              </button>

              <span
                className="font-bold text-[#303030]"
                style={{
                  fontSize: "16px",
                  lineHeight: "140%",
                  letterSpacing: "-0.04em",
                }}
              >
                Assignments
              </span>

              {/* Spacer to balance the back button */}
              <div className="w-12 flex-shrink-0" />
            </div>

            {/* Search + Filter card */}
            <div className="flex flex-col gap-2">
              <div className="bg-white rounded-2xl flex items-center justify-between px-4 h-16">
                {/* Filter button */}
                <button
                  onClick={() => setShowFilterChips((v) => !v)}
                  className="flex items-center gap-1 flex-shrink-0"
                >
                  <SlidersHorizontal
                    size={20}
                    className={statusFilter !== "all" ? "text-[#303030]" : "text-[#A9A9A9]"}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      lineHeight: "140%",
                      letterSpacing: "-0.04em",
                      color: statusFilter !== "all" ? "#303030" : "#A9A9A9",
                      fontWeight: statusFilter !== "all" ? 600 : 400,
                    }}
                  >
                    Filter{statusFilter !== "all" ? ` · ${statusFilter}` : ""}
                  </span>
                </button>

                {/* Search pill */}
                <div
                  className="flex items-center gap-3 flex-1 ml-4 px-4 py-2.5 rounded-full"
                  style={{ border: "1px solid rgba(0,0,0,0.2)" }}
                >
                  <Search size={20} className="text-[#A9A9A9] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent outline-none flex-1 min-w-0"
                    style={{
                      fontSize: "14px",
                      lineHeight: "140%",
                      letterSpacing: "-0.04em",
                      color: "#303030",
                    }}
                  />
                </div>
              </div>

              {/* Filter chips (shown when filter is open) */}
              {showFilterChips && (
                <div className="flex items-center gap-2 flex-wrap px-1">
                  {["all", "completed", "generating", "failed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatusFilter(s);
                        setShowFilterChips(false);
                      }}
                      className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all"
                      style={{
                        background: statusFilter === s ? "#181818" : "rgba(255,255,255,0.75)",
                        color: statusFilter === s ? "#fff" : "#303030",
                      }}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assignment cards */}
            <div className="flex flex-col gap-5">
              {filtered.map((a) => (
                <div
                  key={a._id}
                  onClick={() => a.status === "completed" && (window.location.href = `/dashboard/assignment/${a._id}`)}
                  className={a.status === "completed" ? "cursor-pointer" : ""}
                >
                  {/* Card */}
                  <div
                    className="rounded-3xl p-5"
                    style={{
                      background: "rgba(255,255,255,0.75)",
                    }}
                  >
                    <div className="flex flex-col gap-8">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className="text-[#303030] font-bold flex-1 min-w-0"
                          style={{
                            fontSize: "18px",
                            lineHeight: "140%",
                            letterSpacing: "-0.04em",
                          }}
                        >
                          {a.title}
                        </h3>

                        {/* Three-dot menu */}
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === a._id ? null : a._id);
                            }}
                            className="text-[#303030] p-1"
                          >
                            <MoreVertical size={24} />
                          </button>
                          {openMenu === a._id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => { e.stopPropagation(); setOpenMenu(null); }}
                              />
                              <div className="absolute right-0 top-8 bg-white border border-gray-100 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] rounded-xl w-40 py-2 z-50 animate-in fade-in zoom-in duration-200">
                                <button
                                  onClick={(e) => { e.stopPropagation(); window.location.href = `/dashboard/assignment/${a._id}`; }}
                                  className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 font-semibold"
                                >
                                  View Assignment
                                </button>
                                <button
                                  onClick={(e) => handleDelete(e, a._id)}
                                  className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 font-semibold"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Dates row */}
                      <div className="flex gap-2.5">
                        <span style={{ fontSize: "16px", lineHeight: "120%", letterSpacing: "-0.04em", color: "rgba(0,0,0,0.5)" }}>
                          <strong>Assigned on</strong> : {fmt(a.assignedDate)}
                        </span>
                        <span style={{ fontSize: "16px", lineHeight: "120%", letterSpacing: "-0.04em", color: "rgba(0,0,0,0.5)" }}>
                          &nbsp;&nbsp;<strong>Due</strong> : {fmt(a.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile FAB — sits above the bottom nav */}
      <div className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <a
          href="/dashboard/create"
          className="flex items-center gap-2 bg-[#181818] text-white px-6 py-3 rounded-full shadow-2xl shadow-black/30 active:scale-95 transition-transform"
          style={{ boxShadow: "0px 16px 32px rgba(0,0,0,0.25)" }}
        >
          <Plus size={18} />
          <span className="font-semibold text-sm tracking-[-0.04em]">Create Assignment</span>
        </a>
      </div>
    </div>
  );
}
