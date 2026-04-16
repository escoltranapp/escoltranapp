"use client"

import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 left-0 md:left-[256px] right-0 h-16 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-[#1A1A1A] z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-6 w-full max-w-xl">
        <button
          onClick={onMenuClick}
          className="md:hidden text-[#6B7280] hover:text-white"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        
        {/* BUSCA GLOBAL SPECIFIC */}
        <div className="flex-1 max-w-md relative group">
           <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#404040] text-[18px] group-focus-within:text-[#F97316] transition-colors">search</span>
           <input 
             placeholder="Busca global... (⌘K)" 
             className="w-full bg-[#1A1A1A] border border-[#262626] h-10 pl-11 pr-12 rounded-lg text-[13px] text-[#F2F2F2] placeholder:text-[#404040] focus:outline-none focus:border-[#F97316]/30 focus:bg-[#1A1A1A] transition-all font-medium"
           />
           <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#404040] border border-[#262626] px-1.5 py-0.5 rounded bg-[#0A0A0A]">
              ⌘K
           </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* AÇÕES DA DIREITA */}
        <div className="flex items-center gap-2">
           <button className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:text-[#F97316] transition-all">
             <span className="material-symbols-outlined text-[20px]">contrast</span>
           </button>
           <button className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:text-[#F97316] transition-all relative">
             <span className="material-symbols-outlined text-[22px]">notifications</span>
             <div className="absolute top-2 right-2 w-2 h-2 bg-[#F97316] rounded-full border-2 border-[#0A0A0A]" />
           </button>
        </div>

        {/* PERFIL */}
        <div className="flex items-center gap-3 pl-6 border-l border-[#1A1A1A]">
           <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] p-[1.5px] shadow-lg shadow-[#F97316]/10">
              <div className="w-full h-full rounded-full bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
                 {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    <span className="material-symbols-outlined text-[#F97316] text-[18px]">person</span>
                 )}
              </div>
           </div>
        </div>
      </div>
    </header>
  )
}
