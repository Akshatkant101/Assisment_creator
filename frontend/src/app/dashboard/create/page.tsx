"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useRef, useCallback, useEffect } from "react";
import { ArrowLeft, ArrowRight, Calendar, ChevronDown, Minus, Plus, X, Mic, UploadCloud, Loader2 } from "lucide-react";
import { useAssignmentStore, QUESTION_TYPE_OPTIONS } from "@/store/useAssignmentStore";

export default function CreateAssignmentPage() {
  const { user } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    title, setTitle,
    subject, setSubject,
    gradeLevel, setGradeLevel,
    dueDate, setDueDate,
    questionTypes, addQuestionType, removeQuestionType, updateType,
    incrementCount, decrementCount, incrementMarks, decrementMarks,
    additionalInstructions, setAdditionalInstructions,
    contextFileName, setContextFile,
    isDragging, setIsDragging,
    errors, validate, isSubmitting, submitForm,
  } = useAssignmentStore();

  useEffect(() => {
    if (user) {
      fetch(`http://127.0.0.1:5000/api/users/me?clerkId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            if (!subject && data.subject) setSubject(data.subject);
            if (!gradeLevel && data.classLevel) setGradeLevel(data.classLevel);
          }
        })
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totalQuestions = questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  const handleFile = useCallback(
    (file: File | null) => { if (file) setContextFile(file, file.name); },
    [setContextFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files[0] ?? null);
    },
    [handleFile, setIsDragging]
  );

  const handleNext = async () => {
    if (!validate()) return;
    if (!user) return;
    const id = await submitForm(user.id);
    if (id) router.push(`/dashboard/assignment/${id}`);
  };

  /* ── Shared form fields (rendered inside both desktop + mobile panels) ── */
  const formContent = (
    <>
      {/* Section header */}
      <div>
        <h2 className="text-[20px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
          Assignment Details
        </h2>
        <p className="text-[14px] text-[rgba(94,94,94,0.8)] font-normal tracking-[-0.04em] leading-[140%] mt-1 max-w-[251px]">
          Basic information about your assignment
        </p>
      </div>

      {/* ── 0. Basic Details ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[16px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
            Assignment Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Quiz on Electricity"
            className={`w-full px-4 py-[11px] rounded-full border-[1.25px] ${errors.title ? "border-red-400" : "border-[#DADADA]"} bg-transparent text-[16px] font-medium text-[#303030] outline-none tracking-[-0.04em]`}
          />
          {errors.title && <p className="text-sm text-red-500 tracking-[-0.04em]">{errors.title}</p>}
        </div>

        <div className="flex items-start gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-[16px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Science"
              className={`w-full px-4 py-[11px] rounded-full border-[1.25px] ${errors.subject ? "border-red-400" : "border-[#DADADA]"} bg-transparent text-[16px] font-medium text-[#303030] outline-none tracking-[-0.04em]`}
            />
            {errors.subject && <p className="text-sm text-red-500 tracking-[-0.04em]">{errors.subject}</p>}
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <label className="text-[16px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
              Class / Grade
            </label>
            <input
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="e.g. 10th Grade"
              className={`w-full px-4 py-[11px] rounded-full border-[1.25px] ${errors.gradeLevel ? "border-red-400" : "border-[#DADADA]"} bg-transparent text-[16px] font-medium text-[#303030] outline-none tracking-[-0.04em]`}
            />
            {errors.gradeLevel && <p className="text-sm text-red-500 tracking-[-0.04em]">{errors.gradeLevel}</p>}
          </div>
        </div>
      </div>

      {/* ── 1. File Upload ── */}
      <div className="flex flex-col gap-3">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={[
            "flex flex-col items-center gap-4 py-6 px-8 bg-[#F6F6F6] rounded-[24px]",
            "border-[1.75px] border-dashed cursor-pointer transition-colors select-none",
            isDragging ? "border-[#303030] bg-gray-50" : "border-black/20",
          ].join(" ")}
        >
          <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
            <UploadCloud size={20} className="text-[#5E5E5E]" />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-medium text-[#303030] tracking-[-0.04em] leading-[140%]">
              {contextFileName || "Choose a file or drag & drop it here"}
            </p>
            <p className="text-[14px] text-[#A9A9A9] font-normal tracking-[-0.04em] leading-[140%] mt-1">
              JPEG, PNG, upto 10MB
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="bg-white hover:bg-gray-100 transition-colors px-6 py-2 rounded-full text-[14px] font-medium text-[#303030] tracking-[-0.04em]"
          >
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.jpg,.jpeg,.png"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <p className="text-[16px] font-medium text-[rgba(48,48,48,0.6)] tracking-[-0.04em] leading-[140%]">
          Upload images of your preferred document/image
        </p>
      </div>

      {/* ── 2. Due Date ── */}
      <div className="flex flex-col gap-2">
        <label className="text-[16px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
          Due Date
        </label>
        <div className={[
          "flex items-center justify-between px-4 py-[11px] rounded-full border-[1.25px] bg-transparent",
          errors.dueDate ? "border-red-400" : "border-[#DADADA]",
        ].join(" ")}>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 text-[16px] font-medium text-[#303030] bg-transparent outline-none tracking-[-0.04em] cursor-pointer"
            style={{ colorScheme: "light" }}
          />
          <Calendar size={24} className="text-[#A9A9A9] flex-shrink-0 pointer-events-none" />
        </div>
        {errors.dueDate && (
          <p className="text-sm text-red-500 tracking-[-0.04em]">{errors.dueDate}</p>
        )}
      </div>

      {/* ── 3. Question Types ── */}
      <div className="flex flex-col gap-4">
        <label className="text-[16px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
          Question Type
        </label>

        {/* Desktop column headers */}
        {questionTypes.length > 0 && (
          <div className="hidden md:flex items-center gap-4">
            <div className="flex-1" />
            <p className="w-[148px] text-center text-[16px] font-medium text-[#303030] tracking-[-0.04em]">
              No. of Questions
            </p>
            <p className="w-[100px] text-center text-[16px] font-medium text-[#303030] tracking-[-0.04em]">
              Marks
            </p>
            <div className="w-8" />
          </div>
        )}

        {questionTypes.map((qt, i) => (
          <div key={i}>
            {/* ── Desktop: horizontal row ── */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex-1 relative">
                <select
                  value={qt.type}
                  onChange={(e) => updateType(i, e.target.value)}
                  className="w-full appearance-none px-4 py-[11px] bg-white rounded-full border-[1.25px] border-[#DADADA] text-[16px] font-medium text-[#303030] tracking-[-0.04em] outline-none pr-9 cursor-pointer"
                >
                  {QUESTION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#303030] pointer-events-none" />
              </div>
              <div className="w-[148px] flex items-center justify-between px-2 py-[11px] bg-white rounded-full border-[1.25px] border-[#DADADA]">
                <button type="button" onClick={() => decrementCount(i)} className="w-7 h-7 flex items-center justify-center text-[#303030] hover:bg-gray-100 rounded-full transition-colors">
                  <Minus size={16} />
                </button>
                <span className="text-[16px] font-medium text-[#303030] tracking-[-0.04em] min-w-[2.5ch] text-center">{qt.count}</span>
                <button type="button" onClick={() => incrementCount(i)} className="w-7 h-7 flex items-center justify-center text-[#303030] hover:bg-gray-100 rounded-full transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <div className="w-[100px] flex items-center justify-between px-2 py-[11px] bg-white rounded-full border-[1.25px] border-[#DADADA]">
                <button type="button" onClick={() => decrementMarks(i)} className="w-7 h-7 flex items-center justify-center text-[#303030] hover:bg-gray-100 rounded-full transition-colors">
                  <Minus size={16} />
                </button>
                <span className="text-[16px] font-medium text-[#303030] tracking-[-0.04em] min-w-[2ch] text-center">{qt.marks}</span>
                <button type="button" onClick={() => incrementMarks(i)} className="w-7 h-7 flex items-center justify-center text-[#303030] hover:bg-gray-100 rounded-full transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <button type="button" onClick={() => removeQuestionType(i)} className="w-8 h-8 flex items-center justify-center text-[#A9A9A9] hover:text-[#303030] hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                <X size={16} />
              </button>
            </div>

            {/* ── Mobile: vertical card ── */}
            <div className="md:hidden flex flex-col gap-3 bg-white rounded-3xl p-3">
              {/* Dropdown + X */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <select
                    value={qt.type}
                    onChange={(e) => updateType(i, e.target.value)}
                    className="w-full appearance-none px-4 py-[11px] bg-[#F6F6F6] rounded-full border-none text-[14px] font-medium text-[#303030] tracking-[-0.04em] outline-none pr-9 cursor-pointer"
                  >
                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#303030] pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestionType(i)}
                  className="w-8 h-8 flex items-center justify-center text-[#A9A9A9] hover:text-[#303030] flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Count + Marks */}
              <div className="flex gap-3 rounded-3xl p-2" style={{ background: "#F0F0F0" }}>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[14px] font-medium text-[#303030] tracking-[-0.04em]">No. of Questions</span>
                  <div className="flex items-center justify-between w-full px-2 py-2 bg-white rounded-full">
                    <button type="button" onClick={() => decrementCount(i)} className="w-6 h-6 flex items-center justify-center text-[#303030] hover:bg-gray-100 rounded-full">
                      <Minus size={14} />
                    </button>
                    <span className="text-[16px] font-medium text-[#303030] tracking-[-0.04em]">{qt.count}</span>
                    <button type="button" onClick={() => incrementCount(i)} className="w-6 h-6 flex items-center justify-center text-[#303030] hover:bg-gray-100 rounded-full">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[14px] font-medium text-[#303030] tracking-[-0.04em]">Marks</span>
                  <div className="flex items-center justify-between w-full px-2 py-2 bg-white rounded-full">
                    <button type="button" onClick={() => decrementMarks(i)} className="w-6 h-6 flex items-center justify-center text-[#303030] hover:bg-gray-100 rounded-full">
                      <Minus size={14} />
                    </button>
                    <span className="text-[16px] font-medium text-[#303030] tracking-[-0.04em]">{qt.marks}</span>
                    <button type="button" onClick={() => incrementMarks(i)} className="w-6 h-6 flex items-center justify-center text-[#303030] hover:bg-gray-100 rounded-full">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add question type */}
        <button type="button" onClick={addQuestionType} className="flex items-center gap-2 w-fit group">
          <div className="w-8 h-8 bg-[#2B2B2B] group-hover:bg-black rounded-full flex items-center justify-center transition-colors">
            <Plus size={14} className="text-white" />
          </div>
          <span className="text-[14px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
            Add Question Type
          </span>
        </button>

        {/* Totals */}
        {questionTypes.length > 0 && (
          <div className="flex flex-col items-end gap-2 mt-1">
            <span className="text-[16px] font-medium text-[#303030] tracking-[-0.04em] leading-[110%]">
              Total Questions :&nbsp;&nbsp;{totalQuestions}
            </span>
            <span className="text-[16px] font-medium text-[#303030] tracking-[-0.04em] leading-[110%]">
              Total Marks :&nbsp;&nbsp;{totalMarks}
            </span>
          </div>
        )}

        {errors.questionTypes && (
          <p className="text-sm text-red-500 tracking-[-0.04em]">{errors.questionTypes}</p>
        )}
      </div>

      {/* ── 4. Additional Instructions ── */}
      <div className="flex flex-col gap-2">
        <label className="text-[16px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
          Additional Information{" "}
          <span className="text-[#A9A9A9] font-normal">(For better output)</span>
        </label>
        <div className="bg-white/25 border-[1.25px] border-dashed border-[#DADADA] rounded-[16px] p-4 min-h-[102px] flex flex-col justify-between">
          <textarea
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="e.g Generate a question paper for 3 hour exam duration..."
            className="flex-1 w-full bg-transparent text-[14px] font-medium text-[#303030] placeholder:text-[rgba(48,48,48,0.6)] tracking-[-0.04em] leading-[140%] outline-none resize-none min-h-[60px]"
          />
          <div className="flex justify-end mt-2">
            <button type="button" className="w-9 h-9 bg-[#F0F0F0] hover:bg-gray-200 transition-colors rounded-full flex items-center justify-center">
              <Mic size={16} className="text-[#303030]" />
            </button>
          </div>
        </div>
      </div>

      {errors.general && (
        <p className="text-sm text-red-500 text-center tracking-[-0.04em]">{errors.general}</p>
      )}
    </>
  );

  /* ── Nav buttons (shared) ── */
  const navButtons = (
    <>
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1 bg-white hover:bg-gray-50 transition-colors px-6 py-3 rounded-full text-[16px] font-medium text-[#303030] tracking-[-0.04em] shadow-sm"
      >
        <ArrowLeft size={20} />
        Previous
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 bg-[#181818] hover:bg-black transition-all px-8 py-3.5 rounded-full text-[16px] font-semibold text-white tracking-[-0.04em] disabled:opacity-80 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer min-w-[140px]"
        style={{
          boxShadow: "0px 32px 48px rgba(0,0,0,0.2), 0px 16px 48px rgba(0,0,0,0.12)",
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span>Next</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </>
  );

  return (
    <div className="min-h-full py-2 relative">
      <div className="relative flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">

        {/* ════════════════════════════════
            DESKTOP LAYOUT
        ════════════════════════════════ */}
        <div className="hidden md:flex flex-col items-center w-full">
          {/* Desktop page header */}
          <div className="flex flex-col items-center gap-2 mb-8 w-full max-w-[810px]">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full bg-[#4BC26D] inline-block"
                style={{ boxShadow: "0 0 0 4px rgba(75,194,109,0.4)" }}
              />
              <h1 className="text-[20px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
                Create Assignment
              </h1>
            </div>
            <p className="text-[14px] font-normal tracking-[-0.04em] leading-[140%] text-center text-[rgba(94,94,94,0.55)]">
              Set up a new assignment for your students
            </p>
          </div>

          {/* Desktop form panel */}
          <div className="w-full max-w-[810px] bg-white rounded-[24px] p-6 flex flex-col gap-6 shadow-sm border border-gray-100">
            {formContent}
          </div>

          {/* Desktop nav buttons */}
          <div className="flex items-center justify-between w-full max-w-[810px] mt-8 mb-4">
            {navButtons}
          </div>
        </div>

        {/* ════════════════════════════════
            MOBILE LAYOUT
        ════════════════════════════════ */}
        <div className="md:hidden w-full flex flex-col gap-6">

          {/* Mobile page header row: back arrow + "Create Assignment" */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard")}
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
              style={{ fontSize: "16px", lineHeight: "140%", letterSpacing: "-0.04em" }}
            >
              Create Assignment
            </span>

            <div className="w-12 flex-shrink-0" />
          </div>

          {/* Mobile form card */}
          <div
            className="w-full rounded-[32px] flex flex-col gap-6 p-4"
            style={{ background: "rgba(255,255,255,0.5)" }}
          >
            {formContent}
          </div>

          {/* Mobile nav buttons */}
          <div className="flex items-center justify-between gap-3 mb-4">
            {navButtons}
          </div>
        </div>

      </div>
    </div>
  );
}
