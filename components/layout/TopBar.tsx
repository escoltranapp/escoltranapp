"use client"

import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 left-0 md:left-[200px] right-0 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        
        {/* BUSCA RÁPIDA (OPCIONAL) */}
        <div className="hidden lg:flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-1.5 rounded-lg">
           <span className="material-symbols-outlined text-[18px] text-slate-500">search</span>
           <span className="text-xs text-slate-500 font-medium">Buscar no Escoltran...</span>
           <span className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-slate-500 ml-4">⌘K</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* NOTIFICAÇÕES */}
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-slate-950" />
        </button>

        {/* PERFIL */}
        <div className="flex items-center gap-4 pl-6 border-l border-white/5">
           <div className="text-right hidden sm:block">
              <div className="text-[12px] font-bold text-slate-200 tracking-tight leading-none uppercase">
                 {session?.user?.name || "Usuário"}
              </div>
              <div className="text-[9px] font-mono text-slate-500 font-bold mt-1">Sessão Ativa</div>
           </div>
           
           <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-white/10 p-0.5">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-amber-500 uppercase overflow-hidden">
                 {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    session?.user?.name?.slice(0, 2).toUpperCase() || "US"
                 )}
              </div>
           </div>
        </div>
      </div>
    </header>
  )
}
