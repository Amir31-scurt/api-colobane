"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailTemplate = void 0;
const orderEmailTemplates_1 = require("./orderEmailTemplates");
const getEmailTemplate = (type, data) => {
    const trackingUrl = data.orderId ? `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${data.orderId}` : undefined;
    switch (type) {
        case "ORDER_CREATED":
            return (0, orderEmailTemplates_1.orderConfirmationEmail)({
                orderNumber: data.orderNumber || data.orderId,
                customerName: data.customerName || 'Client',
                totalAmount: data.totalAmount,
                deliveryFee: data.deliveryFee || 0,
                items: data.items,
                deliveryAddress: data.deliveryAddress,
                paymentMethod: data.paymentMethod,
                trackingUrl
            });
        case "ORDER_PAID":
            return (0, orderEmailTemplates_1.paymentConfirmedEmail)({
                orderNumber: data.orderNumber || data.orderId,
                customerName: data.customerName || 'Client',
                totalAmount: data.totalAmount,
                deliveryFee: data.deliveryFee || 0,
                paymentMethod: data.paymentMethod,
                trackingUrl
            });
        case "ORDER_SHIPPED":
            return (0, orderEmailTemplates_1.orderShippedEmail)({
                orderNumber: data.orderNumber || data.orderId,
                customerName: data.customerName || 'Client',
                totalAmount: data.totalAmount,
                deliveryFee: data.deliveryFee || 0,
                deliveryAddress: data.deliveryAddress,
                trackingUrl
            });
        case "ORDER_DELIVERED":
            return (0, orderEmailTemplates_1.orderDeliveredEmail)({
                orderNumber: data.orderNumber || data.orderId,
                customerName: data.customerName || 'Client',
                totalAmount: data.totalAmount,
                deliveryFee: data.deliveryFee || 0,
                trackingUrl
            });
        case "ORDER_CANCELLED":
            return (0, orderEmailTemplates_1.orderCancelledEmail)({
                orderNumber: data.orderNumber || data.orderId,
                customerName: data.customerName || 'Client',
                totalAmount: data.totalAmount,
                deliveryFee: data.deliveryFee || 0,
                reason: data.reason
            });
        case "payment_failed":
        case "PAYMENT_FAILED":
            return {
                subject: `[ALERT] Échec paiement Commande #${data.orderNumber || data.orderId}`,
                html: `
        <h1>Échec de paiement détecté</h1>
        <p>Le système de réconciliation a marqué le paiement de la commande #${data.orderNumber || data.orderId} comme FAILED.</p>
        <p>Provider: ${data.provider}</p>
        <p>Date: ${new Date().toISOString()}</p>
        `
            };
        default:
            return null;
    }
};
exports.getEmailTemplate = getEmailTemplate;
