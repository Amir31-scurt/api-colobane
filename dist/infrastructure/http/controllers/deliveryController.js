"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDeliveryZonesController = listDeliveryZonesController;
exports.applyDeliveryController = applyDeliveryController;
exports.assignDelivererController = assignDelivererController;
exports.updateDeliveryStatusController = updateDeliveryStatusController;
exports.calculateFeeController = calculateFeeController;
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
async function calculateFeeController(req, res) {
    try {
        const { items, deliveryMethodId, deliveryLocationId } = req.body;
        // items must be { productId: number }[]
        const result = await Promise.resolve().then(() => __importStar(require("../../../core/usecases/delivery/calculateDeliveryFeeUsecase"))).then(m => m.calculateDeliveryFeeUsecase({
            items,
            deliveryMethodId,
            deliveryLocationId
        }));
        return res.json(result);
    }
    catch (err) {
        if (err.message === "INVALID_DELIVERY_LOCATION") {
            return res.status(400).json({ error: "INVALID_DELIVERY_LOCATION" });
        }
        console.error(err);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
