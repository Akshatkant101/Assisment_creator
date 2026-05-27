"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIO = setIO;
exports.getIO = getIO;
let _io = null;
function setIO(io) {
    _io = io;
}
function getIO() {
    if (!_io)
        throw new Error("Socket.io not initialised");
    return _io;
}
