import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader, Card, Badge } from "@/components/ui";
import { sendNieuwsbrief } from "@/app/admin/_actions";
import Link from "next/link";
import { Send, Users, AlertTriangle } from "lucide-react";

export default async function NieuwsbriefSendPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const nieuwsbrief = await prisma.nieuwsbrief.findUnique({
    where: { id, organisatieId },
  });

  if (!nieuwsbrief) notFound();

  if (nieuwsbrief.status === "VERZONDEN") {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Nieuwsbrief versturen" description="" />
        <Card className="max-w-lg">
          <div className="text-center py-6">
            <Badge variant="success" size="sm">Al verzonden</Badge>
            <p className="text-sm text-neutral-500 mt-3">
              Deze nieuwsbrief is al verstuurd op{" "}
              {nieuwsbrief.verzondenOp
                ? new Date(nieuwsbrief.verzondenOp).toLocaleString("nl-NL")
                : "onbekende datum"}{" "}
              naar {nieuwsbrief.verstuurtAantal} ontvangers.
            </p>
            <Link
              href="/admin/nieuwsbrieven"
              className="mt-4 inline-block text-sm text-brand-600 hover:underline"
            >
              ← Terug naar nieuwsbrieven
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const rollen =
    nieuwsbrief.doelgroep === "alle"
      ? (["VRIJWILLIGER", "FAMILIE"] as const)
      : nieuwsbrief.doelgroep === "vrijwilligers"
      ? (["VRIJWILLIGER"] as const)
      : (["FAMILIE"] as const);

  const aantalOntvangers = await prisma.gebruiker.count({
    where: { organisatieId, rol: { in: [...rollen] } },
  });

  const sendWithId = sendNieuwsbrief.bind(null, id);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Nieuwsbrief versturen"
        description={nieuwsbrief.onderwerp}
        action={
          <Link
            href={`/admin/nieuwsbrieven/${id}/edit`}
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            ← Bewerken
          </Link>
        }
      />

      <Card className="max-w-lg space-y-5">
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Dit kan niet ongedaan worden gemaakt. De e-mails worden direct verzonden.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <span className="text-neutral-500">Onderwerp</span>
            <span className="font-medium text-gray-800 max-w-[220px] text-right">{nieuwsbrief.onderwerp}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <span className="text-neutral-500">Doelgroep</span>
            <span className="font-medium text-gray-800 capitalize">{nieuwsbrief.doelgroep}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-500 flex items-center gap-1.5">
              <Users size={14} />
              Ontvangers
            </span>
            <span className="font-bold text-brand-600 text-base">{aantalOntvangers}</span>
          </div>
        </div>

        {aantalOntvangers === 0 ? (
          <div className="p-3 bg-neutral-50 rounded-xl text-sm text-neutral-500 text-center">
            Geen ontvangers in de geselecteerde doelgroep.
          </div>
        ) : (
          <form action={sendWithId}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
            >
              <Send size={16} />
              Verstuur naar {aantalOntvangers} ontvanger{aantalOntvangers !== 1 ? "s" : ""}
            </button>
          </form>
        )}

        <Link
          href="/admin/nieuwsbrieven"
          className="block text-center text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          Annuleren
        </Link>
      </Card>
    </div>
  );
}
