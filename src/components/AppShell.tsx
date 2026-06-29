"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  PlusSquare,
  Heart,
  Handshake,
  Bell,
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
  exact?: boolean;
}

const NAV_COORDINATOR: NavItem[] = [
  { href: "/coordinator", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/coordinator/bewoners", icon: Users, label: "Bewoners" },
  { href: "/coordinator/briefjes", icon: FileText, label: "Briefjes" },
  { href: "/coordinator/meldingen", icon: Bell, label: "Meldingen" },
  { href: "/coordinator/gebruikers", icon: Settings, label: "Team" },
];

const NAV_VRIJWILLIGER: NavItem[] = [
  { href: "/vrijwilliger", icon: PlusSquare, label: "Registreren", exact: true },
];

const NAV_FAMILIE: NavItem[] = [
  { href: "/familie", icon: Heart, label: "Tijdlijn", exact: true },
  { href: "/familie/help-mee", icon: Handshake, label: "Help mee" },
];

const NAV_MAP: Record<string, NavItem[]> = {
  COORDINATOR: NAV_COORDINATOR,
  VRIJWILLIGER: NAV_VRIJWILLIGER,
  FAMILIE: NAV_FAMILIE,
};

interface Props {
  rol: string;
  naam?: string;
  children: React.ReactNode;
  nieuweAanmeldingen?: number;
}

export default function AppShell({ rol, naam, children, nieuweAanmeldingen = 0 }: Props) {
  const pathname = usePathname();
  const navItems = NAV_MAP[rol] ?? [];

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-warm-200 h-14 flex items-center px-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2 flex-1">
          <img src="/logo.svg" alt="Welzijnsklik" className="w-7 h-7" />
          <span className="font-semibold text-warm-900 text-[15px] tracking-tight">Welzijnsklik</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Link
            href="/coordinator/meldingen"
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-warm-100 transition-colors text-warm-400"
          >
            <Bell size={18} />
            {nieuweAanmeldingen > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {nieuweAanmeldingen > 9 ? "9+" : nieuweAanmeldingen}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-warm-100 transition-colors text-warm-400"
          >
            <Settings size={18} />
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors text-warm-400 hover:text-red-500"
            title="Uitloggen"
          >
            <LogOut size={18} />
          </button>
          <Link href="/account" className="ml-1">
            <Avatar naam={naam} size="sm" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-app mx-auto w-full pt-14 pb-20">
        {children}
      </main>

      {/* Bottom nav */}
      {navItems.length > 0 && (
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-warm-200 max-w-app mx-auto w-full safe-bottom">
          <div className="flex items-center justify-around px-2 h-16">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all duration-150 ${
                    isActive
                      ? "text-brand-600"
                      : "text-warm-400 hover:text-warm-600"
                  }`}
                >
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.7}
                  />
                  <span className={`text-[10px] font-semibold tracking-wide ${isActive ? "text-brand-600" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
