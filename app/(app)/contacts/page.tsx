"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

function KPICard({
  label, value, icon, emoji, color = "#F97316"
}: {
  label: string; value: string | number; icon?: string; emoji?: string; color?: string
}) {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 hover:bg-[#262626] transition-all group overflow-hidden shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center">
          {icon ? <span className="material-symbols-outlined text-[20px] text-[#F97316]">{icon}</span> : <span className="text-xl">{emoji}</span>}
        </div>
        <div className="px-2 py-0.5 rounded-full text-[10px] font-black font-mono text-[#F97316] bg-[#F97316]/5 border border-[#F97316]/10 uppercase tracking-widest">
           Sincronizado
        </div>
      </div>
      <div>
         <div className="text-[10px] font-mono text-[#6B7280] uppercase tracking-[0.2em] font-black mb-1 italic">{label}</div>
         <div className="text-2xl font-black text-white tracking-tighter font-mono">{value}</div>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const [search, setSearch] = useState("")

  const { data: contacts = [], isLoading } = useQuery<any[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await fetch("/api/contacts")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
  })

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      
      {/* HEADER ESCOLTRAN STYLE */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">CRM Contatos</h1>
          <p className="text-[#6B7280] text-[15px] mt-2 font-bold tracking-tight">Diretório mestre de entidades processadas</p>
        </div>
        
        <button className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#F97316]/20 text-[12px] uppercase tracking-widest">
          <span className="material-symbols-outlined text-[20px] font-black">person_add</span>
          <span>Sincronizar Novo</span>
        </button>
      </header>

      {/* KPI GRID ESPECÍFICO DO PROMPT ORIGINAL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         <KPICard label="Database" value={contacts.length} icon="corporate_fare" />
         <KPICard label="Active Network" value={contacts.filter(c => c.status === "lead").length} emoji="⚡" />
         <KPICard label="Flow Active" value="00" icon="dynamic_feed" />
         <KPICard label="Converte" value={contacts.filter(c => c.status === "cliente").length} emoji="🛡️" />
      </div>

      {/* BARRA DE BUSCA EM SURFACE LARANJA */}
      <div className="bg-[#1A1A1A] border border-white/5 p-2 rounded-2xl mb-8 flex items-center gap-4 shadow-xl">
         <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#404040] group-focus-within:text-[#F97316] transition-colors">search</span>
            <input
              placeholder="Filtro por empresa ou identificador..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] h-11 pl-12 pr-4 rounded-xl text-sm text-[#F2F2F2] placeholder:text-[#404040] focus:outline-none focus:border-[#F97316]/40 transition-all font-medium"
            />
         </div>
      </div>

      {/* TABELA ESCOLTRAN ESPECÍFICA DO PROMPT ORIGINAL */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-[#0A0A0A]">
                     <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono">Contato Digital</th>
                     <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono">Empresa</th>
                     <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono">Ação Operacional</th>
                  </tr>
               </thead>
               <tbody>
                  {contacts.length === 0 ? (
                     <tr>
                        <td colSpan={3} className="py-32 text-center text-[#404040]">
                           <div className="flex flex-col items-center gap-4 italic opacity-40">
                              <span className="material-symbols-outlined text-[64px]">dataset</span>
                              <div className="font-black text-[14px] tracking-widest">DATASET VAZIO OU SEM RESULTADOS</div>
                           </div>
                        </td>
                     </tr>
                  ) : (
                     contacts.map((contact) => (
                       <tr key={contact.id} className="hover:bg-[#F97316]/5 transition-all group border-b border-[#262626]/50">
                         <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-9 h-9 rounded-full bg-[#262626] border border-white/5 flex items-center justify-center text-[#F97316] font-black text-xs font-mono group-hover:bg-[#F97316] group-hover:text-black transition-all">
                                 {contact.nome?.slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                 <div className="font-black text-white text-[14px] tracking-tight">{contact.nome}</div>
                                 <div className="text-[10px] text-[#404040] font-mono uppercase tracking-widest">{contact.email || "Sem ID Digital"}</div>
                              </div>
                           </div>
                         </td>
                         <td className="px-6 py-5">
                            <div className="text-[13px] font-bold text-[#A3A3A3] group-hover:text-white transition-colors">{contact.empresa || "—"}</div>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="px-2 py-0.5 bg-[#262626] text-[#6B7280] text-[9px] font-black rounded uppercase tracking-widest">Cluster: Default</span>
                            </div>
                         </td>
                         <td className="px-6 py-5 text-right">
                           <button className="h-8 px-4 bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#F97316] hover:text-black transition-all">
                             Analisar
                           </button>
                         </td>
                       </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  )
}
