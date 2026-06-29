import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import BewerkForm from "./BewerkForm";

function toDateString(d: Date) {
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function toTimeString(d: Date) {
  return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function addMinutes(d: Date, min: number) {
  return new Date(d.getTime() + min * 60 * 1000);
}

export default async function BewerkHulpGevraagdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const hulp = await prisma.hulpGevraagd.findFirst({
    where: { id, organisatieId },
  });

  if (!hulp) notFound();

  const datum = new Date(hulp.datum);
  const eindtijdDatum = addMinutes(datum, hulp.duurMinuten);

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <Link
          href={`/coordinator/hulp-gevraagd/${id}`}
          className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-600 text-sm mb-3 transition-colors"
        >
          <ChevronLeft size={15} />
          Terug
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Oproep bewerken</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Wijzigingen zijn direct zichtbaar voor vrijwilligers</p>
      </div>

      <BewerkForm
        id={id}
        initieel={{
          titel: hulp.titel,
          omschrijving: hulp.omschrijving,
          datum: toDateString(datum),
          tijd: toTimeString(datum),
          eindtijd: toTimeString(eindtijdDatum),
          aantalNodig: hulp.aantalNodig,
          fotoUrl: hulp.fotoUrl,
        }}
      />
    </div>
  );
}
