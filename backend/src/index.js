"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const db_1 = require("./config/db");
const socket_1 = require("./socket");
const users_1 = __importDefault(require("./routes/users"));
const assignments_1 = __importDefault(require("./routes/assignments"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express_1.default.json());
app.use("/api/users", users_1.default);
app.use("/api/assignments", assignments_1.default);
app.get("/health", (_req, res) => res.json({ status: "ok" }));
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
(0, socket_1.setIO)(io);
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("join-job", (jobId) => {
        socket.join(`job:${jobId}`);
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
(0, db_1.connectDB)().then(() => {
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
