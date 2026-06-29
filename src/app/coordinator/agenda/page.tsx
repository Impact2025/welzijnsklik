import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AgendaKalender from "./AgendaKalender";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const session = await auth();
  const organisatieId = session?.user?.organisatieId;
  if (!organisatieId) redirect("/login");

  const { m } = await searchParams;

  const now = new Date();
  let jaar = now.getFullYear();
  let maand = now.getMonth(); // 0-indexed

  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const parts = m.split("-");
    jaar = parseInt(parts[0]);
    maand = parseInt(parts[1]) - 1;
  }

  const maandStart = new Date(jaar, maand, 1);
  const maandEinde = new Date(jaar, maand + 1, 0, 23, 59, 59, 999);

  const [activiteiten, hulpVragen] = await Promise.all([
    prisma.activiteit.findMany({
      where: {
        bewoner: { organisatieId },
        createdAt: { gte: maandStart, lte: maandEinde },
      },
      include: {
        bewoner: { select: { naam: true } },
        vrijwilliger: { select: { naam: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.hulpGevraagd.findMany({
      where: {
        organisatieId,
        datum: { gte: maandStart, lte: maandEinde },
      },
      orderBy: { datum: "asc" },
    }),
  ]);

  function formatTijd(d: Date) {
    return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDuur(min: number) {
    if (min < 60) return `${min} min`;
    const u = Math.floor(min / 60);
    const rest = min % 60;
    return rest > 0 ? `${u}u ${rest}min` : `${u} uur`;
  }

  const activiteitenData = activiteiten.map((a) => ({
    id: a.id,
    dag: new Date(a.createdAt).getDate(),
    type: "activiteit" as const,
    titel: a.type,
    subtitel: `${a.vrijwilliger.naam} → ${a.bewoner.naam}`,
    href: `/coordinator/tijdlijn`,
    tijdLabel: formatTijd(new Date(a.createdAt)),
  }));

  const hulpVragenData = hulpVragen.map((h) => ({
    id: h.id,
    dag: new Date(h.datum).getDate(),
    type: "hulp" as const,
    titel: h.titel,
    subtitel: `${formatTijd(new Date(h.datum))} · ${formatDuur(h.duurMinuten)} · ${h.aantalNodig} vr.`,
    href: `/coordinator/hulp-gevraagd/${h.id}`,
    status: h.status,
    tijdLabel: formatTijd(new Date(h.datum)),
  }));

  return (
    <div className="px-4 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Agenda</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Activiteiten en hulpvragen per maand</p>
      </div>
      <AgendaKalender
        jaar={jaar}
        maand={maand}
        activiteiten={activiteitenData}
        hulpVragen={hulpVragenData}
      />
    </div>
  );
}
