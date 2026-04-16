"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

function KPICard({
  label, value, icon, trend, color = "#ffc880"
}: {
  label: string; value: string | number; icon: string; trend?: string; color?: string
}) {
  return (
    <div className="bg-surface-container border border-white/5 rounded-2xl p-6 hover:bg-surface-container-high transition-all group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
        </div>
        {trend && (
           <div className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-amber-500 bg-amber-500/10">
              {trend}
           </div>
        )}
      </div>
      <div className="space-y-1">
         <div className="text-2xl font-bold text-white tracking-tight font-mono">{value}</div>
         <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">{label}</div>
      </div>
    </div>
  )
}

interface Contact {
  id: string; nome: string; sobrenome?: string; email: string; telefone: string; empresa: string; cargo: string; status: string;
}

const emptyForm = { nome: "", sobrenome: "", email: "", telefone: "", empresa: "", cargo: "" }

export default function ContactsPage() {
  const queryClient = useQueryClient()
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Contact | null>(null)

  const { data: contactsData, isLoading } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await fetch("/api/contacts")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 15_000,
  })

  const contacts = Array.isArray(contactsData) ? contactsData : []
  const filtered = search
    ? contacts.filter(c =>
        `${c.nome} ${c.sobrenome || ""} ${c.email} ${c.empresa || ""}`.toLowerCase().includes(search.toLowerCase())
      )
    : contacts

  const createContact = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Nome é obrigatório")
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Falha ao criar contato")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Contato criado com sucesso!" })
      setShowNew(false)
      setForm(emptyForm)
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: err.message })
    },
  })

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* HEADER ESCOLTRAN */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-[32px] font-bold text-white tracking-tight">CRM Contatos</h1>
          <p className="text-slate-500 text-[14px] mt-1">Diretório mestre de entidades e tomadores de decisão</p>
        </div>
        
        <button
          onClick={() => setShowNew(true)}
          className="bg-amber-500 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-amber-500/10 text-[12px] uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[20px] font-bold">person_add</span>
          <span>Novo Contato</span>
        </button>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         <KPICard label="Total Registros" value={contacts.length} icon="groups" trend="Database" color="#adc6ff" />
         <KPICard label="Empresas" value={new Set(contacts.map(c => c.empresa).filter(Boolean)).size} icon="corporate_fare" trend="Active Network" color="#ffc880" />
         <KPICard label="Leads Ativos" value={contacts.filter(c => c.status === "lead").length} icon="bolt" trend="Flow Active" color="#f5a623" />
         <KPICard label="Clientes" value={contacts.filter(c => c.status === "cliente").length} icon="verified_user" trend="Converted" color="#7ae982" />
      </div>

      {/* BARRA DE BUSCA EM SURFACE */}
      <div className="bg-surface-container border border-white/5 p-2 rounded-2xl mb-8 flex items-center gap-4">
         <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
            <input
              placeholder="Filtrar diretório pelo nome, email ou empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface-container-lowest h-11 pl-12 pr-4 rounded-lg text-sm text-white focus:border-amber-500/50 border border-transparent outline-none transition-all"
            />
         </div>
      </div>

      {/* TABELA ESCOLTRAN */}
      <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden">
         <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">Master Directory ({filtered.length})</div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-surface-container-low/50">
                     <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5 font-mono">Entidade / Cargo</th>
                     <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5 font-mono">Contato Digital</th>
                     <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5 font-mono">Empresa</th>
                     <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5 font-mono">Ação Operacional</th>
                  </tr>
               </thead>
               <tbody>
                  {isLoading ? (
                     [...Array(6)].map((_, i) => <tr key={i} className="h-16 animate-pulse border-b border-white/5 opacity-50"><td colSpan={4} className="px-6 bg-surface-container-high/20" /></tr>)
                  ) : filtered.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-600 font-mono text-[11px] uppercase tracking-widest">
                           Dataset Vazio ou Sem Resultados
                        </td>
                     </tr>
                  ) : filtered.map((contact) => (
                     <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 border-b border-white/[0.03]">
                           <div className="font-bold text-white text-[14px]">{contact.nome}{contact.sobrenome ? ` ${contact.sobrenome}` : ""}</div>
                           <div className="text-[10px] text-slate-500 uppercase font-mono mt-1 tracking-widest">{contact.cargo || "Decision Maker"}</div>
                        </td>
                        <td className="px-6 py-4 border-b border-white/[0.03]">
                           <div className="text-[13px] font-mono text-slate-300">{contact.email}</div>
                           <div className="text-[11px] text-slate-500 font-mono mt-1">{contact.telefone}</div>
                        </td>
                        <td className="px-6 py-4 border-b border-white/[0.03]">
                           <div className="inline-flex px-3 py-1 bg-surface-container-high border border-white/5 rounded text-[10px] font-bold uppercase text-amber-500/50">
                              {contact.empresa || 'Individual'}
                           </div>
                        </td>
                        <td className="px-6 py-4 border-b border-white/[0.03] text-right">
                           <button
                             onClick={() => setSelected(contact)}
                             className="h-8 px-4 bg-white/5 border border-white/5 rounded-md text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:bg-amber-500 hover:text-black hover:border-amber-500"
                           >
                             Perfil
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* MODAL NOVO CONTATO */}
      {showNew && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowNew(false)}>
           <div className="bg-surface-container border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold text-white tracking-tight">Criar Nova Entidade</h2>
                 <button onClick={() => setShowNew(false)} className="text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 {[
                   { key: "nome", label: "Prénome *", placeholder: "Ex: Henrique" },
                   { key: "sobrenome", label: "Sobrenome", placeholder: "Ex: Bariani" },
                   { key: "email", label: "Email Corporativo", placeholder: "ex@escoltran.com" },
                   { key: "telefone", label: "Telefone / WhatsApp", placeholder: "(00) 00000-0000" },
                   { key: "empresa", label: "Empresa Relacionada", placeholder: "Escoltran Inc" },
                   { key: "cargo", label: "Cargo Operacional", placeholder: "Diretor" },
                 ].map(({ key, label, placeholder }) => (
                   <div key={key} className="space-y-2">
                     <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500">{label}</label>
                     <input
                       placeholder={placeholder}
                       value={form[key as keyof typeof form]}
                       onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                       className="w-full bg-surface-container-lowest border border-white/5 rounded-lg h-10 px-3 text-[13px] text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                     />
                   </div>
                 ))}
              </div>

              <div className="flex gap-4 mt-10">
                 <button onClick={() => setShowNew(false)} className="flex-1 h-11 bg-slate-800 text-slate-400 font-bold py-3 rounded-lg text-[12px] uppercase tracking-widest">
                    Cancelar
                 </button>
                 <button
                   onClick={() => createContact.mutate()}
                   disabled={createContact.isPending || !form.nome.trim()}
                   className="flex-1 h-11 bg-amber-500 text-black font-bold py-3 rounded-lg text-[12px] uppercase tracking-widest shadow-lg shadow-amber-500/10 disabled:opacity-40"
                 >
                   {createContact.isPending ? "Processando..." : "Salvar Registro"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* PERFIL DRAWER SIMULATION */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
           <div className="h-full w-full max-w-md bg-surface-container border-l border-white/10 p-10 shadow-2xl animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-slate-500">Perfil Analítico</h2>
                 <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>

              <div className="flex items-center gap-6 mb-12">
                 <div className="h-20 w-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-3xl font-mono">
                   {selected.nome.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{selected.nome} {selected.sobrenome}</h3>
                    <p className="text-amber-500/60 text-[11px] uppercase font-mono font-bold tracking-widest">{selected.cargo || "Decision Maker"}</p>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                 {[
                   { label: "Email", value: selected.email, icon: "mail" },
                   { label: "Telefone", value: selected.telefone, icon: "call" },
                   { label: "Empresa", value: selected.empresa, icon: "business" },
                   { label: "Status", value: selected.status, icon: "verified" },
                 ].map(({ label, value, icon }) => (
                   <div key={label} className="bg-surface-container-lowest p-4 rounded-xl border border-white/5">
                     <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{label}</span>
                     </div>
                     <div className="text-[14px] text-white font-mono">{value || "Não informado"}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
