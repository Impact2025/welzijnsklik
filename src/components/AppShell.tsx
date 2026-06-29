"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  PlusCircle,
  Heart,
  Handshake,
  Bell,
  Settings,
  LogOut,
  Clock,
  Megaphone,
  MessageSquare,
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
  { href: "/coordinator/agenda", icon: CalendarDays, label: "Agenda" },
  { href: "/coordinator/bewoners", icon: Users, label: "Bewoners" },
  { href: "/coordinator/hulp-gevraagd", icon: Megaphone, label: "Hulp" },
  { href: "/coordinator/berichten", icon: MessageSquare, label: "Chat" },
  { href: "/coordinator/meldingen", icon: Bell, label: "Meldingen" },
];

const NAV_VRIJWILLIGER: NavItem[] = [
  { href: "/vrijwilliger", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/vrijwilliger/hulp-gevraagd", icon: Megaphone, label: "Hulp" },
  { href: "/vrijwilliger/berichten", icon: MessageSquare, label: "Chat" },
  { href: "/vrijwilliger/nieuw", icon: PlusCircle, label: "Nieuw", exact: true },
  { href: "/vrijwilliger/mijn-activiteiten", icon: Clock, label: "Activiteiten" },
  { href: "/vrijwilliger/notificaties", icon: Bell, label: "Notificaties" },
  { href: "/account", icon: Settings, label: "Instellingen" },
];

const NAV_FAMILIE: NavItem[] = [
  { href: "/familie", icon: Heart, label: "Tijdlijn", exact: true },
  { href: "/familie/help-mee", icon: Handshake, label: "Help mee" },
  { href: "/familie/notificaties", icon: Bell, label: "Notificaties" },
  { href: "/account", icon: Settings, label: "Instellingen" },
];

const NAV_MAP: Record<string, NavItem[]> = {
  COORDINATOR: NAV_COORDINATOR,
  VRIJWILLIGER: NAV_VRIJWILLIGER,
  FAMILIE: NAV_FAMILIE,
};

const ROL_HOME: Record<string, string> = {
  COORDINATOR: "/coordinator",
  VRIJWILLIGER: "/vrijwilliger",
  FAMILIE: "/familie",
};

interface Props {
  rol: string;
  naam?: string;
  profielFoto?: string | null;
  children: React.ReactNode;
  notificatieHref?: string;
  notificatieBadge?: number;
  nieuweHulpReacties?: number;
  openHulpVragen?: number;
  ongelezeBerichten?: number;
}

export default function AppShell({ rol, naam, profielFoto, children, notificatieHref, notificatieBadge = 0, nieuweHulpReacties = 0, openHulpVragen = 0, ongelezeBerichten = 0 }: Props) {
  const pathname = usePathname();
  const navItems = NAV_MAP[rol] ?? [];

  const navBadge: Record<string, number> = {
    "/coordinator/meldingen": notificatieBadge,
    "/coordinator/hulp-gevraagd": nieuweHulpReacties,
    "/coordinator/berichten": ongelezeBerichten,
    "/vrijwilliger/hulp-gevraagd": openHulpVragen,
    "/vrijwilliger/berichten": ongelezeBerichten,
    "/vrijwilliger/notificaties": notificatieBadge,
    "/familie/notificaties": notificatieBadge,
  };

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-warm-200 h-14 flex items-center px-4 max-w-lg mx-auto w-full">
        <Link href={ROL_HOME[rol] ?? "/"} className="flex items-center gap-2 flex-1">
          <img src="/logo.svg" alt="Welzijnsklik" className="w-7 h-7" />
          <span className="font-semibold text-warm-900 text-[15px] tracking-tight">Welzijnsklik</span>
        </Link>
        <div className="flex items-center gap-0.5">
          {notificatieHref && (
            <Link
              href={notificatieHref}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-warm-100 transition-colors text-warm-400"
            >
              <Bell size={18} />
              {notificatieBadge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {notificatieBadge > 9 ? "9+" : notificatieBadge}
                </span>
              )}
            </Link>
          )}
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
            <Avatar naam={naam} src={profielFoto} size="sm" />
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
              const badge = navBadge[item.href] ?? 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all duration-150 ${
                    isActive
                      ? "text-brand-600"
                      : "text-warm-400 hover:text-warm-600"
                  }`}
                >
                  <div className="relative">
                    <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.7} />
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </div>
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
