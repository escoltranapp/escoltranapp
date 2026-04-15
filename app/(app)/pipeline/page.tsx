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
  AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { formatCurrency, cn } from "@/lib/utils"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function MetricHeaderCard({
  title,
  value,
  label,
  icon: Icon,
  color = "gold"
}: {
  title: string
  value: string | number
  label: string
  icon: React.ElementType
  color?: string
}) {
  return (
    <div className="aether-card metric-card animate-aether" style={{ padding: '24px' }}>
      <div className="metric-top">
        <div className="metric-label-group">
          <span className="metric-label">{title}</span>
          <span className="metric-value" style={{ fontSize: '1.75rem' }}>{value}</span>
        </div>
        <div className="metric-icon-wrap" style={{ width: '44px', height: '44px', color: color === 'gold' ? '#c9a227' : color }}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
      <div className="metric-footer" style={{ borderTop: '1px solid rgba(255,255,255,1.5%)', paddingTop: '12px', marginTop: '0' }}>
         <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.15em]">{label}</p>
      </div>
    </div>
  )
}

interface Deal {
  id: string; titulo: string; valor: number; stage: string; prioridade: string; status: string;
  contact?: { nome: string };
}

const STAGES = [
  { id: "PROSPECCAO", label: "Prospecção", color: "#6b7280" },
  { id: "QUALIFICACAO", label: "Qualificação", color: "#c9a227" },
  { id: "PROPOSTA", label: "Proposta", color: "#fbbf24" },
  { id: "NEGOCIACAO", label: "Negociação", color: "#8b5cf6" },
  { id: "FECHAMENTO", label: "Fechamento", color: "#22c55e" }
]

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState("")

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
    <div className="animate-aether space-y-12 pb-12">
      
      {/* Prime Header */}
      <header className="page-header flex-row items-end justify-between">
        <div className="space-y-4">
          <div className="header-badge">
            <span className="dot" />
            Pipeline Comercial Ativo
          </div>
          <div>
            <h1 className="page-title">
              Pipeline <span>Visão Kanban</span> 📊
            </h1>
            <div className="page-subtitle">
              Gestão de Oportunidades <span className="sep" /> 
              Filtro: <span className="status">Pipeline Principal</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <button className="aether-btn-secondary h-14 px-8 border-white/5 opacity-40 hover:opacity-100 flex items-center gap-4">
              <span className="font-black">PIPELINE PRINCIPAL</span>
              <Filter size={14} className="text-gold" />
           </button>
           <button className="aether-btn-primary" onClick={() => setShowAdd(true)}>
             <Plus size={20} strokeWidth={3} />
             Novo Deal
           </button>
        </div>
      </header>

      {/* Kanban Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricHeaderCard title="Total de Cards" value={deals.length} label="Monitorando Fluxo" icon={LayoutGrid} />
        <MetricHeaderCard title="Valor Total" value={formatCurrency(totalValue)} label="Volume em Pipeline" icon={BarChart3} />
        <MetricHeaderCard title="Overdue (+30d)" value="0" label="Crítico / Atenção" icon={AlertCircle} color="#ef4444" />
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[600px] -mx-4 px-4 scrollbar-hide">
        {STAGES.map((stage) => {
          const stageDeals = validatedDeals.filter(d => d.stage === stage.id)
          const stageTotal = stageDeals.reduce((acc, d) => acc + (Number(d.valor) || 0), 0)

          return (
            <div key={stage.id} className="min-w-[320px] flex flex-col gap-6">
              
              {/* Column Header */}
              <div className="px-2 space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color, boxShadow: `0 0 10px ${stage.color}40` }} />
                     <h3 className="text-[13px] font-black uppercase tracking-widest text-white/90">{stage.label}</h3>
                     <Badge variant="outline" className="text-[10px] font-mono text-white/30 border-white/5 bg-white/[0.02]">{stageDeals.length}</Badge>
                   </div>
                   <button className="text-white/20 hover:text-white transition-colors"><Plus size={16} /></button>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-white/20 uppercase tracking-[0.15em]">
                   <span>{formatCurrency(stageTotal)} <span className="text-[8px] opacity-40 ml-1">Total Estimado</span></span>
                </div>
                <div className="h-0.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                   <div className="h-full bg-current opacity-40" style={{ width: '100%', color: stage.color }} />
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-4 p-2 rounded-3xl bg-black/20 border border-white/[0.02]">
                {isLoading ? (
                  [...Array(2)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)
                ) : stageDeals.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                    <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Vazio</span>
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div key={deal.id} className="kanban-card group">
                       <div className="flex justify-between items-start mb-4">
                         <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", 
                           deal.prioridade === 'ALTA' ? "text-red-400 border-red-400/20 bg-red-400/5" :
                           deal.prioridade === 'MEDIA' ? "text-amber-400 border-amber-400/20 bg-amber-400/5" :
                           "text-blue-400 border-blue-400/20 bg-blue-400/5"
                         )}>
                           {deal.prioridade || 'MEDIA'}
                         </span>
                         <Badge className="text-[8px] font-black uppercase tracking-widest bg-white/5 border-white/5">NOVO</Badge>
                       </div>
                       
                       <h4 className="text-[14px] font-black text-white/90 leading-tight group-hover:text-gold transition-colors">{deal.titulo}</h4>
                       
                       <div className="mt-8 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-[10px] font-black text-white/40">
                                {deal.contact?.nome?.[0] || 'U'}
                             </div>
                             <span className="text-[10px] font-bold text-white/30 truncate max-w-[120px] uppercase tracking-tight">{deal.contact?.nome || 'Sem Contato'}</span>
                          </div>
                          <span className="text-[11px] font-black text-white/90">{formatCurrency(deal.valor)}</span>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
