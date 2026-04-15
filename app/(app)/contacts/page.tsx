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
  User as UserIcon,
  Filter,
  Sparkles
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
  iconColor = "#2563eb"
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  iconColor?: string
}) {
  return (
    <div className="crm-metric-card animate-aether group">
      <div className="crm-metric-icon-box" style={{ color: iconColor }}>
        <Icon size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.12em] text-white/30">{title}</h4>
        <div className="text-[32px] font-black tracking-tighter text-white">{value}</div>
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

  const counts = {
    TODOS: validatedContacts.length,
    LEADS: validatedContacts.filter(c => c.status === 'LEAD').length,
    CLIENTES: validatedContacts.filter(c => c.status === 'CLIENTE').length,
    INATIVOS: validatedContacts.filter(c => c.status === 'INATIVO').length
  }

  return (
    <div className="animate-aether space-y-12">
      
      {/* Prime Level Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-blue-500 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]">
              <UserIcon size={24} strokeWidth={2.5} />
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1.5">
                 <Sparkles size={10} className="text-blue-500" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/60">Intelligence Hub</span>
              </div>
              <h1 className="crm-header-title">Relationship Manager</h1>
              <p className="crm-header-subtitle">Central de Gestão de Contatos e Accounts</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button className="h-12 px-6 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-white/60 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
              <Globe size={14} className="text-blue-500" /> Prospectar
           </button>
           <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/5">
              <button className="h-10 px-4 text-white/20 hover:text-white transition-all rounded-xl flex items-center gap-2"><Download size={14} /></button>
              <button className="h-10 px-4 text-white/20 hover:text-white transition-all rounded-xl flex items-center gap-2"><FileSpreadsheet size={14} /></button>
           </div>
           <button className="btn-glow-blue">
              <Plus size={20} strokeWidth={3} /> Criar Novo
           </button>
        </div>
      </header>

      {/* Control Layer (Unified) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
         <div className="lg:col-span-8 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/10 ml-1">Filtros de Cluster</h4>
            <div className="h-[72px] bg-black/40 backdrop-blur-md border border-white/5 rounded-[22px] px-6 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-2">
                 {(["TODOS", "LEADS", "CLIENTES", "INATIVOS"] as const).map(p => (
                   <button 
                    key={p} 
                    onClick={() => setFilter(p)}
                    className={cn("filter-pill h-11 px-6 text-[11px]", filter === p ? "active" : "text-white/20 hover:bg-white/5")}
                   >
                     {p} <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg", filter === p ? "bg-white/20" : "bg-white/5")}>{counts[p]}</span>
                   </button>
                 ))}
              </div>
              <div className="flex items-center gap-4 border-l border-white/5 pl-6">
                 <button className="p-3 text-white/10 hover:text-white transition-all"><Filter size={16} /></button>
                 <div className="flex bg-white/5 p-1 rounded-xl">
                    <button className="p-2.5 text-blue-500 bg-white/10 rounded-lg"><List size={14} /></button>
                    <button className="p-2.5 text-white/10 hover:text-white transition-all"><LayoutGrid size={14} /></button>
                 </div>
              </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/10 ml-1">Busca Rápida</h4>
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-blue-500 transition-colors" />
              <input 
                placeholder="Nome, e-mail ou empresa..." 
                className="crm-search-input h-[72px] rounded-[22px] focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_40px_rgba(37,99,235,0.1)] transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
         </div>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <CRMMetricCard title="Base Operacional" value={counts.TODOS} subtitle={`${counts.CLIENTES} Clientes Retidos`} icon={UserIcon} iconColor="#3b82f6" />
        <CRMMetricCard title="Aquisição Mensal" value={counts.LEADS} subtitle="Taxa de entrada: +18%" icon={TrendingUp} iconColor="#60a5fa" />
        <CRMMetricCard title="Conversion Index" value="1.2%" subtitle="Lead → Deal Close" icon={Sparkles} iconColor="#a855f7" />
        <CRMMetricCard title="SLA de Resposta" value="08m" subtitle="Time-to-first-touch" icon={Clock} iconColor="#f59e0b" />
      </div>

      {/* Advanced Table System */}
      <div className="bg-white/[0.01] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <table className="w-full">
          <thead>
            <tr className="crm-table-header bg-white/[0.02]">
              <th className="text-left pl-10 text-[10px]">Identificação da Conta</th>
              <th className="text-left text-[10px]">Contatos Diretos</th>
              <th className="text-center text-[10px]">Fluxo</th>
              <th className="text-center text-[10px]">Origem</th>
              <th className="text-center text-[10px]">Sync</th>
              <th className="text-right pr-10 text-[10px]">Operações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {isLoading ? (
               [...Array(6)].map((_, i) => <tr key={i} className="h-28 animate-pulse bg-white/5"><td colSpan={6} /></tr>)
            ) : filtered.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-40 text-white/5 font-black uppercase tracking-widest text-[12px]">Nenhuma entidade sincronizada no cluster</td></tr>
            ) : filtered.map((contact) => (
              <tr key={contact.id} className="crm-table-row group transition-all hover:bg-blue-500/[0.02]">
                <td className="pl-10">
                  <div className="flex items-center gap-8">
                    <div className={cn("w-12 h-12 rounded-[18px] flex items-center justify-center text-[12px] font-black border border-white/10 relative overflow-hidden", 
                      contact.status === 'CLIENTE' ? "bg-blue-600/10 text-blue-400" : "bg-red-600/10 text-red-500")}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                      {contact.nome[0]}{contact.sobrenome?.[0] || contact.nome[1]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-[15px] text-white/90 group-hover:text-blue-500 transition-colors uppercase tracking-tight">{contact.nome} {contact.sobrenome}</span>
                      <span className="text-[10px] uppercase font-black text-white/20 tracking-widest mt-0.5">{contact.origem || "Empresa Global"}</span>
                    </div>
                  </div>
                </td>
                <td>
                   <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-bold text-white/60 tracking-tight">{contact.email || "—"}</span>
                      <span className="text-[10px] text-white/20 font-mono tracking-widest">{(contact.telefone || "(—) —")}</span>
                   </div>
                </td>
                <td className="text-center">
                   <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-white/40 uppercase tracking-[0.15em]">
                      <span className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px]", contact.status === 'CLIENTE' ? "bg-green-500 shadow-green-500/50" : "bg-blue-500 shadow-blue-500/50")} /> 
                      {contact.status}
                   </div>
                </td>
                <td className="text-center">
                   <div className="flex items-center justify-center gap-2 text-white/15 hover:text-blue-400 transition-colors">
                      <Globe size={13} /> <span className="text-[10px] font-black uppercase tracking-widest">{contact.origem || 'System'}</span>
                   </div>
                </td>
                <td className="text-center">
                   <div className="flex flex-col items-center">
                      <span className="text-[11px] font-black text-white/10 italic">há 1 dia</span>
                      <div className="w-12 h-0.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                         <div className="w-2/3 h-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                      </div>
                   </div>
                </td>
                <td className="text-right pr-10">
                   <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Eye size={18} /></button>
                      <button className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-blue-500 hover:bg-blue-500/5 rounded-xl transition-all"><Pencil size={18} /></button>
                      <button className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"><Trash2 size={18} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
            <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Exibindo {filtered.length} registros sincronizados</span>
            <div className="flex gap-2">
               <button className="h-9 px-4 border border-white/5 rounded-lg text-[10px] font-black uppercase text-white/20 hover:text-white transition-all">Anterior</button>
               <button className="h-9 px-4 bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Próximo</button>
            </div>
        </div>
      </div>
    </div>
  )
}
