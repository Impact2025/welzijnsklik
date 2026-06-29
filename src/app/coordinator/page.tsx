import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CoordinatorDashboard() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const [activiteiten, bewoners, vrijwilligers, interesses] = await Promise.all([
    prisma.activiteit.findMany({
      where: { bewoner: { organisatieId } },
      include: {
        bewoner: { select: { naam: true } },
        vrijwilliger: { select: { naam: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.bewoner.count({ where: { organisatieId } }),
    prisma.gebruiker.count({ where: { organisatieId, rol: "VRIJWILLIGER" } }),
    prisma.wervingsinteresse.count({ where: { status: "nieuw", gebruiker: { organisatieId } } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Statistieken */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Bewoners", value: bewoners, href: "/coordinator/bewoners" },
          { label: "Vrijwilligers", value: vrijwilligers, href: "#" },
          { label: "Activiteiten", value: activiteiten.length > 0 ? "recente" : "geen", href: "/coordinator/briefjes" },
          { label: "Nieuwe aanmeldingen", value: interesses, href: "#" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
          >
            <p className="text-3xl font-bold text-amber-600">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recente activiteiten */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Recente activiteiten</h2>
          <Link
            href="/coordinator/briefjes"
            className="text-amber-600 hover:underline text-sm"
          >
            Alle briefjes →
          </Link>
        </div>
        {activiteiten.length === 0 ? (
          <p className="text-gray-400 text-sm p-4">Nog geen activiteiten geregistreerd.</p>
        ) : (
          <div className="divide-y">
            {activiteiten.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {a.vrijwilliger.naam} bij {a.bewoner.naam}
                  </p>
                  <p className="text-xs text-gray-500">
                    {a.type} · {a.duurMinuten} min ·{" "}
                    {new Date(a.createdAt).toLocaleDateString("nl-NL")}
                  </p>
                  {a.notities && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{a.notities}</p>
                  )}
                </div>
                {a.fotoUrl && (
                  <img
                    src={a.fotoUrl}
                    alt="Foto activiteit"
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
