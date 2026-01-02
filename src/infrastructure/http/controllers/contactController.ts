import { Request, Response, NextFunction } from 'express';
import { sendEmail } from '../../email/resendProvider';
import { AppError } from '../../../core/errors/AppError';

export const sendContactEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            throw new AppError("Tous les champs sont requis", 400);
        }

        // Target email for support
        // Note: In Resend Test mode, you must send to your verified email address.
        const supportEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_FROM || 'mycolobane@gmail.com';

        console.log(`📧 Sending contact form email to: ${supportEmail}`);
        console.log(`   From User: ${email} (${name})`);

        // Construct HTML email content
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4F46E5;">Nouveau Message de Contact</h2>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>De :</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
                    <p><strong>Sujet :</strong> ${subject}</p>
                </div>
                <div style="padding: 10px 0; border-top: 1px solid #e0e0e0;">
                    <h3 style="color: #374151;">Message :</h3>
                    <p style="white-space: pre-wrap; color: #4B5563; line-height: 1.6;">${message}</p>
                </div>
                <div style="margin-top: 30px; font-size: 12px; color: #9CA3AF; text-align: center;">
                    Cet email a été envoyé depuis le formulaire de contact de Colobane.
                </div>
            </div>
        `;

        // Send email to support team with user's email as Reply-To
        const emailSent = await sendEmail({
            to: supportEmail,
            subject: `[Contact Form] ${subject}`,
            html: htmlContent,
            replyTo: email
        });

        if (!emailSent) {
            throw new AppError("Erreur lors de l'envoi de l'email", 500);
        }

        res.status(200).json({
            status: 'success',
            message: 'Votre message a été envoyé avec succès.'
        });

    } catch (error) {
        next(error);
    }
};
