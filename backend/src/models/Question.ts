import mongoose, { Schema } from "mongoose";

export type QuestionType = "MCQ" | "Short Answer" | "Long Answer" | "Fill in the Blank" | "True/False";
export type Difficulty   = "Easy" | "Moderate" | "Hard";

export interface IOption {
  label: string;
  text: string;
}

export interface IQuestion {
  assignment: mongoose.Types.ObjectId;
  section:    mongoose.Types.ObjectId;
  text:       string;
  type:       QuestionType;
  difficulty: Difficulty;
  marks:      number;
  order:      number;
  options:    IOption[];
  correctAnswer?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OptionSchema = new Schema<IOption>(
  { label: { type: String, required: true }, text: { type: String, required: true } },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    assignment: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    section:    { type: Schema.Types.ObjectId, ref: "Section",    required: true },
    text:       { type: String, required: true },
    type:       { type: String, enum: ["MCQ", "Short Answer", "Long Answer", "Fill in the Blank", "True/False"], required: true },
    difficulty: { type: String, enum: ["Easy", "Moderate", "Hard"], required: true },
    marks:      { type: Number, required: true, min: 0 },
    order:      { type: Number, required: true, default: 0 },
    options:    { type: [OptionSchema], default: [] },
    correctAnswer: { type: String },
  },
  { timestamps: true }
);

QuestionSchema.index({ assignment: 1, section: 1, order: 1 });

export const Question = mongoose.model<IQuestion>("Question", QuestionSchema);
