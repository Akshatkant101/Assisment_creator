"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./models/User");
const Assignment_1 = require("./models/Assignment");
const Section_1 = require("./models/Section");
const Question_1 = require("./models/Question");
dotenv_1.default.config();
const CLERK_ID = process.argv[2] || "user_seed_test";
async function seed() {
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    // Upsert test user
    const user = await User_1.User.findOneAndUpdate({ clerkId: CLERK_ID }, { clerkId: CLERK_ID, email: "test@vedaai.com", firstName: "Demo", lastName: "Teacher" }, { upsert: true, new: true });
    console.log("User:", user._id);
    // Clean up existing seed data for this user
    const existing = await Assignment_1.Assignment.find({ teacher: user._id });
    for (const a of existing) {
        await Section_1.Section.deleteMany({ assignment: a._id });
        await Question_1.Question.deleteMany({ assignment: a._id });
    }
    await Assignment_1.Assignment.deleteMany({ teacher: user._id });
    const now = new Date();
    const future = (days) => new Date(now.getTime() + days * 86400000);
    // ── Assignment 1: Completed (Electroplating) ────────────────────────────
    const a1 = await Assignment_1.Assignment.create({
        title: "Electroplating & Electrolysis",
        subject: "Chemistry",
        gradeLevel: "Class 10",
        teacher: user._id,
        dueDate: future(7),
        assignedDate: future(-3),
        totalMarks: 30,
        questionTypes: ["Multiple Choice Questions", "Short Answer Questions", "Long Answer Questions"],
        questionTypeDetails: [
            { type: "Multiple Choice Questions", count: 5, marks: 1 },
            { type: "Short Answer Questions", count: 5, marks: 3 },
            { type: "Long Answer Questions", count: 2, marks: 5 },
        ],
        numberOfQuestions: 12,
        difficulty: "Moderate",
        additionalInstructions: "Focus on industrial applications of electroplating.",
        status: "completed",
    });
    // Section A – MCQ
    const s1 = await Section_1.Section.create({
        assignment: a1._id, name: "Section A – Multiple Choice", order: 0,
        instructions: "Choose the correct answer. Each question carries 1 mark.",
    });
    await Question_1.Question.insertMany([
        { assignment: a1._id, section: s1._id, order: 0, type: "MCQ", difficulty: "Easy", marks: 1,
            text: "Which electrode does the object to be electroplated act as?",
            options: [{ label: "A", text: "Anode" }, { label: "B", text: "Cathode" }, { label: "C", text: "Both" }, { label: "D", text: "Neither" }],
            correctAnswer: "B" },
        { assignment: a1._id, section: s1._id, order: 1, type: "MCQ", difficulty: "Easy", marks: 1,
            text: "In electroplating, the electrolyte must be a salt of the:",
            options: [{ label: "A", text: "Object metal" }, { label: "B", text: "Plating metal" }, { label: "C", text: "Solvent" }, { label: "D", text: "Alloy" }],
            correctAnswer: "B" },
        { assignment: a1._id, section: s1._id, order: 2, type: "MCQ", difficulty: "Moderate", marks: 1,
            text: "During electrolysis of water, which gas is produced at the cathode?",
            options: [{ label: "A", text: "Oxygen" }, { label: "B", text: "Hydrogen" }, { label: "C", text: "Carbon dioxide" }, { label: "D", text: "Nitrogen" }],
            correctAnswer: "B" },
        { assignment: a1._id, section: s1._id, order: 3, type: "MCQ", difficulty: "Moderate", marks: 1,
            text: "Which process is used to purify copper industrially?",
            options: [{ label: "A", text: "Galvanisation" }, { label: "B", text: "Electroplating" }, { label: "C", text: "Electrolytic refining" }, { label: "D", text: "Smelting" }],
            correctAnswer: "C" },
        { assignment: a1._id, section: s1._id, order: 4, type: "MCQ", difficulty: "Hard", marks: 1,
            text: "The amount of substance deposited during electrolysis is proportional to:",
            options: [{ label: "A", text: "Voltage applied" }, { label: "B", text: "Charge passed" }, { label: "C", text: "Temperature" }, { label: "D", text: "Electrode size" }],
            correctAnswer: "B" },
    ]);
    // Section B – Short Answer
    const s2 = await Section_1.Section.create({
        assignment: a1._id, name: "Section B – Short Answer", order: 1,
        instructions: "Answer in 2–3 sentences. Each question carries 3 marks.",
    });
    await Question_1.Question.insertMany([
        { assignment: a1._id, section: s2._id, order: 0, type: "Short Answer", difficulty: "Easy", marks: 3,
            text: "Define electroplating and state one industrial use.", options: [], correctAnswer: "Electroplating is the process of depositing a thin layer of a desired metal on another metal using electrolysis. It is used to coat iron with zinc (galvanising) to prevent rusting." },
        { assignment: a1._id, section: s2._id, order: 1, type: "Short Answer", difficulty: "Moderate", marks: 3,
            text: "Why is chromium used for electroplating cutlery and car parts?", options: [], correctAnswer: "Chromium is hard, shiny, and resistant to corrosion, making it ideal for decorative and protective coatings on cutlery and car bumpers." },
        { assignment: a1._id, section: s2._id, order: 2, type: "Short Answer", difficulty: "Moderate", marks: 3,
            text: "What is the role of the electrolyte in an electrolytic cell?", options: [], correctAnswer: "The electrolyte conducts electricity by providing ions and also supplies the ions of the plating metal that are deposited at the cathode." },
        { assignment: a1._id, section: s2._id, order: 3, type: "Short Answer", difficulty: "Hard", marks: 3,
            text: "Explain why the mass of the anode decreases during electroplating.", options: [], correctAnswer: "The anode (plating metal) dissolves into the electrolyte as metal ions, which then migrate to the cathode and deposit there, maintaining electrolyte concentration." },
        { assignment: a1._id, section: s2._id, order: 4, type: "Short Answer", difficulty: "Hard", marks: 3,
            text: "How does galvanisation protect iron from rusting?", options: [], correctAnswer: "Zinc coating on iron acts as a sacrificial anode — it oxidises preferentially even if the coating is scratched, preventing the underlying iron from reacting with oxygen and moisture." },
    ]);
    // Section C – Long Answer
    const s3 = await Section_1.Section.create({
        assignment: a1._id, name: "Section C – Long Answer", order: 2,
        instructions: "Answer in detail. Each question carries 5 marks.",
    });
    await Question_1.Question.insertMany([
        { assignment: a1._id, section: s3._id, order: 0, type: "Long Answer", difficulty: "Hard", marks: 5,
            text: "With a labelled diagram, explain the process of electroplating a steel spoon with silver. Include the choice of electrodes and electrolyte.", options: [], correctAnswer: "" },
        { assignment: a1._id, section: s3._id, order: 1, type: "Long Answer", difficulty: "Hard", marks: 5,
            text: "Describe electrolytic refining of copper. What are the impurities that collect at the anode mud and why?", options: [], correctAnswer: "" },
    ]);
    console.log("Created completed assignment:", a1._id);
    // ── Assignment 2: Completed (Physics – Motion) ──────────────────────────
    const a2 = await Assignment_1.Assignment.create({
        title: "Laws of Motion & Gravitation",
        subject: "Physics",
        gradeLevel: "Class 9",
        teacher: user._id,
        dueDate: future(5),
        assignedDate: future(-5),
        totalMarks: 25,
        questionTypes: ["Multiple Choice Questions", "Fill in the Blanks", "Short Answer Questions"],
        questionTypeDetails: [
            { type: "Multiple Choice Questions", count: 5, marks: 1 },
            { type: "Fill in the Blanks", count: 5, marks: 1 },
            { type: "Short Answer Questions", count: 5, marks: 3 },
        ],
        numberOfQuestions: 15,
        difficulty: "Easy",
        additionalInstructions: "",
        status: "completed",
    });
    const s4 = await Section_1.Section.create({ assignment: a2._id, name: "Section A – MCQ", order: 0, instructions: "Each question carries 1 mark." });
    await Question_1.Question.insertMany([
        { assignment: a2._id, section: s4._id, order: 0, type: "MCQ", difficulty: "Easy", marks: 1,
            text: "Newton's first law of motion is also known as the law of:",
            options: [{ label: "A", text: "Inertia" }, { label: "B", text: "Acceleration" }, { label: "C", text: "Gravitation" }, { label: "D", text: "Conservation" }],
            correctAnswer: "A" },
        { assignment: a2._id, section: s4._id, order: 1, type: "MCQ", difficulty: "Easy", marks: 1,
            text: "The SI unit of force is:",
            options: [{ label: "A", text: "Joule" }, { label: "B", text: "Newton" }, { label: "C", text: "Pascal" }, { label: "D", text: "Watt" }],
            correctAnswer: "B" },
        { assignment: a2._id, section: s4._id, order: 2, type: "MCQ", difficulty: "Easy", marks: 1,
            text: "Value of acceleration due to gravity on Earth's surface is approximately:",
            options: [{ label: "A", text: "9.8 m/s²" }, { label: "B", text: "6.7 m/s²" }, { label: "C", text: "11.2 m/s²" }, { label: "D", text: "3.7 m/s²" }],
            correctAnswer: "A" },
        { assignment: a2._id, section: s4._id, order: 3, type: "MCQ", difficulty: "Moderate", marks: 1,
            text: "A body of mass 2 kg is accelerated at 5 m/s². The net force acting on it is:",
            options: [{ label: "A", text: "2.5 N" }, { label: "B", text: "7 N" }, { label: "C", text: "10 N" }, { label: "D", text: "0.4 N" }],
            correctAnswer: "C" },
        { assignment: a2._id, section: s4._id, order: 4, type: "MCQ", difficulty: "Moderate", marks: 1,
            text: "According to Newton's third law, action and reaction are:",
            options: [{ label: "A", text: "Equal and in the same direction" }, { label: "B", text: "Equal and opposite, acting on the same body" }, { label: "C", text: "Equal and opposite, acting on different bodies" }, { label: "D", text: "Unequal and opposite" }],
            correctAnswer: "C" },
    ]);
    const s5 = await Section_1.Section.create({ assignment: a2._id, name: "Section B – Fill in the Blanks", order: 1, instructions: "Fill in the blanks. Each carries 1 mark." });
    await Question_1.Question.insertMany([
        { assignment: a2._id, section: s5._id, order: 0, type: "Fill in the Blank", difficulty: "Easy", marks: 1, text: "The force of attraction between any two objects in the universe is called ________.", options: [], correctAnswer: "Gravitational force" },
        { assignment: a2._id, section: s5._id, order: 1, type: "Fill in the Blank", difficulty: "Easy", marks: 1, text: "Mass × Velocity is known as ________.", options: [], correctAnswer: "Momentum" },
        { assignment: a2._id, section: s5._id, order: 2, type: "Fill in the Blank", difficulty: "Easy", marks: 1, text: "Newton's second law: F = ________.", options: [], correctAnswer: "ma" },
        { assignment: a2._id, section: s5._id, order: 3, type: "Fill in the Blank", difficulty: "Moderate", marks: 1, text: "The universal gravitational constant G has a value of ________ N m² kg⁻².", options: [], correctAnswer: "6.674 × 10⁻¹¹" },
        { assignment: a2._id, section: s5._id, order: 4, type: "Fill in the Blank", difficulty: "Moderate", marks: 1, text: "An object in free fall experiences only the force of ________.", options: [], correctAnswer: "Gravity" },
    ]);
    const s6 = await Section_1.Section.create({ assignment: a2._id, name: "Section C – Short Answer", order: 2, instructions: "Answer in 2–3 sentences. Each carries 3 marks." });
    await Question_1.Question.insertMany([
        { assignment: a2._id, section: s6._id, order: 0, type: "Short Answer", difficulty: "Easy", marks: 3, text: "State Newton's second law of motion and derive its mathematical form.", options: [], correctAnswer: "" },
        { assignment: a2._id, section: s6._id, order: 1, type: "Short Answer", difficulty: "Moderate", marks: 3, text: "A ball is thrown upward with velocity 20 m/s. How high does it rise? (g = 10 m/s²)", options: [], correctAnswer: "" },
        { assignment: a2._id, section: s6._id, order: 2, type: "Short Answer", difficulty: "Hard", marks: 3, text: "Explain why astronauts feel weightless in a space station orbiting Earth.", options: [], correctAnswer: "" },
    ]);
    console.log("Created completed assignment:", a2._id);
    // ── Assignment 3: Draft ─────────────────────────────────────────────────
    await Assignment_1.Assignment.create({
        title: "Cell Structure & Functions",
        subject: "Biology",
        gradeLevel: "Class 9",
        teacher: user._id,
        dueDate: future(14),
        assignedDate: now,
        totalMarks: 20,
        questionTypes: ["Multiple Choice Questions", "Short Answer Questions"],
        questionTypeDetails: [
            { type: "Multiple Choice Questions", count: 10, marks: 1 },
            { type: "Short Answer Questions", count: 5, marks: 2 },
        ],
        numberOfQuestions: 15,
        difficulty: "Easy",
        additionalInstructions: "Include plant and animal cell differences.",
        status: "draft",
    });
    // ── Assignment 4: Draft ─────────────────────────────────────────────────
    await Assignment_1.Assignment.create({
        title: "Trigonometry – Heights & Distances",
        subject: "Mathematics",
        gradeLevel: "Class 10",
        teacher: user._id,
        dueDate: future(10),
        assignedDate: now,
        totalMarks: 40,
        questionTypes: ["Multiple Choice Questions", "Numerical Problems", "Long Answer Questions"],
        questionTypeDetails: [
            { type: "Multiple Choice Questions", count: 5, marks: 1 },
            { type: "Numerical Problems", count: 5, marks: 4 },
            { type: "Long Answer Questions", count: 3, marks: 5 },
        ],
        numberOfQuestions: 13,
        difficulty: "Hard",
        additionalInstructions: "",
        status: "draft",
    });
    // ── Assignment 5: Failed ────────────────────────────────────────────────
    await Assignment_1.Assignment.create({
        title: "French Revolution – Causes & Effects",
        subject: "History",
        gradeLevel: "Class 9",
        teacher: user._id,
        dueDate: future(6),
        assignedDate: future(-1),
        totalMarks: 30,
        questionTypes: ["Short Answer Questions", "Long Answer Questions"],
        questionTypeDetails: [
            { type: "Short Answer Questions", count: 5, marks: 3 },
            { type: "Long Answer Questions", count: 3, marks: 5 },
        ],
        numberOfQuestions: 8,
        difficulty: "Moderate",
        additionalInstructions: "Emphasise economic causes.",
        status: "failed",
    });
    console.log("Seed complete! Run with clerkId:", CLERK_ID);
    await mongoose_1.default.disconnect();
}
seed().catch((e) => { console.error(e); process.exit(1); });
