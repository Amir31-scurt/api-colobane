import { NotificationType } from "../constants/notificationTypes.ts";

interface NotificationPayload {
  type: NotificationType;
  orderId?: number;
  productName?: string;
  status?: string;
}

export function buildNotificationContent(payload: NotificationPayload) {
  switch (payload.type) {
    case NotificationType.ORDER_CREATED:
      return {
        title: "Commande créée",
        message: `Votre commande #${payload.orderId} a été créée avec succès.`
      };

    case NotificationType.ORDER_PAID:
      return {
        title: "Paiement confirmé",
        message: `Le paiement de la commande #${payload.orderId} a été confirmé.`
      };

    case NotificationType.ORDER_STATUS_CHANGED:
      return {
        title: "Statut de commande mis à jour",
        message: `Votre commande #${payload.orderId} est maintenant ${payload.status}.`
      };

    case NotificationType.DELIVERY_ASSIGNED:
      return {
        title: "Livraison assignée",
        message: `Une nouvelle livraison vous a été assignée (commande #${payload.orderId}).`
      };

    case NotificationType.DELIVERY_IN_TRANSIT:
      return {
        title: "Commande en route",
        message: `Votre commande #${payload.orderId} est en cours de livraison.`
      };

    case NotificationType.ORDER_DELIVERED:
      return {
        title: "Commande livrée",
        message: `Votre commande #${payload.orderId} a été livrée.`
      };

    case NotificationType.LOW_STOCK:
      return {
        title: "Stock faible",
        message: `Le produit ${payload.productName} est presque épuisé.`
      };

    case NotificationType.NEW_ORDER_FOR_SELLER:
      return {
        title: "Nouvelle commande",
        message: `Une nouvelle commande a été passée pour vos produits.`
      };

    default:
      throw new Error("UNKNOWN_NOTIFICATION_TYPE");
  }
}
