export function verifyEmailTemplate(verificationLink: string) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Vérification de votre email</h2>
        <p>Merci de confirmer votre adresse email pour activer votre compte Colobane.</p>
  
        <p>
          <a
            href="${verificationLink}"
            style="
              display: inline-block;
              padding: 12px 18px;
              background: #000;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Vérifier mon email
          </a>
        </p>
  
        <p>Ce lien expire dans 24 heures.</p>
        <p>L’équipe Colobane</p>
      </div>
    `;
  }
  