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
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono italic">Contato</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono italic">Email / Telefone</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono italic text-center">Status</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono italic">Canal</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono italic">Última Atividade</th>
                     <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono italic">Ações</th>
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
                        <tr key={contact.id} className="hover:bg-[#F97316]/5 transition-all group border-b border-[#262626]/50">
                          {/* CONTATO */}
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-white/[0.05] flex items-center justify-center text-[#F97316] font-black text-xs font-mono group-hover:bg-[#F97316] group-hover:text-black transition-all">
                                  {contact.nome?.slice(0, 1).toUpperCase()}
                               </div>
                               <div>
                                  <div className="font-black text-white text-[14px] tracking-tight uppercase italic">{contact.nome}</div>
                                  <div className="text-[10px] text-[#404040] font-mono uppercase tracking-widest mt-0.5">{contact.empresa || "Pessoa Física"}</div>
                               </div>
                            </div>
                          </td>

                          {/* EMAIL / TELEFONE */}
                          <td className="px-8 py-6">
                             <div className="text-[12px] font-mono font-black text-[#A3A3A3] group-hover:text-[#F2F2F2] transition-colors">{contact.email || "—"}</div>
                             <div className="text-[11px] font-mono font-bold text-[#404040] mt-1">{contact.telefone || "—"}</div>
                          </td>

                          {/* STATUS */}
                          <td className="px-8 py-6 text-center">
                             <span className={cn(
                               "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border",
                               contact.status === "cliente" ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                               contact.status === "lead" ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20" : 
                               "bg-[#262626] text-[#6B7280] border-white/5"
                             )}>
                               {contact.status || "Novo"}
                             </span>
                          </td>

                          {/* CANAL */}
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2 text-[#404040] group-hover:text-[#A3A3A3] transition-colors">
                                <span className="material-symbols-outlined text-[16px]">language</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{contact.canalOrigem || "Direto"}</span>
                             </div>
                          </td>

                          {/* ÚLTIMA ATIVIDADE */}
                          <td className="px-8 py-6">
                             <div className="text-[11px] font-bold text-[#404040] italic">
                                {contact.updatedAt ? `Sincronizado em ${new Date(contact.updatedAt).toLocaleDateString()}` : "Sem atividade"}
                             </div>
                          </td>

                          {/* AÇÕES */}
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => {
                                     setSelectedContact(contact)
                                     setIsDetailOpen(true)
                                  }}
                                  className="w-9 h-9 flex items-center justify-center border border-white/5 rounded-lg text-[#404040] hover:text-[#F97316] hover:bg-[#F97316]/10 transition-all focus:outline-none"
                                >
                                   <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>
                                <button 
                                  onClick={() => {
                                     setSelectedContact(contact)
                                     setIsEditOpen(true)
                                  }}
                                  className="w-9 h-9 flex items-center justify-center border border-white/5 rounded-lg text-[#404040] hover:text-[#F97316] hover:bg-[#F97316]/10 transition-all focus:outline-none"
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
