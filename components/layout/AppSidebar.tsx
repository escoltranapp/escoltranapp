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
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = true, onClose }: AppSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-border z-[100] transition-transform duration-500 ease-in-out flex flex-col",
        !isOpen && "-translate-x-full md:translate-x-0"
      )}>
        
        {/* 1. FIXED HEADER */}
        <div className="p-8 pb-10">
          <Link href="/dashboard" className="flex items-center gap-4 group cursor-pointer active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] group-hover:rotate-12 transition-transform duration-500">
              <span className="text-2xl font-black text-white italic">E</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground italic tracking-tighter leading-none">ESCOLTRAN</h1>
              <div className="flex items-center gap-2 mt-2">
                 <div className="w-1.5 h-[1px] bg-[#F97316]" />
                 <span className="text-[9px] font-mono font-black text-secondary uppercase tracking-[0.3em]">CRM System</span>
              </div>
            </div>
          </Link>
        </div>

        {/* 2. SCROLLABLE NAVIGATION */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-1 py-4 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/")
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => onClose?.()}
                className={cn(
                  "group relative flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 overflow-hidden",
                  isActive 
                    ? "text-primary bg-primary/5" 
                    : "text-secondary hover:text-foreground hover:bg-foreground/[0.02]"
                )}
              >
                {/* ACTIVE INDICATOR */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-[3.5px] bg-[#F97316] rounded-r-full shadow-[0_0_15px_#F97316]" />
                )}
                
                <span className={cn(
                  "material-symbols-outlined text-[19px] transition-all",
                  isActive ? "scale-110" : "group-hover:scale-110 group-hover:text-white"
                )}>{item.icon}</span>
                <span className="text-[11px] font-black uppercase tracking-[0.15em] italic">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* 3. FIXED FOOTER USER AREA */}
        <div className="p-4 pt-6 border-t border-border bg-sidebar/80 backdrop-blur-md">
           <div className="relative group">
              <div className="relative bg-foreground/[0.02] border border-border p-5 rounded-[22px] shadow-2xl overflow-hidden group/card">
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                       <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm" />
                       <div className="w-10 h-10 rounded-full bg-background border border-primary/40 flex items-center justify-center text-[13px] font-black text-primary relative z-10">
                          {session?.user?.name?.slice(0, 2).toUpperCase() || "EC"}
                       </div>
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="text-[12px] font-black text-foreground truncate uppercase tracking-tight italic">
                          {(() => {
                            const names = (session?.user?.name || "Operador").trim().split(/\s+/);
                            return names.length > 1 ? `${names[0]} ${names[1]}` : names[0];
                          })()}
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={() => signOut()}
                   className="w-full mt-5 flex items-center justify-center gap-3 text-secondary hover:text-foreground transition-all py-3 border border-border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-foreground/[0.01] hover:bg-primary/10 hover:border-primary/30 group/logout"
                  >
                    <span className="material-symbols-outlined text-[16px] group-hover/logout:rotate-12 transition-transform">logout</span>
                    <span>Terminal Exit</span>
                 </button>
              </div>
           </div>
        </div>
      </aside>
    </>
  )
}
