import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, Activity, UserPlus, Users, UserCheck } from "lucide-react";
import { ACTIVITEIT_ICON, formatDatum } from "@/lib/activiteit";

function ActiviteitIcon({ type }: { type: string }) {
  const cfg = ACTIVITEIT_ICON[type] ?? ACTIVITEIT_ICON.Anders;
  const Icon = cfg.icon;
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
      <Icon size={16} className={cfg.kleur} />
    </div>
  );
}

export default async function CoordinatorDashboard() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const naam = session!.user.naam ?? session!.user.name ?? "Coördinator";
  const voornaam = naam.split(" ")[0];

  const [activiteiten, bewoners, vrijwilligers, interesses] = await Promise.all([
    prisma.activiteit.findMany({
      where: { bewoner: { organisatieId } },
      include: {
        bewoner: { select: { naam: true } },
        vrijwilliger: { select: { naam: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.bewoner.count({ where: { organisatieId } }),
    prisma.gebruiker.count({ where: { organisatieId, rol: "VRIJWILLIGER" } }),
    prisma.wervingsinteresse.count({ where: { status: "nieuw", gebruiker: { organisatieId } } }),
  ]);

  const stats = [
    { label: "Bewoners", value: bewoners, icon: Users, href: "/coordinator/bewoners", kleur: "text-sky-600", bg: "bg-sky-50" },
    { label: "Vrijwilligers", value: vrijwilligers, icon: UserCheck, href: "#", kleur: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Activiteiten", value: activiteiten.length, icon: Activity, href: "/coordinator/briefjes", kleur: "text-amber-600", bg: "bg-amber-50" },
    { label: "Aanmeldingen", value: interesses, icon: UserPlus, href: "#", kleur: "text-violet-600", bg: "bg-violet-50" },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Goeiedag, {voornaam} 👋</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Hier is een overzicht van vandaag</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow group"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                <Icon size={17} className={s.kleur} />
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5 font-medium">{s.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Recente activiteiten */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="px-4 py-3.5 flex items-center justify-between border-b border-neutral-50">
          <h2 className="font-semibold text-gray-900 text-[15px]">Recente activiteiten</h2>
          <Link
            href="/coordinator/briefjes"
            className="text-amber-600 text-xs font-semibold flex items-center gap-0.5"
          >
            Alles <ChevronRight size={13} />
          </Link>
        </div>
        {activiteiten.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Activity size={24} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">Nog geen activiteiten geregistreerd.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {activiteiten.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                <ActiviteitIcon type={a.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {a.vrijwilliger.naam}
                    <span className="text-neutral-400 font-normal"> bij </span>
                    {a.bewoner.naam}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {a.type} · {a.duurMinuten} min ·{" "}
                    {formatDatum(new Date(a.createdAt))}
                  </p>
                </div>
                {a.fotoUrl && (
                  <img
                    src={a.fotoUrl}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
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
