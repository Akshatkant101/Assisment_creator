import mongoose, { Schema } from "mongoose";

export type AssignmentStatus = "draft" | "generating" | "completed" | "failed";

export interface IContextFile {
  fileName: string;
  fileUrl:  string;
  mimeType: string;
}

export interface IQuestionTypeDetail {
  type:  string;
  count: number;
  marks: number;
}

export interface IAssignment {
  title:               string;
  subject?:            string;
  gradeLevel?:         string;
  teacher:             mongoose.Types.ObjectId;
  dueDate:             Date;
  assignedDate:        Date;
  totalMarks:          number;
  questionTypes:       string[];
  questionTypeDetails: IQuestionTypeDetail[];
  numberOfQuestions:   number;
  difficulty:          string;
  additionalInstructions: string;
  status:              AssignmentStatus;
  jobId?:              string;
  contextText?:        string;
  contextFiles:        IContextFile[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ContextFileSchema = new Schema<IContextFile>(
  {
    fileName: { type: String, required: true },
    fileUrl:  { type: String, required: true },
    mimeType: { type: String, required: true },
  },
  { _id: false }
);

const QuestionTypeDetailSchema = new Schema<IQuestionTypeDetail>(
  {
    type:  { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title:      { type: String, required: true, trim: true },
    subject:    { type: String, trim: true, default: "" },
    gradeLevel: { type: String, trim: true, default: "" },
    teacher:     { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate:     { type: Date, required: true },
    assignedDate:{ type: Date, required: true, default: () => new Date() },
    totalMarks:        { type: Number, required: true, min: 1 },
    questionTypes:     { type: [String], required: true },
    questionTypeDetails: { type: [QuestionTypeDetailSchema], default: [] },
    numberOfQuestions: { type: Number, required: true, min: 1 },
    difficulty:        { type: String, required: true, default: "Mixed" },
    additionalInstructions: { type: String, default: "" },
    status:  { type: String, enum: ["draft", "generating", "completed", "failed"], default: "draft" },
    jobId:   { type: String },
    contextText:  { type: String },
    contextFiles: { type: [ContextFileSchema], default: [] },
  },
  { timestamps: true }
);

AssignmentSchema.index({ teacher: 1, createdAt: -1 });
AssignmentSchema.index({ status: 1 });

export const Assignment = mongoose.model<IAssignment>("Assignment", AssignmentSchema);
