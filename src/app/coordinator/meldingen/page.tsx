import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Bell, Handshake, Mail, UserCheck, XCircle, CheckCircle2 } from "lucide-react";
import MarkeerBehandeld from "./MarkeerBehandeld";
import Link from "next/link";

const STATUS_CFG: Record<string, { label: string; bg: string; kleur: string; icon: typeof Bell }> = {
  nieuw: { label: "Nieuw", bg: "bg-amber-100", kleur: "text-amber-700", icon: Bell },
  in_behandeling: { label: "In behandeling", bg: "bg-sky-100", kleur: "text-sky-700", icon: UserCheck },
  behandeld: { label: "Behandeld", bg: "bg-emerald-100", kleur: "text-emerald-700", icon: CheckCircle2 },
  gesloten: { label: "Gesloten", bg: "bg-neutral-100", kleur: "text-neutral-500", icon: XCircle },
};

export default async function NotificatiesPage() {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    redirect("/geen-toegang");
  }

  const interesses = await prisma.wervingsinteresse.findMany({
    where: { gebruiker: { organisatieId: session.user.organisatieId } },
    include: {
      gebruiker: { select: { naam: true, email: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const nieuwCount = interesses.filter((i) => i.status === "nieuw").length;

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Meldingen</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {nieuwCount > 0
            ? `${nieuwCount} nieuwe aanmelding${nieuwCount !== 1 ? "en" : ""}`
            : "Geen nieuwe aanmeldingen"}
        </p>
      </div>

      {interesses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-4 py-12 text-center space-y-2">
          <Bell size={24} className="text-neutral-300 mx-auto" />
          <p className="text-neutral-400 text-sm">Nog geen aanmeldingen ontvangen.</p>
          <p className="text-neutral-300 text-xs">Nieuwe aanmeldingen van de familie-pagina verschijnen hier.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interesses.map((i) => {
            const cfg = STATUS_CFG[i.status] ?? STATUS_CFG.nieuw;
            const Icon = cfg.icon;
            return (
              <div
                key={i.id}
                className={`bg-white rounded-2xl shadow-sm border p-4 space-y-3 transition-all ${
                  i.status === "nieuw" ? "border-amber-200 ring-1 ring-amber-100" : "border-neutral-100"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={16} className={cfg.kleur} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {i.gebruiker?.naam ?? i.naam ?? "Onbekend"}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {i.gebruiker?.email ?? i.email ?? "—"} ·{" "}
                        {new Date(i.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.kleur}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Bericht */}
                {i.bericht && (
                  <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 rounded-xl p-3">
                    &ldquo;{i.bericht}&rdquo;
                  </p>
                )}

                {/* Acties */}
                {i.status === "nieuw" && (
                  <div className="flex gap-2">
                    <MarkeerBehandeld id={i.id} />
                    <Link
                      href={`mailto:${i.gebruiker?.email ?? i.email}`}
                      className="flex items-center justify-center gap-1.5 flex-1 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      <Mail size={13} />
                      E-mailen
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
