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
  Clock, 
  Eye, 
  Pencil, 
  Trash2,
  List,
  LayoutGrid,
  User as UserIcon,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Metric Card Enterprise-Grade ──────────────────────────
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
    <div className="crm-metric-card">
      <div className="crm-metric-icon-box" style={{ color: iconColor, backgroundColor: `${iconColor}15` }}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="space-y-0.5">
        <h4 className="label-upper">{title}</h4>
        <div className="value-main">{value}</div>
        <p className="sub-context">{subtitle}</p>
      </div>
    </div>
  )
}

interface Contact {
  id: string; nome: string; sobrenome?: string; email?: string; telefone?: string; status: string; origem?: string;
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
    return c.nome.toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q)
  })

  const counts = {
    TODOS: validatedContacts.length,
    LEADS: validatedContacts.filter(c => c.status === 'LEAD').length,
    CLIENTES: validatedContacts.filter(c => c.status === 'CLIENTE').length,
    INATIVOS: validatedContacts.filter(c => c.status === 'INATIVO').length
  }

  return (
    <div className="animate-aether space-y-7">
      
      {/* Page Header (Regra 8) */}
      <header className="flex items-center justify-between">
        <div>
           <div className="page-header-context flex items-center gap-2">
              <Sparkles size={10} /> RELATIONSHIP MANAGER
           </div>
           <h1 className="page-title-h1">CRM</h1>
           <p className="page-subtitle-desc">Gestão estratégica de contas, leads e relacionamentos comerciais</p>
        </div>

        <button className="btn-cta-primary flex items-center gap-2">
          <Plus size={18} /> Novo Contato
        </button>
      </header>

      {/* KPI Cluster (Regra 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CRMMetricCard title="Total de Contatos" value={counts.TODOS} subtitle={`${counts.CLIENTES} clientes convertidos`} icon={UserIcon} iconColor="#3b82f6" />
        <CRMMetricCard title="Novos este mês" value={counts.LEADS} subtitle="Taxa de aquisição estável" icon={TrendingUp} iconColor="#60a5fa" />
        <CRMMetricCard title="Conversão" value="1.2%" subtitle="Lead → Deal Close" icon={Sparkles} iconColor="#a855f7" />
        <CRMMetricCard title="SLA de Resposta" value="08m" subtitle="Time-to-first-touch" icon={Clock} iconColor="#f59e0b" />
      </div>

      {/* Control Layer */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
         <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-blue-500" />
            <input 
              placeholder="Buscar por nome, empresa ou e-mail..." 
              className="w-full bg-white/5 border border-white/10 h-12 rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         <div className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-white/5 pr-4">
               {["TODOS", "LEADS", "CLIENTES"].map(p => (
                 <button 
                  key={p} 
                  onClick={() => setFilter(p)}
                  className={cn("text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all", 
                    (filter === p) ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40")}
                 >
                   {p}
                 </button>
               ))}
            </div>
            <div className="flex items-center gap-1">
               <button className="p-2 text-blue-500 bg-white/5 rounded-lg"><List size={14} /></button>
               <button className="p-2 text-white/10"><LayoutGrid size={14} /></button>
            </div>
         </div>
      </div>

      {/* Enterprise Table (Regra 6) */}
      <div className="crm-metric-card p-0 overflow-hidden border-none shadow-2xl">
        <table className="w-full">
          <thead>
            <tr className="crm-table-header">
              <th className="text-left pl-7">Contato / Entidade</th>
              <th className="text-left">E-mail e Telefone</th>
              <th className="text-center">Status</th>
              <th className="text-center">Origem</th>
              <th className="text-center">Atividade</th>
              <th className="text-right pr-7">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {isLoading ? (
               [...Array(5)].map((_, i) => <tr key={i} className="h-16 animate-pulse bg-white/5"><td colSpan={6} /></tr>)
            ) : filtered.map((contact) => (
              <tr key={contact.id} className="crm-table-row group">
                <td className="pl-7">
                  <div className="flex items-center gap-4">
                    <div className="crm-avatar bg-blue-600/20 text-blue-400">
                      {contact.nome[0]}{contact.nome[1]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-white group-hover:text-blue-400 transition-colors uppercase truncate max-w-[180px]">{contact.nome}</span>
                      <span className="text-[11px] font-medium text-white/30 uppercase tracking-tight">{contact.origem || "Empresa Global"}</span>
                    </div>
                  </div>
                </td>
                <td>
                   <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-white/60">{contact.email || "—"}</span>
                      <span className="text-[11px] text-white/20 font-mono">{(contact.telefone || "(—) —")}</span>
                   </div>
                </td>
                <td className="text-center">
                   <div className={cn("status-badge", 
                     contact.status === 'CLIENTE' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20")}>
                      <span className={cn("dot", contact.status === 'CLIENTE' ? "bg-green-500" : "bg-blue-500")} /> {contact.status}
                   </div>
                </td>
                <td className="text-center text-white/20"><Globe size={14} className="mx-auto" /></td>
                <td className="text-center">
                   <span className="text-[11px] font-bold text-white/10 italic">há 1 dia</span>
                </td>
                <td className="text-right pr-7">
                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 text-white/20 hover:text-white"><Eye size={16} /></button>
                      <button className="p-2 text-white/20 hover:text-blue-500"><Pencil size={16} /></button>
                      <button className="p-2 text-white/20 hover:text-red-500"><Trash2 size={16} /></button>
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
