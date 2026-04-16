"use client"

import { useQuery } from "@tanstack/react-query"

export default function ActivitiesPage() {
  return (
    <div className="animate-in fade-in duration-700 pb-24">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Atividades</h1>
        <p className="text-[#6B7280] text-[15px] mt-2 font-bold tracking-tight">Audit log e registros de interações do sistema</p>
      </header>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
         {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-6 p-6 border-b border-white/[0.04] hover:bg-[#F97316]/5 transition-all group">
               <div className="w-12 h-12 rounded-xl bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-[#F97316] group-hover:bg-[#F97316] group-hover:text-black transition-all shadow-inner">
                  <span className="material-symbols-outlined text-[20px]">history</span>
               </div>
               <div className="flex-1 space-y-1">
                  <div className="text-[14px] font-bold text-[#F2F2F2] uppercase tracking-tight">Evento de Sistema #{1240-i}</div>
                  <div className="text-[11px] text-[#6B7280] font-medium leading-none">Dataset sincronizado com sucesso por <span className="text-white">Admin Node</span></div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">12:45 PM</div>
                  <div className="text-[9px] font-bold text-[#F97316] mt-1 uppercase tracking-tighter">Status: OK</div>
               </div>
            </div>
         ))}
      </div>
    </div>
  )
}
