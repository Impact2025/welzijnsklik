import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ArrowLeft } from "lucide-react";
import { getRecenteActiviteitenMetFoto } from "@/lib/actions/nieuwsbrieven";
import { NieuwsbriefEditor } from "./NieuwsbriefEditor";

export default async function EditNieuwsbriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.organisatieId) notFound();

  const draft = await prisma.nieuwsbriefDraft.findFirst({
    where: { id, organisatieId: session.user.organisatieId },
    include: { blokken: { orderBy: { volgorde: "asc" } } },
  });
  if (!draft) notFound();

  const recenteActiviteiten = draft.status === "verzonden" ? [] : await getRecenteActiviteitenMetFoto();

  // Welke activiteiten zitten er al in deze draft?
  const gekozenActiviteitIds = new Set(
    draft.blokken.filter((b) => b.type === "activiteit" && b.bronActiviteitId).map((b) => b.bronActiviteitId!)
  );

  return (
    <div className="py-6 lg:py-8 max-w-6xl mx-auto">
      <div className="mb-4">
        <a
          href="/coordinator/nieuwsbrieven"
          className="text-sm text-warm-500 hover:text-warm-900 transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Terug naar nieuwsbrieven
        </a>
      </div>
      <NieuwsbriefEditor
        draft={{
          id: draft.id,
          titel: draft.titel,
          intro: draft.intro ?? "",
          doelgroep: draft.doelgroep,
          status: draft.status,
          verstuurtAantal: draft.verstuurtAantal,
          verzondenOp: draft.verzondenOp ? draft.verzondenOp.toISOString() : null,
        }}
        blokken={draft.blokken.map((b) => ({
          id: b.id,
          type: b.type as "activiteit" | "tekst" | "afbeelding",
          kop: b.kop ?? "",
          tekst: b.tekst ?? "",
          fotoUrl: b.fotoUrl ?? null,
          vrijwilligerNaam: b.vrijwilligerNaam ?? null,
          bewonerNaam: b.bewonerNaam ?? null,
          bronActiviteitId: b.bronActiviteitId ?? null,
        }))}
        recenteActiviteiten={recenteActiviteiten.map((a) => ({
          id: a.id,
          type: a.type,
          notities: a.notities ?? null,
          fotoUrl: a.fotoUrl!,
          bewonerNaam: a.bewoner.naam,
          vrijwilligerNaam: a.vrijwilliger.naam,
          createdAt: a.createdAt.toISOString(),
          gekozen: gekozenActiviteitIds.has(a.id),
        }))}
      />
    </div>
  );
}
