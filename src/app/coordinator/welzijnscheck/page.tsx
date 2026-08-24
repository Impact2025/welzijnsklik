import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  HeartPulse,
  AlertTriangle,
  Users,
  Smile,
  CalendarClock,
  ChevronRight,
  MessageSquarePlus,
} from "lucide-react";
import { Avatar, Badge } from "@/components/ui";
import { getWelzijnscheckOverzicht } from "@/lib/actions/welzijnscheck";
import { welzijnsInfo, heeftAandachtNodig, VERLOOP_DAGEN } from "@/lib/welzijnscheck";
import { formatDatum } from "@/lib/activiteit";

export default async function CoordinatorWelzijnscheckPage() {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    redirect("/geen-toegang");
  }
  const organisatieId = session.user.organisatieId!;

  const { rijen, samenvatting } = await getWelzijnscheckOverzicht(organisatieId);

  const nu = new Date();
  const verloopGrens = new Date(nu.getTime() - VERLOOP_DAGEN * 24 * 60 * 60 * 1000);

  const aandachtRijen = rijen.filter(
    (r) => r.laatsteScore !== null && heeftAandachtNodig(r.laatsteScore)
  );
  const verouderdRijen = rijen.filter(
    (r) => r.laatsteScore === null || (r.laatsteCheck && r.laatsteCheck < verloopGrens)
  );

  return (
    <div className="px-4 py-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HeartPulse size={22} className="text-brand-600" />
            Welzijnscheck
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Hoe gaat het met je vrijwilligers? Een score van 1–5 per vrijwilliger.
          </p>
        </div>
        <Link
          href="/coordinator/welzijnscheck/nieuw"
          className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <MessageSquarePlus size={15} />
          Check namens vrijwilliger
        </Link>
      </div>

      {/* Samenvatting-stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Vrijwilligers"
          value={samenvatting.totaal}
          icon={Users}
          variant="info"
        />
        <StatCard
          label="Gemiddeld"
          value={samenvatting.gemiddeld !== null ? `${samenvatting.gemiddeld}/5` : "—"}
          icon={Smile}
          variant="success"
        />
        <StatCard
          label="Aandacht nodig"
          value={samenvatting.aandacht}
          icon={AlertTriangle}
          variant={samenvatting.aandacht > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Geen check (14d)"
          value={verouderdRijen.length}
          icon={CalendarClock}
          variant={verouderdRijen.length > 0 ? "warning" : "default"}
        />
      </div>

      {/* Aandacht-banner */}
      {aandachtRijen.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-800 text-sm">
                {aandachtRijen.length} vrijwilliger{aandachtRijen.length > 1 ? "s" : ""} heeft
                {aandachtRijen.length > 1 ? "en" : ""} aandacht nodig
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {aandachtRijen.map((r) => {
                  return (
                    <Link
                      key={r.vrijwilligerId}
                      href={`/coordinator/welzijnscheck/${r.vrijwilligerId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors"
                    >
                      {r.anoniem ? "Anoniem" : r.naam} · {r.laatsteScore}/5
                      <ChevronRight size={12} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overzicht per vrijwilliger */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="px-4 py-3.5 lg:px-5 flex items-center justify-between border-b border-neutral-50">
          <h2 className="font-semibold text-gray-900 text-[15px]">Alle vrijwilligers</h2>
          <span className="text-xs text-neutral-400">
            {samenvatting.metCheck} van {samenvatting.totaal} ingevuld
          </span>
        </div>

        {rijen.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Users size={24} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">Nog geen vrijwilligers in deze organisatie.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {rijen.map((r) => {
              const heeftCheck = r.laatsteScore !== null;
              const info = heeftCheck ? welzijnsInfo(r.laatsteScore!) : null;
              const verouderd =
                !heeftCheck || (r.laatsteCheck && r.laatsteCheck < verloopGrens);
              const aandacht = heeftCheck && heeftAandachtNodig(r.laatsteScore!);

              return (
                <Link
                  key={r.vrijwilligerId}
                  href={heeftCheck ? `/coordinator/welzijnscheck/${r.vrijwilligerId}` : `/coordinator/berichten/${r.vrijwilligerId}`}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors group ${
                    aandacht ? "bg-red-50/60" : ""
                  }`}
                >
                  <Avatar naam={r.anoniem ? undefined : r.naam} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {r.anoniem ? "Anoniem" : r.naam}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {heeftCheck ? (
                        <>
                          {info!.label}
                          {r.laatsteCheck && (
                            <> · {formatDatum(new Date(r.laatsteCheck), { day: "numeric", month: "short" })}</>
                          )}
                        </>
                      ) : (
                        "Nog geen check ingevuld"
                      )}
                    </p>
                  </div>

                  {heeftCheck ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.aandachtspunten.length > 0 && (
                        <span
                          title={r.aandachtspunten.join(", ")}
                          className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full"
                        >
                          <AlertTriangle size={10} />
                          {r.aandachtspunten.length}
                        </span>
                      )}
                      <div
                        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center ${info!.chipBg} ${info!.chipText}`}
                      >
                        <span className="text-base font-bold leading-none">{r.laatsteScore}</span>
                        <span className="text-[9px] leading-none mt-0.5">/5</span>
                      </div>
                    </div>
                  ) : (
                    <ChevronRight size={18} className="text-neutral-300 flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  variant,
}: {
  label: string;
  value: number | string;
  icon: typeof Users;
  variant?: "info" | "success" | "danger" | "warning" | "default";
}) {
  const v =
    variant === "danger"
      ? "bg-red-100 text-red-600"
      : variant === "warning"
      ? "bg-amber-100 text-amber-600"
      : variant === "success"
      ? "bg-emerald-100 text-emerald-600"
      : variant === "info"
      ? "bg-sky-100 text-sky-600"
      : "bg-neutral-100 text-neutral-500";
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${v}`}>
        <Icon size={17} />
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5 font-medium">{label}</p>
    </div>
  );
}
