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
];

const NAV_VRIJWILLIGER: NavItem[] = [
  { href: "/vrijwilliger", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/vrijwilliger/hulp-gevraagd", icon: Megaphone, label: "Hulp" },
  { href: "/vrijwilliger/berichten", icon: MessageSquare, label: "Chat" },
  { href: "/vrijwilliger/nieuw", icon: PlusCircle, label: "Nieuw", exact: true },
  { href: "/vrijwilliger/mijn-activiteiten", icon: Clock, label: "Activiteiten" },
];

const NAV_FAMILIE: NavItem[] = [
  { href: "/familie", icon: Heart, label: "Tijdlijn", exact: true },
  { href: "/familie/help-mee", icon: Handshake, label: "Help mee" },
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

const ROL_NOTIFICATIES: Record<string, string> = {
  COORDINATOR: "/coordinator/meldingen",
  VRIJWILLIGER: "/vrijwilliger/meldingen",
  FAMILIE: "/familie/notificaties",
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
  };

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Top bar — mobile only */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-warm-200 h-14 flex items-center px-4 lg:hidden">
        <Link href={ROL_HOME[rol] ?? "/"} className="flex items-center gap-2 flex-1">
          <img src="/logo.png" alt="Welzijnsklik" className="w-7 h-7" />
          <span className="font-semibold text-warm-900 text-[15px] tracking-tight">Welzijnsklik</span>
        </Link>
        <div className="flex items-center gap-0.5">
          <Link
            href={notificatieHref ?? (ROL_NOTIFICATIES[rol] ?? "#")}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-warm-100 transition-colors text-warm-400"
          >
            <Bell size={18} />
            {notificatieBadge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {notificatieBadge > 9 ? "9+" : notificatieBadge}
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
            <Avatar naam={naam} src={profielFoto} size="sm" />
          </Link>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-white/95 backdrop-blur border-r border-warm-200 p-4">
        <Link href={ROL_HOME[rol] ?? "/"} className="flex items-center gap-3 mb-8 px-2">
          <img src="/logo.png" alt="Welzijnsklik" className="w-8 h-8" />
          <span className="font-bold text-xl text-warm-900 tracking-tight">Welzijnsklik</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const badge = navBadge[item.href] ?? 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-warm-600 hover:bg-warm-100 hover:text-warm-800"
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.7} />
                <span className="text-sm">{item.label}</span>
                {badge > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-warm-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <Link href="/account" className="flex items-center gap-3 flex-1">
              <Avatar naam={naam} src={profielFoto} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{naam}</p>
                <p className="text-xs text-warm-500 capitalize">{rol.toLowerCase()}</p>
              </div>
            </Link>
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

      {/* Content wrapper */}
      <div className="lg:pl-64">
        {/* Desktop top header (minimal) */}
        <header className="hidden lg:block fixed top-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-b border-warm-200 h-14 px-6 pl-[calc(16rem+24px)]">
          <div className="flex items-center justify-end h-full gap-3">
            <Link
              href={notificatieHref ?? (ROL_NOTIFICATIES[rol] ?? "#")}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-warm-100 transition-colors text-warm-400"
            >
              <Bell size={18} />
              {notificatieBadge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {notificatieBadge > 9 ? "9+" : notificatieBadge}
                </span>
              )}
            </Link>
            <Link
              href="/account"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-warm-100 transition-colors text-warm-400"
            >
              <Settings size={18} />
            </Link>
            <Link href="/account">
              <Avatar naam={naam} src={profielFoto} size="sm" />
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-screen-xl mx-auto w-full pt-14 pb-20 lg:pt-14 lg:pb-8 px-4 lg:px-8">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      {navItems.length > 0 && (
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-warm-200 max-w-app mx-auto w-full safe-bottom lg:hidden">
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
