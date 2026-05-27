import mongoose, { Schema } from "mongoose";

export interface ISection {
  assignment: mongoose.Types.ObjectId;
  name: string;
  instructions: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const SectionSchema = new Schema<ISection>(
  {
    assignment:   { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    name:         { type: String, required: true },
    instructions: { type: String, default: "" },
    order:        { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

SectionSchema.index({ assignment: 1, order: 1 });

export const Section = mongoose.model<ISection>("Section", SectionSchema);
