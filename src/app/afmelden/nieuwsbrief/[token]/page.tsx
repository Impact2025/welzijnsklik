import { prisma } from "@/lib/prisma";
import { Check, Mail, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function AfmeldPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const abonnement = await prisma.nieuwsbriefAbonnement.findUnique({
    where: { afmeldToken: token },
    include: { nieuwsbrief: { select: { titel: true } } },
  });

  let status: "ok" | "al" | "fout" = "fout";
  if (abonnement) {
    if (abonnement.actief) {
      await prisma.nieuwsbriefAbonnement.update({
        where: { id: abonnement.id },
        data: { actief: false, status: "afgemeld" },
      });
      status = "ok";
    } else {
      status = "al";
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center">
        {status === "ok" && (
          <>
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Afgemeld</h1>
            <p className="text-warm-600 mt-2 text-sm">
              Je ontvangt geen nieuwsbrieven meer van {abonnement?.nieuwsbrief.titel ?? "Welzijnsklik"}.
              Bedankt voor je betrokkenheid.
            </p>
          </>
        )}
        {status === "al" && (
          <>
            <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={26} className="text-neutral-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Al afgemeld</h1>
            <p className="text-warm-600 mt-2 text-sm">
              Je staat niet meer ingeschreven voor deze nieuwsbrief.
            </p>
          </>
        )}
        {status === "fout" && (
          <>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Link ongeldig</h1>
            <p className="text-warm-600 mt-2 text-sm">
              Deze afmeldlink is ongeldig of verlopen.
            </p>
          </>
        )}
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-brand-600 hover:underline font-semibold"
        >
          Terug naar Welzijnsklik
        </Link>
      </div>
    </div>
  );
}
