import { create } from "zustand";
import API_URL from "@/lib/api";

export const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Answer Questions",
  "Long Answer Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Fill in the Blanks",
  "True/False",
];

export interface QuestionTypeEntry {
  type: string;
  count: number;
  marks: number;
}

export type JobStatus = "idle" | "generating" | "completed" | "failed";

interface FormErrors {
  title?: string;
  subject?: string;
  gradeLevel?: string;
  dueDate?: string;
  questionTypes?: string;
  general?: string;
}

interface AssignmentFormState {
  // Form fields
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: string;
  questionTypes: QuestionTypeEntry[];
  additionalInstructions: string;
  contextFile: File | null;
  contextFileName: string;
  isDragging: boolean;

  // Submission / job state
  isSubmitting: boolean;
  jobId: string | null;
  jobStatus: JobStatus;
  generatedAssignmentId: string | null;

  // Validation
  errors: FormErrors;

  // Actions
  setTitle: (t: string) => void;
  setSubject: (s: string) => void;
  setGradeLevel: (g: string) => void;
  setDueDate: (date: string) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateType: (index: number, type: string) => void;
  incrementCount: (index: number) => void;
  decrementCount: (index: number) => void;
  incrementMarks: (index: number) => void;
  decrementMarks: (index: number) => void;
  setAdditionalInstructions: (text: string) => void;
  setContextFile: (file: File | null, fileName: string) => void;
  setIsDragging: (b: boolean) => void;
  clearError: (field: keyof FormErrors) => void;
  validate: () => boolean;
  reset: () => void;
  submitForm: (clerkId: string) => Promise<string | null>;

  // WebSocket
  connectSocket: (jobId: string) => void;
  disconnectSocket: () => void;
  setJobStatus: (status: JobStatus) => void;
  setGeneratedAssignmentId: (id: string) => void;
}

const DEFAULT_STATE = {
  title: "",
  subject: "",
  gradeLevel: "",
  dueDate: "",
  questionTypes: [{ type: "Multiple Choice Questions", count: 5, marks: 2 }],
  additionalInstructions: "",
  contextFile: null,
  contextFileName: "",
  isDragging: false,
  isSubmitting: false,
  jobId: null,
  jobStatus: "idle" as JobStatus,
  generatedAssignmentId: null,
  errors: {},
};

let _socket: import("socket.io-client").Socket | null = null;

export const useAssignmentStore = create<AssignmentFormState>((set, get) => ({
  ...DEFAULT_STATE,

  setTitle: (title) => set((s) => ({ title, errors: { ...s.errors, title: undefined } })),
  setSubject: (subject) => set((s) => ({ subject, errors: { ...s.errors, subject: undefined } })),
  setGradeLevel: (gradeLevel) => set((s) => ({ gradeLevel, errors: { ...s.errors, gradeLevel: undefined } })),

  setDueDate: (date) =>
    set((s) => ({ dueDate: date, errors: { ...s.errors, dueDate: undefined } })),

  addQuestionType: () =>
    set((s) => {
      const used = s.questionTypes.map((q) => q.type);
      const next = QUESTION_TYPE_OPTIONS.find((o) => !used.includes(o)) ?? QUESTION_TYPE_OPTIONS[0];
      return {
        questionTypes: [...s.questionTypes, { type: next, count: 3, marks: 1 }],
        errors: { ...s.errors, questionTypes: undefined },
      };
    }),

  removeQuestionType: (index) =>
    set((s) => ({ questionTypes: s.questionTypes.filter((_, i) => i !== index) })),

  updateType: (index, type) =>
    set((s) => ({
      questionTypes: s.questionTypes.map((q, i) => (i === index ? { ...q, type } : q)),
    })),

  incrementCount: (index) =>
    set((s) => ({
      questionTypes: s.questionTypes.map((q, i) =>
        i === index ? { ...q, count: q.count + 1 } : q
      ),
    })),

  decrementCount: (index) =>
    set((s) => ({
      questionTypes: s.questionTypes.map((q, i) =>
        i === index ? { ...q, count: Math.max(1, q.count - 1) } : q
      ),
    })),

  incrementMarks: (index) =>
    set((s) => ({
      questionTypes: s.questionTypes.map((q, i) =>
        i === index ? { ...q, marks: q.marks + 1 } : q
      ),
    })),

  decrementMarks: (index) =>
    set((s) => ({
      questionTypes: s.questionTypes.map((q, i) =>
        i === index ? { ...q, marks: Math.max(1, q.marks - 1) } : q
      ),
    })),

  setAdditionalInstructions: (text) => set({ additionalInstructions: text }),

  setContextFile: (file, fileName) => set({ contextFile: file, contextFileName: fileName }),

  setIsDragging: (b) => set({ isDragging: b }),

  clearError: (field) =>
    set((s) => ({ errors: { ...s.errors, [field]: undefined } })),

  validate: () => {
    const { title, subject, gradeLevel, dueDate, questionTypes } = get();
    const errors: FormErrors = {};

    if (!title.trim()) errors.title = "Title is required";
    if (!subject.trim()) errors.subject = "Subject is required";
    if (!gradeLevel.trim()) errors.gradeLevel = "Class is required";

    if (!dueDate) {
      errors.dueDate = "Due date is required";
    } else if (new Date(dueDate) <= new Date()) {
      errors.dueDate = "Due date must be in the future";
    }

    if (questionTypes.length === 0) {
      errors.questionTypes = "Add at least one question type";
    }

    for (const qt of questionTypes) {
      if (qt.count < 1) {
        errors.questionTypes = "Number of questions must be at least 1";
        break;
      }
      if (qt.marks < 1) {
        errors.questionTypes = "Marks must be at least 1";
        break;
      }
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  reset: () => set(DEFAULT_STATE),

  submitForm: async (clerkId) => {
    const { title, subject, gradeLevel, dueDate, questionTypes, additionalInstructions } = get();
    set({ isSubmitting: true, errors: {} });

    const totalQuestions = questionTypes.reduce((s, q) => s + q.count, 0);
    const totalMarks = questionTypes.reduce((s, q) => s + q.count * q.marks, 0);
    const types = questionTypes.map((q) => q.type);

    try {
      const res = await fetch(`${API_URL}/api/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId,
          title,
          subject,
          gradeLevel,
          dueDate,
          totalMarks,
          questionTypes: types,
          questionTypeDetails: questionTypes,
          numberOfQuestions: totalQuestions,
          additionalInstructions,
          status: "draft",
        }),
      });

      if (!res.ok) throw new Error("Failed to create assignment");

      const data = await res.json();
      set({ jobId: data._id, jobStatus: "generating", isSubmitting: false });

      // Kick off AI generation
      await fetch(`${API_URL}/api/assignments/${data._id}/generate`, { method: "POST" });

      // Connect socket for real-time updates
      get().connectSocket(data._id);
      return data._id;
    } catch (err) {
      set({
        isSubmitting: false,
        errors: { general: "Something went wrong. Please try again." },
      });
      return null;
    }
  },

  connectSocket: async (jobId) => {
    if (_socket?.connected) return;

    const { io } = await import("socket.io-client");
    _socket = io(API_URL, { transports: ["websocket", "polling"] });

    _socket.on("connect", () => {
      _socket?.emit("join-job", jobId);
    });

    _socket.on("job:completed", (data: { assignmentId: string }) => {
      set({ jobStatus: "completed", generatedAssignmentId: data.assignmentId });
    });

    _socket.on("job:failed", () => {
      set({ jobStatus: "failed" });
    });

    _socket.on("job:progress", (data: { status: JobStatus }) => {
      set({ jobStatus: data.status });
    });
  },

  disconnectSocket: () => {
    _socket?.disconnect();
    _socket = null;
  },

  setJobStatus: (status) => set({ jobStatus: status }),
  setGeneratedAssignmentId: (id) => set({ generatedAssignmentId: id }),
}));
