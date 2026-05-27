"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// POST /api/users/sync  — upsert Clerk user into MongoDB
router.post("/sync", async (req, res) => {
    const { clerkId, email, firstName, lastName } = req.body;
    if (!clerkId || !email) {
        res.status(400).json({ error: "clerkId and email are required" });
        return;
    }
    const user = await User_1.User.findOneAndUpdate({ clerkId }, { clerkId, email, firstName, lastName }, { upsert: true, new: true, runValidators: true });
    res.json(user);
});
// GET /api/users/me?clerkId=xxx
router.get("/me", async (req, res) => {
    const clerkId = String(req.query.clerkId ?? "");
    if (!clerkId) {
        res.status(400).json({ error: "clerkId required" });
        return;
    }
    const user = await User_1.User.findOne({ clerkId: clerkId });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.json(user);
});
// PUT /api/users/me
router.put("/me", async (req, res) => {
    const clerkId = String(req.body.clerkId ?? "");
    if (!clerkId) {
        res.status(400).json({ error: "clerkId required" });
        return;
    }
    const { subject, classLevel, school } = req.body;
    const user = await User_1.User.findOneAndUpdate({ clerkId }, { $set: { subject, classLevel, school } }, { new: true, runValidators: true });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.json(user);
});
exports.default = router;
