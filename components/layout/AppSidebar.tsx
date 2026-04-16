"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const NAV_GROUPS = [
  {
    label: "Dashboard",
    items: [
      { label: "Overview", path: "/dashboard", icon: "dashboard" }
    ]
  },
  {
    label: "Comercial",
    items: [
      { label: "Pipeline", path: "/pipeline", icon: "view_kanban" },
      { label: "Contatos", path: "/contacts", icon: "person" },
      { label: "Atividades", path: "/activities", icon: "calendar_today" }
    ]
  },
  {
    label: "Marketing",
    items: [
      { label: "Busca de Leads", path: "/lead-search", icon: "manage_search" },
      { label: "Disparo em Massa", path: "/listas-disparo", icon: "send_to_mobile" },
      { label: "Analytics", path: "/utm-analytics", icon: "monitoring" },
      { label: "Insights", path: "/ai-insights", icon: "auto_awesome" }
    ]
  },
  {
    label: "Sistema",
    items: [
      { label: "Configurações", path: "/settings", icon: "settings" }
    ]
  }
]

interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="fixed left-0 top-0 h-full w-[200px] z-50 bg-slate-900 border-r border-white/5 flex flex-col py-8 overflow-hidden">
      {/* BRAND */}
      <div className="px-6 mb-10">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
           <span className="material-symbols-outlined text-amber-500 text-[28px]">rocket_launch</span>
           <span>Escoltran</span>
        </h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">CRM System</p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-8 overflow-y-auto scrollbar-hide">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-6 mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 font-bold">
              {group.label}
            </div>
            {group.items.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-6 py-2.5 transition-all duration-200 text-[13px] font-medium tracking-wide border-l-2",
                  isActive(item.path)
                    ? "bg-amber-500/10 text-amber-500 border-amber-500"
                    : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* FOOTER / USER */}
      <div className="px-6 pt-6 border-t border-white/5 space-y-4">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container-highest border border-white/10 flex items-center justify-center text-[11px] font-bold text-amber-500 font-mono uppercase">
               {session?.user?.name?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="flex-1 min-w-0">
               <div className="text-[12px] font-bold text-slate-200 truncate uppercase tracking-tight">
                  {session?.user?.name?.split(" ")[0] || "Usuário"}
               </div>
               <div className="text-[9px] font-mono text-slate-500 uppercase font-bold">Plan: Scale</div>
            </div>
         </div>
         <button 
           onClick={() => signOut()}
           className="w-full flex items-center gap-2 text-slate-500 hover:text-error transition-colors text-[11px] font-bold uppercase tracking-widest"
          >
           <span className="material-symbols-outlined text-[18px]">logout</span>
           <span>Sair</span>
         </button>
      </div>
    </aside>
  )
}
