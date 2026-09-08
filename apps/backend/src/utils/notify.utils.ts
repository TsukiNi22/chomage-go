type NewApplicationMail = {
    to: string;
    employerName: string;
    jobTitle: string;
    companyName: string;
    candidateName: string;
    message: string | null;
};

export function renderNewApplicationMail(input: NewApplicationMail): string
{
    let messageBlock = "<p style=\"margin:0;color:#566360;font-style:italic\">Aucun message joint.</p>";
    if (input.message !== null && input.message !== "") {
        messageBlock =
            "<p style=\"margin:0;padding:12px 16px;background:#f2f7f6;border-left:2px solid #0f5f5c;color:#16192b;line-height:1.6\">" +
            escapeHtml(input.message) +
            "</p>";
    }

    return `<!doctype html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f2f7f6;font-family:system-ui,-apple-system,sans-serif;color:#16192b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-top:2px solid #0f5f5c">
        <tr><td style="padding:24px 32px 8px">
          <span style="font-size:20px;font-weight:800;color:#0f5f5c">Géo<span style="color:#9c4429">Emploi</span></span>
        </td></tr>
        <tr><td style="padding:0 32px 8px">
          <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.4px;color:#566360">Nouvelle candidature</p>
          <h1 style="margin:8px 0 0;font-size:22px;line-height:1.25;color:#0f5f5c">${escapeHtml(input.candidateName)} a postulé</h1>
        </td></tr>
        <tr><td style="padding:16px 32px 0">
          <p style="margin:0 0 12px;line-height:1.6;color:#566360">
            Bonjour ${escapeHtml(input.employerName)}, une nouvelle candidature vient d'être déposée sur votre offre
            <strong style="color:#16192b">${escapeHtml(input.jobTitle)}</strong> (${escapeHtml(input.companyName)}).
          </p>
          ${messageBlock}
        </td></tr>
        <tr><td style="padding:24px 32px">
          <a href="${escapeHtml(process.env.FRONTEND_URL || "http://localhost:3000")}/offres"
             style="display:inline-block;padding:10px 18px;background:#b85433;color:#ffffff;text-decoration:none;font-weight:600;border-radius:4px">
            Consulter la candidature
          </a>
        </td></tr>
        <tr><td style="padding:16px 32px 24px;border-top:1px solid #d2e0de">
          <p style="margin:0;font-size:13px;font-weight:600;color:#9c4429">
            Démonstrateur technique, ne constitue pas un service public en exploitation.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string
{
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Point de sortie unique des e-mails.
 * Aucun transport SMTP n'est installe sur ce demonstrateur : le message est journalise
 * tel qu'il partirait, et la variable SMTP_HOST sert de temoin de configuration.
 */
export function sendMail(to: string, subject: string, html: string)
{
    if (!process.env.SMTP_HOST) {
        console.log(
            `[notify] pas de SMTP configure, e-mail non envoye a ${to} ` +
            `(${subject}) - ${html.length} octets de HTML prets a l'envoi`,
        );
        return;
    }

    console.log(`[notify] SMTP_HOST defini mais aucun transport installe, e-mail non envoye a ${to} (${subject})`);
}

export function sendNewApplicationMail(input: NewApplicationMail)
{
    sendMail(
        input.to,
        `Nouvelle candidature de ${input.candidateName} sur "${input.jobTitle}"`,
        renderNewApplicationMail(input),
    );
}

type VerificationMail = {
    name: string;
    url: string;
};

export function renderVerificationMail(input: VerificationMail): string
{
    return `<!doctype html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f2f7f6;font-family:system-ui,-apple-system,sans-serif;color:#16192b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-top:2px solid #0f5f5c">
        <tr><td style="padding:24px 32px 8px">
          <span style="font-size:20px;font-weight:800;color:#0f5f5c">Géo<span style="color:#9c4429">Emploi</span></span>
        </td></tr>
        <tr><td style="padding:0 32px 8px">
          <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.4px;color:#566360">Vérification de l'adresse</p>
          <h1 style="margin:8px 0 0;font-size:22px;line-height:1.25;color:#0f5f5c">Confirmez votre adresse électronique</h1>
        </td></tr>
        <tr><td style="padding:16px 32px 0">
          <p style="margin:0 0 12px;line-height:1.6;color:#566360">
            Bonjour ${escapeHtml(input.name)}, confirmez votre adresse pour activer l'ensemble des
            fonctionnalités de votre compte. Ce lien expire dans une heure.
          </p>
        </td></tr>
        <tr><td style="padding:24px 32px">
          <a href="${escapeHtml(input.url)}"
             style="display:inline-block;padding:10px 18px;background:#b85433;color:#ffffff;text-decoration:none;font-weight:600;border-radius:4px">
            Vérifier mon adresse
          </a>
        </td></tr>
        <tr><td style="padding:0 32px 16px">
          <p style="margin:0;font-size:13px;color:#566360;word-break:break-all">${escapeHtml(input.url)}</p>
        </td></tr>
        <tr><td style="padding:16px 32px 24px;border-top:1px solid #d2e0de">
          <p style="margin:0;font-size:13px;font-weight:600;color:#9c4429">
            Démonstrateur technique, ne constitue pas un service public en exploitation.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function sendVerificationMail(to: string, input: VerificationMail)
{
    sendMail(to, "Confirmez votre adresse électronique — GéoEmploi", renderVerificationMail(input));
}
