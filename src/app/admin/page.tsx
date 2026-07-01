import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Building2, Users, Activity, Mail, FileText, UserPlus, TrendingUp, UserCheck } from "lucide-react";
import { StatCard, PageHeader, Card } from "@/components/ui";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  const naam = session!.user.naam ?? session!.user.name ?? "Admin";
  const voornaam = naam.split(" ")[0];

  const [klanten, gebruikers, blogPosts, nieuwsbrieven, leads, activiteitenDezeMaand] = await Promise.all([
    prisma.organisatie.count(),
    prisma.gebruiker.count(),
    prisma.blogPost.count(),
    prisma.nieuwsbrief.count(),
    prisma.lead.count(),
    prisma.activiteit.count({
      where: {
        createdAt: { gte: (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })() },
      },
    }),
  ]);

  const stats = [
    { label: "Klanten", value: klanten, icon: Building2, href: "/admin/klanten", variant: "info" as const },
    { label: "Gebruikers (alle klanten)", value: gebruikers, icon: Users, href: "/admin/klanten", variant: "success" as const },
    { label: "Leads", value: leads, icon: UserPlus, href: "/admin/leads", variant: "violet" as const },
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
