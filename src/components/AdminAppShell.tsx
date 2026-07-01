"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Mail,
  FileText,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/crm", icon: Users, label: "CRM" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/nieuwsbrieven", icon: Mail, label: "Nieuwsbrieven" },
  { href: "/admin/blog", icon: FileText, label: "Blog" },
  { href: "/admin/instellingen", icon: Settings, label: "Instellingen" },
];

interface Props {
  naam?: string;
  profielFoto?: string | null;
  children: React.ReactNode;
}

export default function AdminAppShell({ naam, profielFoto, children }: Props) {
  const pathname = usePathname();
  const naamDisplay = naam ?? "Admin";

  return (
    <div className="min-h-screen bg-warm-50 flex">
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-warm-200 overflow-y-auto hidden lg:block">
        <div className="p-4">
          <Link href="/admin" className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Welzijnsklik" className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-warm-900 text-lg">Welzijnsklik</h1>
              <p className="text-xs text-warm-500">Admin Panel</p>
            </div>
          </Link>
          <nav className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-warm-600 hover:bg-warm-100"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-warm-200">
          <div className="flex items-center gap-3">
            <Avatar naam={naamDisplay} src={profielFoto} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-900 truncate">{naamDisplay}</p>
              <p className="text-xs text-warm-500">Coördinator</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-warm-400 hover:text-red-500"
              title="Uitloggen"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <header className="fixed top-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-b border-warm-200 h-14 flex items-center px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 flex-1">
          <img src="/logo.png" alt="Welzijnsklik" className="w-7 h-7" />
          <span className="font-semibold text-warm-900 text-[15px]">Admin</span>
        </Link>
        <Link href="/admin/instellingen">
          <Settings size={20} className="text-warm-400" />
        </Link>
      </header>

      <main className="flex-1 lg:pl-64 pt-14 lg:pt-0">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-warm-200 h-16 flex items-center justify-around lg:hidden">
        {ADMIN_NAV.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? "text-brand-600" : "text-warm-400"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.7} />
              <span className="text-[9px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
