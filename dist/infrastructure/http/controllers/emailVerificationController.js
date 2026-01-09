"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailController = verifyEmailController;
const verifyEmailUsecase_1 = require("../../../core/usecases/auth/verifyEmailUsecase");
async function verifyEmailController(req, res) {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Token manquant" });
    }
    await (0, verifyEmailUsecase_1.verifyEmailUseCase)(token);
    res.json({
        status: "ok",
        message: "Email vérifié avec succès",
    });
}
