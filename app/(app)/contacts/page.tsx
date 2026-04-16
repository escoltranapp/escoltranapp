"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { NewContactDialog } from "@/components/contacts/NewContactDialog"

function KPICard({
  label, value, icon, emoji, color = "#F97316"
}: {
  label: string; value: string | number; icon?: string; emoji?: string; color?: string
}) {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 hover:bg-[#262626] transition-all group overflow-hidden shadow-lg min-h-[140px] flex flex-col justify-center">
      <div className="flex items-center justify-between mb-auto">
        <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center">
          {icon ? <span className="material-symbols-outlined text-[20px] text-[#F97316]">{icon}</span> : <span className="text-xl">{emoji}</span>}
        </div>
        <div className="px-2 py-0.5 rounded-full text-[9px] font-black font-mono text-[#F97316] bg-[#F97316]/5 border border-[#F97316]/10 uppercase tracking-widest">
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
  const [isNewContactOpen, setIsNewContactOpen] = useState(false)

  const { data: contactsData, isLoading } = useQuery<any>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await fetch("/api/contacts")
      if (!res.ok) return []
      return res.json()
    },
  })

  // DEFENSIVE DATA EXTRACTION
  const contacts = Array.isArray(contactsData) ? contactsData : []
  const filteredContacts = contacts.filter(c => 
    c.nome?.toLowerCase().includes(search.toLowerCase()) || 
    c.empresa?.toLowerCase().includes(search.toLowerCase())
  )

  const databaseSize = contacts.length
  const activeNetwork = contacts.filter(c => c.status === "lead").length
  const clientes = contacts.filter(c => c.status === "cliente").length

  return (
    <div className="animate-in fade-in duration-700 pb-24 px-1">
      
      {/* HEADER ESCOLTRAN STYLE */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">CRM Contatos</h1>
          <p className="text-[#6B7280] text-[15px] mt-2 font-bold tracking-tight">Diretório mestre de entidades processadas Escoltran</p>
        </div>
        
        <button 
          onClick={() => setIsNewContactOpen(true)}
          className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-black px-10 py-4 rounded-xl flex items-center gap-3 hover:scale-105 transition-all shadow-lg shadow-[#F97316]/20 text-[12px] uppercase tracking-[0.2em]"
        >
          <span className="material-symbols-outlined text-[20px] font-black">person_add</span>
          <span>Novo</span>
        </button>
      </header>

      {/* KPI GRID ESPECÍFICO - USANDO NOVA CLASSE GRID-STATS PARA EVITAR OVERLAP */}
      <div className="grid-stats mb-12">
         <KPICard label="Database" value={databaseSize} icon="corporate_fare" />
         <KPICard label="Active Network" value={activeNetwork} emoji="⚡" />
         <KPICard label="Flow Active" value="00" icon="dynamic_feed" />
         <KPICard label="Converte" value={clientes} emoji="🛡️" />
      </div>

      {/* BARRA DE BUSCA EM SURFACE CONFORMADA */}
      <div className="bg-[#1A1A1A] border border-white/5 p-2 rounded-2xl mb-8 flex items-center gap-4 shadow-xl max-w-[800px]">
         <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#404040] group-focus-within:text-[#F97316] transition-colors text-[18px]">search</span>
            <input
              placeholder="Filtro por empresa ou identificador de dataset..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] h-11 pl-12 pr-4 rounded-xl text-sm text-[#F2F2F2] placeholder:text-[#404040] focus:outline-none focus:border-[#F97316]/40 transition-all font-bold"
            />
         </div>
      </div>

      {/* TABELA ESCOLTRAN ESPECÍFICA */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl border-t-white/[0.03]">
         <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[800px]">
               <thead>
                  <tr className="bg-[#0A0A0A]">
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono italic">Contato Digital</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono italic">Empresa / Entidade</th>
                     <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono italic">Ação Operacional</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredContacts.length === 0 ? (
                     <tr>
                        <td colSpan={3} className="py-40 text-center text-[#404040]">
                           <div className="flex flex-col items-center gap-6 italic opacity-20">
                              <span className="material-symbols-outlined text-[80px]">dataset</span>
                              <div className="font-black text-[16px] tracking-[0.3em] uppercase">DATASET VAZIO OU SEM RESULTADOS</div>
                           </div>
                        </td>
                     </tr>
                  ) : (
                     filteredContacts.map((contact) => (
                       <tr key={contact.id} className="hover:bg-[#F97316]/5 transition-all group border-b border-[#262626]/50">
                         <td className="px-8 py-6">
                           <div className="flex items-center gap-5">
                              <div className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-white/[0.05] flex items-center justify-center text-[#F97316] font-black text-xs font-mono group-hover:bg-[#F97316] group-hover:text-black group-hover:shadow-[0_0_15px_#F97316] transition-all">
                                 {contact.nome?.slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                 <div className="font-black text-white text-[15px] tracking-tight uppercase italic">{contact.nome}</div>
                                 <div className="text-[10px] text-[#404040] font-mono uppercase tracking-widest mt-0.5">{contact.email || "Sem ID Digital"}</div>
                              </div>
                           </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="text-[14px] font-black text-[#A3A3A3] group-hover:text-white transition-colors uppercase italic">{contact.empresa || "—"}</div>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="px-2 py-0.5 bg-[#0A0A0A] text-[#6B7280] text-[9px] font-black rounded border border-white/5 uppercase tracking-widest">Cluster: Default</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                           <button className="h-10 px-6 bg-[#0A0A0A] border border-white/10 text-[#6B7280] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#F97316] hover:text-[#F97316] hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all">
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

      <NewContactDialog 
        open={isNewContactOpen}
        onOpenChange={setIsNewContactOpen}
      />
    </div>
  )
}
