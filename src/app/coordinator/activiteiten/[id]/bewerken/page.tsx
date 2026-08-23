import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import BewerkActiviteitForm from "./BewerkActiviteitForm";

export default async function BewerkActiviteitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") redirect("/geen-toegang");
  const organisatieId = session.user.organisatieId!;

  const a = await prisma.geplandeActiviteit.findFirst({
    where: { id, organisatieId },
    select: { id: true, titel: true, type: true, beschrijving: true, locatie: true, datum: true, duurMinuten: true, hulpGevraagdId: true },
  });
  if (!a) notFound();

  // Open hulpvragen zonder activiteit, plus de eventueel al gekoppelde
  const hulpOpties = await prisma.hulpGevraagd.findMany({
    where: {
      organisatieId,
      status: { in: ["open", "vol"] },
      OR: [{ geplandeActiviteit: null }, { id: a.hulpGevraagdId ?? "__no__" }],
    },
    orderBy: { datum: "asc" },
    select: { id: true, titel: true },
  });

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Activiteit bewerken</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{a.titel}</p>
      </div>
      <BewerkActiviteitForm bestaande={a} hulpOpties={hulpOpties} />
    </div>
  );
}
