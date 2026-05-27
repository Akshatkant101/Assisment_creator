import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { connectDB } from "./config/db";
import { setIO } from "./socket";
import userRoutes from "./routes/users";
import assignmentRoutes from "./routes/assignments";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/assignments", assignmentRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const httpServer = createServer(app);

const io = new SocketServer(httpServer, { cors: { origin: "*" } });
setIO(io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("join-job", (jobId: string) => {
    socket.join(`job:${jobId}`);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
