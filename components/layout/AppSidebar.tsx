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
    <div className="flex flex-col h-full bg-[#0D0D0D] border-r border-border-subtle w-[240px] shrink-0 overflow-hidden px-2 py-3">
      {/* Header / Logo */}
      <div className="flex items-center justify-between px-3 py-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-sm font-black text-black">E</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-sans font-semibold text-sm tracking-tight text-white">Escoltran</span>
            <span className="font-sans font-normal text-[11px] text-text-muted">CRM Inteligente</span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden h-8 w-8 text-text-muted">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1 mt-5 first:mt-0">
            <div className="px-3 mb-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted opacity-40">
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
                      "group flex items-center gap-[10px] px-3 py-[7px] transition-all duration-150 relative",
                      isActive
                        ? "bg-accent/10 text-accent border-l-2 border-accent rounded-r-lg"
                        : "text-text-secondary border-l-2 border-transparent hover:bg-white/[0.04] rounded-lg"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-opacity duration-150",
                        isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                      )}
                    />
                    <span className={cn(
                      "text-[13px] tracking-tight transition-colors transition-font",
                      isActive ? "font-semibold" : "font-normal"
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
      <div className="mt-auto px-3 py-4 border-t border-border-subtle/50">
        <p className="text-[11px] font-sans text-text-muted opacity-40 text-center">
          Escoltran v1.0
        </p>
      </div>
    </div>
  )
}
