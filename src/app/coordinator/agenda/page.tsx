import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
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
    prisma.geplandeActiviteit.findMany({
      where: {
        organisatieId,
        datum: { gte: maandStart, lte: maandEinde },
      },
      include: {
        hulpGevraagd: {
          select: { id: true, titel: true, status: true, aantalNodig: true, _count: { select: { reacties: { where: { status: { not: { in: ["afgewezen", "geweigerd"] } } } } } } },
        },
      },
      orderBy: { datum: "asc" },
    }),
    prisma.hulpGevraagd.findMany({
      where: {
        organisatieId,
        datum: { gte: maandStart, lte: maandEinde },
        // Alleen losse hulpvragen (zonder gekoppelde activiteit) tonen we als apart item
        geplandeActiviteit: null,
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

  const activiteitenData = activiteiten.map((a) => {
    const gekoppeld = a.hulpGevraagd;
    const vol = gekoppeld ? gekoppeld._count.reacties >= gekoppeld.aantalNodig : false;
    return {
      id: a.id,
      dag: new Date(a.datum).getDate(),
      type: "activiteit" as const,
      titel: a.titel,
      subtitel: gekoppeld
        ? `Hulp: ${gekoppeld.titel}${vol ? " · vol" : ""}`
        : a.locatie || (a.type ?? "Activiteit"),
      href: `/coordinator/activiteiten/${a.id}`,
      tijdLabel: formatTijd(new Date(a.datum)),
    };
  });

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
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Activiteiten en hulpvragen per maand</p>
        </div>
        <Link
          href="/coordinator/activiteiten/nieuw"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-2xl text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          Activiteit
        </Link>
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
