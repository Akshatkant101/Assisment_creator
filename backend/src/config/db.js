"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/assessment_creator";
async function connectDB() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("MongoDB connected:", mongoose_1.default.connection.host);
    }
    catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}
