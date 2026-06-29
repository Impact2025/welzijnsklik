/**
 * Welzijnsklik Design System — herbruikbare UI-componenten.
 * Vervangt honderden inline class-duplicaties door één bron van waarheid.
 */
import type { LucideIcon } from "lucide-react";

// ═════════════════════════════════════════════════════════
// Card
// ═════════════════════════════════════════════════════════

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

const PADDING = { sm: "p-4", md: "p-5", lg: "p-6" };

export function Card({ children, className = "", padding = "md", hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-neutral-100 ${
        hover ? "hover:shadow-md transition-shadow" : "shadow-sm"
      } ${PADDING[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, icon, className = "" }: CardProps & { icon?: LucideIcon }) {
  const Icon = icon;
  return (
    <div className={`flex items-center gap-2 mb-3 ${className}`}>
      {Icon && (
        <div className="w-7 h-7 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <Icon size={14} className="text-neutral-500" />
        </div>
      )}
      <h2 className="font-semibold text-gray-900 text-[15px]">{children}</h2>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// Avatar — initialenbadge
// ═════════════════════════════════════════════════════════

interface AvatarProps {
  naam?: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AVATAR_SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function getInitials(naam?: string): string {
  if (!naam) return "?";
  return naam
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function Avatar({ naam, src, size = "md", className = "" }: AvatarProps) {
  if (src) {
    return (
      <div className={`${AVATAR_SIZES[size]} rounded-xl overflow-hidden flex-shrink-0 ${className}`}>
        <img src={src} alt={naam ?? "Profiel"} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`${AVATAR_SIZES[size]} rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0 ${className}`}
    >
      {getInitials(naam)}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// Badge — voor rollen, statussen, tags
// ═════════════════════════════════════════════════════════

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "violet";

const BADGE_VARIANTS: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: "bg-neutral-100", text: "text-neutral-600" },
  success: { bg: "bg-emerald-100", text: "text-emerald-700" },
  warning: { bg: "bg-amber-100", text: "text-amber-700" },
  danger: { bg: "bg-red-100", text: "text-red-700" },
  info: { bg: "bg-sky-100", text: "text-sky-700" },
  violet: { bg: "bg-violet-100", text: "text-violet-700" },
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "xs";
}

const BADGE_SIZES = {
  xs: "text-[10px] px-2.5 py-1",
  sm: "text-xs px-3 py-1.5",
};

export function Badge({ children, variant = "default", size = "xs", className = "" }: BadgeProps) {
  const v = BADGE_VARIANTS[variant];
  return (
    <span className={`font-bold ${BADGE_SIZES[size]} rounded-full ${v.bg} ${v.text} ${className}`}>
      {children}
    </span>
  );
}

// ═════════════════════════════════════════════════════════
// StatCard — voor dashboard stats
// ═════════════════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href: string;
  variant?: BadgeVariant;
}

export function StatCard({ label, value, icon: Icon, href, variant = "default" }: StatCardProps) {
  const v = BADGE_VARIANTS[variant];
  return (
    <a
      href={href}
      className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow group block"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${v.bg}`}>
        <Icon size={17} className={v.text} />
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5 font-medium">{label}</p>
    </a>
  );
}

// ═════════════════════════════════════════════════════════
// Button — primary CTA
// ═════════════════════════════════════════════════════════

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

const BUTTON_VARIANTS = {
  primary:
    "bg-brand-500 hover:bg-brand-600 text-white shadow-sm",
  secondary:
    "bg-white border border-brand-200 hover:bg-amber-50 text-brand-700",
  ghost:
    "bg-neutral-100 hover:bg-neutral-200 text-neutral-700",
};

export function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary",
  className = "",
  icon: Icon,
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 ${
        BUTTON_VARIANTS[variant]
      } ${fullWidth ? "w-full" : "px-5"} ${className}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={15} />
      ) : null}
      {children}
    </button>
  );
}

// ═════════════════════════════════════════════════════════
// EmptyState — voor lege lijsten
// ═════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card padding="lg" className="text-center">
      <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <Icon size={22} className="text-neutral-400" />
      </div>
      <p className="font-semibold text-gray-900">{title}</p>
      {description && <p className="text-neutral-400 text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}

// ═════════════════════════════════════════════════════════
// PageHeader — consistent bovenaan elke pagina
// ═════════════════════════════════════════════════════════

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-neutral-500 mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
