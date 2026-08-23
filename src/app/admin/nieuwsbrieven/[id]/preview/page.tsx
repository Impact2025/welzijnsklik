import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { baseHtml } from "@/lib/email";
import Link from "next/link";
import { Send, Edit } from "lucide-react";

export default async function NieuwsbriefPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const nieuwsbrief = await prisma.nieuwsbrief.findUnique({ where: { id } });

  if (!nieuwsbrief) notFound();

  // Exacte weergave van wat verzonden wordt (zelfde baseHtml-wrapper als
  // sendNieuwsbrief) — een placeholder-token i.p.v. het echte afmeldToken,
  // dat wordt pas per ontvanger aangemaakt bij het versturen.
  const html = baseHtml({
    title: nieuwsbrief.titel,
    preheader: nieuwsbrief.onderwerp,
    body: nieuwsbrief.inhoud,
    footer: `Welzijnsklik · De Meerwende<br><a href="#">Afmelden voor deze nieuwsbrief</a>`,
  });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Preview"
        description={nieuwsbrief.onderwerp}
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/nieuwsbrieven/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-warm-200 text-sm font-medium hover:bg-warm-50 transition-colors"
            >
              <Edit size={15} />
              Bewerken
            </Link>
            {nieuwsbrief.status !== "VERZONDEN" && (
              <Link
                href={`/admin/nieuwsbrieven/${id}/send`}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
              >
                <Send size={15} />
                Versturen
              </Link>
            )}
          </div>
        }
      />

      <div className="max-w-2xl mx-auto">
        <div className="bg-neutral-100 rounded-2xl p-4 mb-4">
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-neutral-500 font-medium">Van: </span>
              <span className="text-gray-700">Welzijnsklik &lt;noreply@welzijnsklik.nl&gt;</span>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Aan: </span>
              <span className="text-gray-700">Alle leads</span>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Onderwerp: </span>
              <span className="text-gray-700 font-semibold">{nieuwsbrief.onderwerp}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 shadow-sm overflow-hidden bg-warm-50">
          <iframe
            title="E-mail preview"
            srcDoc={html}
            className="w-full"
            style={{ height: 720, border: "none" }}
            sandbox=""
          />
        </div>
      </div>
    </div>
  );
}
