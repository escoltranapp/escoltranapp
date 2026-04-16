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
    <aside className="fixed left-0 top-0 h-full w-[200px] z-50 bg-surface-dim border-r border-white/5 flex flex-col py-8 overflow-hidden">
      {/* BRAND */}
      <div className="px-6 mb-12">
        <h2 className="text-xl font-bold text-white tracking-tight flex flex-col bg-clip-text">
           <span className="text-white">Escoltran</span>
           <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">CRM SYSTEM</span>
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
              "flex items-center gap-3 px-6 py-3 transition-all duration-200 text-[12px] font-medium tracking-wide relative group",
              isActive(item.path)
                ? "bg-amber-500/5 text-amber-500"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {isActive(item.path) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-amber-500 rounded-r-full shadow-[0_0_10px_rgba(245,166,35,0.5)]" />
            )}
            <span className={cn(
               "material-symbols-outlined text-[20px] transition-colors",
               isActive(item.path) ? "text-amber-500" : "text-slate-500 group-hover:text-slate-400"
            )}>{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* FOOTER USER CONTEXT */}
      <div className="px-4 pt-6 border-t border-white/5 mx-2">
         <div className="p-3 rounded-xl bg-surface-container-high/50 border border-white/5 space-y-3">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-[11px] font-bold text-black font-mono">
                  {session?.user?.name?.slice(0, 2).toUpperCase() || "OP"}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-slate-200 truncate uppercase tracking-tight leading-none">
                     {session?.user?.name?.split(" ")[0] || "Operador"}
                  </div>
                  <div className="text-[8px] font-mono text-amber-500/60 uppercase font-black mt-1">Status: Active</div>
               </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-amber-500 transition-colors py-1.5 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]"
             >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              <span>Sair do Terminal</span>
            </button>
         </div>
      </div>
    </aside>
  )
}
