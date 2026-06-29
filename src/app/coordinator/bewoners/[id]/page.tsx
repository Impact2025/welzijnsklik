import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ToestemmingForm from "./ToestemmingForm";
import { ArrowLeft, Camera, Activity, ClipboardList } from "lucide-react";
import { ACTIVITEIT_ICON, formatDatum } from "@/lib/activiteit";
import { getFotoUrl } from "@/lib/foto";

export default async function BewonderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const bewoner = await prisma.bewoner.findFirst({
    where: { id, organisatieId },
    include: {
      activiteiten: {
        orderBy: { createdAt: "desc" },
        include: { vrijwilliger: { select: { naam: true } } },
      },
      toestemmingsLog: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!bewoner) notFound();

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Back + header */}
      <div>
        <Link
          href="/coordinator/bewoners"
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-3 transition-colors"
        >
          <ArrowLeft size={15} />
          Terug naar bewoners
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-700 font-bold">
              {bewoner.naam.split(" ")[0][0]}{bewoner.naam.split(" ").at(-1)?.[0]}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{bewoner.naam}</h1>
            <p className="text-sm text-neutral-500">{bewoner.activiteiten.length} activiteiten</p>
          </div>
        </div>
      </div>

      {/* Toestemming */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-neutral-400" />
          <h2 className="font-semibold text-gray-900 text-[15px]">Toestemming fotografie</h2>
        </div>
        <ToestemmingForm
          bewonerId={bewoner.id}
          toestemmingFotos={bewoner.toestemmingFotos}
          toestemmingDoor={bewoner.toestemmingDoor ?? ""}
          toestemmingDatum={bewoner.toestemmingDatum?.toISOString() ?? null}
        />
      </div>

      {/* Toestemmingslogboek (AVG-audit) */}
      {bewoner.toestemmingsLog.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-neutral-400" />
            <h2 className="font-semibold text-gray-900 text-[15px]">Toestemmingshistorie</h2>
          </div>
          <div className="divide-y divide-neutral-50 -mx-5">
            {bewoner.toestemmingsLog.map((log) => (
              <div key={log.id} className="px-5 py-2.5 flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  log.actie === "AAN" ? "bg-emerald-100" : "bg-red-100"
                }`}>
                  <span className={`text-[10px] font-bold ${
                    log.actie === "AAN" ? "text-emerald-700" : "text-red-600"
                  }`}>
                    {log.actie}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800">
                    Toestemming <span className="font-semibold">{log.actie === "AAN" ? "aangezet" : "uitgezet"}</span>
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    door {log.door} · {formatDatum(new Date(log.createdAt), { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activiteiten */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="px-4 py-3.5 border-b border-neutral-50 flex items-center gap-2">
          <Activity size={15} className="text-neutral-400" />
          <h2 className="font-semibold text-gray-900 text-[15px]">
            Activiteiten ({bewoner.activiteiten.length})
          </h2>
        </div>
        {bewoner.activiteiten.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Activity size={22} className="text-neutral-200 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">Nog geen activiteiten.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {bewoner.activiteiten.map((a) => {
              const cfg = ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders;
              const Icon = cfg.icon;
              return (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={15} className={cfg.kleur} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {a.type}
                      <span className="text-neutral-400 font-normal"> met </span>
                      {a.vrijwilliger.naam}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {a.duurMinuten} min ·{" "}
                      {formatDatum(new Date(a.createdAt), { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {a.notities && (
                      <p className="text-xs text-neutral-500 mt-0.5 italic">{a.notities}</p>
                    )}
                  </div>
                  {a.fotoUrl && (
                    <img
                      src={getFotoUrl(a.fotoUrl, a.bewonerId) ?? ""}
                      alt=""
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
