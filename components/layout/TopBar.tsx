"use client"

import { cn } from "@/lib/utils"

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-[256px] h-16 bg-background/80 backdrop-blur-xl border-b border-border z-40 px-6">
      <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between gap-6">
        
        {/* MOBILE MENU TRIGGER */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/[0.03] border border-border text-secondary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <div className="md:hidden flex items-center gap-2">
             <div className="w-9 h-9 bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)] shrink-0">
                <span className="text-[14px] font-black text-white italic">E</span>
             </div>
             <span className="text-[13px] font-black text-foreground italic tracking-tighter uppercase truncate">Escoltran CRM</span>
          </div>
        </div>

        {/* TOPBAR UTILITIES AREA - MINIMALIST */}
        <div className="flex items-center gap-4">
           {/* Aqui podem entrar notificações ou perfil reduzido se necessário */}
        </div>
      </div>
    </header>
  )
}
