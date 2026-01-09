import {
  orderConfirmationEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  paymentConfirmedEmail
} from './orderEmailTemplates';

export const getEmailTemplate = (type: string, data: any) => {
  const trackingUrl = data.orderId ? `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${data.orderId}` : undefined;

  switch (type) {
    case "ORDER_CREATED":
      return orderConfirmationEmail({
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
      return paymentConfirmedEmail({
        orderNumber: data.orderNumber || data.orderId,
        customerName: data.customerName || 'Client',
        totalAmount: data.totalAmount,
        deliveryFee: data.deliveryFee || 0,
        paymentMethod: data.paymentMethod,
        trackingUrl
      });

    case "ORDER_SHIPPED":
      return orderShippedEmail({
        orderNumber: data.orderNumber || data.orderId,
        customerName: data.customerName || 'Client',
        totalAmount: data.totalAmount,
        deliveryFee: data.deliveryFee || 0,
        deliveryAddress: data.deliveryAddress,
        trackingUrl
      });

    case "ORDER_DELIVERED":
      return orderDeliveredEmail({
        orderNumber: data.orderNumber || data.orderId,
        customerName: data.customerName || 'Client',
        totalAmount: data.totalAmount,
        deliveryFee: data.deliveryFee || 0,
        trackingUrl
      });

    case "ORDER_CANCELLED":
      return orderCancelledEmail({
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
