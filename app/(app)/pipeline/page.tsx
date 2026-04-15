"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  DollarSign, 
  Calendar, 
  User, 
  TrendingUp,
  LayoutGrid,
  BarChart3,
  AlertCircle,
  MoreHorizontal,
  PlusCircle,
  X,
  Kanban,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { formatCurrency, cn } from "@/lib/utils"

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
  subtitle?: string
  icon: React.ElementType
  iconColor?: string
}) {
  return (
    <div className="crm-metric-card animate-aether group">
      <div className="crm-metric-icon-box" style={{ color: iconColor }}>
        <Icon size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-500" />
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">{title}</h4>
        <div className="text-[32px] font-black tracking-tighter text-white">{value}</div>
        {subtitle && <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">{subtitle}</p>}
      </div>
    </div>
  )
}

interface Deal {
  id: string; titulo: string; valor: number; stage: string; prioridade: string; status: string;
  createdAt: string;
  contact?: { nome: string };
}

const STAGES = [
  { id: "PROSPECT", label: "NOVO LEAD", color: "#3b82f6" },
  { id: "QUALIFICATION", label: "QUALIFICAÇÃO", color: "#a855f7" },
  { id: "MEETING", label: "REUNIÃO MARCADA", color: "#f59e0b" },
  { id: "PROPOSAL", label: "PROPOSTA", color: "#10b981" },
  { id: "NEGOTIATION", label: "NEGOCIAÇÃO", color: "#ef4444" },
  { id: "FOLLOW_UP", label: "FOLLOW UP", color: "#ec4899" }
]

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [showAddBoard, setShowAddBoard] = useState(false)

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["deals"],
    queryFn: async () => {
      const res = await fetch("/api/deals")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 15_000,
  })

  const validatedDeals = Array.isArray(deals) ? deals : []
  const totalValue = validatedDeals.reduce((acc, d) => acc + (Number(d.valor) || 0), 0)

  return (
    <div className="animate-aether space-y-12">
      
      {/* Prime Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-blue-500 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]">
              <Kanban size={24} strokeWidth={2.5} />
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1.5">
                 <Sparkles size={10} className="text-blue-500" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/60">Sales Engine v4.0</span>
              </div>
              <h1 className="crm-header-title">Opportunity Pipeline</h1>
              <p className="crm-header-subtitle">Gestão de Fluxo Comercial e Conversão</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="h-12 px-6 bg-white/[0.03] border border-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all cursor-pointer hover:bg-white/[0.06] hover:text-white">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]" /> Fluxo Principal
           </div>
           <button className="h-12 px-4 border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-white/30 hover:text-white/60 transition-all rounded-2xl flex items-center gap-2" onClick={() => setShowAddBoard(true)}>
             <Plus size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Board</span>
           </button>
           <button className="btn-glow-blue" onClick={() => setShowAddColumn(true)}>
              <Plus size={20} strokeWidth={3} /> Nova Coluna
           </button>
        </div>
      </header>

      {/* Kanban Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <CRMMetricCard title="Total Inventory" value={validatedDeals.length} subtitle="Cards Ativos no Fluxo" icon={LayoutGrid} iconColor="#3b82f6" />
        <CRMMetricCard title="Pipeline Value" value={formatCurrency(totalValue)} subtitle="Receita em Prospecção" icon={DollarSign} iconColor="#10b981" />
        <CRMMetricCard title="Stalled Leads" value="01" subtitle="Cards sem interação" icon={AlertCircle} iconColor="#ef4444" />
      </div>

      {/* Unified Search for Kanban */}
      <div className="relative group max-w-md">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-blue-500 transition-colors" />
         <input 
            placeholder="Filtrar oportunidades por nome..." 
            className="crm-search-input h-14 rounded-2xl bg-white/[0.02] border border-white/5 focus:outline-none focus:border-blue-500/50 transition-all"
         />
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-8 overflow-x-auto pb-10 min-h-[700px] -mx-8 px-8 scrollbar-hide">
        {STAGES.map((stage) => {
          const stageDeals = validatedDeals.filter(d => (d.stage || 'PROSPECT') === stage.id)
          const stageTotal = stageDeals.reduce((acc, d) => acc + (Number(d.valor) || 0), 0)

          return (
            <div key={stage.id} className="min-w-[340px] flex flex-col gap-6">
              <div className="h-[72px] bg-white/[0.015] border border-white/5 rounded-[22px] px-6 flex items-center justify-between shadow-lg relative overflow-hidden group/header">
                <div className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover/header:w-1.5" style={{ background: stage.color }} />
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: stage.color, boxShadow: `0_0_15px_${stage.color}80` }} />
                  <span className="text-[12px] font-black uppercase tracking-widest text-white/90">{stage.label}</span>
                </div>
                <div className="bg-white/5 px-3 py-1 rounded-lg text-[10px] font-black text-white/20">{stageDeals.length}</div>
              </div>
              
              <div className="flex items-center justify-between px-2">
                 <div className="text-[11px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                    {formatCurrency(stageTotal)}
                 </div>
                 <ArrowRight size={12} className="text-white/5" />
              </div>

              {/* Cards List */}
              <div className="space-y-5">
                {isLoading ? (
                  [...Array(2)].map((_, i) => <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse" />)
                ) : (
                  stageDeals.map((deal) => (
                    <div key={deal.id} className="kanban-card group p-6">
                       <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] font-black tracking-widest px-2 py-0.5">NEW DEAL</Badge>
                          <button className="text-white/10 hover:text-white transition-all"><MoreHorizontal size={16} /></button>
                       </div>
                       
                       <h4 className="text-[15px] font-black uppercase tracking-tight text-white/90 group-hover:text-blue-500 transition-colors leading-tight mb-2">{deal.titulo}</h4>
                       
                       <div className="flex items-center gap-3">
                          <div className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border", 
                            deal.prioridade === 'ALTA' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20")}>
                             {deal.prioridade || 'Média'}
                          </div>
                          <span className="text-[9px] font-bold text-white/10 uppercase">SLA: 24h</span>
                       </div>

                       <div className="text-[18px] font-black text-white mt-6 mb-8 flex items-baseline gap-1">
                          <span className="text-[10px] text-white/20">VALOR:</span> {formatCurrency(deal.valor)}
                       </div>

                       <div className="flex items-center justify-between pt-6 border-t border-white/[0.04]">
                          <div className="flex items-center gap-2.5">
                             <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-[11px] font-black border border-white/5 shadow-lg">{deal.contact?.nome?.[0] || 'S'}</div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white/70 uppercase truncate max-w-[100px]">{deal.contact?.nome || 'Lead s/ Nome'}</span>
                                <span className="text-[8px] font-bold text-white/10">OWNER: ME</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/15 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 hover:text-white transition-all cursor-pointer">
                             <Calendar size={11} />
                             <span className="text-[9px] font-black uppercase">21 abr</span>
                          </div>
                       </div>
                    </div>
                  ))
                )}
                
                <button className="w-full py-6 border-2 border-dashed border-white/5 hover:border-blue-500/20 rounded-3xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-white/10 hover:text-blue-500 hover:bg-blue-500/5 transition-all">
                  <PlusCircle size={16} /> Adicionar Oportunidade
                </button>
              </div>
            </div>
          )
        })}

        {/* New Column Add */}
        <div className="min-w-[340px] h-[600px] flex flex-col border-2 border-dashed border-white/5 rounded-[40px] items-center justify-center gap-6 group hover:border-blue-500/20 transition-all cursor-pointer" onClick={() => setShowAddColumn(true)}>
           <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/5 group-hover:text-blue-500 group-hover:bg-blue-500/5 group-hover:scale-110 transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.02)]">
              <Plus size={32} strokeWidth={3} />
           </div>
           <div className="text-center">
              <span className="text-[13px] font-black uppercase tracking-widest text-white/5 group-hover:text-white/40 block mb-1">Nova Coluna</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/5 group-hover:text-blue-500/30">Expand Pipeline</span>
           </div>
        </div>
      </div>
    </div>
  )
}
