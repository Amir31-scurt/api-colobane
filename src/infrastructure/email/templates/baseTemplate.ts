/**
 * Base email template with Colobane branding
 * Provides a consistent, professional look for all emails
 */

interface EmailTemplateOptions {
  title: string;
  preheader?: string;
  content: string;
  ctaButton?: {
    text: string;
    url: string;
  };
}

export function baseEmailTemplate(options: EmailTemplateOptions): string {
  const { title, preheader, content, ctaButton } = options;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px 30px;
    }
    .content h1 {
      font-size: 24px;
      color: #1a1a1a;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .content p {
      color: #666;
      margin-bottom: 15px;
      font-size: 15px;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #999;
      font-size: 13px;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .content h1 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <a href="#" class="logo">COLOBANE</a>
    </div>

    <!-- Content -->
    <div class="content">
      <h1>${title}</h1>
      ${content}
      
      ${ctaButton ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${ctaButton.url}" class="cta-button">${ctaButton.text}</a>
        </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Colobane Marketplace</strong></p>
      <p>Votre marketplace de confiance au Sénégal</p>
      <div class="divider" style="margin: 15px auto; width: 50%;"></div>
      <p style="color: #999;">
        <a href="#" style="color: #f59e0b;">Aide</a> • <a href="#" style="color: #f59e0b;">Contact</a> • <a href="#" style="color: #f59e0b;">Conditions</a>
      </p>
      <p style="margin-top: 15px; color: #bbb;">
        © ${new Date().getFullYear()} Colobane. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
