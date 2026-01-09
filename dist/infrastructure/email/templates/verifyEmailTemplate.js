"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailTemplate = verifyEmailTemplate;
const baseTemplate_1 = require("./baseTemplate");
function verifyEmailTemplate(verificationLink) {
    const content = `
    <p>Bienvenue sur Colobane ! 🎉</p>
    
    <p>Merci de vous être inscrit. Pour activer votre compte et commencer à profiter de notre marketplace, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.</p>

    <div class="info-box">
      <p style="margin: 0; color: #666; font-size: 14px;">
        ⏱️ Ce lien de vérification expire dans <strong>24 heures</strong>.
      </p>
    </div>

    <p style="margin-top: 25px; color: #666;">
      Si vous n'avez pas créé de compte Colobane, vous pouvez ignorer cet email en toute sécurité.
    </p>
  `;
    return (0, baseTemplate_1.baseEmailTemplate)({
        title: 'Vérifiez votre adresse email',
        preheader: 'Cliquez pour activer votre compte Colobane',
        content,
        ctaButton: {
            text: 'Vérifier mon email',
            url: verificationLink
        }
    });
}
