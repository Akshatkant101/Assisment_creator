import mongoose, { Schema } from "mongoose";

export interface IUser {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subject?: string;
  classLevel?: string;
  school?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId:   { type: String, required: true, unique: true },
    email:     { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName:  { type: String },
    subject:   { type: String },
    classLevel:{ type: String },
    school:    { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
