"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderController = createOrderController;
exports.listUserOrdersController = listUserOrdersController;
exports.listSellerOrdersController = listSellerOrdersController;
exports.updateOrderStatusController = updateOrderStatusController;
exports.getOrderTrackingController = getOrderTrackingController;
const createOrderUsecase_1 = require("../../../core/usecases/orders/createOrderUsecase");
const listUserOrdersUsecase_1 = require("../../../core/usecases/orders/listUserOrdersUsecase");
const listSellerOrdersUsecase_1 = require("../../../core/usecases/orders/listSellerOrdersUsecase");
const updateOrderStatusUsecase_1 = require("../../../core/usecases/orders/updateOrderStatusUsecase");
const getOrderTrackingUsecase_1 = require("../../../core/usecases/orders/getOrderTrackingUsecase");
async function createOrderController(req, res) {
    try {
        const order = await (0, createOrderUsecase_1.createOrderUsecase)({
            userId: req.user.id,
            items: req.body.items,
            deliveryMethodId: req.body.deliveryMethodId,
            deliveryLocationId: req.body.deliveryLocationId,
            shippingAddress: req.body.shippingAddress,
            paymentProvider: req.body.paymentProvider
        });
        return res.status(201).json(order);
    }
    catch (err) {
        console.error(err);
        if (err.message.startsWith("INSUFFICIENT_STOCK")) {
            return res.status(400).json({ message: "Stock insuffisant" });
        }
        return res.status(500).json({ message: "Erreur interne" });
    }
}
async function listUserOrdersController(req, res) {
    const orders = await (0, listUserOrdersUsecase_1.listUserOrdersUsecase)(req.user.id);
    return res.json(orders);
}
async function listSellerOrdersController(req, res) {
    const orders = await (0, listSellerOrdersUsecase_1.listSellerOrdersUsecase)(req.user.id);
    return res.json(orders);
}
async function updateOrderStatusController(req, res) {
    try {
        const orderId = Number(req.params.orderId);
        const { status, note } = req.body;
        const updated = await (0, updateOrderStatusUsecase_1.updateOrderStatusUsecase)({
            orderId,
            status,
            changedByUserId: req.user.id,
            note
        });
        return res.json(updated);
    }
    catch (err) {
        if (err.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({ message: "Commande introuvable" });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne" });
    }
}
async function getOrderTrackingController(req, res) {
    try {
        const orderId = Number(req.params.orderId);
        const isSeller = req.user.role === "SELLER" || req.user.role === "ADMIN";
        const isAdmin = req.user.role === "ADMIN";
        const order = await (0, getOrderTrackingUsecase_1.getOrderTrackingUsecase)(orderId, req.user.id, isSeller, isAdmin);
        return res.json(order);
    }
    catch (err) {
        if (err.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({ message: "Commande introuvable" });
        }
        if (err.message === "FORBIDDEN") {
            return res.status(403).json({ message: "Accès non autorisé à cette commande" });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne" });
    }
}
