"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { NewContactDialog } from "@/components/contacts/NewContactDialog"
import { ContactDetailSheet } from "@/components/contacts/ContactDetailSheet"

function KPICard({
  label, value, icon, emoji, color = "#F97316"
}: {
  label: string; value: string | number; icon?: string; emoji?: string; color?: string
}) {
  return (
    <div className="relative group overflow-hidden">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
      <div className="relative bg-[#1A1A1A]/40 backdrop-blur-2xl border border-white/[0.04] rounded-3xl p-8 hover:bg-[#1A1A1A]/60 transition-all shadow-2xl min-h-[160px] flex flex-col justify-between group/card">
        {/* RADIAL GLOW */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 group-hover/card:opacity-40 transition-opacity rounded-full" 
          style={{ backgroundColor: color }}
        />

        <div className="flex items-start justify-between">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-xl"
            style={{ 
              backgroundColor: `${color}10`,
              borderColor: `${color}30`,
              boxShadow: `0 0 20px ${color}10`
            }}
          >
            {icon ? (
              <span className="material-symbols-outlined text-[28px]" style={{ color }}>{icon}</span>
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
           <div className="text-4xl font-black text-white tracking-widest font-mono flex items-baseline gap-2">
              {value}
              <span className="text-[10px] text-[#262626] font-black uppercase tracking-tighter">DATA_BITS</span>
           </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const [search, setSearch] = useState("")
  const [isNewContactOpen, setIsNewContactOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { data: contactsData, isLoading } = useQuery<any>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await fetch("/api/contacts")
      if (!res.ok) return []
      return res.json()
    },
  })

  // DEFENSIVE DATA EXTRACTION - FIXING API STRUCTURE DISCREPANCY
  const contacts = Array.isArray(contactsData?.contacts) ? contactsData.contacts : []
  const counts = contactsData?.counts || { all: 0, leads: 0, clientes: 0, inativos: 0 }

  const filteredContacts = contacts.filter((c: any) => 
    c.nome?.toLowerCase().includes(search.toLowerCase()) || 
    c.empresa?.toLowerCase().includes(search.toLowerCase())
  )

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

      <div className="relative z-10 p-12 space-y-12 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 px-1">
        
        {/* HIGH-FIDELITY HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] relative">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-20" />
                  <span className="material-symbols-outlined text-white text-3xl font-black relative z-10">groups</span>
               </div>
               <div>
                  <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                    Diretório <span className="text-[#F97316] drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">Mestre</span>
                  </h1>
                  <p className="text-[#404040] text-xs font-mono font-black uppercase tracking-[0.5em] mt-3 flex items-center gap-3">
                     <span className="w-8 h-[1px] bg-[#262626]" />
                     Escaneando Cluster: Escoltran Cloud Architecture
                  </p>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="relative group w-[400px]">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#404040] group-focus-within:text-[#F97316] transition-all text-[20px]">search</span>
                <input
                  placeholder="LOCALIZAR ENTIDADE NO DATASET GLOBAL..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#1A1A1A]/30 backdrop-blur-3xl border border-white/[0.03] h-14 pl-14 pr-6 rounded-2xl text-[11px] font-black text-[#F2F2F2] placeholder:text-[#262626] focus:outline-none focus:border-[#F97316]/30 transition-all tracking-[0.1em]"
                />
             </div>
             <button 
               onClick={() => setIsNewContactOpen(true)}
               className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-black px-12 py-5 rounded-2xl flex items-center gap-4 hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-[#F97316]/30 text-[11px] uppercase tracking-[0.3em] group"
             >
               <span className="material-symbols-outlined text-[22px] font-black group-hover:rotate-12 transition-transform">person_add</span>
               Sincronizar Nova Entidade
             </button>
          </div>
        </header>

        {/* KPI INTELLIGENCE LAYER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <KPICard label="Dataset Size" value={databaseSize} icon="storage" emoji="📡" />
           <KPICard label="Network Load" value={activeNetwork} icon="radar" emoji="🔥" />
           <KPICard label="Shield Nodes" value={clientes} icon="verified" emoji="🛡️" color="#22C55E" />
           <KPICard label="Sync Heartbeat" value="0 ms" icon="monitor_heart" color="#A855F7" />
        </div>

        {/* DATASET TABLE AREA */}
        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-br from-[#F97316]/10 to-transparent rounded-[40px] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" />
           <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/[0.06] rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-[#1A1A1A]/20">
                      <th className="px-12 py-10 text-[11px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] border-b border-white/[0.03]">Entidade / Nó do Cluster</th>
                      <th className="px-12 py-10 text-[11px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] border-b border-white/[0.03]">Status Operacional</th>
                      <th className="px-12 py-10 text-[11px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] border-b border-white/[0.03]">Canal de Entrada</th>
                      <th className="px-12 py-10 text-[11px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] border-b border-white/[0.03]">Audit Status</th>
                      <th className="px-12 py-10 text-right text-[11px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] border-b border-white/[0.03]">Comandos</th>
                    </tr>
                  </thead>
               <tbody>
                  {filteredContacts.length === 0 ? (
                     <tr>
                        <td colSpan={6} className="py-40 text-center text-[#404040]">
                           <div className="flex flex-col items-center gap-6 italic opacity-20">
                              <span className="material-symbols-outlined text-[80px]">dataset</span>
                              <div className="font-black text-[16px] tracking-[0.3em] uppercase">DATASET VAZIO OU SEM RESULTADOS</div>
                           </div>
                        </td>
                     </tr>
                  ) : (
                      filteredContacts.map((contact: any) => (
                        <tr key={contact.id} className="group/row hover:bg-[#F97316]/[0.02] transition-colors border-b border-white/[0.03]">
                          {/* IDENTIDADE */}
                          <td className="px-12 py-10">
                            <div className="flex items-center gap-6">
                              <div className="relative">
                                 <div className="absolute -inset-2 bg-[#F97316]/20 rounded-2xl blur-lg opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                 <div className="w-16 h-16 rounded-2xl bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-white font-black text-2xl group-hover/row:border-[#F97316]/40 group-hover/row:text-[#F97316] transition-all relative z-10 shadow-lg font-mono">
                                   {contact.nome?.slice(0, 1).toUpperCase()}
                                 </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="text-[19px] font-black text-white italic tracking-tighter uppercase group-hover/row:text-[#F97316] transition-colors leading-none">{contact.nome}</div>
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest leading-none">{contact.empresa || "Pessoa Física"}</span>
                                   <span className="w-1 h-1 rounded-full bg-[#262626]" />
                                   <span className="text-[10px] font-mono font-bold text-[#6B7280] lowercase tracking-tight leading-none">{contact.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-12 py-10">
                            <div className={cn(
                              "inline-flex items-center gap-3 px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-xl",
                              contact.status === "cliente" 
                                ? "bg-green-500/10 text-green-500 border-green-500/30" 
                                : "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30"
                            )}>
                              <div className={cn("w-2 h-2 rounded-full animate-pulse", contact.status === "cliente" ? "bg-green-500" : "bg-[#F97316]")} />
                              {contact.status || "Novo Lead"}
                            </div>
                          </td>

                          {/* CANAL */}
                          <td className="px-12 py-10">
                             <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[18px] text-[#404040] group-hover/row:text-[#F97316] transition-colors">hub</span>
                                <div className="text-[12px] font-black text-white uppercase italic tracking-widest">{contact.canalOrigem || "Direto"}</div>
                             </div>
                          </td>

                          {/* ÚLTIMA ATIVIDADE */}
                          <td className="px-10 py-8">
                             <div className="text-[11px] font-black text-[#404040] italic uppercase tracking-tighter">
                                {contact.updatedAt ? `Sincronizado via Node em ${new Date(contact.updatedAt).toLocaleDateString()}` : "Dataset Inativo"}
                             </div>
                          </td>

                          {/* AÇÕES */}
                          <td className="px-10 py-8 text-right">
                             <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                     setSelectedContact(contact)
                                     setIsDetailOpen(true)
                                  }}
                                  className="w-11 h-11 flex items-center justify-center border border-white/5 bg-[#1A1A1A] rounded-xl text-[#F2F2F2] hover:text-[#F97316] hover:border-[#F97316]/30 transition-all focus:outline-none shadow-xl"
                                >
                                   <span className="material-symbols-outlined text-[20px]">visibility</span>
                                </button>
                                <button 
                                  onClick={() => {
                                     setSelectedContact(contact)
                                     setIsEditOpen(true)
                                  }}
                                  className="w-11 h-11 flex items-center justify-center border border-white/5 bg-[#1A1A1A] rounded-xl text-[#F2F2F2] hover:text-[#F97316] hover:border-[#F97316]/30 transition-all focus:outline-none shadow-xl"
                                >
                                   <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                             </div>
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
  )
}
