import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Home } from "lucide-react";

export default async function VrijwilligerBewoners({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kamer?: string }>;
}) {
  const session = await auth();
  if (session?.user?.rol !== "WELZIJNSMEDEWERKER") {
    redirect("/geen-toegang");
  }
  const organisatieId = session.user.organisatieId!;
  const { q, kamer } = await searchParams;

  const bewoners = await prisma.bewoner.findMany({
    where: {
      organisatieId,
      ...(q ? { naam: { contains: q, mode: "insensitive" } } : {}),
      ...(kamer ? { kamer: { contains: kamer, mode: "insensitive" } } : {}),
    },
    orderBy: { naam: "asc" },
  });

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Bewoners</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{bewoners.length} bewoners gevonden</p>
      </div>

      <form className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Zoek op naam..."
          className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="search"
          name="kamer"
          defaultValue={kamer ?? ""}
          placeholder="Kamernummer..."
          className="w-36 px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        {bewoners.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Users size={24} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">Geen bewoners gevonden.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {bewoners.map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-4 py-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-bold text-sm">
                    {b.naam.split(" ")[0][0]}{b.naam.split(" ").at(-1)?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{b.naam}</p>
                  {b.kamer && (
                    <span className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Home size={11} />
                      Kamer {b.kamer}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
