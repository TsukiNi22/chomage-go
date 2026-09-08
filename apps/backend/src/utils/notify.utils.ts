import nodemailer from "nodemailer";
import type {Transporter, TransportOptions} from "nodemailer";
import {mkdir, writeFile} from "node:fs/promises";
import {join} from "node:path";

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

let transport: Transporter | null = null;
let transportChecked = false;

function mailFrom(): string
{
    return process.env.MAIL_FROM || "GeoEmploi <no-reply@geoemploi.fr>";
}

/**
 * Transport SMTP construit à la demande à partir des variables d'environnement.
 * Renvoie null tant qu'aucun serveur n'est configuré : l'application reste utilisable
 * sans SMTP, les messages sont alors seulement journalisés.
 */
function getTransport(): Transporter | null
{
    if (transportChecked) {
        return transport;
    }
    transportChecked = true;

    if (process.env.SMTP_URL) {
        transport = nodemailer.createTransport(process.env.SMTP_URL);
        return transport;
    }

    if (!process.env.SMTP_HOST) {
        return null;
    }

    const port = Number(process.env.SMTP_PORT || "587");
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    const options: TransportOptions & Record<string, unknown> = {
        host: process.env.SMTP_HOST,
        port: port,
        secure: secure,
    };

    if (process.env.SMTP_USER) {
        options.auth = {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD || "",
        };
    }

    transport = nodemailer.createTransport(options);

    return transport;
}

/**
 * Dépose une copie du message sur disque quand MAIL_OUTBOX_DIR est défini.
 * Sert à relire les e-mails en développement, sans serveur SMTP.
 */
async function writeToOutbox(to: string, subject: string, html: string)
{
    const dir = process.env.MAIL_OUTBOX_DIR;
    if (!dir) {
        return;
    }

    try {
        await mkdir(dir, { recursive: true });
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        const safeTo = to.replace(/[^a-zA-Z0-9._-]/g, "_");
        const file = join(dir, stamp + "_" + safeTo + ".html");
        await writeFile(file, "<!-- " + subject + " -->\n" + html, "utf-8");
        console.log(`[notify] copie du message ecrite dans ${file}`);
    } catch (error) {
        console.error("[notify] impossible d'ecrire la copie du message", error);
    }
}

/**
 * Point de sortie unique des e-mails.
 * Envoie par SMTP dès qu'un serveur est configuré ; sans configuration, le message
 * est journalisé (et copié dans MAIL_OUTBOX_DIR si la variable est définie) afin que
 * le service reste utilisable en développement.
 */
export async function sendMail(to: string, subject: string, html: string)
{
    await writeToOutbox(to, subject, html);

    const mailer = getTransport();

    if (mailer === null) {
        console.log(
            `[notify] pas de SMTP configure, e-mail non envoye a ${to} ` +
            `(${subject}) - ${html.length} octets de HTML prets a l'envoi`,
        );
        return;
    }

    try {
        await mailer.sendMail({
            from: mailFrom(),
            to: to,
            subject: subject,
            html: html,
        });
        console.log(`[notify] e-mail envoye a ${to} (${subject})`);
    } catch (error) {
        console.error(`[notify] echec de l'envoi a ${to} (${subject})`, error);
    }
}

export function sendNewApplicationMail(input: NewApplicationMail)
{
    // L'envoi ne doit pas retarder la réponse HTTP : les échecs sont journalisés.
    void sendMail(
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

export async function sendVerificationMail(to: string, input: VerificationMail)
{
    console.log(`[notify] lien de verification pour ${to} : ${input.url}`);
    await sendMail(to, "Confirmez votre adresse électronique — GéoEmploi", renderVerificationMail(input));
}
