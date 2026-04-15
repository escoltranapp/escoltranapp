"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  List,
  User,
  CalendarDays,
  Search,
  Phone,
  Activity,
  Settings,
  Sparkles,
  UserPlus,
  LogOut,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ─── Navigation structure ─────────────────────────────────────────────────────

const sections: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutGrid },
    ],
  },
  {
    title: "Comercial",
    items: [
      { label: "Pipeline",    href: "/pipeline",    icon: List },
      { label: "Contatos",    href: "/contacts",    icon: User },
      { label: "Atividades",  href: "/activities",  icon: CalendarDays },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Busca de Leads",  href: "/lead-search",   icon: Search },
      { label: "Disparo em Massa", href: "/listas-disparo", icon: Phone },
      { label: "UTM Analytics",   href: "/utm-analytics", icon: Activity },
      { label: "IA Insights",     href: "/ai-insights",   icon: Sparkles },
    ],
  },
  {
    title: "Config",
    items: [
      { label: "Configurações", href: "/settings", icon: Settings },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2 py-[7px] text-[12.5px] transition-colors duration-150 mb-[1px]",
        isActive
          ? "bg-[rgba(201,162,39,0.12)] text-white font-medium"
          : "text-white/55 hover:bg-white/[0.05] hover:text-white/80"
      )}
    >
      <Icon
        className={cn(
          "h-[15px] w-[15px] shrink-0 transition-opacity",
          isActive ? "text-[#c9a227] opacity-100" : "opacity-45 group-hover:opacity-60"
        )}
        strokeWidth={1.5}
      />
      <span className="leading-none">{item.label}</span>
      {isActive && (
        <span className="ml-auto h-4 w-0.5 shrink-0 rounded-full bg-[#c9a227]" />
      )}
    </Link>
  );
}

// ─── Usage bar ────────────────────────────────────────────────────────────────

function UsageBar({ percent = 72 }: { percent?: number }) {
  return (
    <div className="px-1 pb-1.5 pt-0.5">
      <div className="mb-1.5 flex justify-between text-[10px] text-white/30">
        <span>Uso da base</span>
        <span>{percent}%</span>
      </div>
      <div className="h-0.5 rounded-full bg-white/[0.08]">
        <div
          className="h-0.5 rounded-full bg-[#c9a227]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Usuário";
  const userRole = "Administrador";
  const usagePercent = 72;
  
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col overflow-hidden border-r border-[rgba(255,255,255,0.07)] bg-[#0d0d0d] font-sans">
      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5 border-b border-[rgba(255,255,255,0.06)] px-4 py-5 relative">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c9a227] text-sm font-medium text-[#0d0d0d]">
          E
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium leading-none tracking-[0.02em] text-white">
            Escoltran
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.08em] text-white/35">
            Sales Intelligence
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="md:hidden absolute right-4 text-white/40 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {sections.map((section, i) => (
          <div key={section.title} className="px-3 pt-5 pb-1">
            {/* Section label */}
            <p className="mb-1 px-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-white/25">
              {section.title}
            </p>

            {section.items.map((item) => (
              <NavLink key={item.href} item={item} onClick={onClose} />
            ))}

            {/* Divider between sections except after last */}
            {i < sections.length - 1 && (
              <hr className="mx-1 mt-3 border-t border-white/[0.06]" />
            )}
          </div>
        ))}
      </nav>

      {/* ── Bottom section ── */}
      <div className="px-3 pb-3 pt-2">

        {/* Workspace card */}
        <div className="mb-3 rounded-[10px] border border-[rgba(201,162,39,0.2)] bg-[rgba(201,162,39,0.07)] p-3">
          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#c9a227]">
            Workspace
          </p>
          <p className="mb-2.5 text-[11px] leading-[1.4] text-white/40">
            Gerencie sua equipe com IA.
          </p>
          <button className="flex w-full items-center justify-center gap-1.5 rounded-[7px] border border-[rgba(201,162,39,0.35)] bg-transparent py-[7px] text-[11px] font-medium tracking-[0.04em] text-[#c9a227] transition-colors hover:bg-[rgba(201,162,39,0.1)]">
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Convidar
          </button>
        </div>

        {/* Usage bar */}
        <UsageBar percent={usagePercent} />

        {/* User row */}
        <div className="group flex items-center gap-2.5 px-1 py-2 relative rounded-md transition-colors hover:bg-white/[0.05] cursor-default">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#c9a227] text-[11px] font-medium text-[#0d0d0d]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-white/80">
              {userName}
            </p>
            <p className="mt-0.5 text-[10px] text-white/30">{userRole}</p>
          </div>
          
          <Settings
            className="h-[14px] w-[14px] shrink-0 text-white/20 transition-all group-hover:opacity-0 absolute right-2"
            strokeWidth={1.5}
          />
          
          <button 
            onClick={(e) => { e.stopPropagation(); signOut(); }}
            className="opacity-0 group-hover:opacity-100 transition-all absolute right-2 text-white/20 hover:text-red-400"
            title="Sair do sistema"
          >
            <LogOut className="h-[14px] w-[14px] shrink-0" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
