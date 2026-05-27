"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assignment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ContextFileSchema = new mongoose_1.Schema({
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
}, { _id: false });
const QuestionTypeDetailSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
}, { _id: false });
const AssignmentSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    subject: { type: String, trim: true, default: "" },
    gradeLevel: { type: String, trim: true, default: "" },
    teacher: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    assignedDate: { type: Date, required: true, default: () => new Date() },
    totalMarks: { type: Number, required: true, min: 1 },
    questionTypes: { type: [String], required: true },
    questionTypeDetails: { type: [QuestionTypeDetailSchema], default: [] },
    numberOfQuestions: { type: Number, required: true, min: 1 },
    difficulty: { type: String, required: true, default: "Mixed" },
    additionalInstructions: { type: String, default: "" },
    status: { type: String, enum: ["draft", "generating", "completed", "failed"], default: "draft" },
    jobId: { type: String },
    contextText: { type: String },
    contextFiles: { type: [ContextFileSchema], default: [] },
}, { timestamps: true });
AssignmentSchema.index({ teacher: 1, createdAt: -1 });
AssignmentSchema.index({ status: 1 });
exports.Assignment = mongoose_1.default.model("Assignment", AssignmentSchema);
