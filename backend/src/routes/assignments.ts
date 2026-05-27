import { Router, Request, Response } from "express";
import { Assignment } from "../models/Assignment";
import { Section } from "../models/Section";
import { Question } from "../models/Question";
import { User } from "../models/User";
import { generateAssignment } from "../services/generateQuestions";

const router = Router();

// GET /api/assignments?clerkId=xxx  — list all assignments for a teacher
router.get("/", async (req: Request, res: Response) => {
  const clerkId = String(req.query.clerkId ?? "");
  if (!clerkId) { res.status(400).json({ error: "clerkId required" }); return; }

  const user = await User.findOne({ clerkId: clerkId });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const assignments = await Assignment.find({ teacher: user._id })
    .sort({ createdAt: -1 })
    .select("-contextText -contextFiles");

  res.json(assignments);
});

// GET /api/assignments/:id  — get a single assignment with sections & questions
router.get("/:id", async (req: Request, res: Response) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404).json({ error: "Assignment not found" }); return; }

  const sections = await Section.find({ assignment: assignment._id }).sort({ order: 1 });
  const questions = await Question.find({ assignment: assignment._id }).sort({ section: 1, order: 1 });

  const sectionsWithQuestions = sections.map((s) => ({
    ...s.toObject(),
    questions: questions.filter((q) => q.section.toString() === s._id.toString()),
  }));

  res.json({ ...assignment.toObject(), sections: sectionsWithQuestions });
});

// POST /api/assignments  — create a new assignment (draft)
router.post("/", async (req: Request, res: Response) => {
  const { clerkId, title, subject, gradeLevel, dueDate, totalMarks,
          questionTypes, questionTypeDetails, numberOfQuestions, difficulty, additionalInstructions } = req.body;

  if (!clerkId) { res.status(400).json({ error: "clerkId required" }); return; }

  const user = await User.findOne({ clerkId });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const assignment = await Assignment.create({
    title, subject, gradeLevel,
    teacher: user._id,
    dueDate: new Date(dueDate),
    assignedDate: new Date(),
    totalMarks, questionTypes,
    questionTypeDetails: questionTypeDetails || [],
    numberOfQuestions,
    difficulty: difficulty || "Mixed",
    additionalInstructions: additionalInstructions || "",
    status: "draft",
  });

  res.status(201).json(assignment);
});

// POST /api/assignments/:id/generate  — trigger AI generation
router.post("/:id/generate", async (req: Request, res: Response) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404).json({ error: "Assignment not found" }); return; }
  if (assignment.status === "generating") { res.status(409).json({ error: "Already generating" }); return; }

  // Fire generation in background — don't await so response returns immediately
  generateAssignment(String(req.params.id)).catch(console.error);

  res.json({ status: "generating", assignmentId: req.params.id });
});

// DELETE /api/assignments/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) { res.status(404).json({ error: "Assignment not found" }); return; }

  await Section.deleteMany({ assignment: req.params.id });
  await Question.deleteMany({ assignment: req.params.id });

  res.json({ success: true });
});

export default router;
