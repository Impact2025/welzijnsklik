import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { markeerGelezen } from "@/lib/actions/berichten";
import ChatInput from "@/components/ChatInput";
import ChatScroll from "@/components/ChatScroll";
import { Avatar } from "@/components/ui";

function tijdStempel(datum: Date) {
  return datum.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) +
    " · " +
    datum.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
}

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
    where: { id: vrijwilligerId, organisatieId, rol: "VRIJWILLIGER" },
  });
  if (!vrijwilliger) notFound();

  // Markeer inkomende berichten als gelezen
  await markeerGelezen(vrijwilligerId);

  const berichten = await prisma.bericht.findMany({
    where: {
      OR: [
        { vanId: ikId, aanId: vrijwilligerId },
        { vanId: vrijwilligerId, aanId: ikId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

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
          <Avatar naam={vrijwilliger.naam} src={vrijwilliger.profielFoto} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{vrijwilliger.naam}</p>
            <p className="text-xs text-neutral-400">Vrijwilliger</p>
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
            berichten.map((b) => {
              const vanMij = b.vanId === ikId;
              return (
                <div key={b.id} className={`flex ${vanMij ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] ${vanMij ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      vanMij
                        ? "bg-amber-500 text-white rounded-br-md"
                        : "bg-white border border-neutral-100 shadow-sm text-gray-900 rounded-bl-md"
                    }`}>
                      {b.inhoud}
                    </div>
                    <span className="text-[10px] text-neutral-400 px-1">
                      {tijdStempel(new Date(b.createdAt))}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </ChatScroll>
      </div>

      <ChatInput aanId={vrijwilligerId} />
    </div>
  );
}
