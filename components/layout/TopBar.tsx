"use client"

import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[256px] h-16 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.03] z-40 px-6">
      <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between gap-6">
        
        {/* MOBILE MENU TRIGGER */}
        <button 
          onClick={onMenuClick}
          className="md:hidden w-10 h-10 flex items-center justify-center text-[#A3A3A3]"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* SEARCH BAR - CONSTRAINED WIDTH TO PREVENT OVERLAP */}
        <div className="flex-1 max-w-[600px] relative group hidden sm:block">
           <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#404040] text-[18px] group-focus-within:text-[#F97316] transition-colors">search</span>
           <input 
             placeholder="Busca global de dataset... (⌘K)" 
             className="w-full h-10 bg-[#1A1A1A] border border-[#262626] pl-11 pr-14 rounded-xl text-[13px] text-white placeholder:text-[#404040] focus:outline-none focus:border-[#F97316]/40 transition-all font-bold"
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded border border-[#262626] bg-[#0A0A0A] text-[9px] font-mono font-black text-[#6B7280]">⌘K</span>
           </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
           {/* NOTIFICATIONS */}
           <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1A1A1A] border border-white/5 text-[#404040] hover:text-[#F97316] transition-all relative">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#F97316] rounded-full shadow-[0_0_8px_#F97316]" />
           </button>

           {/* USER PROFILE */}
           <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="text-right hidden lg:block">
                 <div className="text-[12px] font-black text-white uppercase tracking-tight">{session?.user?.name || "Operador"}</div>
                 <div className="text-[9px] font-mono font-black text-[#F97316] uppercase tracking-[0.2em] italic">Auth: Node_A1</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] p-[1.5px] shadow-lg shadow-[#F97316]/10">
                 <div className="w-full h-full rounded-full bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[11px] font-black text-white font-mono">
                         {session?.user?.name?.slice(0, 2).toUpperCase() || "EC"}
                      </span>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </header>
  )
}
