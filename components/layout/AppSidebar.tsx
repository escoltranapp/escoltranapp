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
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.3)] border border-white/10 group-hover:scale-105 transition-transform duration-500">
        <span className="text-white font-black text-2xl italic select-none">E</span>
      </div>
      <div>
        <h2 className="text-[22px] font-black text-white tracking-tighter leading-none italic uppercase">
          ESCOLTRAN
        </h2>
        <div className="flex items-center gap-1.5 mt-1.5">
           <div className="w-1 h-3 bg-[#F97316] rounded-full" />
           <span className="text-[10px] text-[#6B7280] font-black tracking-[0.2em] uppercase">CRM SYSTEM</span>
        </div>
      </div>
    </div>
  )
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="fixed left-0 top-0 h-full w-[256px] z-50 bg-[#0A0A0A] border-r border-white/[0.03] flex flex-col pt-10 pb-8 overflow-hidden">
      {/* BRAND */}
      <div className="px-8 mb-16">
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
              "flex items-center gap-5 px-8 py-4 transition-all duration-300 text-[14px] font-black tracking-tight relative group italic uppercase",
              isActive(item.path)
                ? "text-white bg-gradient-to-r from-[#F97316]/10 to-transparent"
                : "text-[#404040] hover:text-[#F2F2F2]"
            )}
          >
            {isActive(item.path) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-7 bg-[#F97316] rounded-r-full shadow-[0_0_20px_rgba(249,115,22,0.8)]" />
            )}
            <span className={cn(
               "material-symbols-outlined text-[22px] transition-all duration-300",
               isActive(item.path) 
                 ? "text-[#F97316] drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]" 
                 : "text-[#262626] group-hover:text-[#F97316]/50 group-hover:scale-110"
            )}>{item.icon}</span>
            <span className={cn(
              "truncate transition-all duration-300",
              isActive(item.path) ? "opacity-100" : "opacity-80 group-hover:opacity-100"
            )}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* FOOTER USER AREA */}
      <div className="px-6 pt-8 border-t border-white/[0.03] mx-2 mt-auto">
         <div className="p-5 rounded-2xl bg-[#1A1A1A] border border-white/[0.03] space-y-6 shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="w-11 h-11 rounded-full bg-[#0A0A0A] border border-[#F97316]/30 flex items-center justify-center text-[13px] font-black text-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                  {session?.user?.name?.slice(0, 2).toUpperCase() || "EC"}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-black text-white truncate uppercase tracking-tighter italic">
                     {session?.user?.name?.split(" ")[0] || "Operador"}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] shadow-[0_0_8px_#34D399]" />
                     <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">Live Node</span>
                  </div>
               </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 text-[#404040] hover:text-white transition-all py-3 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#F97316]/10 hover:border-[#F97316]/30 group"
             >
              <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">logout</span>
              <span>Sair do Sistema</span>
            </button>
         </div>
      </div>
    </aside>
  )
}
