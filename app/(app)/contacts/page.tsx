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
  ShieldAlert
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate, cn } from "@/lib/utils"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function ContactMetric({
  title,
  value,
  icon: Icon,
  color = "gold"
}: {
  title: string
  value: number
  icon: React.ElementType
  color?: string
}) {
  return (
    <div className="aether-card metric-card animate-aether" style={{ padding: '24px' }}>
      <div className="metric-top">
        <div className="metric-label-group">
          <span className="metric-label">{title}</span>
          <span className="metric-value" style={{ fontSize: '1.75rem' }}>{value.toString().padStart(2, '0')}</span>
        </div>
        <div className="metric-icon-wrap" style={{ width: '44px', height: '44px', color: color === 'gold' ? '#c9a227' : color }}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
      <div className="metric-footer" style={{ borderTop: '1px solid rgba(255,255,255,1.5%)', paddingTop: '12px', marginTop: '0' }}>
         <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.15em]">Registros em Nuvem</p>
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
      <header className="page-header flex-row items-end justify-between">
        <div className="space-y-4">
          <div className="header-badge">
            <span className="dot" />
            Gestão de Relacionamento
          </div>
          <div>
            <h1 className="page-title">
              Base de <span>Contatos</span> 👥
            </h1>
            <div className="page-subtitle">
              Sincronização em Nuvem <span className="sep" /> 
              Total de Entidades: <span className="status font-black">{validatedContacts.length}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <button className="aether-btn-secondary h-14 px-8 border-white/5 opacity-40 hover:opacity-100 flex items-center gap-4">
              <span className="font-black uppercase tracking-widest text-[10px]">Prospectar Leads</span>
           </button>
           <button className="aether-btn-primary">
             <Plus size={20} strokeWidth={3} />
             Inserir Registro
           </button>
        </div>
      </header>

      {/* Contact Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ContactMetric title="Base Total" value={validatedContacts.length} icon={Users} />
        <ContactMetric title="Leads Ativos" value={validatedContacts.filter(c => c.status === 'LEAD').length} icon={TrendingUp} />
        <ContactMetric title="Clientes" value={validatedContacts.filter(c => c.status === 'CLIENTE').length} icon={Briefcase} />
        <ContactMetric title="Inativos" value={validatedContacts.filter(c => c.status === 'INATIVO').length} icon={ShieldAlert} color="#6b7280" />
      </div>

      {/* Table Section */}
      <div className="aether-table-wrap animate-aether">
        <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex gap-4 p-1 bg-black/40 rounded-2xl border border-white/5">
              {["TODOS", "LEADS", "CLIENTES", "INATIVOS"].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)}
                  className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                  f === filter ? "bg-gold text-black shadow-lg shadow-gold/20" : "text-white/30 hover:text-white/60 hover:bg-white/5")}
                >
                  {f}
                </button>
              ))}
           </div>
           
           <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input placeholder="Filtrar base..." className="aether-input pl-12 h-12 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button className="aether-btn-secondary h-12 w-12 p-0 flex items-center justify-center opacity-40 hover:opacity-100 border-white/5">
                 <Download size={18} />
              </button>
           </div>
        </div>

        <table className="aether-table w-full">
          <thead>
            <tr className="aether-table-header">
              <th>Entidade</th>
              <th className="hidden md:table-cell">Corporativo</th>
              <th className="hidden lg:table-cell">Origem</th>
              <th>Status</th>
              <th className="hidden sm:table-cell">Protocolos</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               [...Array(5)].map((_, i) => <tr key={i} className="h-20 animate-pulse bg-white/5"><td colSpan={6} /></tr>)
            ) : filtered.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-24 text-white/10 font-black uppercase tracking-widest text-xs">Nenhum registro localizado no cluster</td></tr>
            ) : filtered.map((contact) => (
              <tr key={contact.id} className="group">
                <td>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-[13px] font-black text-gold group-hover:scale-110 transition-transform">
                      {contact.nome[0]}{contact.sobrenome?.[0] || ""}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-[14px] uppercase tracking-tight group-hover:text-gold transition-colors">{contact.nome} {contact.sobrenome}</span>
                      <span className="text-[10px] uppercase font-black text-white/20 tracking-tight">{contact.email || "Sem Email"}</span>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell">
                   <div className="flex flex-col">
                    <span className="text-[11px] font-mono font-bold text-white/40">{contact.telefone || "—"}</span>
                   </div>
                </td>
                <td className="hidden lg:table-cell">
                   <Badge variant="secondary" className="bg-white/5 text-[9px] uppercase font-black px-3 border-white/5">{contact.origem || "DIRETO"}</Badge>
                </td>
                <td>
                   <Badge variant={contact.status === 'LEAD' ? "novo" : contact.status === 'CLIENTE' ? "ativa" : "inativa"} className="text-[9px] uppercase font-black py-0.5 px-3">
                     {contact.status}
                   </Badge>
                </td>
                <td className="hidden sm:table-cell">
                   <span className="text-[11px] font-black font-mono text-white/20 tracking-widest">{contact._count?.deals?.toString().padStart(2, '0') || "00"}</span>
                </td>
                <td className="text-right">
                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-gold hover:border-gold/30 transition-all"><ArrowUpRight size={16} /></button>
                      <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-all"><MoreHorizontal size={16} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px] font-black text-white/10 uppercase tracking-widest">
           <span>Paginação: {filtered.length} de {validatedContacts.length}</span>
           <div className="flex gap-2">
              <button className="h-8 px-4 rounded-lg bg-white/5 border border-white/5 hover:text-white transition-colors">Anterior</button>
              <button className="h-8 px-4 rounded-lg bg-white/5 border border-white/5 hover:text-white transition-colors">Próximo</button>
           </div>
        </div>
      </div>

    </div>
  )
}
