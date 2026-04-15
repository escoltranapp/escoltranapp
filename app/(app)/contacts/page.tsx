"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  Plus, 
  Search, 
  Download, 
  FileSpreadsheet,
  Globe,
  Users, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  Eye, 
  Pencil, 
  Trash2,
  List,
  LayoutGrid,
  ChevronRight,
  MoreVertical,
  User as UserIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function CRMMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "blue"
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  iconColor?: string
}) {
  return (
    <div className="crm-metric-card animate-aether">
      <div className="crm-metric-icon-box" style={{ color: iconColor }}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-white/30">{title}</h4>
        <div className="text-[28px] font-black tracking-tight text-white">{value}</div>
        <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  )
}

interface Contact {
  id: string; nome: string; sobrenome?: string; email?: string; telefone?: string; status: string; origem?: string;
  _count?: { deals: number };
}

export default function ContactsPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("TODOS")

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await fetch("/api/contacts")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 30_000,
  })

  const validatedContacts = Array.isArray(contacts) ? contacts : []
  const filtered = validatedContacts.filter(c => {
    const q = search.toLowerCase()
    const matchesSearch = c.nome.toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q)
    return matchesSearch
  })

  // Group counts for pills
  const counts = {
    TODOS: validatedContacts.length,
    LEADS: validatedContacts.filter(c => c.status === 'LEAD').length,
    CLIENTES: validatedContacts.filter(c => c.status === 'CLIENTE').length,
    INATIVOS: validatedContacts.filter(c => c.status === 'INATIVO').length
  }

  return (
    <div className="animate-aether space-y-10 pb-12">
      
      {/* CRM Global Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20">
              <UserIcon size={20} />
           </div>
           <div>
              <h1 className="crm-header-title">CRM</h1>
              <p className="crm-header-subtitle">Relacionamentos e Pipeline</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button className="h-11 px-6 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all">
              <Globe size={14} /> Prospectar
           </button>
           <button className="h-11 px-4 border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-white/30 hover:text-white/60 transition-all rounded-xl flex items-center gap-2">
              <Download size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">CSV</span>
           </button>
           <button className="h-11 px-4 border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-white/30 hover:text-white/60 transition-all rounded-xl flex items-center gap-2">
              <FileSpreadsheet size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Excel</span>
           </button>
           <button className="btn-glow-blue ml-2">
              <Plus size={18} strokeWidth={3} /> Novo
           </button>
        </div>
      </header>

      {/* Unified Control Bar */}
      <div className="space-y-6">
         <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-blue-500 transition-colors" />
            <input 
              placeholder="Buscar por nome, empresa, email..." 
              className="crm-search-input focus:outline-none focus:border-blue-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         <div className="h-[68px] bg-white/[0.02] border border-white/5 rounded-2xl px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
               {(["TODOS", "LEADS", "CLIENTES", "INATIVOS"] as const).map(p => (
                 <button 
                  key={p} 
                  onClick={() => setFilter(p)}
                  className={cn("filter-pill", filter === p ? "active" : "text-white/20 hover:text-white/40")}
                 >
                   {p} <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-md", filter === p ? "bg-white/20" : "bg-white/5")}>{counts[p]}</span>
                 </button>
               ))}
            </div>
            
            <div className="flex items-center gap-2 border-l border-white/5 pl-6 h-8">
               <button className="p-2 text-blue-500 bg-blue-500/10 rounded-lg"><List size={14} /></button>
               <button className="p-2 text-white/10 hover:text-white/30 transition-all rounded-lg"><LayoutGrid size={14} /></button>
            </div>
         </div>
      </div>

      {/* Reference Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CRMMetricCard title="Total de Contatos" value={counts.TODOS} subtitle={`${validatedContacts.filter(c => c.status === 'CLIENTE').length} Clientes Ativos`} icon={UserIcon} iconColor="#3b82f6" />
        <CRMMetricCard title="Novos este mês" value={counts.LEADS} subtitle="Contatos Adicionados" icon={TrendingUp} iconColor="#60a5fa" />
        <CRMMetricCard title="Taxa de Conversão" value="1%" subtitle="Lead → Cliente" icon={Users} iconColor="#a855f7" />
        <CRMMetricCard title="Próximas Atividades" value="23" subtitle="Follow-ups Pendentes" icon={Clock} iconColor="#f59e0b" />
      </div>

      {/* Reference Table UI */}
      <div className="aether-card bg-transparent border-none overflow-visible">
        <table className="w-full">
          <thead>
            <tr className="crm-table-header">
              <th className="text-left">Contato</th>
              <th className="text-left">Email / Telefone</th>
              <th className="text-center">Status</th>
              <th className="text-center">Canal</th>
              <th className="text-center">Última Atividade</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {isLoading ? (
               [...Array(5)].map((_, i) => <tr key={i} className="h-24 animate-pulse bg-white/5"><td colSpan={6} /></tr>)
            ) : filtered.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-32 text-white/5 font-black uppercase tracking-widest text-[11px]">Nenhum registro localizado no cluster</td></tr>
            ) : filtered.map((contact) => (
              <tr key={contact.id} className="crm-table-row group transition-all">
                <td>
                  <div className="flex items-center gap-6">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black border border-white/10 shadow-lg", 
                      contact.status === 'CLIENTE' ? "bg-blue-600/20 text-blue-400" : "bg-red-600/20 text-red-500")}>
                      {contact.nome[0]}{contact.sobrenome?.[0] || contact.nome[1]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[15px] text-white/90 group-hover:text-blue-400 transition-colors uppercase">{contact.nome} {contact.sobrenome}</span>
                      <span className="text-[10px] uppercase font-bold text-white/20 tracking-tight">{contact.origem || "Empresa Não Informada"}</span>
                    </div>
                  </div>
                </td>
                <td>
                   <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-bold text-white/70">{contact.email || "exemplo@corp.com"}</span>
                      <span className="text-[10px] text-white/20 font-mono">{(contact.telefone || "(00) 00000-0000")}</span>
                   </div>
                </td>
                <td className="text-center">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-white/40 uppercase tracking-widest">
                      <span className={cn("w-1 h-1 rounded-full", contact.status === 'CLIENTE' ? "bg-green-500" : "bg-blue-500")} /> {contact.status}
                   </div>
                </td>
                <td className="text-center">
                   <div className="flex items-center justify-center gap-2 text-white/20 hover:text-white/40 transition-colors cursor-pointer">
                      <Globe size={12} /> <span className="text-[10px] font-black uppercase tracking-widest">{contact.origem === 'CNPJ' ? 'CNPJ' : 'Google'}</span>
                   </div>
                </td>
                <td className="text-center">
                   <span className="text-[11px] font-bold text-white/20 italic">há 1 dia</span>
                </td>
                <td className="text-right">
                   <div className="flex justify-end gap-2 pr-4">
                      <button className="p-2.5 text-white/10 hover:text-white/40 hover:bg-white/5 rounded-xl transition-all"><Eye size={16} /></button>
                      <button className="p-2.5 text-white/10 hover:text-blue-500 hover:bg-blue-500/5 rounded-xl transition-all"><Pencil size={16} /></button>
                      <button className="p-2.5 text-white/10 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"><Trash2 size={16} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
