
export const getEmailTemplate = (type: string, data: any) => {
    switch (type) {
        case "ORDER_CREATED":
            return {
                subject: `Commande confirmée #${data.orderId}`,
                html: `
                <h1>Merci pour votre commande !</h1>
                <p>Bonjour,</p>
                <p>Nous avons bien reçu votre commande <strong>#${data.orderId}</strong>.</p>
                <p>Nous allons la traiter dans les plus brefs délais.</p>
                <p>Total: <strong>${data.totalAmount} FCFA</strong></p>
                <br/>
                <p>L'équipe Colobane.</p>
                `
            };
        case "ORDER_PAID":
            return {
                subject: `Paiement confirmé pour la commande #${data.orderId}`,
                html: `
                <h1>Paiement Reçu</h1>
                <p>Bonjour,</p>
                <p>Votre paiement pour la commande <strong>#${data.orderId}</strong> a été confirmé avec succès.</p>
                <p>Nous préparons votre expédition.</p>
                <br/>
                <p>L'équipe Colobane.</p>
                `
            };
        case "ORDER_SHIPPED":
            return {
                subject: `Votre commande #${data.orderId} est en route !`,
                html: `
                <h1>Expédition en cours</h1>
                <p>Bonne nouvelle !</p>
                <p>Votre commande <strong>#${data.orderId}</strong> a été expédiée.</p>
                <p>Vous recevrez bientôt des informations pour le suivi.</p>
                <br/>
                <p>L'équipe Colobane.</p>
                `
            };
        case "payment_failed": // Admin specific potentially, or user
        case "PAYMENT_FAILED":
            return {
                subject: `[ALERT] Échec paiement Commande #${data.orderId}`,
                html: `
                <h1>Échec de paiement détecté</h1>
                <p>Le système de réconciliation a marqué le paiement de la commande #${data.orderId} comme FAILED.</p>
                <p>Provider: ${data.provider}</p>
                <p>Date: ${new Date().toISOString()}</p>
                `
            };
        default:
            return null;
    }
};
