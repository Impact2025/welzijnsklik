import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ActiviteitForm from "./ActiviteitForm";

export default async function VrijwilligerPage() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

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
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">
        Activiteit vastleggen
      </h1>
      <ActiviteitForm bewoners={bewoners} />
    </div>
  );
}
