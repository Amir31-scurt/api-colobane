import {
  orderConfirmationEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  paymentConfirmedEmail,
  orderAdminNotificationEmail
} from './orderEmailTemplates';

export const getEmailTemplate = (type: string, data: any) => {
  const trackingUrl = data.orderId ? `${process.env.CLIENT_URL || 'https://www.mycolobane.com'}/orders/${data.orderId}` : undefined;

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
    
    case "NEW_ORDER_ADMIN":
      return orderAdminNotificationEmail({
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

    case "BRAND_PENDING":
      return {
        subject: `🆕 Nouvelle boutique soumise : ${data.brandName || "Nouvelle boutique"}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 20px; background-color: #ffffff; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #f59e0b;">
              <span style="font-size: 32px;">🛍️</span>
              <h1 style="color: #0f172a; margin: 8px 0 0 0; font-size: 22px; font-weight: 800;">
                Nouvelle Demande de Boutique
              </h1>
              <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">
                Une nouvelle boutique a été soumise sur Colobane et attend votre vérification
              </p>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tbody>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 0; font-weight: 600; color: #64748b; width: 140px;">Boutique</td>
                    <td style="padding: 10px 0; font-weight: 700; color: #0f172a; font-size: 16px;">${data.brandName || "N/A"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Identifiant (Slug)</td>
                    <td style="padding: 10px 0; color: #f59e0b; font-family: monospace; font-weight: 600;">${data.brandSlug || data.brandId || "N/A"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Vendeur</td>
                    <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">
                      ${data.applicantName || "Vendeur"}
                      ${data.applicantEmail ? `<br/><span style="color: #64748b; font-weight: normal; font-size: 13px;">${data.applicantEmail}</span>` : ""}
                    </td>
                  </tr>
                  ${data.contactPhone ? `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Téléphone</td>
                    <td style="padding: 10px 0; color: #0f172a;">${data.contactPhone}</td>
                  </tr>` : ""}
                  ${data.description ? `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Description</td>
                    <td style="padding: 10px 0; color: #334155; line-height: 1.4;">${data.description}</td>
                  </tr>` : ""}
                  <tr>
                    <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Date</td>
                    <td style="padding: 10px 0; color: #64748b;">${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.ADMIN_DASHBOARD_URL || 'https://admin.mycolobane.com'}/dashboard/brands" 
                 style="background: #f59e0b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                Examiner la boutique dans le Dashboard Admin →
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;"/>
            
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
              🇸🇳 Colobane Marketplace • Notification automatique Administrateur
            </p>
          </div>
        `
      };

    default:
      return null;
  }
};
