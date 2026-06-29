import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ActiviteitForm from "../ActiviteitForm";

export default async function NieuweActiviteitPage() {
  const session = await auth();
  const organisatieId = session?.user?.organisatieId;
  if (!organisatieId) redirect("/login");

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
        <Link
          href="/vrijwilliger"
          className="inline-flex items-center gap-1 text-warm-400 hover:text-warm-600 text-sm mb-3 transition-colors"
        >
          <ChevronLeft size={15} />
          Overzicht
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nieuwe activiteit</h1>
        <p className="text-sm text-warm-500 mt-0.5">Leg vast wat je hebt gedaan</p>
      </div>
      <ActiviteitForm bewoners={bewoners} />
    </div>
  );
}
