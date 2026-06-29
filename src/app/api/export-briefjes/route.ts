import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Exporteer activiteiten als gestileerde HTML (openen in browser → print als PDF).
 * GET /api/export-briefjes?van=...&tot=...&vrijwilligerId=...
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.organisatieId || session.user.rol !== "COORDINATOR") {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const vanParam = searchParams.get("van");
  const totParam = searchParams.get("tot");
  const vrijwilligerId = searchParams.get("vrijwilligerId");

  const nu = new Date();
  const eersteVanMaand = new Date(nu.getFullYear(), nu.getMonth(), 1);
  const van = vanParam ? new Date(vanParam) : eersteVanMaand;
  const tot = totParam ? new Date(totParam) : nu;

interface ActiviteitItem {
  id: string;
  bewonerId: string;
  vrijwilligerId: string;
  type: string;
  duurMinuten: number;
  notities: string | null;
  fotoUrl: string | null;
  createdAt: Date;
  bewoner: { naam: string };
  vrijwilliger: { naam: string };
}

  const activiteiten: ActiviteitItem[] = await prisma.activiteit.findMany({
    where: {
      bewoner: { organisatieId: session.user.organisatieId },
      createdAt: { gte: van, lte: tot },
      ...(vrijwilligerId ? { vrijwilligerId } : {}),
    },
    include: {
      bewoner: { select: { naam: true } },
      vrijwilliger: { select: { naam: true } },
    },
    orderBy: [{ vrijwilliger: { naam: "asc" } }, { createdAt: "desc" }],
  });

  const perVrijwilliger = activiteiten.reduce<Record<string, { naam: string; totaalMinuten: number; items: typeof activiteiten }>>(
    (acc, a) => {
      const key = a.vrijwilligerId;
      if (!acc[key]) acc[key] = { naam: a.vrijwilliger.naam, totaalMinuten: 0, items: [] };
      acc[key].totaalMinuten += a.duurMinuten;
      acc[key].items.push(a);
      return acc;
    },
    {}
  );

  const totaalMinuten = activiteiten.reduce((sum, a) => sum + a.duurMinuten, 0);

  const formatNL = (d: Date) =>
    d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });

  const rows = Object.values(perVrijwilliger)
    .map(
      (vw) => `
    <div class="section">
      <div class="section-header">
        <h2>${escHtml(vw.naam)}</h2>
        <span class="uren">${Math.floor(vw.totaalMinuten / 60)}u ${vw.totaalMinuten % 60}m</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Bewoner</th>
            <th>Activiteit</th>
            <th>Duur</th>
            <th>Notities</th>
          </tr>
        </thead>
        <tbody>
          ${vw.items
            .map(
              (a) => `
            <tr>
              <td>${formatNL(new Date(a.createdAt))}</td>
              <td>${escHtml(a.bewoner.naam)}</td>
              <td>${escHtml(a.type)}</td>
              <td>${a.duurMinuten} min</td>
              <td>${a.notities ? escHtml(a.notities) : "—"}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>Briefjes rapportage</title>
<style>
  @page { margin: 20mm 15mm; }
  body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; color: #222; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .sub { color: #666; font-size: 12px; margin-bottom: 20px; }
  .summary { background: #f5f5f5; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; }
  .section { margin-bottom: 24px; page-break-inside: avoid; }
  .section-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5a500; padding-bottom: 6px; margin-bottom: 8px; }
  .section-header h2 { font-size: 14px; margin: 0; }
  .section-header .uren { font-size: 12px; font-weight: bold; color: #e5a500; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; color: #888; padding: 6px 4px; border-bottom: 1px solid #ddd; }
  td { padding: 6px 4px; border-bottom: 1px solid #eee; }
  .footer { margin-top: 30px; font-size: 10px; color: #aaa; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
</style>
</head>
<body>
  <h1>Briefjes rapportage</h1>
  <p class="sub">${formatNL(van)} – ${formatNL(tot)}</p>
  <div class="summary">
    <strong>Totaal:</strong> ${activiteiten.length} activiteiten · ${Math.floor(totaalMinuten / 60)}u ${totaalMinuten % 60}m ·
    ${Object.keys(perVrijwilliger).length} vrijwilliger(s)
  </div>
  ${rows}
  <div class="footer">Welzijnsklik · Gegenereerd op ${formatNL(new Date())}</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="briefjes-${formatNL(van).replace(/\s/g, "-")}-${formatNL(tot).replace(/\s/g, "-")}.html"`,
    },
  });
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
