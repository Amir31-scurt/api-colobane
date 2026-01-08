"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmailController = addEmailController;
const addEmailToUserUsecase_1 = require("../../../core/usecases/users/addEmailToUserUsecase");
async function addEmailController(req, res) {
    const userId = req.user.userId;
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email requis" });
    }
    await (0, addEmailToUserUsecase_1.addEmailToUserUseCase)(userId, email);
    res.json({
        status: "ok",
        message: "Email ajouté, vérification envoyée",
    });
}
