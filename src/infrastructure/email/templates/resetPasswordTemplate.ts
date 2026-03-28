import { baseEmailTemplate } from './baseTemplate';

export function resetPasswordTemplate(resetLink: string): string {
  const content = `
    <p>Vous avez demandé la réinitialisation de votre mot de passe Colobane.</p>
    
    <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable pendant <strong>1 heure</strong>.</p>

    <div class="info-box">
      <p style="margin: 0; color: #666; font-size: 14px;">
        ⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe reste inchangé.
      </p>
    </div>

    <p style="margin-top: 25px; color: #666;">
      Pour votre sécurité, ne partagez jamais ce lien avec quelqu'un d'autre.
    </p>
  `;

  return baseEmailTemplate({
    title: 'Réinitialisez votre mot de passe',
    preheader: 'Cliquez pour réinitialiser votre mot de passe Colobane',
    content,
    ctaButton: {
      text: 'Réinitialiser mon mot de passe',
      url: resetLink
    }
  });
}
