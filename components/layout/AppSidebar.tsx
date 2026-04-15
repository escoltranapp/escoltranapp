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
  const { data: session } = useSession()

  return (
    <div className="flex flex-col h-full bg-[#09090B] border-r border-white/5 w-[240px] shrink-0 overflow-hidden px-4 py-6">
      {/* Header / Logo */}
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/10">
            <span className="text-base font-black text-black">E</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-sans font-bold text-sm tracking-tight text-white/90">Escoltran</span>
            <span className="font-sans font-normal text-[11px] text-white/40">CRM Inteligente</span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden h-8 w-8 text-white/40">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto space-y-7 custom-scrollbar pr-2">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <div className="px-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30">
                {group.title}
              </span>
            </div>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 transition-all duration-200 rounded-xl",
                      isActive
                        ? "bg-accent text-black font-semibold shadow-md shadow-accent/20"
                        : "text-white/50 hover:bg-white/[0.03] hover:text-white/80"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-opacity",
                        isActive ? "opacity-100 text-black" : "opacity-40 group-hover:opacity-100"
                      )}
                    />
                    <span className="text-[13px] tracking-tight">
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}

        {/* Action Button */}
        <div className="pt-4 px-2">
          <Button 
            className="w-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 h-11 rounded-xl flex items-center justify-between px-4 group transition-all"
            onClick={() => {}}
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Nova Prospecção</span>
            </div>
            <ChevronRight className="h-3 w-3 opacity-40 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Quota Section */}
      <div className="mt-8 px-2 space-y-3">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Cota Mensal</span>
            <span className="text-[10px] font-bold text-accent">6/10</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full w-[60%]" />
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 p-2 bg-transparent hover:bg-white/[0.03] rounded-2xl transition-all cursor-pointer group">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black text-xs border border-accent/20">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white/90 truncate">{session?.user?.name || "Usuário"}</p>
            <p className="text-[10px] text-white/30 truncate">{session?.user?.email}</p>
          </div>
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => signOut()}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
            >
              <LogOut className="h-3 w-3 text-white/40 hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
