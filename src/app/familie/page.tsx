import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Handshake, Users2 } from "lucide-react";
import { ACTIVITEIT_ICON, formatDatum } from "@/lib/activiteit";
import { getFotoUrl } from "@/lib/foto";

export default async function FamilieTijdlijn() {
  const session = await auth();
  const gebruikerId = session!.user.gebruikerId!;

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
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-2xl">
            <Users2 size={22} className="text-neutral-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Nog niet gekoppeld</p>
            <p className="text-neutral-500 text-sm mt-1">
              Neem contact op met de coördinator om gekoppeld te worden aan een bewoner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {koppelingen.map(({ bewoner, relatie }) => (
        <div key={bewoner.id} className="space-y-4">
          {/* Bewoner header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-700 font-bold">
                {bewoner.naam.split(" ")[0][0]}{bewoner.naam.split(" ").at(-1)?.[0]}
              </span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-[17px]">{bewoner.naam}</h1>
              <p className="text-xs text-neutral-500 capitalize">{relatie}</p>
            </div>
          </div>

          {/* Activiteiten tijdlijn */}
          {bewoner.activiteiten.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-4 py-6 text-center">
              <p className="text-neutral-400 text-sm">Nog geen activiteiten geregistreerd.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {bewoner.activiteiten.map((a) => {
                const cfg = ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders;
                const Icon = cfg.icon;
                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 flex gap-3"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={16} className={cfg.kleur} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{a.type}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        met {a.vrijwilliger.naam} · {a.duurMinuten} min ·{" "}
                        {formatDatum(new Date(a.createdAt), { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                      {a.notities && (
                        <p className="text-sm text-gray-700 mt-1.5 leading-snug">{a.notities}</p>
                      )}
                    </div>
                    {a.fotoUrl && bewoner.toestemmingFotos && (
                      <img
                        src={getFotoUrl(a.fotoUrl, bewoner.id) ?? ""}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <Link
            href="/familie/help-mee"
            className="flex items-center justify-center gap-2 w-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold py-3.5 rounded-2xl text-sm transition-colors border border-amber-200"
          >
            <Handshake size={16} />
            Zelf een keer meehelpen?
          </Link>
        </div>
      ))}
    </div>
  );
}
