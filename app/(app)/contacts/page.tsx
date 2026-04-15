"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Users, Search, Filter, Plus, Building2, Sparkles, ShieldCheck, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

function KPICard({
  label, value, subtext, icon: Icon, trend, color = "var(--accent-primary)"
}: {
  label: string; value: string | number; subtext: string; icon: React.ElementType; trend?: string; color?: string
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-container" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={20} />
      </div>
      <div className="kpi-label-row">
        <span className="kpi-label">{label}</span>
        {trend && (
           <span className={cn("kpi-trend", trend.includes('+') ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
              {trend}
           </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-subtext">{subtext}</div>
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
    <div className="page-container animate-aether">

      {/* HEADER */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <Users size={12} /> GESTÃO DE RELACIONAMENTO
          </div>
          <h1 className="page-title-h1">CRM Contatos</h1>
          <p className="page-subtitle">Diretório mestre de entidades e tomadores de decisão</p>
        </div>
        <button className="btn-cta-primary flex items-center gap-2" onClick={() => setShowNew(true)}>
          <Plus size={18} /> Novo Contato
        </button>
      </header>

      {/* KPI CARDS */}
      <div className="kpi-grid">
         <KPICard label="Total de Registros" value={contacts.length} subtext="Dataset mapeado no cluster" icon={Users} color="#d4af37" />
         <KPICard label="Empresas" value={new Set(contacts.map(c => c.empresa).filter(Boolean)).size} subtext="Inbound e Outbound" icon={Building2} color="#a855f7" />
         <KPICard label="Leads" value={contacts.filter(c => c.status === "lead").length} subtext="Aquisição contínua" icon={Sparkles} color="#f59e0b" />
         <KPICard label="Clientes" value={contacts.filter(c => c.status === "cliente").length} subtext="Conversões efetivadas" icon={ShieldCheck} color="#10b981" />
      </div>

      {/* BARRA DE COMANDOS */}
      <div className="flex bg-[#111318] border border-white/5 p-2 rounded-xl gap-2">
         <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
            <input
              placeholder="Filtrar diretório..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent h-10 pl-9 pr-4 text-[13px] border-none focus:outline-none text-white"
            />
         </div>
         {search && (
           <button
             className="h-10 px-3 flex items-center text-white/30 hover:text-white transition-all"
             onClick={() => setSearch("")}
           >
             <X size={14} />
           </button>
         )}
      </div>

      {/* TABELA ENTERPRISE */}
      <div className="enterprise-table-wrapper">
         <div className="table-header-label">Master Directory ({filtered.length})</div>
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th>Entidade / Cargo</th>
                  <th>Contato Digital</th>
                  <th>Empresa</th>
                  <th className="text-right">Ação</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  [...Array(6)].map((_, i) => <tr key={i} className="h-16 animate-pulse bg-white/5"><td colSpan={4} /></tr>)
               ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-white/20 text-sm">
                      {search ? "Nenhum contato encontrado para a busca." : "Nenhum contato cadastrado ainda."}
                    </td>
                  </tr>
               ) : filtered.map((contact) => (
                  <tr key={contact.id} className="enterprise-table-row">
                     <td>
                        <div className="font-bold text-white/90">{contact.nome}{contact.sobrenome ? ` ${contact.sobrenome}` : ""}</div>
                        <div className="text-[10px] text-white/20 uppercase font-black mt-1">{contact.cargo || "Decision Maker"}</div>
                     </td>
                     <td>
                        <div className="text-[12px] font-bold text-white/60">{contact.email}</div>
                        <div className="text-[10px] text-white/20 uppercase font-bold mt-1">{contact.telefone}</div>
                     </td>
                     <td>
                        <div className="inline-flex px-3 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] font-bold uppercase text-white/40">
                           {contact.empresa || 'Individual'}
                        </div>
                     </td>
                     <td className="text-right">
                        <button
                          onClick={() => setSelected(contact)}
                          className="h-9 px-5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold uppercase text-white/30 hover:text-white hover:bg-white/10 transition-all"
                        >
                          Perfil
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* MODAL NOVO CONTATO */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-white">Novo Contato</h2>
              <button onClick={() => setShowNew(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "nome", label: "Nome *", placeholder: "João" },
                { key: "sobrenome", label: "Sobrenome", placeholder: "Silva" },
                { key: "email", label: "Email", placeholder: "joao@empresa.com" },
                { key: "telefone", label: "Telefone", placeholder: "(11) 99999-9999" },
                { key: "empresa", label: "Empresa", placeholder: "Acme Corp" },
                { key: "cargo", label: "Cargo", placeholder: "Diretor Comercial" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</label>
                  <input
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-[#0a0c10] border border-white/5 rounded-lg h-10 px-3 text-[13px] text-white focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowNew(false)} className="h-10 px-6 bg-white/5 border border-white/5 rounded-lg text-[11px] font-bold uppercase text-white/40 hover:text-white transition-all">
                Cancelar
              </button>
              <button
                onClick={() => createContact.mutate()}
                disabled={createContact.isPending || !form.nome.trim()}
                className="h-10 px-6 btn-cta-primary text-[11px] font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {createContact.isPending ? "Criando..." : "Criar Contato"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERFIL DO CONTATO */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-white">Perfil</h2>
              <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-bold text-lg">
                  {selected.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white text-[16px]">{selected.nome}{selected.sobrenome ? ` ${selected.sobrenome}` : ""}</p>
                  <p className="text-white/30 text-[11px] uppercase font-bold">{selected.cargo || "Sem cargo"}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: "Email", value: selected.email },
                  { label: "Telefone", value: selected.telefone },
                  { label: "Empresa", value: selected.empresa },
                  { label: "Status", value: selected.status },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">{label}</span>
                    <span className="text-[12px] text-white/60">{value}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
