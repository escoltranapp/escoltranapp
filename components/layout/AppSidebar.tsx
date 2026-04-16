"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Overview", path: "/dashboard", icon: "dashboard" },
  { label: "Pipeline", path: "/pipeline", icon: "view_kanban" },
  { label: "Contatos", path: "/contacts", icon: "person" },
  { label: "Atividades", path: "/activities", icon: "calendar_today" },
  { label: "Busca de Leads", path: "/lead-search", icon: "manage_search" },
  { label: "Disparo em Massa", path: "/listas-disparo", icon: "send_to_mobile" },
  { label: "Analytics", path: "/utm-analytics", icon: "monitoring" },
  { label: "Insights", path: "/ai-insights", icon: "auto_awesome" },
  { label: "Configurações", path: "/settings", icon: "settings" },
]

interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] z-50 bg-surface border-r border-white/5 flex flex-col py-8 overflow-hidden shadow-2xl shadow-black/50">
      {/* BRAND */}
      <div className="px-8 mb-12">
        <h2 className="text-2xl font-bold text-white tracking-tighter flex flex-col">
           <span className="text-white">Escoltran</span>
           <span className="text-[10px] text-amber-500/40 uppercase tracking-[0.3em] font-black mt-1">CRM SYSTEM</span>
        </h2>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={onClose}
            className={cn(
              "flex items-center gap-4 px-8 py-3.5 transition-all duration-300 text-[13px] font-bold tracking-tight relative group",
              isActive(item.path)
                ? "bg-amber-500/5 text-amber-500"
                : "text-slate-500 hover:text-slate-200"
            )}
          >
            {isActive(item.path) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-6 bg-amber-500 rounded-r-full shadow-[0_0_15px_rgba(245,166,35,0.6)]" />
            )}
            <span className={cn(
               "material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110",
               isActive(item.path) ? "text-amber-500" : "text-slate-600 group-hover:text-slate-400"
            )}>{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* FOOTER USER AREA */}
      <div className="px-6 pt-6 border-t border-white/5 mx-2 bg-gradient-to-t from-black/20 to-transparent">
         <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-[13px] font-black text-black font-mono shadow-lg shadow-amber-500/10">
                  {session?.user?.name?.slice(0, 2).toUpperCase() || "US"}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-slate-200 truncate uppercase tracking-tight">
                     {session?.user?.name?.split(" ")[0] || "Usuário"}
                  </div>
                  <div className="text-[9px] font-mono text-amber-500/40 uppercase font-bold mt-1">Status: Online</div>
               </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-white transition-all py-2.5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5"
             >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sair do Sistema</span>
            </button>
         </div>
      </div>
    </aside>
  )
}
