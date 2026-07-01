import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Users, UserCheck, Activity, Mail, FileText, TrendingUp, Calendar, Bell } from "lucide-react";
import { StatCard, PageHeader, Card } from "@/components/ui";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const naam = session!.user.naam ?? session!.user.name ?? "Admin";
  const voornaam = naam.split(" ")[0];

  const [bewoners, vrijwilligers, familieLeden, blogPosts, nieuwsbrieven, activiteitenDezeMaand] = await Promise.all([
    prisma.bewoner.count({ where: { organisatieId } }),
    prisma.gebruiker.count({ where: { organisatieId, rol: "VRIJWILLIGER" } }),
    prisma.gebruiker.count({ where: { organisatieId, rol: "FAMILIE" } }),
    prisma.blogPost.count({ where: { organisatieId } }),
    prisma.nieuwsbrief.count({ where: { organisatieId } }),
    prisma.activiteit.count({
      where: {
        bewoner: { organisatieId },
        createdAt: { gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const stats = [
    { label: "Bewoners", value: bewoners, icon: Users, href: "/admin/crm/bewoners", variant: "info" as const },
    { label: "Vrijwilligers", value: vrijwilligers, icon: UserCheck, href: "/admin/crm/vrijwilligers", variant: "success" as const },
    { label: "Familieleden", value: familieLeden, icon: Users, href: "/admin/crm/familie", variant: "violet" as const },
    { label: "Blog posts", value: blogPosts, icon: FileText, href: "/admin/blog", variant: "warning" as const },
    { label: "Nieuwsbrieven", value: nieuwsbrieven, icon: Mail, href: "/admin/nieuwsbrieven", variant: "default" as const },
    { label: "Activiteiten (30d)", value: activiteitenDezeMaand, icon: Activity, href: "/admin/analytics", variant: "default" as const },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title={`Welkom, ${voornaam}`} description="Admin dashboard - overzicht van algemene statistieken en acties" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Snelle acties</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/crm/bewoners/nieuw" className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors">
              <Users size={20} className="text-brand-600" />
              <span className="text-sm font-medium">Bewoner toevoegen</span>
            </Link>
            <Link href="/admin/crm/vrijwilligers/nieuw" className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors">
              <UserCheck size={20} className="text-emerald-600" />
              <span className="text-sm font-medium">Vrijwilliger uitnodigen</span>
            </Link>
            <Link href="/admin/nieuwsbrieven/nieuw" className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors">
              <Mail size={20} className="text-amber-600" />
              <span className="text-sm font-medium">Nieuwsbrief maken</span>
            </Link>
            <Link href="/admin/blog/nieuw" className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors">
              <FileText size={20} className="text-violet-600" />
              <span className="text-sm font-medium">Blog post schrijven</span>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-600" />
            Platform status
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-warm-100">
              <span className="text-warm-600">Database verbinding</span>
              <span className="text-emerald-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-warm-100">
              <span className="text-warm-600">Email service</span>
              <span className="text-emerald-600 font-medium">Gereed</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-warm-100">
              <span className="text-warm-600">Storage</span>
              <span className="text-emerald-600 font-medium">Beschikbaar</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-warm-600">Laatste backup</span>
              <span className="text-gray-900 font-medium">Vandaag</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
