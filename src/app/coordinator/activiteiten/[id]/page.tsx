import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CalendarDays, Clock, MapPin, Megaphone, Users, Pencil, Trash2, UserCheck } from "lucide-react";
import { ACTIVITEIT_ICON } from "@/lib/activiteit";
import { verwijderGeplandeActiviteit } from "@/lib/actions/activiteiten-agenda";

function formatDatumVol(datum: Date) {
  return datum.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatTijd(datum: Date) {
  return datum.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}
function formatDuur(min: number) {
  if (min < 60) return `${min} min`;
  const u = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${u}u ${m}min` : `${u} uur`;
}

export default async function ActiviteitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const a = await prisma.geplandeActiviteit.findFirst({
    where: { id, organisatieId },
    include: {
      hulpGevraagd: {
        include: {
          reacties: {
            include: { gebruiker: { select: { naam: true, rol: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!a) notFound();

  const cfg = a.type ? ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders : ACTIVITEIT_ICON.Anders;
  const Icon = cfg.icon;
  const hulp = a.hulpGevraagd;

  async function verwijder(formData: FormData) {
    "use server";
    await verwijderGeplandeActiviteit(formData.get("id") as string);
    redirect("/coordinator/activiteiten");
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/coordinator/activiteiten"
          className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-600 text-sm transition-colors"
        >
          <ChevronLeft size={15} />
          Activiteiten
        </Link>
        <Link
          href={`/coordinator/activiteiten/${a.id}/bewerken`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
        >
          <Pencil size={14} />
          Bewerken
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
            <Icon size={20} className={cfg.kleur} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{a.titel}</h1>
            {a.type && <p className="text-sm text-neutral-500">{a.type}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <CalendarDays size={14} className="text-amber-500" />
            <span className="font-medium text-gray-700">{formatDatumVol(new Date(a.datum))}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Clock size={14} className="text-amber-500" />
            <span className="font-medium text-gray-700">
              {formatTijd(new Date(a.datum))} · {formatDuur(a.duurMinuten)}
            </span>
          </div>
          {a.locatie && (
            <div className="flex items-center gap-2 text-sm text-neutral-500 col-span-2">
              <MapPin size={14} className="text-amber-500" />
              <span className="font-medium text-gray-700">{a.locatie}</span>
            </div>
          )}
        </div>

        {a.beschrijving && <p className="text-sm text-neutral-600 leading-relaxed">{a.beschrijving}</p>}

        <p className="text-xs text-neutral-400">Gepland door {a.aangemaaktDoor}</p>
      </div>

      {/* Gekoppelde hulpvraag */}
      {hulp && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 text-[15px] flex items-center gap-1.5">
            <Megaphone size={15} className="text-amber-500" />
            Gekoppelde hulpvraag
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-gray-900 text-sm">{hulp.titel}</h3>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  hulp.status === "open" ? "bg-emerald-100 text-emerald-700" : hulp.status === "vol" ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {hulp.status === "open" ? "Open" : hulp.status === "vol" ? "Vol" : "Gesloten"}
              </span>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">{hulp.omschrijving}</p>

            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Users size={14} className="text-amber-500" />
              <span className="font-medium text-gray-700">
                {hulp.reacties.filter((r) => r.status !== "afgewezen").length} / {hulp.aantalNodig} aangemeld
              </span>
            </div>

            {/* Aanmeldingen */}
            {hulp.reacties.length > 0 && (
              <div className="space-y-2 pt-1">
                {hulp.reacties.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 text-sm bg-neutral-50 rounded-xl px-3 py-2">
                    <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-700 flex-shrink-0">
                      {r.gebruiker.naam.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    </span>
                    <span className="font-medium text-gray-800 truncate">{r.gebruiker.naam}</span>
                    <span className="text-xs text-neutral-400 ml-auto">
                      {r.gebruiker.rol === "FAMILIE" ? "Familie" : "Vrijwilliger"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link
              href={`/coordinator/hulp-gevraagd/${hulp.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700"
            >
              Open hulpvraag
              <ChevronLeft size={13} className="rotate-180" />
            </Link>
          </div>
        </div>
      )}

      <form action={verwijder}>
        <input type="hidden" name="id" value={a.id} />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 font-semibold py-3 rounded-2xl text-sm transition-colors"
        >
          <Trash2 size={15} />
          Activiteit verwijderen
        </button>
      </form>
    </div>
  );
}
