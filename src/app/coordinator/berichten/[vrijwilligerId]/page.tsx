import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { markeerGelezen } from "@/lib/actions/berichten";
import ChatInput from "@/components/ChatInput";
import ChatScroll from "@/components/ChatScroll";
import ChatBericht from "@/components/ChatBericht";
import { Avatar } from "@/components/ui";
import { ROL_LABELS } from "@/lib/rollen";

export default async function CoordinatorChatPage({
  params,
}: {
  params: Promise<{ vrijwilligerId: string }>;
}) {
  const { vrijwilligerId } = await params;
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const ikId = session!.user.gebruikerId!;

  const vrijwilliger = await prisma.gebruiker.findFirst({
    where: {
      id: vrijwilligerId,
      organisatieId,
      rol: { in: ["VRIJWILLIGER", "WELZIJNSMEDEWERKER"] },
    },
  });
  if (!vrijwilliger) notFound();

  // Markeer inkomende berichten als gelezen
  await markeerGelezen(vrijwilligerId);

  // Laatste 50 berichten — voorkomt dat een lange geschiedenis onbegrensd blijft groeien.
  const berichtenDesc = await prisma.bericht.findMany({
    where: {
      OR: [
        { vanId: ikId, aanId: vrijwilligerId },
        { vanId: vrijwilligerId, aanId: ikId },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const berichten = berichtenDesc.slice().reverse();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header boven AppShell topbar */}
      <div className="px-4 pt-4 pb-3 border-b border-neutral-100 bg-warm-50">
        <div className="flex items-center gap-3">
          <Link
            href="/coordinator/berichten"
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ChevronLeft size={22} />
          </Link>
          <Avatar naam={vrijwilliger.naam} src={vrijwilliger.profielFoto} fotoId={vrijwilliger.id} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{vrijwilliger.naam}</p>
            <p className="text-xs text-neutral-400">{ROL_LABELS[vrijwilliger.rol]}</p>
          </div>
        </div>
      </div>

      {/* Berichten */}
      <div className="flex-1 px-4 py-4 space-y-3 pb-36">
        <ChatScroll>
          {berichten.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400 text-sm">Nog geen berichten. Stuur het eerste bericht!</p>
            </div>
          ) : (
            berichten.map((b) => <ChatBericht key={b.id} bericht={b} ikId={ikId} />)
          )}
        </ChatScroll>
      </div>

      <ChatInput aanId={vrijwilligerId} />
    </div>
  );
}
