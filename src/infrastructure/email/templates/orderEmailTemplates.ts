import { baseEmailTemplate } from './baseTemplate';

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  deliveryFee: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryAddress?: string;
  paymentMethod?: string;
  trackingUrl?: string;
}

/**
 * Order Confirmation Email
 * Sent when a new order is created
 */
export function orderConfirmationEmail(data: OrderEmailData): { subject: string; html: string } {
  const itemsHtml = data.items?.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <strong>${item.name}</strong><br>
        <span style="color: #999; font-size: 13px;">Quantité: ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>
  `).join('') || '';

  const subtotal = data.totalAmount - data.deliveryFee;

  const content = `
    <p>Bonjour ${data.customerName},</p>
    
    <p>Merci pour votre commande ! Nous avons bien reçu votre commande <strong>#${data.orderNumber}</strong> et nous commençons à la préparer.</p>

    <div class="info-box">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">Résumé de la commande</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${itemsHtml}
        <tr>
          <td style="padding: 12px 0; font-size: 14px; color: #666;">Sous-total</td>
          <td style="padding: 12px 0; text-align: right; color: #666;">${formatPrice(subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-size: 14px; color: #666;">Frais de livraison</td>
          <td style="padding: 12px 0; text-align: right; color: #666;">${formatPrice(data.deliveryFee)}</td>
        </tr>
        <tr style="border-top: 2px solid #f59e0b;">
          <td style="padding: 15px 0; font-size: 18px; font-weight: bold;">Total</td>
          <td style="padding: 15px 0; text-align: right; font-size: 18px; font-weight: bold; color: #f59e0b;">${formatPrice(data.totalAmount)}</td>
        </tr>
      </table>
    </div>

    ${data.deliveryAddress ? `
      <div style="margin: 25px 0;">
        <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">📍 Adresse de livraison</h3>
        <p style="color: #666; margin: 0; padding: 12px; background-color: #f8f9fa; border-radius: 6px;">
          ${data.deliveryAddress}
        </p>
      </div>
    ` : ''}

    ${data.paymentMethod ? `
      <div style="margin: 25px 0;">
        <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">💳 Mode de paiement</h3>
        <p style="color: #666; margin: 0;">${data.paymentMethod}</p>
      </div>
    ` : ''}

    <p style="margin-top: 30px;">Nous vous tiendrons informé de l'avancement de votre commande par email et notification.</p>
    
    <p style="color: #999; font-size: 14px; margin-top: 25px;">
      Une question ? Notre équipe est là pour vous aider !
    </p>
  `;

  return {
    subject: `✓ Commande confirmée #${data.orderNumber}`,
    html: baseEmailTemplate({
      title: 'Commande confirmée ! 🎉',
      preheader: `Votre commande #${data.orderNumber} a bien été enregistrée`,
      content,
      ctaButton: data.trackingUrl ? {
        text: 'Suivre ma commande',
        url: data.trackingUrl
      } : undefined
    })
  };
}

/**
 * Order Shipped Email
 */
export function orderShippedEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    <p>Bonjour ${data.customerName},</p>
    
    <p>Bonne nouvelle ! Votre commande <strong>#${data.orderNumber}</strong> est en route et sera bientôt chez vous ! 📦</p>

    <div class="info-box">
      <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Informations d'expédition</h3>
      <p style="margin: 5px 0; color: #666;">
        <strong>Numéro de commande:</strong> ${data.orderNumber}<br>
        <strong>Montant total:</strong> ${formatPrice(data.totalAmount)}
      </p>
    </div>

    ${data.deliveryAddress ? `
      <div style="margin: 25px 0;">
        <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">📍 Adresse de livraison</h3>
        <p style="color: #666; margin: 0; padding: 12px; background-color: #f8f9fa; border-radius: 6px;">
          ${data.deliveryAddress}
        </p>
      </div>
    ` : ''}

    <p style="margin-top: 30px;">Assurez-vous d'être disponible pour réceptionner votre colis.</p>
  `;

  return {
    subject: `📦 Votre commande #${data.orderNumber} est en route !`,
    html: baseEmailTemplate({
      title: 'Votre commande est en route ! 🚚',
      preheader: `Votre commande #${data.orderNumber} a été expédiée`,
      content,
      ctaButton: data.trackingUrl ? {
        text: 'Suivre ma livraison',
        url: data.trackingUrl
      } : undefined
    })
  };
}

/**
 * Order Delivered Email
 */
export function orderDeliveredEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    <p>Bonjour ${data.customerName},</p>
    
    <p>Votre commande <strong>#${data.orderNumber}</strong> a été livrée avec succès ! ✨</p>

    <div class="info-box" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border: none; color: white;">
      <h3 style="margin: 0 0 10px 0; font-size: 18px; color: white;">🎉 Livraison réussie !</h3>
      <p style="margin: 5px 0; color: rgba(255,255,255,0.9);">
        Nous espérons que vous êtes satisfait de votre achat.
      </p>
    </div>

    <p style="margin-top: 25px;">Nous serions ravis d'avoir votre avis sur cette commande ! Votre retour nous aide à améliorer notre service.</p>

    <p style="margin-top: 30px; color: #666;">
      Merci de votre confiance et à très bientôt sur Colobane ! 💜
    </p>
  `;

  return {
    subject: `✅ Commande #${data.orderNumber} livrée !`,
    html: baseEmailTemplate({
      title: 'Commande livrée ! 🎊',
      preheader: `Votre commande #${data.orderNumber} a été livrée`,
      content,
      ctaButton: {
        text: 'Découvrir nos produits',
        url: 'https://www.mycolobane.com/products'
      }
    })
  };
}

/**
 * Order Cancelled Email
 */
export function orderCancelledEmail(data: OrderEmailData & { reason?: string }): { subject: string; html: string } {
  const content = `
    <p>Bonjour ${data.customerName},</p>
    
    <p>Votre commande <strong>#${data.orderNumber}</strong> a été annulée.</p>

    ${data.reason ? `
      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Motif de l'annulation</h3>
        <p style="margin: 0; color: #666;">${data.reason}</p>
      </div>
    ` : ''}

    <p style="margin-top: 25px;">Si vous avez effectué un paiement, le remboursement sera traité dans les prochains jours ouvrables.</p>

    <p style="margin-top: 20px; color: #666;">
      Si vous avez des questions concernant cette annulation, n'hésitez pas à nous contacter.
    </p>
  `;

  return {
    subject: `❌ Commande #${data.orderNumber} annulée`,
    html: baseEmailTemplate({
      title: 'Commande annulée',
      preheader: `Votre commande #${data.orderNumber} a été annulée`,
      content,
      ctaButton: {
        text: 'Nous contacter',
        url: 'https://www.mycolobane.com/contact'
      }
    })
  };
}

/**
 * Payment Confirmation Email
 */
export function paymentConfirmedEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    <p>Bonjour ${data.customerName},</p>
    
    <p>Votre paiement pour la commande <strong>#${data.orderNumber}</strong> a été confirmé avec succès ! 💚</p>

    <div class="info-box">
      <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Détails du paiement</h3>
      <p style="margin: 5px 0; color: #666;">
        <strong>Numéro de commande:</strong> ${data.orderNumber}<br>
        <strong>Montant payé:</strong> ${formatPrice(data.totalAmount)}<br>
        ${data.paymentMethod ? `<strong>Méthode:</strong> ${data.paymentMethod}` : ''}
      </p>
    </div>

    <p style="margin-top: 25px;">Nous préparons maintenant votre commande et vous tiendrons informé à chaque étape.</p>
  `;

  return {
    subject: `✓ Paiement confirmé pour la commande #${data.orderNumber}`,
    html: baseEmailTemplate({
      title: 'Paiement confirmé ! ✓',
      preheader: `Votre paiement de ${formatPrice(data.totalAmount)} a été reçu`,
      content,
      ctaButton: data.trackingUrl ? {
        text: 'Suivre ma commande',
        url: data.trackingUrl
      } : undefined
    })
  };
}

/**
 * Order Admin Notification Email
 */
export function orderAdminNotificationEmail(data: OrderEmailData): { subject: string; html: string } {
  const itemsHtml = data.items?.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <strong>${item.name}</strong><br>
        <span style="color: #999; font-size: 13px;">Quantité: ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>
  `).join('') || '';

  const content = `
    <p>Une nouvelle commande vient d'être passée sur Colobane !</p>
    
    <div class="info-box">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">Détails Admin</h3>
      <p><strong>Commande:</strong> #${data.orderNumber}</p>
      <p><strong>Client:</strong> ${data.customerName}</p>
      <p><strong>Montant Total:</strong> ${formatPrice(data.totalAmount)}</p>
      <p><strong>Frais Livraison:</strong> ${formatPrice(data.deliveryFee)}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; border-bottom: 2px solid #eee; padding-bottom: 10px;">Article</th>
          <th style="text-align: right; border-bottom: 2px solid #eee; padding-bottom: 10px;">Prix</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="margin: 25px 0;">
      <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">📍 Adresse de livraison</h3>
      <p style="color: #666; margin: 0; padding: 12px; background-color: #f8f9fa; border-radius: 6px;">
        ${data.deliveryAddress || 'Non spécifiée'}
      </p>
    </div>

    ${data.paymentMethod ? `
      <div style="margin: 25px 0;">
        <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">💳 Mode de paiement</h3>
        <p style="color: #666; margin: 0;">${data.paymentMethod}</p>
      </div>
    ` : ''}
  `;

  return {
    subject: `🔔 NOUVELLE COMMANDE #${data.orderNumber}`,
    html: baseEmailTemplate({
      title: 'Nouvelle commande reçue !',
      preheader: `Commande #${data.orderNumber} par ${data.customerName}`,
      content,
      ctaButton: {
        text: 'Voir sur le Dashboard',
        url: `${process.env.ADMIN_URL || 'https://admin.mycolobane.com'}/orders/${data.orderNumber}`
      }
    })
  };
}

/**
 * Helper function to format prices
 */
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
