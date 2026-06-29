import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ACTIVITEIT_ICON, formatDatum, formatDuur } from "@/lib/activiteit";
import { getFotoUrl } from "@/lib/foto";
import { Clock, Heart, MessageCircle } from "lucide-react";

export default async function CoordinatorTijdlijn() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const activiteiten = await prisma.activiteit.findMany({
    where: { bewoner: { organisatieId } },
    include: {
      bewoner: { select: { naam: true, toestemmingFotos: true } },
      vrijwilliger: { select: { naam: true } },
      reacties: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { gebruiker: { select: { naam: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tijdlijn</h1>
        <p className="text-sm text-warm-500 mt-0.5">Alle activiteiten op een rij</p>
      </div>

      {activiteiten.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center">
          <Heart size={24} className="text-neutral-300 mx-auto mb-2" />
          <p className="text-warm-400 text-sm">Nog geen activiteiten geregistreerd.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activiteiten.map((a) => {
            const cfg = ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders;
            const Icon = cfg.icon;
            const magFoto = a.fotoUrl && a.bewoner.toestemmingFotos;

            return (
              <article
                key={a.id}
                className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
              >
                {/* Foto — groot en pro */}
                {magFoto && (
                  <div className="relative w-full aspect-[16/9] bg-warm-100 overflow-hidden">
                    <img
                      src={getFotoUrl(a.fotoUrl, a.bewonerId) ?? ""}
                      alt={`${a.type} bij ${a.bewoner.naam}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow-sm">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                        <Icon size={12} className={cfg.kleur} />
                      </div>
                      <span className="text-xs font-bold text-gray-800">{a.type}</span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Header — altijd zichtbaar */}
                  <div className="flex items-center gap-3">
                    {!magFoto && (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={18} className={cfg.kleur} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{a.vrijwilliger.naam}</p>
                        <span className="text-warm-300">·</span>
                        <p className="text-sm text-warm-500 truncate">{a.bewoner.naam}</p>
                      </div>
                      <p className="text-xs text-warm-400 mt-0.5">
                        {formatDatum(new Date(a.createdAt), {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {!magFoto && (
                          <>
                            <span className="mx-1.5">·</span>
                            {a.type}
                            <span className="mx-1.5">·</span>
                            {formatDuur(a.duurMinuten)}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Notities van de vrijwilliger */}
                  {a.notities && (
                    <div className="bg-warm-50 rounded-xl p-3.5 border border-warm-100">
                      <div className="flex items-start gap-2.5">
                        <div className="w-1 h-full min-h-[24px] bg-brand-500 rounded-full flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-1">
                            {a.vrijwilliger.naam}
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">{a.notities}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Duur + metadata */}
                  {magFoto && (
                    <div className="flex items-center gap-3 text-xs text-warm-400">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatDuur(a.duurMinuten)}</span>
                      </div>
                    </div>
                  )}

                  {/* Reacties (max 3) */}
                  {a.reacties.length > 0 && (
                    <div className="pt-2 border-t border-warm-100 space-y-1.5">
                      {a.reacties.slice(0, 3).map((r) => (
                        <div key={r.id} className="flex items-start gap-2 text-xs">
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[7px] font-bold flex-shrink-0 mt-0.5">
                            {r.gebruiker.naam.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">{r.gebruiker.naam}</span>
                            <span className="text-warm-400">
                              {" "}{r.emoji}
                              {r.bericht && <span className="text-gray-600"> {r.bericht}</span>}
                            </span>
                          </div>
                        </div>
                      ))}
                      {a.reacties.length > 3 && (
                        <p className="text-xs text-warm-400 pl-7">
                          +{a.reacties.length - 3} reacties
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
