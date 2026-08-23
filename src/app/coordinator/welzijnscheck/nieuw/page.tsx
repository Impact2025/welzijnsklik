import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WelzijnscheckNamensForm from "./WelzijnscheckNamensForm";

export default async function CoordinatorWelzijnscheckNieuwPage() {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    redirect("/geen-toegang");
  }
  const organisatieId = session.user.organisatieId!;

  const vrijwilligers = await prisma.gebruiker.findMany({
    where: {
      organisatieId,
      rol: { in: ["VRIJWILLIGER", "WELZIJNSMEDEWERKER"] },
    },
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });

  return (
    <div className="px-4 py-6 space-y-5 max-w-xl mx-auto">
      <Link
        href="/coordinator/welzijnscheck"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft size={16} />
        Terug naar overzicht
      </Link>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Check namens vrijwilliger</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Geen tijd voor een digitale check? Vul hem direct voor een vrijwilliger in.
        </p>
      </div>

      <WelzijnscheckNamensForm vrijwilligers={vrijwilligers} />
    </div>
  );
}
