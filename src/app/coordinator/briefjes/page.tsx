import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FileText, Clock } from "lucide-react";

export default async function BriefjesPage({
  searchParams,
}: {
  searchParams: Promise<{ van?: string; tot?: string; vrijwilligerId?: string }>;
}) {
  const { van: vanParam, tot: totParam, vrijwilligerId } = await searchParams;
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const nu = new Date();
  const eersteVanMaand = new Date(nu.getFullYear(), nu.getMonth(), 1);

  const van = vanParam ? new Date(vanParam) : eersteVanMaand;
  const tot = totParam ? new Date(totParam) : nu;

  const vrijwilligers = await prisma.gebruiker.findMany({
    where: { organisatieId, rol: "VRIJWILLIGER" },
    orderBy: { naam: "asc" },
  });

  const activiteiten = await prisma.activiteit.findMany({
    where: {
      bewoner: { organisatieId },
      createdAt: { gte: van, lte: tot },
      ...(vrijwilligerId ? { vrijwilligerId } : {}),
    },
    include: {
      bewoner: { select: { naam: true } },
      vrijwilliger: { select: { naam: true } },
    },
    orderBy: [{ vrijwilliger: { naam: "asc" } }, { createdAt: "desc" }],
  });

  const perVrijwilliger = activiteiten.reduce<
    Record<string, { naam: string; totaalMinuten: number; activiteiten: typeof activiteiten }>
  >((acc, a) => {
    const key = a.vrijwilligerId;
    if (!acc[key]) acc[key] = { naam: a.vrijwilliger.naam, totaalMinuten: 0, activiteiten: [] };
    acc[key].totaalMinuten += a.duurMinuten;
    acc[key].activiteiten.push(a);
    return acc;
  }, {});

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Briefjes</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Rapportage per vrijwilliger</p>
      </div>

      {/* Filter */}
      <form method="GET" className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-3">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Filter</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1 font-medium">Van</label>
            <input
              type="date"
              name="van"
              defaultValue={van.toISOString().slice(0, 10)}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1 font-medium">Tot</label>
            <input
              type="date"
              name="tot"
              defaultValue={tot.toISOString().slice(0, 10)}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1 font-medium">Vrijwilliger</label>
          <select
            name="vrijwilligerId"
            defaultValue={vrijwilligerId ?? ""}
            className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
          >
            <option value="">Alle vrijwilligers</option>
            {vrijwilligers.map((v) => (
              <option key={v.id} value={v.id}>{v.naam}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Toepassen
        </button>
      </form>

      {/* Rapportage */}
      {Object.keys(perVrijwilliger).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-4 py-10 text-center">
          <FileText size={24} className="text-neutral-300 mx-auto mb-2" />
          <p className="text-neutral-400 text-sm">Geen activiteiten gevonden voor deze periode.</p>
        </div>
      ) : (
        Object.values(perVrijwilliger).map((vw) => (
          <div key={vw.naam} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-neutral-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-[15px]">{vw.naam}</h2>
              <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-medium">
                <Clock size={12} />
                {Math.floor(vw.totaalMinuten / 60)}u {vw.totaalMinuten % 60}m
              </div>
            </div>
            <div className="divide-y divide-neutral-50">
              {vw.activiteiten.map((a) => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.bewoner.naam}</p>
                      <span className="text-xs text-neutral-400 flex-shrink-0">{a.duurMinuten} min</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{a.type}</span>
                      <span className="text-xs text-neutral-400">
                        {new Date(a.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    {a.notities && (
                      <p className="text-xs text-neutral-400 mt-0.5 italic truncate">{a.notities}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
