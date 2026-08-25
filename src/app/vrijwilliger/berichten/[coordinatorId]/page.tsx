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

export default async function VrijwilligerChatPage({
  params,
}: {
  params: Promise<{ coordinatorId: string }>;
}) {
  const { coordinatorId } = await params;
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const ikId = session!.user.gebruikerId!;

  const coordinator = await prisma.gebruiker.findFirst({
    where: { id: coordinatorId, organisatieId, rol: "COORDINATOR" },
  });
  if (!coordinator) notFound();

  await markeerGelezen(coordinatorId);

  // Laatste 50 berichten — voorkomt dat een lange geschiedenis onbegrensd blijft groeien.
  const berichtenDesc = await prisma.bericht.findMany({
    where: {
      OR: [
        { vanId: ikId, aanId: coordinatorId },
        { vanId: coordinatorId, aanId: ikId },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const berichten = berichtenDesc.slice().reverse();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-neutral-100 bg-warm-50">
        <div className="flex items-center gap-3">
          <Link
            href="/vrijwilliger/berichten"
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ChevronLeft size={22} />
          </Link>
          <Avatar naam={coordinator.naam} src={coordinator.profielFoto} fotoId={coordinator.id} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{coordinator.naam}</p>
            <p className="text-xs text-neutral-400">Coördinator</p>
          </div>
        </div>
      </div>

      {/* Berichten */}
      <div className="flex-1 px-4 py-4 space-y-3 pb-36">
        <ChatScroll>
          {berichten.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400 text-sm">Nog geen berichten. Stel je vraag!</p>
            </div>
          ) : (
            berichten.map((b) => <ChatBericht key={b.id} bericht={b} ikId={ikId} />)
          )}
        </ChatScroll>
      </div>

      <ChatInput aanId={coordinatorId} />
    </div>
  );
}
