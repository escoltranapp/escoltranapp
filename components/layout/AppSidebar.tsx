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
  { label: "Disparo em Massa", path: "/listas-disparo", icon: "campaign" },
  { label: "UTM Analytics", path: "/utm-analytics", icon: "monitoring" },
  { label: "IA Insights", path: "/ai-insights", icon: "auto_awesome" },
  { label: "Configurações", path: "/settings", icon: "settings" },
]

interface AppSidebarProps {
  onClose?: () => void;
}

function EscoltranLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
        <span className="text-white font-black text-xl italic">E</span>
      </div>
      <div>
        <h2 className="text-xl font-black text-white tracking-tighter leading-none italic">
          ESCOLTRAN
        </h2>
        <span className="text-[10px] text-[#6B7280] font-black tracking-widest uppercase">CRM SYSTEM</span>
      </div>
    </div>
  )
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="fixed left-0 top-0 h-full w-[256px] z-50 bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col py-8 overflow-hidden">
      {/* BRAND */}
      <div className="px-8 mb-12">
        <EscoltranLogo />
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={onClose}
            className={cn(
              "flex items-center gap-4 px-8 py-3.5 transition-all duration-300 text-[14px] font-bold tracking-tight relative group",
              isActive(item.path)
                ? "bg-[#F97316]/5 text-[#F97316]"
                : "text-[#6B7280] hover:text-[#F2F2F2]"
            )}
          >
            {isActive(item.path) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#F97316] rounded-r-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
            )}
            <span className={cn(
               "material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110",
               isActive(item.path) ? "text-[#F97316]" : "text-[#404040] group-hover:text-[#F97316]/50"
            )}>{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* FOOTER USER AREA */}
      <div className="px-6 pt-6 border-t border-[#1A1A1A] mx-2">
         <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#262626] space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-[13px] font-black text-white shadow-lg shadow-[#F97316]/20">
                  {session?.user?.name?.slice(0, 2).toUpperCase() || "US"}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-[#F2F2F2] truncate uppercase tracking-tight">
                     {session?.user?.name?.split(" ")[0] || "Operador"}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
                     <span className="text-[9px] font-bold text-[#6B7280] uppercase">Online</span>
                  </div>
               </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 text-[#6B7280] hover:text-[#F2F2F2] transition-all py-2.5 border border-[#262626] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#262626]"
             >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sair</span>
            </button>
         </div>
      </div>
    </aside>
  )
}
