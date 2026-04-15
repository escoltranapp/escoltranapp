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
  Plus,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"

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
    <div className="flex flex-col h-full bg-[#09090B] border-r border-white/5 text-white/50 font-sans">
      {/* Header / Logo */}
      <div className="p-8 pb-10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-accent/20 transition-transform group-hover:scale-105">
            E
          </div>
          <div>
            <span className="text-white font-black text-lg tracking-tight block leading-none">Escoltran</span>
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1 block">SaaS Intelligence</span>
          </div>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-white/20">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-4 space-y-10 overflow-y-auto scrollbar-hide">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
              {group.title}
            </h3>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                      active 
                        ? "bg-accent text-black font-black shadow-lg shadow-accent/10" 
                        : "hover:bg-white/[0.03] hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-black" : "text-white/20 group-hover:text-accent transition-colors")} />
                    <span className="text-[13px] tracking-tight">{item.label}</span>
                    {active && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}

        {/* Action Card / Invite */}
        <div className="p-4 pt-10">
          <div className="bg-[#111114] border border-white/5 rounded-[22px] p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Workspace</p>
            <h4 className="text-xs font-bold text-white mb-4">Gerencie sua equipe com IA.</h4>
            <Button size="sm" className="w-full bg-white/5 hover:bg-white/10 text-white border-white/5 text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl">
              <Plus className="h-3 w-3 mr-2" /> Convidar
            </Button>
          </div>
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        {/* Usage Quota Area */}
        <div className="mb-6 px-2 space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
            <span className="text-white/20">Uso da Base</span>
            <span className="text-accent">72%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: '72%' }} />
          </div>
        </div>

        <div className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.03] transition-all cursor-default relative">
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
