import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BewonersOverzicht() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const bewoners = await prisma.bewoner.findMany({
    where: { organisatieId },
    orderBy: { naam: "asc" },
    include: {
      _count: { select: { activiteiten: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Bewoners</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {bewoners.length === 0 ? (
          <p className="text-gray-400 text-sm p-4">Geen bewoners gevonden.</p>
        ) : (
          <div className="divide-y">
            {bewoners.map((b) => (
              <Link
                key={b.id}
                href={`/coordinator/bewoners/${b.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-gray-800">{b.naam}</p>
                  <p className="text-xs text-gray-400">
                    {b._count.activiteiten} activiteiten ·{" "}
                    <span
                      className={
                        b.toestemmingFotos
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      {b.toestemmingFotos
                        ? "Foto-toestemming gegeven"
                        : "Geen foto-toestemming"}
                    </span>
                  </p>
                </div>
                <span className="text-gray-300 text-lg">›</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
