"use client"

import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

export default function ListasDisparoPage() {
  return (
    <div className="animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Disparo em Massa</h1>
          <p className="text-[#6B7280] text-[15px] mt-2 font-bold tracking-tight">Automação de campanhas e orquestração de fluxos massivos</p>
        </div>
        
        <button className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#F97316]/20 text-[12px] uppercase tracking-widest">
          <span className="material-symbols-outlined text-[20px] font-black">send</span>
          <span>Nova Campanha</span>
        </button>
      </header>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-[#0A0A0A]">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono">Campanha</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono">Progresso</th>
                  <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono">Operação</th>
               </tr>
            </thead>
            <tbody>
               {[
                  { n: "Campanha Marketing Abril", s: "Disparando", p: 65 },
                  { n: "Follow-up Leads Frios", s: "Concluída", p: 100 },
                  { n: "Lançamento Produto V3", s: "Rascunho", p: 0 }
               ].map((c, i) => (
                  <tr key={i} className="hover:bg-[#F97316]/5 transition-all group border-b border-[#262626]/50">
                     <td className="px-6 py-6">
                        <div className="font-black text-white text-[14px] tracking-tight uppercase italic">{c.n}</div>
                        <div className="text-[10px] text-[#404040] font-mono uppercase tracking-widest mt-1">ID: CAMP-0{i}</div>
                     </td>
                     <td className="px-6 py-6">
                        <span className={cn(
                           "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                           c.s === 'Disparando' ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20" : "bg-[#262626] text-[#6B7280] border-white/5"
                        )}>{c.s}</span>
                     </td>
                     <td className="px-6 py-6 w-64">
                        <div className="flex flex-col gap-2">
                           <div className="flex justify-between text-[10px] font-mono font-black text-[#404040]">
                              <span>{c.p}%</span>
                           </div>
                           <div className="h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden border border-white/5">
                              <div className="h-full bg-[#F97316] shadow-[0_0_10px_rgba(249,115,22,0.4)] transition-all duration-1000" style={{ width: `${c.p}%` }} />
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-6 text-right">
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-[#404040] hover:text-[#F97316] hover:bg-[#F97316]/10 transition-all">
                           <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  )
}
