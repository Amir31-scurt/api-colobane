"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hello = void 0;
const hello = (req, res) => {
    res.json({ message: "Welcome to your Node.js + TypeScript API! 🎉" });
};
exports.hello = hello;
