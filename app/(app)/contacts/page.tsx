"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { NewContactDialog } from "@/components/contacts/NewContactDialog"
import { ContactDetailSheet } from "@/components/contacts/ContactDetailSheet"
import { ChannelIcon } from "@/components/ui/ChannelIcon"

function KPICard({
  label, value, icon, emoji, color = "#F97316"
}: {
  label: string; value: string | number; icon?: string; emoji?: string; color?: string
}) {
  return (
    <div className="relative group overflow-hidden">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
      <div className="relative bg-[#1A1A1A]/40 backdrop-blur-2xl border border-white/[0.04] rounded-2xl p-6 hover:bg-[#1A1A1A]/60 transition-all shadow-2xl min-h-[130px] flex flex-col justify-between group/card">
        {/* RADIAL GLOW */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 group-hover/card:opacity-40 transition-opacity rounded-full" 
          style={{ backgroundColor: color }}
        />

        <div className="flex items-start justify-between">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-xl"
            style={{ 
              backgroundColor: `${color}10`,
              borderColor: `${color}30`,
              boxShadow: `0 0 20px ${color}10`
            }}
          >
            {icon ? (
              <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
            ) : (
              <span className="text-2xl">{emoji}</span>
            )}
          </div>
          <div className="px-3 py-1 rounded-full text-[9px] font-black font-mono text-[#404040] bg-[#0A0A0A] border border-white/[0.03] uppercase tracking-[0.2em] group-hover/card:text-[#F97316] transition-colors">
             IO: SYNCED
          </div>
        </div>

        <div className="space-y-1 relative z-10">
           <div className="text-[10px] font-mono text-[#404040] uppercase tracking-[0.4em] font-black italic group-hover/card:translate-x-1 transition-transform">{label}</div>
           <div className="text-3xl font-black text-white tracking-widest font-mono flex items-baseline gap-2">
              {value}
              <span className="text-[9px] text-[#262626] font-black uppercase tracking-tighter">DATA_BITS</span>
           </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(15)
  const [isNewContactOpen, setIsNewContactOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { data: contactsData, isLoading, isFetching } = useQuery<any>({
    queryKey: ["contacts", limit, search],
    queryFn: async () => {
      const res = await fetch(`/api/contacts?limit=${limit}&search=${search}`)
      if (!res.ok) return { contacts: [], total: 0 }
      return res.json()
    },
    placeholderData: (previousData: any) => previousData
  })

  // DEFENSIVE DATA EXTRACTION - FIXING API STRUCTURE DISCREPANCY
  const contacts = Array.isArray(contactsData?.contacts) ? contactsData.contacts : []
  const counts = contactsData?.counts || { all: 0, leads: 0, clientes: 0, inativos: 0 }
  const total = contactsData?.total || 0

  const hasMore = contacts.length < total

  const databaseSize = counts.all
  const activeNetwork = counts.leads
  const clientes = counts.clientes

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden transition-all duration-1000">
      {/* IMMERSIVE AETHER BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#F97316]/5 blur-[160px] rounded-full animate-pulse duration-[10s]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F97316]/5 blur-[160px] rounded-full animate-pulse duration-[8s]" />
      </div>

      <div className="relative z-10 p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HIGH-FIDELITY HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] relative">
                  <span className="material-symbols-outlined text-white text-xl font-black relative z-10">groups</span>
               </div>
               <div>
                  <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                    CRM
                  </h1>
               </div>
            </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group w-[350px]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#404040] group-focus-within:text-[#F97316] transition-all text-[18px]">search</span>
                <input
                  placeholder="LOCALIZAR ENTIDADE..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#1A1A1A]/30 backdrop-blur-3xl border border-white/[0.03] h-12 pl-12 pr-6 rounded-xl text-[10px] font-black text-[#F2F2F2] placeholder:text-[#262626] focus:outline-none focus:border-[#F97316]/30 transition-all tracking-[0.1em]"
                />
             </div>
             <button 
               onClick={() => setIsNewContactOpen(true)}
               className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-black px-8 py-4 rounded-xl flex items-center gap-3 hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-[#F97316]/30 text-[10px] uppercase tracking-[0.2em] group"
             >
               <span className="material-symbols-outlined text-[18px] font-black">person_add</span>
               Novo Contato
             </button>
          </div>
        </header>

        {/* KPI INTELLIGENCE LAYER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <KPICard label="Total de Contatos" value={databaseSize} icon="storage" color="#F97316" />
           <KPICard label="Leads em Conversão" value={activeNetwork} icon="radar" color="#F97316" />
           <KPICard label="Clientes Ativos" value={clientes} icon="verified" color="#22C55E" />
        </div>

        {/* CONTACTS TABLE AREA */}
        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-br from-[#F97316]/10 to-transparent rounded-[32px] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" />
           <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/[0.06] rounded-[32px] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-[#1A1A1A]/20">
                      <th className="px-6 py-4 text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] border-b border-white/[0.03]">Entidade</th>
                      <th className="px-6 py-4 text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] border-b border-white/[0.03]">Status</th>
                      <th className="px-6 py-4 text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] border-b border-white/[0.03]">Canal</th>
                      <th className="px-6 py-4 text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] border-b border-white/[0.03]">Audit</th>
                      <th className="px-6 py-4 text-right text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] border-b border-white/[0.03]">Ações</th>
                    </tr>
                  </thead>
               <tbody>
                  {contacts.length === 0 ? (
                     <tr>
                        <td colSpan={6} className="py-24 text-center text-[#404040]">
                           <div className="flex flex-col items-center gap-4 italic opacity-20">
                              <span className="material-symbols-outlined text-[60px]">contacts</span>
                              <div className="font-black text-[12px] tracking-[0.3em] uppercase">NENHUM CONTATO</div>
                           </div>
                        </td>
                     </tr>
                  ) : (
                      contacts.map((contact: any) => (
                        <tr key={contact.id} className="group/row hover:bg-[#F97316]/[0.02] transition-colors border-b border-white/[0.03]">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-white font-black text-base group-hover/row:border-[#F97316]/40 group-hover/row:text-[#F97316] transition-all shadow-lg font-mono">
                                 {contact.nome?.slice(0, 1).toUpperCase()}
                               </div>
                               <div className="space-y-0.5">
                                 <div className="text-[14px] font-black text-white italic tracking-tighter uppercase group-hover/row:text-[#F97316] transition-colors leading-none">{contact.nome}</div>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-mono font-black text-[#404040] uppercase tracking-widest leading-none">{contact.empresa || "Pessoa Física"}</span>
                                 </div>
                               </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className={cn(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-[0.2em]",
                              contact.status === "cliente" 
                                ? "bg-green-500/10 text-green-500 border-green-500/30" 
                                : "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30"
                            )}>
                              {contact.status || "Novo Lead"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase italic tracking-widest">
                                <ChannelIcon channel={contact.canalOrigem || "Direto"} />
                                {contact.canalOrigem || "Direto"}
                             </div>
                          </td>

                          <td className="px-6 py-4">
                             <div className="text-[8px] font-black text-[#404040] italic uppercase tracking-tighter">
                                {contact.updatedAt ? `Atualizado em: ${new Date(contact.updatedAt).toLocaleDateString()}` : "Sem atividade"}
                             </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                     setSelectedContact(contact)
                                     setIsDetailOpen(true)
                                  }}
                                  className="w-9 h-9 flex items-center justify-center border border-white/5 bg-[#1A1A1A] rounded-lg text-[#F2F2F2] hover:text-[#F97316] hover:border-[#F97316]/30 transition-all shadow-xl"
                                >
                                   <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>
                                <button 
                                  onClick={() => {
                                     setSelectedContact(contact)
                                     setIsEditOpen(true)
                                  }}
                                  className="w-9 h-9 flex items-center justify-center border border-white/5 bg-[#1A1A1A] rounded-lg text-[#F2F2F2] hover:text-[#F97316] hover:border-[#F97316]/30 transition-all shadow-xl"
                                >
                                   <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))
                  )}
               </tbody>
            </table>
          </div>

          {/* LOAD MORE SECTION */}
          {hasMore && (
            <div className="p-8 flex justify-center border-t border-white/[0.03] bg-[#0A0A0A]/20">
               <button 
                 onClick={() => setLimit(prev => prev + 15)}
                 disabled={isFetching}
                 className="group relative flex items-center gap-3 px-8 py-3 bg-[#1A1A1A] border border-white/[0.05] rounded-xl text-[10px] font-black text-[#A3A3A3] uppercase tracking-[0.2em] hover:text-[#F97316] hover:border-[#F97316]/30 hover:bg-[#F97316]/5 transition-all shadow-xl disabled:opacity-50"
               >
                  {isFetching ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px] group-hover:rotate-180 transition-transform duration-500">expand_more</span>
                  )}
                  <span>{isFetching ? "CARREGANDO..." : "VER MAIS CONTATOS"}</span>
                  
                  {/* GLOW EFFECT */}
                  <div className="absolute inset-0 bg-[#F97316]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
               </button>
            </div>
          )}
        </div>
      </div>

      <NewContactDialog 
        open={isNewContactOpen}
        onOpenChange={setIsNewContactOpen}
      />

      <NewContactDialog 
        open={isEditOpen}
        onOpenChange={(open) => {
           setIsEditOpen(open)
           if (!open) setSelectedContact(null)
        }}
        contact={selectedContact}
      />

      <ContactDetailSheet 
        contact={selectedContact}
        open={isDetailOpen}
        onOpenChange={(open) => {
           setIsDetailOpen(open)
           if (!open) setSelectedContact(null)
        }}
        onEdit={(contact) => {
           setIsDetailOpen(false)
           setSelectedContact(contact)
           setIsEditOpen(true)
        }}
      />
      </div>
    </div>
  )
}
