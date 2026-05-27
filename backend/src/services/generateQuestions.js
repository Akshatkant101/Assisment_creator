"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAssignment = generateAssignment;
const genai_1 = require("@google/genai");
const Assignment_1 = require("../models/Assignment");
const Section_1 = require("../models/Section");
const Question_1 = require("../models/Question");
const socket_1 = require("../socket");
function buildPrompt(assignment) {
    const typesBlock = assignment.questionTypeDetails
        .map((d) => `  - ${d.type}: ${d.count} questions × ${d.marks} mark(s) each`)
        .join("\n");
    const contextBlock = assignment.contextText
        ? `\nContext / Study Material:\n${assignment.contextText}\n`
        : "";
    const instrBlock = assignment.additionalInstructions
        ? `\nAdditional Instructions: ${assignment.additionalInstructions}`
        : "";
    return `You are an expert teacher creating an exam paper. Generate a complete, high-quality exam paper strictly following the specifications below.

Subject: ${assignment.subject || "General"}
Grade: ${assignment.gradeLevel || "General"}
Topic: ${assignment.title}
Total Marks: ${assignment.totalMarks}
Total Questions: ${assignment.numberOfQuestions}
Overall Difficulty: ${assignment.difficulty}
${instrBlock}${contextBlock}

Question Type Breakdown:
${typesBlock}

Rules:
1. Create one Section per question type (Section A, B, C, ...).
2. Each section must contain EXACTLY the specified number of questions for that type.
3. For MCQ: provide exactly 4 options labelled A, B, C, D. Set correctAnswer to the label (e.g. "B").
4. For Fill in the Blank: set correctAnswer to the word/phrase that fills the blank.
5. For True/False: options must be [{"label":"A","text":"True"},{"label":"B","text":"False"}]. correctAnswer is "A" or "B".
6. For Short Answer and Long Answer: options = [], correctAnswer = "".
7. Difficulty must be exactly one of: "Easy", "Moderate", "Hard" — distribute them sensibly across the section.
8. Questions must be factually correct, clear, and appropriate for the grade level.
9. Return ONLY valid JSON — no markdown, no code fences, no explanation.

Return JSON in this exact schema:
{
  "sections": [
    {
      "name": "Section A – Multiple Choice",
      "instructions": "Choose the correct answer. Each question carries 1 mark.",
      "questions": [
        {
          "text": "...",
          "type": "MCQ",
          "difficulty": "Easy",
          "marks": 1,
          "options": [{"label":"A","text":"..."},{"label":"B","text":"..."},{"label":"C","text":"..."},{"label":"D","text":"..."}],
          "correctAnswer": "A"
        }
      ]
    }
  ]
}`;
}
function normaliseType(raw) {
    const r = raw.toLowerCase();
    if (r.includes("multiple") || r.includes("mcq"))
        return "MCQ";
    if (r.includes("long"))
        return "Long Answer";
    if (r.includes("short"))
        return "Short Answer";
    if (r.includes("fill"))
        return "Fill in the Blank";
    if (r.includes("true"))
        return "True/False";
    return "Short Answer";
}
function normaliseDifficulty(raw) {
    const r = raw.toLowerCase();
    if (r === "easy")
        return "Easy";
    if (r === "hard")
        return "Hard";
    return "Moderate";
}
async function generateAssignment(assignmentId) {
    const assignment = await Assignment_1.Assignment.findById(assignmentId);
    if (!assignment)
        throw new Error("Assignment not found");
    await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, { status: "generating" });
    try {
        const io = (0, socket_1.getIO)();
        io.to(`job:${assignmentId}`).emit("job:progress", { status: "generating", message: "Contacting AI..." });
        const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = buildPrompt({
            title: assignment.title,
            subject: assignment.subject,
            gradeLevel: assignment.gradeLevel,
            totalMarks: assignment.totalMarks,
            numberOfQuestions: assignment.numberOfQuestions,
            difficulty: assignment.difficulty,
            questionTypeDetails: assignment.questionTypeDetails,
            additionalInstructions: assignment.additionalInstructions,
            contextText: assignment.contextText,
        });
        io.to(`job:${assignmentId}`).emit("job:progress", { status: "generating", message: "Generating questions..." });
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        const text = (result.text ?? "").trim();
        // Strip markdown code fences if present
        const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
        const paper = JSON.parse(jsonText);
        io.to(`job:${assignmentId}`).emit("job:progress", { status: "generating", message: "Saving to database..." });
        // Persist sections and questions
        for (let si = 0; si < paper.sections.length; si++) {
            const sec = paper.sections[si];
            const section = await Section_1.Section.create({
                assignment: assignmentId,
                name: sec.name,
                instructions: sec.instructions || "",
                order: si,
            });
            for (let qi = 0; qi < sec.questions.length; qi++) {
                const q = sec.questions[qi];
                await Question_1.Question.create({
                    assignment: assignmentId,
                    section: section._id,
                    text: q.text,
                    type: normaliseType(q.type),
                    difficulty: normaliseDifficulty(q.difficulty),
                    marks: q.marks,
                    order: qi,
                    options: q.options || [],
                    correctAnswer: q.correctAnswer || "",
                });
            }
        }
        await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, { status: "completed" });
        io.to(`job:${assignmentId}`).emit("job:completed", { assignmentId });
    }
    catch (err) {
        console.error("Generation failed:", err);
        await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, { status: "failed" });
        const io = (0, socket_1.getIO)();
        io.to(`job:${assignmentId}`).emit("job:failed", { error: String(err) });
        throw err;
    }
}
