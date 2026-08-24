import { prisma } from "@/lib/prisma";
import { sendEmail, welzijncheckReminderHtml } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

/**
 * Maandelijkse herinnering voor de welzijnscheck.
 * GET /api/cron/welzijncheck-reminder — bedoeld voor Vercel Cron, zie vercel.json
 * (draait op de 1e van elke maand). Vercel stuurt automatisch een
 * `Authorization: Bearer ${CRON_SECRET}`-header mee als CRON_SECRET is ingesteld.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
  }

  const vrijwilligers = await prisma.gebruiker.findMany({
    where: { rol: { in: ["VRIJWILLIGER", "WELZIJNSMEDEWERKER"] } },
    select: { naam: true, email: true, organisatie: { select: { naam: true } } },
  });

  let verzonden = 0;
  for (const v of vrijwilligers) {
    const ok = await sendEmail({
      to: v.email,
      subject: "Tijd voor je welzijnscheck 💬",
      html: welzijncheckReminderHtml(v.naam, v.organisatie.naam),
    });
    if (ok) verzonden++;
  }

  console.log(`[welzijncheck-reminder] ${verzonden}/${vrijwilligers.length} verzonden`);
  return NextResponse.json({ verzonden, totaal: vrijwilligers.length });
}
