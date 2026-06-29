import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ActiviteitForm from "./ActiviteitForm";

export default async function VrijwilligerPage() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const naam = session!.user.naam ?? session!.user.name ?? "Vrijwilliger";
  const voornaam = naam.split(" ")[0];

  const bewoners = await prisma.bewoner.findMany({
    where: { organisatieId },
    orderBy: { naam: "asc" },
    select: {
      id: true,
      naam: true,
      toestemmingFotos: true,
    },
  });

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Hoi {voornaam}!</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Leg een activiteit vast</p>
      </div>
      <ActiviteitForm bewoners={bewoners} />
    </div>
  );
}
