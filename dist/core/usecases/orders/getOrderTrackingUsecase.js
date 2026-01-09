"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderTrackingUsecase = getOrderTrackingUsecase;
// src/core/usecases/orders/getOrderTrackingUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getOrderTrackingUsecase(orderId, userId, isSeller, isAdmin) {
    const order = await prismaClient_1.prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            items: {
                include: {
                    product: true,
                    variant: true
                }
            },
            deliveryMethod: true,
            deliveryLocation: true,
            Payment: true,
            statusHistory: {
                orderBy: { createdAt: "asc" }
            }
        }
    });
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    if (!isAdmin && !isSeller && order.userId !== userId) {
        throw new Error("FORBIDDEN");
    }
    const timeline = [];
    // 1. Initial Event (Creation)
    timeline.push({
        orderId: order.id,
        status: 'PENDING',
        timestamp: order.createdAt,
        message: 'Commande créée avec succès'
    });
    // 2. History Events
    if (order.statusHistory && order.statusHistory.length > 0) {
        order.statusHistory.forEach(history => {
            // Avoid duplicate PENDING if distinct from creation, or just push all
            // Generally history records changes.
            timeline.push({
                orderId: order.id,
                status: history.status,
                timestamp: history.createdAt,
                message: history.note || getStatusMessage(history.status)
            });
        });
    }
    // Ensure current status is represented if not in history (e.g. direct DB edits)
    // But usually statusHistory covers it. 
    // For the frontend sort order, it expects chronological.
    return {
        order: order,
        timeline: timeline
    };
}
function getStatusMessage(status) {
    switch (status) {
        case 'PENDING': return 'Commande en attente';
        case 'PAID': return 'Paiement confirmé';
        case 'PROCESSING': return 'Commande en cours de préparation';
        case 'SHIPPED': return 'Commande en cours de livraison';
        case 'DELIVERED': return 'Commande livrée';
        case 'CANCELLED': return 'Commande annulée';
        default: return 'Mise à jour du statut';
    }
}
