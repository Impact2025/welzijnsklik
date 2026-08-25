import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BerichtenOverzicht, { type Thread } from "@/components/BerichtenOverzicht";

export default async function CoordinatorBerichtenPage() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const ikId = session!.user.gebruikerId!;

  // Haal alle vrijwilligers + welzijnsmedewerkers op + hun laatste bericht + ongelezen teller
  const vrijwilligers = await prisma.gebruiker.findMany({
    where: {
      organisatieId,
      rol: { in: ["VRIJWILLIGER", "WELZIJNSMEDEWERKER"] },
    },
    orderBy: { naam: "asc" },
  });

  const threadData = await Promise.all(
    vrijwilligers.map(async (v) => {
      const [laatste, ongelezen] = await Promise.all([
        prisma.bericht.findFirst({
          where: {
            OR: [
              { vanId: ikId, aanId: v.id },
              { vanId: v.id, aanId: ikId },
            ],
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.bericht.count({
          where: { vanId: v.id, aanId: ikId, gelezen: false },
        }),
      ]);
      return {
        id: v.id,
        naam: v.naam,
        rol: v.rol as Thread["rol"],
        profielFoto: v.profielFoto,
        laatste: laatste
          ? { inhoud: laatste.inhoud, createdAt: laatste.createdAt, vanId: laatste.vanId }
          : null,
        ongelezen,
      } satisfies Thread;
    })
  );

  // Sorteer: eerst met berichten (nieuwste eerst), dan zonder
  const threads = threadData.sort((a, b) => {
    if (!a.laatste && !b.laatste) return 0;
    if (!a.laatste) return 1;
    if (!b.laatste) return -1;
    return new Date(b.laatste.createdAt).getTime() - new Date(a.laatste.createdAt).getTime();
  });

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Berichten</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Gesprekken met vrijwilligers en collega&apos;s</p>
      </div>

      <BerichtenOverzicht threads={threads} ikId={ikId} />
    </div>
  );
}
