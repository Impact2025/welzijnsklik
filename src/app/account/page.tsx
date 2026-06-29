import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import EmailVoorkeurenForm from "@/components/EmailVoorkeurenForm";
import ProfielFotoUpload from "@/components/ProfielFotoUpload";
import { User, Building2, Shield, Download } from "lucide-react";

const ROL_LABELS: Record<string, string> = {
  COORDINATOR: "Coördinator",
  VRIJWILLIGER: "Vrijwilliger",
  FAMILIE: "Familie",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { naam, email, rol, organisatieId, gebruikerId } = session.user as {
    naam?: string;
    email?: string;
    rol?: string;
    organisatieId?: string;
    gebruikerId?: string;
  };

  // Dynamische organisatienaam
  let organisatieNaam = "—";
  if (organisatieId) {
    const org = await prisma.organisatie.findUnique({
      where: { id: organisatieId },
      select: { naam: true },
    });
    if (org) organisatieNaam = org.naam;
  }

  // Email voorkeuren
  let emailActiviteiten = true;
  let emailDigest = true;
  if (gebruikerId) {
    const voorkeur = await prisma.emailVoorkeur.findUnique({
      where: { gebruikerId },
    });
    if (voorkeur) {
      emailActiviteiten = voorkeur.activiteiten;
      emailDigest = voorkeur.wekelijkseDigest;
    }
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Account</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Jouw profiel en instellingen</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 space-y-4">
        <div className="flex items-center gap-4">
          <ProfielFotoUpload naam={naam} huidigeFoto={session.user.profielFoto} />
          <div>
            <p className="font-semibold text-gray-900">{naam ?? "—"}</p>
            <p className="text-sm text-neutral-500">{email ?? "—"}</p>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          <div className="flex items-center gap-3 py-3">
            <Shield size={16} className="text-neutral-400 flex-shrink-0" />
            <span className="text-sm text-neutral-500">Rol</span>
            <span className="ml-auto text-sm font-medium text-gray-800">
              {rol ? ROL_LABELS[rol] ?? rol : "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 py-3">
            <Building2 size={16} className="text-neutral-400 flex-shrink-0" />
            <span className="text-sm text-neutral-500">Organisatie</span>
            <span className="ml-auto text-sm font-medium text-gray-800">
              {organisatieNaam}
            </span>
          </div>
          <div className="flex items-center gap-3 py-3">
            <User size={16} className="text-neutral-400 flex-shrink-0" />
            <span className="text-sm text-neutral-500">E-mail</span>
            <span className="ml-auto text-sm font-medium text-gray-800 truncate max-w-[180px]">
              {email ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Email voorkeuren — gefilterd op rol */}
      <EmailVoorkeurenForm initial={{ activiteiten: emailActiviteiten, wekelijkseDigest: emailDigest }} rol={rol} />

      {/* AVG export */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 space-y-3">
        <p className="text-sm text-neutral-500 mb-1">
          Je bent ingelogd als <strong className="text-gray-800">{naam}</strong>.
        </p>
        <a
          href="/api/data-export"
          className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-amber-50 hover:text-amber-700 text-neutral-700 font-medium py-3 rounded-xl text-sm transition-colors"
        >
          <Download size={15} />
          Mijn gegevens downloaden (AVG)
        </a>
        <SignOutButton className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-700 font-medium py-3 rounded-xl text-sm transition-colors" />
      </div>
    </div>
  );
}
