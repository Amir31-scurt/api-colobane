"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWaveSignature = verifyWaveSignature;
const crypto_1 = __importDefault(require("crypto"));
function verifyWaveSignature(rawBody, header) {
    if (!header)
        return false;
    const secret = process.env.WAVE_WEBHOOK_SECRET;
    const parts = header.split(",");
    let timestamp = "";
    let receivedSignature = "";
    for (const p of parts) {
        const [key, value] = p.split("=");
        if (key === "t")
            timestamp = value;
        if (key === "s")
            receivedSignature = value;
    }
    if (!timestamp || !receivedSignature)
        return false;
    const payload = `${timestamp}.${rawBody}`;
    const expected = crypto_1.default.createHmac("sha256", secret).update(payload).digest("hex");
    return expected === receivedSignature;
}
