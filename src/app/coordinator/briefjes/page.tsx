import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function BriefjesPage({
  searchParams,
}: {
  searchParams: { van?: string; tot?: string; vrijwilligerId?: string };
}) {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const nu = new Date();
  const eersteVanMaand = new Date(nu.getFullYear(), nu.getMonth(), 1);

  const van = searchParams.van ? new Date(searchParams.van) : eersteVanMaand;
  const tot = searchParams.tot ? new Date(searchParams.tot) : nu;

  const vrijwilligers = await prisma.gebruiker.findMany({
    where: { organisatieId, rol: "VRIJWILLIGER" },
    orderBy: { naam: "asc" },
  });

  const activiteiten = await prisma.activiteit.findMany({
    where: {
      bewoner: { organisatieId },
      createdAt: { gte: van, lte: tot },
      ...(searchParams.vrijwilligerId
        ? { vrijwilligerId: searchParams.vrijwilligerId }
        : {}),
    },
    include: {
      bewoner: { select: { naam: true } },
      vrijwilliger: { select: { naam: true } },
    },
    orderBy: [{ vrijwilliger: { naam: "asc" } }, { createdAt: "desc" }],
  });

  // Groepeer per vrijwilliger
  const perVrijwilliger = activiteiten.reduce<
    Record<string, { naam: string; totaalMinuten: number; activiteiten: typeof activiteiten }>
  >((acc, a) => {
    const key = a.vrijwilligerId;
    if (!acc[key]) {
      acc[key] = { naam: a.vrijwilliger.naam, totaalMinuten: 0, activiteiten: [] };
    }
    acc[key].totaalMinuten += a.duurMinuten;
    acc[key].activiteiten.push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Briefjes / Rapportage</h1>

      {/* Filter */}
      <form method="GET" className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Van</label>
          <input
            type="date"
            name="van"
            defaultValue={van.toISOString().slice(0, 10)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tot</label>
          <input
            type="date"
            name="tot"
            defaultValue={tot.toISOString().slice(0, 10)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Vrijwilliger</label>
          <select
            name="vrijwilligerId"
            defaultValue={searchParams.vrijwilligerId ?? ""}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Alle vrijwilligers</option>
            {vrijwilligers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.naam}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
        >
          Filter
        </button>
      </form>

      {/* Rapportagetabel per vrijwilliger */}
      {Object.keys(perVrijwilliger).length === 0 ? (
        <p className="text-gray-400 text-sm">Geen activiteiten gevonden voor deze periode.</p>
      ) : (
        Object.values(perVrijwilliger).map((vw) => (
          <div key={vw.naam} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-amber-50 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">{vw.naam}</h2>
              <span className="text-sm text-gray-500">
                Totaal: {Math.floor(vw.totaalMinuten / 60)}u{" "}
                {vw.totaalMinuten % 60}min
              </span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Datum</th>
                  <th className="px-4 py-2 text-left">Bewoner</th>
                  <th className="px-4 py-2 text-left">Activiteit</th>
                  <th className="px-4 py-2 text-right">Duur</th>
                  <th className="px-4 py-2 text-left">Notities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vw.activiteiten.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString("nl-NL")}
                    </td>
                    <td className="px-4 py-2 text-gray-800">{a.bewoner.naam}</td>
                    <td className="px-4 py-2 text-gray-800">{a.type}</td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {a.duurMinuten} min
                    </td>
                    <td className="px-4 py-2 text-gray-400 max-w-xs truncate">
                      {a.notities ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
