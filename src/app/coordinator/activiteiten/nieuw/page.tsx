import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ActiviteitForm from "./ActiviteitForm";

export default async function NieuweActiviteitPage() {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") redirect("/geen-toegang");
  const organisatieId = session.user.organisatieId!;

  // Open hulpvragen die nog niet aan een activiteit gekoppeld zijn
  const hulpOpties = await prisma.hulpGevraagd.findMany({
    where: { organisatieId, geplandeActiviteit: null, status: { in: ["open", "vol"] } },
    orderBy: { datum: "asc" },
    select: { id: true, titel: true, datum: true, aantalNodig: true },
  });

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Nieuwe activiteit</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Plan een activiteit en koppel eventueel een hulpvraag</p>
      </div>
      <ActiviteitForm hulpOpties={hulpOpties} />
    </div>
  );
}
