import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Users, UserCheck, Plus } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui";
import Link from "next/link";

export default async function CRMOverview() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const [bewoners, vrijwilligers, familieLeden] = await Promise.all([
    prisma.bewoner.count({ where: { organisatieId } }),
    prisma.gebruiker.count({ where: { organisatieId, rol: "VRIJWILLIGER" } }),
    prisma.gebruiker.count({ where: { organisatieId, rol: "FAMILIE" } }),
  ]);

  const secties = [
    {
      title: "Bewoners",
      count: bewoners,
      icon: Users,
      href: "/admin/crm/bewoners",
      nieuwHref: "/admin/crm/bewoners/nieuw",
      nieuwLabel: "Bewoner toevoegen",
      beschrijving: "Registreer bewoners en koppel familieleden",
      variant: "info" as const,
    },
    {
      title: "Vrijwilligers",
      count: vrijwilligers,
      icon: UserCheck,
      href: "/admin/crm/vrijwilligers",
      nieuwHref: "/admin/crm/vrijwilligers/nieuw",
      nieuwLabel: "Vrijwilliger uitnodigen",
      beschrijving: "Beheer vrijwilligersprofielen en voorkeuren",
      variant: "success" as const,
    },
    {
      title: "Familieleden",
      count: familieLeden,
      icon: Users,
      href: "/admin/crm/familie",
      nieuwHref: null,
      nieuwLabel: null,
      beschrijving: "Overzicht van gekoppelde familieleden",
      variant: "violet" as const,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="CRM"
        description="Beheer bewoners, vrijwilligers en familieleden"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {secties.map((s) => (
          <StatCard
            key={s.title}
            label={s.title}
            value={s.count}
            icon={s.icon}
            href={s.href}
            variant={s.variant}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {secties.map((s) => (
          <div
            key={s.title}
            className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5"
          >
            <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
            <p className="text-sm text-neutral-500 mb-4">{s.beschrijving}</p>
            <div className="flex flex-col gap-2">
              <Link
                href={s.href}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-warm-200 text-sm font-medium hover:bg-warm-50 transition-colors"
              >
                <s.icon size={15} className="text-neutral-500" />
                Bekijk alle {s.title.toLowerCase()}
              </Link>
              {s.nieuwHref && (
                <Link
                  href={s.nieuwHref}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
                >
                  <Plus size={15} />
                  {s.nieuwLabel}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
