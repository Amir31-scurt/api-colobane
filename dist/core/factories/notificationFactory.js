"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNotificationContent = buildNotificationContent;
const notificationTypes_1 = require("../constants/notificationTypes");
function buildNotificationContent(payload) {
    switch (payload.type) {
        case notificationTypes_1.NotificationType.ORDER_CREATED:
            return {
                title: "Commande créée",
                message: `Votre commande #${payload.orderId} a été créée avec succès.`
            };
        case notificationTypes_1.NotificationType.ORDER_PAID:
            return {
                title: "Paiement confirmé",
                message: `Le paiement de la commande #${payload.orderId} a été confirmé.`
            };
        case notificationTypes_1.NotificationType.ORDER_SHIPPED:
            return {
                title: "Commande expédiée",
                message: `Votre commande #${payload.orderId} a été expédiée.`
            };
        case notificationTypes_1.NotificationType.ORDER_STATUS_CHANGED:
            return {
                title: "Statut de commande mis à jour",
                message: `Votre commande #${payload.orderId} est maintenant ${payload.status}.`
            };
        case notificationTypes_1.NotificationType.DELIVERY_ASSIGNED:
            return {
                title: "Livraison assignée",
                message: `Une nouvelle livraison vous a été assignée (commande #${payload.orderId}).`
            };
        case notificationTypes_1.NotificationType.DELIVERY_IN_TRANSIT:
            return {
                title: "Commande en route",
                message: `Votre commande #${payload.orderId} est en cours de livraison.`
            };
        case notificationTypes_1.NotificationType.ORDER_DELIVERED:
            return {
                title: "Commande livrée",
                message: `Votre commande #${payload.orderId} a été livrée.`
            };
        case notificationTypes_1.NotificationType.LOW_STOCK:
            return {
                title: "Stock faible",
                message: `Le produit ${payload.productName} est presque épuisé.`
            };
        case notificationTypes_1.NotificationType.NEW_ORDER_FOR_SELLER:
            return {
                title: "Nouvelle commande",
                message: `Une nouvelle commande a été passée pour vos produits.`
            };
        default:
            throw new Error("UNKNOWN_NOTIFICATION_TYPE");
    }
}
