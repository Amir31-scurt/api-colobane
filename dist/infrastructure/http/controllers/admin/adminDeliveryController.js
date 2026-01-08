"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCreateDeliveryZoneController = adminCreateDeliveryZoneController;
exports.adminListDeliveryZonesController = adminListDeliveryZonesController;
const createDeliveryZoneUsecase_1 = require("../../../../core/usecases/delivery/createDeliveryZoneUsecase");
const listDeliveryZonesUsecase_1 = require("../../../../core/usecases/delivery/listDeliveryZonesUsecase");
async function adminCreateDeliveryZoneController(req, res) {
    try {
        const { name, city, minAmountFree, baseFee } = req.body;
        if (!name || baseFee === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const zone = await (0, createDeliveryZoneUsecase_1.createDeliveryZoneUsecase)({
            name,
            city,
            minAmountFree: minAmountFree ? Number(minAmountFree) : undefined,
            baseFee: Number(baseFee)
        });
        return res.status(201).json(zone);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function adminListDeliveryZonesController(req, res) {
    try {
        const zones = await (0, listDeliveryZonesUsecase_1.listDeliveryZonesUsecase)();
        return res.json(zones);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
