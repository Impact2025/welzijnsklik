import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@welzijnsklik.nl";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:8765";

// ═════════════════════════════════════════════════════════════
// Generieke wrapper — logt sending, vangt fouten af
// ═════════════════════════════════════════════════════════════

interface SendParams {
  to: string | string[];
  subject: string;
  html: string;
  /** Als true: laat de fout doorvliegen ipv silent catch */
  throwOnError?: boolean;
}

export async function sendEmail({ to, subject, html, throwOnError = false }: SendParams) {
  const start = Date.now();
  console.log(`[email] → ${Array.isArray(to) ? to.join(", ") : to}: "${subject}"`);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error(`[email] ❌ Fout:`, error);
      if (throwOnError) throw new Error(`Resend: ${error.message}`);
      return false;
    }

    console.log(`[email] ✓ Verzonden in ${Date.now() - start}ms — id: ${data?.id}`);
    return true;
  } catch (err) {
    console.error(`[email] ❌ Uitzondering:`, err);
    if (throwOnError) throw err;
    return false;
  }
}

// ═════════════════════════════════════════════════════════════
// HTML-template engine
// ═════════════════════════════════════════════════════════════

interface TemplateParams {
  title: string;
  preheader: string;
  body: string;
  cta?: { label: string; url: string };
  footer?: string;
}

function baseHtml({ title, preheader, body, cta, footer }: TemplateParams): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${esc(title)}</title>
  <style>
    @media only screen and (max-width: 480px) {
      .container { width: 100% !important; }
      .inner { padding: 24px 16px !important; }
      .cta-btn { width: 100% !important; display: block !important; }
      .logo-text { font-size: 18px !important; }
    }
    body { margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 560px; margin: 0 auto; padding: 24px 16px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.04); }
    .header { background: #e5a500; padding: 32px 32px 24px; text-align: center; }
    .header img { width: 48px; height: 48px; }
    .header h1 { color: #ffffff; font-size: 20px; font-weight: 700; margin: 12px 0 0; letter-spacing: 0.5px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 13px; margin: 4px 0 0; }
    .body { padding: 32px 32px 24px; color: #1a1714; }
    .body h2 { font-size: 16px; font-weight: 700; margin: 0 0 12px; color: #1a1714; }
    .body p { font-size: 14px; line-height: 1.6; color: #655e54; margin: 0 0 12px; }
    .body ul { margin: 8px 0 16px; padding-left: 20px; }
    .body li { font-size: 14px; line-height: 1.6; color: #655e54; margin-bottom: 4px; }
    .cta-wrap { text-align: center; padding: 16px 0 8px; }
    .cta-btn { display: inline-block; background: #e5a500; color: #ffffff !important; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px; text-decoration: none; }
    .divider { height: 1px; background: #e8e3db; margin: 20px 0; }
    .footer-text { padding: 16px 32px 24px; text-align: center; font-size: 11px; color: #a39b8e; }
    .footer-text a { color: #a39b8e; text-decoration: underline; }
    .badge { display: inline-block; background: #fef3c7; color: #b45309; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
    table.activity { width: 100%; border-collapse: collapse; }
    table.activity td { padding: 10px 0; border-bottom: 1px solid #f5f2ed; font-size: 13px; color: #655e54; }
    table.activity td:last-child { text-align: right; font-weight: 600; color: #1a1714; }
    .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f2ed; font-size: 13px; }
    .stat-label { color: #655e54; }
    .stat-value { font-weight: 700; color: #1a1714; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="${APP_URL}/logo.svg" alt="W" width="48" height="48">
        <h1>${esc(title)}</h1>
        <p>${esc(preheader)}</p>
      </div>
      <div class="body">
        ${body}
        ${cta ? `
        <div class="cta-wrap">
          <a href="${esc(cta.url)}" class="cta-btn">${esc(cta.label)}</a>
        </div>` : ""}
      </div>
      <div class="footer-text">
        ${footer ?? `Welzijnsklik · De Meerwende<br><a href="${APP_URL}/account">Je ontvangt deze e-mail omdat je een account hebt.<br>Pas je voorkeuren aan in je accountinstellingen.</a>`}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ═════════════════════════════════════════════════════════════
// Specifieke templates
// ═════════════════════════════════════════════════════════════

export function welkomHtml(naam: string, rol: string, organisatie: string): string {
  const rolLabel = { COORDINATOR: "coördinator", VRIJWILLIGER: "vrijwilliger", FAMILIE: "familie" }[rol] ?? "gebruiker";
  return baseHtml({
    title: "Welkom bij Welzijnsklik",
    preheader: `Je bent toegevoegd als ${rolLabel} bij ${organisatie}`,
    body: `
      <h2>Hoi ${esc(naam)},</h2>
      <p>Je bent toegevoegd als <span class="badge">${esc(rolLabel)}</span> bij <strong>${esc(organisatie)}</strong>.</p>
      <p>Welzijnsklik is het platform waarmee vrijwilligers, bewoners en familie verbonden blijven in de ouderenzorg.</p>
      <p>Log in met de e-mail die je hebt ontvangen en ga aan de slag.</p>
    `,
    cta: { label: "Inloggen op Welzijnsklik", url: APP_URL },
  });
}

export function activiteitHtml(
  bewonerNaam: string,
  vrijwilligerNaam: string,
  type: string,
  duurMinuten: number,
  notities: string | null,
  relatie: string,
  organisatie: string
): string {
  return baseHtml({
    title: `Nieuwe activiteit: ${type}`,
    preheader: `${vrijwilligerNaam} was ${type.toLowerCase()} bij ${bewonerNaam}`,
    body: `
      <h2>🔄 Nieuwe activiteit geregistreerd</h2>
      <p>Beste familie,</p>
      <p>Er is zojuist een nieuwe activiteit geregistreerd voor <strong>${esc(bewonerNaam)}</strong>.</p>
      <div style="background:#f5f2ed; border-radius:12px; padding:16px; margin:16px 0;">
        <table class="activity">
          <tr><td>Activiteit</td><td>${esc(type)}</td></tr>
          <tr><td>Vrijwilliger</td><td>${esc(vrijwilligerNaam)}</td></tr>
          <tr><td>Duur</td><td>${duurMinuten} minuten</td></tr>
        </table>
        ${notities ? `<p style="margin-top:12px;font-style:italic;color:#817a6e;">"${esc(notities)}"</p>` : ""}
      </div>
      <p style="color:#a39b8e;font-size:12px;">Je ontvangt deze notificatie als ${esc(relatie)} van ${esc(bewonerNaam)}.</p>
    `,
    cta: { label: "Bekijk op Welzijnsklik", url: `${APP_URL}/familie` },
    footer: `Welzijnsklik · ${esc(organisatie)}<br><a href="${APP_URL}/account">Notificatievoorkeuren aanpassen</a>`,
  });
}

export function wervingHtml(
  naam: string,
  email: string,
  bericht: string | null,
  organisatie: string
): string {
  return baseHtml({
    title: "Nieuwe aanmelding samenzorg-vrijwilliger",
    preheader: `${naam} wil helpen bij ${organisatie}`,
    body: `
      <h2>🙌 Nieuwe aanmelding</h2>
      <p><strong>${esc(naam)}</strong> heeft zich aangemeld als samenzorg-vrijwilliger.</p>
      <div style="background:#f5f2ed; border-radius:12px; padding:16px; margin:16px 0;">
        <table class="activity">
          <tr><td>Naam</td><td>${esc(naam)}</td></tr>
          <tr><td>E-mail</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          ${bericht ? `<tr><td>Bericht</td><td>"${esc(bericht)}"</td></tr>` : ""}
        </table>
      </div>
      <p>Neem contact op om de vervolgstappen te bespreken.</p>
    `,
    cta: { label: "Bekijk in Welzijnsklik", url: `${APP_URL}/coordinator/meldingen` },
    footer: `Welzijnsklik · ${esc(organisatie)}`,
  });
}

export function toestemmingHtml(
  bewonerNaam: string,
  actie: string,
  door: string,
  uitgevoerdDoor: string,
  organisatie: string
): string {
  const isAan = actie === "AAN";
  return baseHtml({
    title: `Toestemming fotografie ${isAan ? "aangezet" : "uitgezet"}`,
    preheader: `Toestemming voor ${bewonerNaam} is ${isAan ? "verleend" : "ingetrokken"}`,
    body: `
      <h2>${isAan ? "✅" : "⛔"} Toestemming fotografie ${isAan ? "aangezet" : "uitgezet"}</h2>
      <p>Voor <strong>${esc(bewonerNaam)}</strong> is de toestemming voor fotografie bij activiteiten <strong>${isAan ? "aangezet" : "uitgezet"}</strong>.</p>
      <div style="background:#f5f2ed; border-radius:12px; padding:16px; margin:16px 0;">
        <table class="activity">
          <tr><td>Bewoner</td><td>${esc(bewonerNaam)}</td></tr>
          <tr><td>Actie</td><td>${isAan ? "Aangezet" : "Uitgezet"}</td></tr>
          <tr><td>Door</td><td>${esc(door)}</td></tr>
          <tr><td>Uitgevoerd door</td><td>${esc(uitgevoerdDoor)}</td></tr>
        </table>
      </div>
      <p style="color:#a39b8e;font-size:12px;">Deze wijziging is vastgelegd in het AVG-toestemmingslogboek.</p>
    `,
    footer: `Welzijnsklik · ${esc(organisatie)}`,
  });
}

export function weekDigestHtml(
  naam: string,
  stats: {
    activiteiten: number;
    uren: number;
    vrijwilligersActief: number;
    nieuweAanmeldingen: number;
    bewoners: number;
    perVrijwilliger: { naam: string; uren: number }[];
  },
  organisatie: string
): string {
  const vrijwilligerRows = stats.perVrijwilliger
    .slice(0, 5)
    .map((v) => `<tr><td>${esc(v.naam)}</td><td>${v.uren}u</td></tr>`)
    .join("");

  return baseHtml({
    title: "Wekelijkse samenvatting",
    preheader: `${stats.activiteiten} activiteiten · ${stats.uren} uur · ${stats.vrijwilligersActief} vrijwilligers`,
    body: `
      <h2>Hoi ${esc(naam)}, 👋</h2>
      <p>Dit is je wekelijkse samenvatting van Welzijnsklik voor ${esc(organisatie)}.</p>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:16px 0;">
        <div style="background:#fffbeb; border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:22px; font-weight:700; color:#1a1714;">${stats.activiteiten}</div>
          <div style="font-size:11px; color:#a39b8e;">activiteiten</div>
        </div>
        <div style="background:#ecfdf5; border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:22px; font-weight:700; color:#1a1714;">${Math.floor(stats.uren)}u</div>
          <div style="font-size:11px; color:#a39b8e;">vrijwilligers</div>
        </div>
        <div style="background:#f0f9ff; border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:22px; font-weight:700; color:#1a1714;">${stats.vrijwilligersActief}</div>
          <div style="font-size:11px; color:#a39b8e;">actieve vrijwilligers</div>
        </div>
        <div style="background:#fef3c7; border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:22px; font-weight:700; color:#1a1714;">${stats.nieuweAanmeldingen}</div>
          <div style="font-size:11px; color:#a39b8e;">nieuwe aanmeldingen</div>
        </div>
      </div>

      ${stats.perVrijwilliger.length > 0 ? `
      <div class="divider"></div>
      <h2>Uren per vrijwilliger (top 5)</h2>
      <table class="activity">
        ${vrijwilligerRows}
      </table>` : ""}

      <p style="margin-top:16px;">${stats.bewoners} bewoners in totaal.</p>
    `,
    cta: { label: "Open dashboard", url: `${APP_URL}/coordinator` },
    footer: `Welzijnsklik · ${esc(organisatie)}<br><a href="${APP_URL}/account">Uitschrijven voor wekelijkse digest</a>`,
  });
}
