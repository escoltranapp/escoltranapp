"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Phone,
  ArrowUpRight,
  TrendingUp,
  Briefcase,
  ShieldAlert,
  LayoutGrid
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate, cn } from "@/lib/utils"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function MetricHeaderCard({
  title,
  value,
  icon: Icon,
  color = "gold"
}: {
  title: string
  value: string | number
  icon: React.ElementType
  color?: string
}) {
  return (
    <div className="aether-card metric-card-refined animate-aether">
      <div className="icon-wrap">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <span className="label text-white/20">{title}</span>
        <span className="value">{value}</span>
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
    const matchesFilter = filter === "TODOS" || c.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="animate-aether space-y-12 pb-12">
      
      {/* Prime Header */}
      <header className="page-header flex-col lg:flex-row items-start justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/5 w-fit">
             <LayoutGrid size={10} className="text-gold" />
             <span className="text-[9px] font-black uppercase tracking-widest text-gold/60">Base de Dados</span>
          </div>
          <div>
            <h1 className="page-title">Relacionamento <span>CRM</span></h1>
            <div className="page-subtitle text-white/20 mt-2 font-bold uppercase tracking-widest text-[10px]">
              Sincronização Cloud <span className="mx-2 opacity-10">•</span> 
              Registros Ativos: <span className="text-gold font-black">{validatedContacts.length}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <button className="aether-btn-secondary h-12 px-6 border-white/5 opacity-40 hover:opacity-100 flex items-center gap-3">
              <Download size={14} /> EXPORTAR CSV
           </button>
           <button className="aether-btn-primary h-12 px-8">
             <Plus size={20} strokeWidth={3} /> Inserir Contato
           </button>
        </div>
      </header>

      {/* KPI Cluster */}
      <div className="metric-row">
        <MetricHeaderCard title="Base Total" value={validatedContacts.length} icon={Users} />
        <MetricHeaderCard title="Leads Ativos" value={validatedContacts.filter(c => c.status === 'LEAD').length} icon={TrendingUp} />
        <MetricHeaderCard title="Conversões" value={validatedContacts.filter(c => c.status === 'CLIENTE').length} icon={Briefcase} />
        <MetricHeaderCard title="Inativos" value={validatedContacts.filter(c => c.status === 'INATIVO').length} icon={ShieldAlert} />
      </div>

      {/* Table Section */}
      <div className="aether-table-wrap animate-aether bg-white/[0.01]">
        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex gap-2 p-1 bg-black rounded-2xl border border-white/5">
              {["TODOS", "LEAD", "CLIENTE", "INATIVO"].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)}
                  className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                  f === filter ? "bg-gold text-black shadow-lg" : "text-white/20 hover:text-white/40 hover:bg-white/5")}
                >
                  {f === "TODOS" ? "Geral" : f}
                </button>
              ))}
           </div>
           
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10" />
              <Input placeholder="Localizar no cluster..." className="aether-input pl-12 h-14 bg-black border-white/5 text-[13px] uppercase tracking-wide font-bold" value={search} onChange={(e) => setSearch(e.target.value)} />
           </div>
        </div>

        <table className="aether-table w-full">
          <thead>
            <tr className="aether-table-header">
              <th className="pl-10">Identidade</th>
              <th className="hidden md:table-cell">Protocolo</th>
              <th className="hidden lg:table-cell">Origem</th>
              <th>Status Operacional</th>
              <th className="hidden sm:table-cell">Volume</th>
              <th className="text-right pr-10">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               [...Array(5)].map((_, i) => <tr key={i} className="h-20 animate-pulse bg-white/5"><td colSpan={6} /></tr>)
            ) : filtered.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-32 text-white/10 font-black uppercase tracking-widest text-[11px]">Nenhum registro localizado</td></tr>
            ) : filtered.map((contact) => (
              <tr key={contact.id} className="group border-b border-white/[0.01] hover:bg-white/[0.01] transition-colors">
                <td className="pl-10 py-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-[13px] font-black text-gold group-hover:scale-110 transition-transform shadow-inner">
                      {contact.nome[0]}{contact.sobrenome?.[0] || ""}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-[14px] uppercase tracking-tight text-white/90 group-hover:text-gold transition-colors">{contact.nome} {contact.sobrenome}</span>
                      <span className="text-[10px] uppercase font-bold text-white/15 tracking-tight">{contact.email || "Sem Email"}</span>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell">
                   <div className="flex flex-col">
                    <span className="text-[11px] font-mono font-black text-white/30">{contact.telefone || "—"}</span>
                   </div>
                </td>
                <td className="hidden lg:table-cell">
                   <Badge variant="secondary" className="bg-white/5 text-[9px] uppercase font-black px-4 py-1 border-white/5">{contact.origem || "DIRETO"}</Badge>
                </td>
                <td>
                   <Badge variant={contact.status === 'LEAD' ? "novo" : contact.status === 'CLIENTE' ? "ativa" : "inativa"} className="text-[9px] uppercase font-black py-1 px-4 tracking-widest">
                     {contact.status}
                   </Badge>
                </td>
                <td className="hidden sm:table-cell">
                   <span className="text-[11px] font-black font-mono text-white/10 tracking-widest">{contact._count?.deals?.toString().padStart(2, '0') || "00"}</span>
                </td>
                <td className="text-right pr-10">
                   <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-gold hover:border-gold/40 transition-all"><ArrowUpRight size={16} /></button>
                      <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-white transition-all"><MoreHorizontal size={16} /></button>
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
