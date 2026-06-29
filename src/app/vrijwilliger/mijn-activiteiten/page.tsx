import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Heart, Clock } from "lucide-react";
import { ACTIVITEIT_ICON, formatDatum, formatDuur } from "@/lib/activiteit";
import { getFotoUrl } from "@/lib/foto";

export default async function MijnActiviteiten() {
  const session = await auth();
  const gebruikerId = session!.user.gebruikerId!;

  const activiteiten = await prisma.activiteit.findMany({
    where: { vrijwilligerId: gebruikerId },
    include: {
      bewoner: { select: { naam: true, toestemmingFotos: true } },
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
        <h1 className="text-xl font-bold text-gray-900">Mijn activiteiten</h1>
        <p className="text-sm text-warm-500 mt-0.5">Alles wat jij hebt gedaan</p>
      </div>

      {activiteiten.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center">
          <Heart size={24} className="text-neutral-300 mx-auto mb-2" />
          <p className="text-warm-400 text-sm">Nog geen activiteiten vastgelegd.</p>
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
                {/* Foto */}
                {magFoto && (
                  <div className="relative w-full aspect-[16/9] bg-warm-100 overflow-hidden">
                    <img
                      src={getFotoUrl(a.fotoUrl, a.bewonerId) ?? ""}
                      alt=""
                      className="w-full h-full object-cover"
                    />
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
                  <div className="flex items-center gap-3">
                    {!magFoto && (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={18} className={cfg.kleur} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {a.type}
                        <span className="text-warm-400 font-normal"> bij </span>
                        {a.bewoner.naam}
                      </p>
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
                            {formatDuur(a.duurMinuten)}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Notities */}
                  {a.notities && (
                    <div className="bg-warm-50 rounded-xl p-3.5 border border-warm-100">
                      <p className="text-sm text-gray-700 leading-relaxed">{a.notities}</p>
                    </div>
                  )}

                  {/* Duur */}
                  {magFoto && (
                    <div className="flex items-center gap-1.5 text-xs text-warm-400">
                      <Clock size={12} />
                      <span>{formatDuur(a.duurMinuten)}</span>
                    </div>
                  )}

                  {/* Reacties van familie */}
                  {a.reacties.length > 0 && (
                    <div className="pt-2 border-t border-warm-100 space-y-1.5">
                      <p className="text-[10px] font-semibold text-warm-400 uppercase tracking-wider">
                        Reacties van familie
                      </p>
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

      {activiteiten.length > 0 && (
        <p className="text-center text-xs text-warm-400 pt-2">
          {activiteiten.length} activiteiten ·{" "}
          {Math.floor(activiteiten.reduce((s, a) => s + a.duurMinuten, 0) / 60)} uur in totaal
        </p>
      )}
    </div>
  );
}
