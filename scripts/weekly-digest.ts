/**
 * Wekelijkse digest — cron job script.
 * Draait elke maandagochtend om 8:00.
 * Stuurt coordinatoren een overzicht van de afgelopen week.
 */
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { Resend } from "resend";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@welzijnsklik.nl";
const APP_URL = process.env.NEXTAUTH_URL ?? "https://welzijnsklik.nl";

const ESCAPE = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function digestHtml(
  naam: string,
  stats: { activiteiten: number; uren: number; vrijwilligersActief: number; nieuweAanmeldingen: number; bewoners: number; perVrijwilliger: { naam: string; uren: number }[] },
  organisatie: string
): string {
  const vrijwilligerRows = stats.perVrijwilliger
    .slice(0, 5)
    .map((v) => `<tr><td>${ESCAPE(v.naam)}</td><td>${v.uren}u</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#faf8f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
  .container{max-width:560px;margin:0 auto;padding:24px 16px}
  .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)}
  .header{background:#e5a500;padding:32px 32px 24px;text-align:center}
  .header h1{color:#fff;font-size:20px;font-weight:700;margin:12px 0 0}
  .header p{color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0}
  .body{padding:32px;color:#1a1714}
  .body h2{font-size:16px;font-weight:700;margin:0 0 12px}
  .body p{font-size:14px;line-height:1.6;color:#655e54;margin:0 0 12px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}
  .grid-item{background:#fffbeb;border-radius:12px;padding:12px;text-align:center}
  .grid-item .num{font-size:22px;font-weight:700;color:#1a1714}
  .grid-item .lbl{font-size:11px;color:#a39b8e}
  table{width:100%;border-collapse:collapse}
  td{padding:10px 0;border-bottom:1px solid #f5f2ed;font-size:13px;color:#655e54}
  td:last-child{text-align:right;font-weight:600;color:#1a1714}
  .cta{text-align:center;padding:16px 0 8px}
  .cta a{display:inline-block;background:#e5a500;color:#fff!important;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none}
  .footer{text-align:center;font-size:11px;color:#a39b8e;padding:16px 32px 24px}
</style></head>
<body>
<div class="container">
<div class="card">
<div class="header"><h1>Wekelijkse samenvatting</h1><p>${ESCAPE(organisatie)}</p></div>
<div class="body">
<h2>Hoi ${ESCAPE(naam)} 👋</h2>
<p>Dit is je wekelijkse samenvatting van Welzijnsklik.</p>
<div class="grid">
<div class="grid-item"><div class="num">${stats.activiteiten}</div><div class="lbl">activiteiten</div></div>
<div class="grid-item" style="background:#ecfdf5"><div class="num">${Math.floor(stats.uren)}u</div><div class="lbl">vrijwilligersuren</div></div>
<div class="grid-item" style="background:#f0f9ff"><div class="num">${stats.vrijwilligersActief}</div><div class="lbl">actieve vrijwilligers</div></div>
<div class="grid-item" style="background:#fef3c7"><div class="num">${stats.nieuweAanmeldingen}</div><div class="lbl">nieuwe aanmeldingen</div></div>
</div>
${vrijwilligerRows ? `<h2>Uren per vrijwilliger (top 5)</h2><table>${vrijwilligerRows}</table>` : ""}
<p style="margin-top:16px">${stats.bewoners} bewoners · <strong>${stats.activiteiten}</strong> activiteiten deze week</p>
<div class="cta"><a href="${APP_URL}/coordinator">Open dashboard</a></div>
</div>
<div class="footer">Welzijnsklik · ${ESCAPE(organisatie)}<br><a href="${APP_URL}/account">Notificatievoorkeuren aanpassen</a></div>
</div></div></body></html>`;
}

async function main() {
  console.log("[weekly-digest] Start…");
  const nu = new Date();
  const weekGeleden = new Date(nu.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Vind alle coordinatoren — alleen die met digest aan (default: true)
  const coordinatoren = await prisma.gebruiker.findMany({
    where: { rol: "COORDINATOR" },
    include: {
      organisatie: { select: { naam: true, id: true } },
    },
  });

  // Filter op emailVoorkeur (kan null zijn = default true)
  const metDigest: typeof coordinatoren = [];
  for (const c of coordinatoren) {
    const voorkeur = await prisma.emailVoorkeur.findUnique({
      where: { gebruikerId: c.id },
      select: { wekelijkseDigest: true },
    });
    if (voorkeur === null || voorkeur.wekelijkseDigest === true) {
      metDigest.push(c);
    }
  }

  console.log(`[weekly-digest] ${metDigest.length}/${coordinatoren.length} coordinatoren met digest aan`);

  // Groepeer per organisatie
  const orgMap = new Map<string, typeof metDigest>();
  for (const c of metDigest) {
    const existing = orgMap.get(c.organisatieId) ?? [];
    existing.push(c);
    orgMap.set(c.organisatieId, existing);
  }

  let verzonden = 0;
  const orgIds = Array.from(orgMap.keys());

  for (const orgId of orgIds) {
    const coordinatorenVanOrg = orgMap.get(orgId)!;
    const org = coordinatorenVanOrg[0].organisatie;

    // Stats voor deze organisatie in de afgelopen week
    const [activiteiten, bewoners, aanmeldingen] = await Promise.all([
      prisma.activiteit.findMany({
        where: {
          bewoner: { organisatieId: orgId },
          createdAt: { gte: weekGeleden },
        },
        include: { vrijwilliger: { select: { naam: true } } },
      }),
      prisma.bewoner.count({ where: { organisatieId: orgId } }),
      prisma.wervingsinteresse.count({
        where: { status: "nieuw", gebruiker: { organisatieId: orgId } },
      }),
    ]);

    const totaalUren = activiteiten.reduce((s, a) => s + a.duurMinuten, 0);
    const uniekeVrijwilligers = new Set(activiteiten.map((a) => a.vrijwilligerId)).size;

    // Uren per vrijwilliger
    const urenMap = new Map<string, number>();
    for (const a of activiteiten) {
      urenMap.set(a.vrijwilliger.naam, (urenMap.get(a.vrijwilliger.naam) ?? 0) + a.duurMinuten);
    }
    const perVrijwilliger = Array.from(urenMap.entries())
      .map(([naam, min]) => ({ naam, uren: Math.round((min / 60) * 10) / 10 }))
      .sort((a, b) => b.uren - a.uren);

    const stats = {
      activiteiten: activiteiten.length,
      uren: totaalUren,
      vrijwilligersActief: uniekeVrijwilligers,
      nieuweAanmeldingen: aanmeldingen,
      bewoners,
      perVrijwilliger,
    };

    for (const coordinator of coordinatorenVanOrg) {
      const html = digestHtml(coordinator.naam, stats, org.naam);
      try {
        await resend.emails.send({
          from: FROM,
          to: [coordinator.email],
          subject: `📊 Wekelijkse samenvatting — ${org.naam} (${stats.activiteiten} activiteiten)`,
          html,
        });
        verzonden++;
        console.log(`[weekly-digest] ✓ ${coordinator.naam} (${coordinator.email})`);
      } catch (err) {
        console.error(`[weekly-digest] ❌ ${coordinator.email}:`, err);
      }
    }
  }

  console.log(`[weekly-digest] Gereed — ${verzonden}/${metDigest.length} verzonden`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
