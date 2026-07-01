import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity, Phone, Mail, Calendar, Shield, Heart } from "lucide-react";
import { ProfielForm } from "./ProfielForm";
import { ACTIVITEIT_ICON, formatDatum } from "@/lib/activiteit";

const ROL_LABELS: Record<string, string> = {
  COORDINATOR: "Coördinator",
  VRIJWILLIGER: "Vrijwilliger",
  FAMILIE: "Familie",
};

export default async function GebruikerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.organisatieId || session.user.rol !== "COORDINATOR") {
    redirect("/geen-toegang");
  }

  const gebruiker = await prisma.gebruiker.findFirst({
    where: { id, organisatieId: session.user.organisatieId },
    include: {
      activiteiten: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { bewoner: { select: { naam: true } } },
      },
    },
  });

  if (!gebruiker) notFound();

  const initialen = gebruiker.naam
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Back + header */}
      <div>
        <Link
          href="/coordinator/gebruikers"
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-3 transition-colors"
        >
          <ArrowLeft size={15} />
          Terug naar gebruikers
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-700 font-bold">{initialen}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{gebruiker.naam}</h1>
            <span className="text-xs font-semibold text-neutral-400">{ROL_LABELS[gebruiker.rol]}</span>
          </div>
        </div>
      </div>

      {/* Contactinfo */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 flex flex-col gap-2">
        <a href={`mailto:${gebruiker.email}`} className="flex items-center gap-2 text-sm text-neutral-600">
          <Mail size={14} className="text-neutral-400" />
          {gebruiker.email}
        </a>
        {gebruiker.telefoon && (
          <a href={`tel:${gebruiker.telefoon}`} className="flex items-center gap-2 text-sm text-neutral-600">
            <Phone size={14} className="text-neutral-400" />
            {gebruiker.telefoon}
          </a>
        )}
      </div>

      {/* Intake summary voor vrijwilligers */}
      {gebruiker.rol === "VRIJWILLIGER" && gebruiker.beschikbaarheid && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-2">
          <h3 className="font-semibold text-gray-900 text-[15px] flex items-center gap-1.5">
            <Calendar size={15} />
            Intake details
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {gebruiker.beschikbaarheid && (
              <div>
                <span className="text-neutral-400">Beschikbaarheid</span>
                <p className="font-medium">{gebruiker.beschikbaarheid}</p>
              </div>
            )}
            {gebruiker.vogStatus && (
              <div>
                <span className="text-neutral-400">VOG-status</span>
                <p className="font-medium">{gebruiker.vogStatus}</p>
              </div>
            )}
          </div>
          {gebruiker.ervaring && (
            <div>
              <p className="text-[10px] text-neutral-400 uppercase">Ervaring</p>
              <p className="text-sm text-gray-700 line-clamp-2">{gebruiker.ervaring}</p>
            </div>
          )}
          {gebruiker.motivatie && (
            <div>
              <p className="text-[10px] text-neutral-400 uppercase">Motivatie</p>
              <p className="text-sm text-gray-700 line-clamp-2">{gebruiker.motivatie}</p>
            </div>
          )}
        </div>
      )}

      {/* Dossier (alleen voor vrijwilligers) */}
      {gebruiker.rol === "VRIJWILLIGER" && (
        <ProfielForm
          gebruikerId={gebruiker.id}
          naam={gebruiker.naam}
          telefoon={gebruiker.telefoon}
          voorkeurActiviteiten={gebruiker.voorkeurActiviteiten}
          interneNotities={gebruiker.interneNotities}
          beschikbaarheid={gebruiker.beschikbaarheid}
          vogStatus={gebruiker.vogStatus}
          ervaring={gebruiker.ervaring}
          motivatie={gebruiker.motivatie}
        />
      )}

      {/* Recente activiteiten */}
      {gebruiker.rol === "VRIJWILLIGER" && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-neutral-50 flex items-center gap-2">
            <Activity size={15} className="text-neutral-400" />
            <h2 className="font-semibold text-gray-900 text-[15px]">
              Activiteiten ({gebruiker.activiteiten.length})
            </h2>
          </div>
          {gebruiker.activiteiten.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Activity size={22} className="text-neutral-200 mx-auto mb-2" />
              <p className="text-neutral-400 text-sm">Nog geen activiteiten.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {gebruiker.activiteiten.map((a) => {
                const cfg = ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders;
                const Icon = cfg.icon;
                return (
                  <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={15} className={cfg.kleur} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {a.type}
                        <span className="text-neutral-400 font-normal"> bij </span>
                        {a.bewoner.naam}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {a.duurMinuten} min · {formatDatum(new Date(a.createdAt), { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}