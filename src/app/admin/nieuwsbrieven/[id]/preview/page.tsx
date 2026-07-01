import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
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
          <div className="flex items-start gap-3 text-sm">
            <div className="space-y-1">
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
        </div>

        <div
          className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <div
            style={{
              background: "#005e9f",
              padding: "24px 32px",
              color: "#fff",
            }}
          >
            <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{nieuwsbrief.titel}</p>
          </div>
          <div
            style={{ padding: "32px", color: "#333", lineHeight: 1.7, fontSize: 15 }}
            dangerouslySetInnerHTML={{ __html: nieuwsbrief.inhoud }}
          />
          <div
            style={{
              borderTop: "1px solid #eee",
              padding: "16px 32px",
              background: "#f9f9f9",
              fontSize: 12,
              color: "#999",
            }}
          >
            <p style={{ margin: 0 }}>
              Welzijnsklik · Dit bericht is gestuurd omdat je een account hebt bij Welzijnsklik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
