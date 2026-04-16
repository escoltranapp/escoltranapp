"use client"

import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 left-0 md:left-[240px] right-0 h-16 bg-surface-lowest/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-6 w-full max-w-xl">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        
        {/* BUSCA RÁPIDA */}
        <div className="flex-1 max-w-md relative group">
           <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[20px] group-focus-within:text-amber-500 transition-colors">search</span>
           <input 
             placeholder="Pesquisar registros..." 
             className="w-full bg-slate-900/50 border border-white/5 h-10 pl-12 pr-4 rounded-xl text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/20 focus:bg-slate-900/80 transition-all font-medium"
           />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* AÇÕES DA DIREITA */}
        <div className="flex items-center gap-2 pr-4 border-r border-white/5">
           <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-opacity relative">
             <span className="material-symbols-outlined text-[24px]">notifications</span>
             <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-surface-lowest" />
           </button>
           <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-opacity">
             <span className="material-symbols-outlined text-[22px]">help_outline</span>
           </button>
        </div>

        {/* PERFIL AVATAR */}
        <div className="w-9 h-9 rounded-full bg-surface-container-high border border-white/10 p-0.5">
          <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
             {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
                <span className="material-symbols-outlined text-amber-500 text-[20px]">person</span>
             )}
          </div>
        </div>
      </div>
    </header>
  )
}
