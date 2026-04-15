"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Kanban,
  Users,
  Search,
  Send,
  Activity,
  BarChart2,
  Bot,
  Settings,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const menuGroups = [
  {
    title: "Dashboard",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    ]
  },
  {
    title: "Comercial",
    items: [
      { href: "/pipeline", label: "Pipeline", icon: Kanban },
      { href: "/contacts", label: "Contatos", icon: Users },
      { href: "/activities", label: "Atividades", icon: Activity },
    ]
  },
  {
    title: "Marketing",
    items: [
      { href: "/lead-search", label: "Busca de Leads", icon: Search },
      { href: "/listas-disparo", label: "Disparo em Massa", icon: Send },
      { href: "/utm-analytics", label: "UTM Analytics", icon: BarChart2 },
      { href: "/ai-insights", label: "IA Insights", icon: Bot },
    ]
  },
  {
    title: "Config",
    items: [
      { href: "/settings", label: "Configurações", icon: Settings },
    ]
  }
]

interface AppSidebarProps {
  onClose?: () => void
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] border-r border-border-default w-[220px] shrink-0 overflow-hidden">
      {/* Header / Logo */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shadow-[0_0_15px_rgba(224,176,80,0.3)]">
            <span className="text-xs font-black text-accent-foreground">E</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-sans font-black text-sm tracking-tight text-white uppercase">Escoltran</span>
            <span className="font-display italic text-[10px] text-accent">CRM Inteligente</span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-0 py-2 overflow-y-auto space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-6">
              <span className="text-[10px] font-black font-mono uppercase tracking-[0.15em] text-text-muted">
                {group.title}
              </span>
            </div>
            <nav className="space-y-[2px]">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 px-6 py-2 transition-all duration-200 border-l-2",
                      isActive
                        ? "bg-surface-elevated text-accent border-accent"
                        : "text-text-secondary border-transparent hover:text-text-primary hover:border-border-strong hover:bg-surface-elevated/50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-opacity duration-200",
                        isActive ? "opacity-100" : "opacity-50 group-hover:opacity-100"
                      )}
                    />
                    <span className={cn(
                      "text-[13px] tracking-wide uppercase font-mono",
                      isActive ? "font-bold" : "font-normal"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-subtle bg-black/20">
        <p className="text-[10px] font-mono text-text-muted text-center tracking-widest uppercase opacity-60">
          Escoltran v1.0
        </p>
      </div>
    </div>
  )
}
