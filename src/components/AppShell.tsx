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
  type LucideIcon,
} from "lucide-react";

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
}

function getInitials(naam?: string) {
  if (!naam) return "?";
  return naam
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function AppShell({ rol, naam, children }: Props) {
  const pathname = usePathname();
  const navItems = NAV_MAP[rol] ?? [];
  const initials = getInitials(naam);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-100 h-14 flex items-center px-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm leading-none select-none">W</span>
          </div>
          <span className="font-semibold text-gray-900 text-[15px] tracking-tight">Welzijnsklik</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-400">
            <Bell size={18} />
          </button>
          <Link
            href="/account"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-400"
          >
            <Settings size={18} />
          </Link>
          <Link
            href="/account"
            className="ml-1 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold hover:bg-amber-200 transition-colors"
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full pt-14 pb-20">
        {children}
      </main>

      {/* Bottom nav */}
      {navItems.length > 0 && (
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-neutral-100 max-w-lg mx-auto w-full safe-bottom">
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
                      ? "text-amber-600"
                      : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.7}
                  />
                  <span className={`text-[10px] font-semibold tracking-wide ${isActive ? "text-amber-600" : ""}`}>
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
