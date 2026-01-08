"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDeliveryZonesController = listDeliveryZonesController;
exports.applyDeliveryController = applyDeliveryController;
exports.assignDelivererController = assignDelivererController;
exports.updateDeliveryStatusController = updateDeliveryStatusController;
const applyDeliveryToOrderUsecase_1 = require("../../../core/usecases/delivery/applyDeliveryToOrderUsecase");
const assignDelivererUsecase_1 = require("../../../core/usecases/delivery/assignDelivererUsecase");
const updateDeliveryStatusUsecase_1 = require("../../../core/usecases/delivery/updateDeliveryStatusUsecase");
const listDeliveryZones_1 = require("../../../core/usecases/delivery/listDeliveryZones");
async function listDeliveryZonesController(req, res) {
    try {
        const zones = await (0, listDeliveryZones_1.listDeliveryZones)();
        return res.json(zones);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur récupération zones de livraison" });
    }
}
async function applyDeliveryController(req, res) {
    try {
        const { orderId, deliveryZoneId, deliveryMethodId, shippingAddress } = req.body;
        const updated = await (0, applyDeliveryToOrderUsecase_1.applyDeliveryToOrderUsecase)({
            orderId,
            deliveryZoneId,
            deliveryMethodId,
            shippingAddress
        });
        return res.json(updated);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur application livraison" });
    }
}
async function assignDelivererController(req, res) {
    try {
        const { orderId, delivererId, methodId } = req.body;
        const assignment = await (0, assignDelivererUsecase_1.assignDelivererUsecase)({
            orderId,
            delivererId,
            methodId
        });
        return res.json(assignment);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur assignation livreur" });
    }
}
async function updateDeliveryStatusController(req, res) {
    try {
        const assignmentId = Number(req.params.assignmentId);
        const { status } = req.body;
        const updated = await (0, updateDeliveryStatusUsecase_1.updateDeliveryStatusUsecase)({
            assignmentId,
            status,
            changedByUserId: req.user.id
        });
        return res.json(updated);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur maj statut livraison" });
    }
}
