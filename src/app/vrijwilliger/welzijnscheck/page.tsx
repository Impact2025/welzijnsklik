import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isVrijwilligerRol } from "@/lib/rollen";
import WelzijnscheckForm from "./WelzijnscheckForm";

export default async function VrijwilligerWelzijnscheckPage() {
  const session = await auth();
  if (!session?.user?.gebruikerId || !isVrijwilligerRol(session.user.rol)) {
    redirect("/geen-toegang");
  }
  const organisatieId = session.user.organisatieId!;
  const vrijwilligerId = session.user.gebruikerId;

  const laatste = await prisma.welzijnscheck.findFirst({
    where: { organisatieId, vrijwilligerId },
    orderBy: { createdAt: "desc" },
  });

  const aantal = await prisma.welzijnscheck.count({
    where: { organisatieId, vrijwilligerId },
  });

  return (
    <div className="px-4 py-6 space-y-5 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Welzijnscheck</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Hoe gaat het met je? Een eerlijke score helpt je coördinator om je op
          het juiste moment te steunen.
        </p>
      </div>

      <WelzijnscheckForm
        laatsteScore={laatste?.score ?? null}
        laatsteCheck={laatste?.createdAt ?? null}
        aantalChecks={aantal}
      />
    </div>
  );
}
