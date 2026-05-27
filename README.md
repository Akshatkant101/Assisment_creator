# AI Assessment Creator

An AI-powered Assessment Creator that allows teachers to create assignments, generate question papers using AI based on provided context (files/text), and view the generated output in a well-designed format.

## Features

### 1. Assignment Creation (Frontend)
- **Form Interface**: A beautifully designed form inspired by modern aesthetics.
- **File Upload**: Support for uploading PDF or text files as context for AI.
- **Assignment Details**: Configure due date, question types, number of questions, total marks, and additional instructions.
- **Validation**: Strict validation to prevent empty or negative values.
- **State Management**: Built using Next.js and Zustand for efficient state management.
- **Real-time Updates**: WebSocket integration for real-time status updates on generation jobs.

### 2. AI Question Generation
- **Structured Prompts**: Converts user inputs into structured prompts for the AI.
- **Intelligent Formatting**: Generates sections (e.g., Section A, B), individual questions, difficulty levels (Easy/Moderate/Hard), and marks per question.
- **Structured Data**: The AI response is parsed and stored as structured data, never directly rendered as raw text.

### 3. Backend System
- **Stack**: Node.js + Express (TypeScript).
- **Database**: MongoDB for storing assignments and results.
- **Caching & Queues**: Redis and BullMQ for managing background jobs (AI generation, PDF creation) and tracking job state.
- **Real-time Communication**: WebSocket server to notify the frontend when background processing is complete.
- **Job Flow**:
  1. API request received.
  2. Job added to BullMQ queue.
  3. Worker processes generation via AI.
  4. Result is structured and stored in MongoDB.
  5. WebSocket notifies the frontend of completion.

### 4. Output Page (Enhanced UX)
- **Exam Paper Layout**: Displays the generated question paper in a structured, clean, and highly readable layout resembling a real exam paper.
- **Student Info Section**: Interactive input lines for Name, Roll Number, and Section.
- **Section Grouping**: Clear titles, instructions, and grouped questions for each section.
- **Question Details**: Displays question text, difficulty tags (Easy/Moderate/Hard), and marks.
- **Bonus Features**:
  - Download as PDF with proper formatting.
  - Action bar with Regenerate options.
  - Visual badges/tags for difficulty.
  - Fully responsive and mobile-friendly.

## Tech Stack

### Frontend
- Next.js (App Router) + TypeScript
- Tailwind CSS (for modern styling)
- Zustand (State Management)
- Socket.io-client (WebSocket)
- React Hook Form + Zod (Validation)

### Backend
- Node.js + Express (TypeScript)
- MongoDB + Mongoose
- Redis
- BullMQ (Background Jobs)
- Socket.io (WebSocket Server)

### AI
- Integration with LLM (e.g., OpenAI API, Anthropic Claude, or OSS models)
- Structured Output Parsing
