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

        {/* USER PROFILE */}
        <div className="flex items-center gap-3">
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
    </header>
  )
}
