"use client";

import { useUser } from "@clerk/nextjs";
import { Search, MoreVertical, Plus } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [showWelcome, setShowWelcome] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`http://127.0.0.1:5000/api/assignments/${id}`, { method: "DELETE" });
      setAssignments(assignments.filter(a => a._id !== id));
      setOpenMenu(null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { setLoading(false); return; }

    // Welcome animation on first visit
    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      sessionStorage.setItem("hasSeenWelcome", "true");
      setTimeout(() => setShowWelcome(false), 4000);
    }

    // Sync user then fetch assignments
    fetch("http://127.0.0.1:5000/api/users/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      }),
    })
      .then(() =>
        fetch(`http://127.0.0.1:5000/api/assignments?clerkId=${user.id}`)
      )
      .then((r) => r.json())
      .then((data) => setAssignments(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoaded, user]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB").replace(/\//g, "-");

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full relative">

      {/* Welcome Banner */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-100 text-gray-800 px-6 py-3.5 rounded-full shadow-xl transform transition-all duration-700 ease-out flex items-center gap-3 ${
          showWelcome ? "translate-y-0 opacity-100 scale-100" : "-translate-y-10 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-lg">👋</div>
        <span className="font-semibold text-sm">
          Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split("@")[0]}!
        </span>
      </div>

      <div className="flex items-center gap-3 mb-1">
        <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
        <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Assignments</h2>
      </div>
      <p className="text-sm text-gray-400 font-medium mb-8 pl-6">
        Manage and create assignments for your classes.
      </p>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <button className="flex items-center gap-2 text-gray-500 text-sm font-semibold px-5 py-2.5 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filter By
        </button>
        <div className="relative flex-1 w-full max-w-xl ml-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search Assignment"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-[1.25rem] border border-gray-100 h-[160px] animate-pulse">
              <div className="h-5 bg-gray-100 rounded-full w-2/3 mb-3"></div>
              <div className="h-3 bg-gray-100 rounded-full w-1/3 mb-2"></div>
              <div className="mt-auto pt-8 flex justify-between">
                <div className="h-3 bg-gray-100 rounded-full w-1/3"></div>
                <div className="h-3 bg-gray-100 rounded-full w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Plus size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">No assignments yet</p>
          <p className="text-gray-400 text-sm mt-1">Click &quot;Create Assignment&quot; to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10 pb-8">
          {filtered.map((a) => (
            <div
              key={a._id}
              onClick={() => a.status === "completed" && (window.location.href = `/dashboard/assignment/${a._id}`)}
              className={`bg-white p-6 rounded-[1.25rem] shadow-sm border border-gray-100 flex flex-col justify-between h-[160px] hover:shadow-md hover:border-gray-200 transition-all group ${a.status === "completed" ? "cursor-pointer" : ""}`}
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
              </div>
              <div className="flex justify-between items-end mt-4">
                <p className="text-[13px] font-bold text-gray-900">
                  Assigned on: <span className="text-gray-500 font-medium">{fmt(a.assignedDate)}</span>
                </p>
                <p className="text-[13px] font-bold text-gray-900">
                  Due: <span className="text-gray-500 font-medium">{fmt(a.dueDate)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Create Button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 ml-[140px] z-50">
        <a href="/dashboard/create" className="bg-[#1a1a1a] hover:bg-black text-white px-7 py-3.5 rounded-full flex items-center gap-2 shadow-2xl shadow-black/30 transition-transform hover:scale-105 active:scale-95">
          <Plus size={20} />
          <span className="font-semibold text-sm tracking-wide">Create Assignment</span>
        </a>
      </div>

      {/* White fade at bottom */}
      <div className="fixed bottom-0 left-[300px] right-0 h-32 bg-gradient-to-t from-[#f4f4f5] to-transparent pointer-events-none z-20"></div>
    </div>
  );
}
