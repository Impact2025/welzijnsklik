import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function FamilieTijdlijn() {
  const session = await auth();
  const gebruikerId = session!.user.gebruikerId!;

  // Haal alle bewoners op waarmee dit familielid gekoppeld is
  const koppelingen = await prisma.familieKoppeling.findMany({
    where: { gebruikerId },
    include: {
      bewoner: {
        include: {
          activiteiten: {
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
              vrijwilliger: { select: { naam: true } },
            },
          },
        },
      },
    },
  });

  if (koppelingen.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">
          Je bent nog niet gekoppeld aan een bewoner. Neem contact op met de
          coördinator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {koppelingen.map(({ bewoner, relatie }) => (
        <div key={bewoner.id} className="space-y-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-bold text-gray-800">{bewoner.naam}</h1>
            <span className="text-sm text-amber-600 capitalize">{relatie}</span>
          </div>

          {bewoner.activiteiten.length === 0 ? (
            <p className="text-gray-400 text-sm">Nog geen activiteiten geregistreerd.</p>
          ) : (
            <div className="space-y-3">
              {bewoner.activiteiten.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-xl shadow-sm p-4 flex gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">
                      {a.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      met {a.vrijwilliger.naam} · {a.duurMinuten} min ·{" "}
                      {new Date(a.createdAt).toLocaleDateString("nl-NL", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                    {a.notities && (
                      <p className="text-sm text-gray-600 mt-1">{a.notities}</p>
                    )}
                  </div>
                  {/* Foto alleen tonen als bewoner toestemming heeft gegeven */}
                  {a.fotoUrl && bewoner.toestemmingFotos && (
                    <img
                      src={a.fotoUrl}
                      alt="Foto van activiteit"
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <Link
            href="/familie/help-mee"
            className="block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-xl text-sm transition"
          >
            Wil jij ook een keer meehelpen? →
          </Link>
        </div>
      ))}
    </div>
  );
}
