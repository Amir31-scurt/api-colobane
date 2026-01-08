"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOrangeMoneySignature = verifyOrangeMoneySignature;
const crypto_1 = __importDefault(require("crypto"));
function verifyOrangeMoneySignature(rawBody, signature) {
    if (!signature)
        return false;
    const secret = process.env.OM_WEBHOOK_SECRET;
    const expected = crypto_1.default.createHmac("sha256", secret).update(rawBody).digest("hex");
    return expected === signature;
}
