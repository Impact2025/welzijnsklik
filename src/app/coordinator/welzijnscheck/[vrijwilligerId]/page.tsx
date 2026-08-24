import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui";
import { getWelzijnscheckGeschiedenis } from "@/lib/actions/welzijnscheck";
import { welzijnsInfo } from "@/lib/welzijnscheck";
import { formatDatum } from "@/lib/activiteit";

export default async function WelzijnscheckDetailPage({
  params,
}: {
  params: Promise<{ vrijwilligerId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    redirect("/geen-toegang");
  }
  const { vrijwilligerId } = await params;
  const organisatieId = session.user.organisatieId!;

  const data = await getWelzijnscheckGeschiedenis(organisatieId, vrijwilligerId);
  if (!data) notFound();

  const { naam, checks } = data;

  return (
    <div className="px-4 py-6 space-y-5 max-w-2xl mx-auto">
      <Link
        href="/coordinator/welzijnscheck"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={15} />
        Terug naar overzicht
      </Link>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar naam={naam} size="lg" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">{naam}</h1>
            <p className="text-sm text-neutral-500">
              {checks.length} welzijnscheck{checks.length !== 1 ? "s" : ""} ingevuld
            </p>
          </div>
        </div>
        <Link
          href={`/coordinator/berichten/${vrijwilligerId}`}
          className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors flex-shrink-0"
        >
          <MessageSquare size={14} />
          Bericht
        </Link>
      </div>

      {checks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-4 py-10 text-center">
          <p className="text-neutral-400 text-sm">Nog geen welzijnscheck ingevuld.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checks.map((c) => {
            const info = welzijnsInfo(c.score);
            const kritiek = c.score <= 2;
            return (
              <div
                key={c.id}
                className={`bg-white rounded-2xl shadow-sm border p-4 space-y-3 ${
                  kritiek ? "border-red-200 ring-1 ring-red-100" : "border-neutral-100"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center ${info.chipBg} ${info.chipText}`}>
                      <span className="text-base font-bold leading-none">{c.score}</span>
                      <span className="text-[9px] leading-none mt-0.5">/5</span>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${info.chipText}`}>{info.label}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatDatum(new Date(c.createdAt), { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  {c.anoniem && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full flex-shrink-0">
                      <ShieldCheck size={11} />
                      Anoniem
                    </span>
                  )}
                </div>

                {c.aandachtspunten.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.aandachtspunten.map((p) => (
                      <span
                        key={p}
                        className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                {c.notitie && (
                  <p className="text-sm text-gray-700 leading-relaxed bg-neutral-50 rounded-xl px-3.5 py-3">
                    &ldquo;{c.notitie}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
