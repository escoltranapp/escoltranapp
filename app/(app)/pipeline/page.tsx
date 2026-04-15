"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  Plus, 
  Search, 
  DollarSign, 
  Calendar, 
  LayoutGrid,
  AlertCircle,
  Kanban,
  Sparkles,
  ArrowRight,
  PlusCircle
} from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

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
  subtitle?: string
  icon: React.ElementType
  iconColor?: string
}) {
  return (
    <div className="crm-metric-card">
      <div className="crm-metric-icon-box" style={{ color: iconColor, backgroundColor: `${iconColor}15` }}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="space-y-0.5">
        <h4 className="label-upper">{title}</h4>
        <div className="value-main">{value}</div>
        {subtitle && <p className="sub-context">{subtitle}</p>}
      </div>
    </div>
  )
}

interface Deal {
  id: string; titulo: string; valor: number; stage: string; prioridade: string; status: string;
  contact?: { nome: string };
}

const STAGES = [
  { id: "PROSPECT", label: "NOVO LEAD", color: "#3b82f6" },
  { id: "QUALIFICATION", label: "QUALIFICAÇÃO", color: "#a855f7" },
  { id: "MEETING", label: "REUNIÃO MARCADA", color: "#f59e0b" },
  { id: "PROPOSAL", label: "PROPOSTA", color: "#10b981" },
  { id: "NEGOTIATION", label: "NEGOCIAÇÃO", color: "#ef4444" },
]

export default function PipelinePage() {
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
    <div className="animate-aether space-y-7">
      
      {/* Page Header (Regra 8) */}
      <header className="flex items-center justify-between">
        <div>
           <div className="page-header-context flex items-center gap-2">
              <Sparkles size={10} /> SALES INTELLIGENCE
           </div>
           <h1 className="page-title-h1">Pipeline</h1>
           <p className="page-subtitle-desc">Gestão visual de oportunidades em visão Kanban</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="h-10 px-6 border border-white/5 bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Fluxo Principal
           </button>
           <button className="btn-cta-primary flex items-center gap-2">
              <Plus size={18} /> Nova Etapa
           </button>
        </div>
      </header>

      {/* Kanban Metrics (Regra 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CRMMetricCard title="Total Inventory" value={validatedDeals.length} subtitle="Oportunidades no funil" icon={LayoutGrid} iconColor="#3b82f6" />
        <CRMMetricCard title="Pipeline Value" value={formatCurrency(totalValue)} subtitle="Receita em prospecção" icon={DollarSign} iconColor="#10b981" />
        <CRMMetricCard title="Fadiga Operacional" value="01" subtitle="Cards sem interação" icon={AlertCircle} iconColor="#ef4444" />
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
        {STAGES.map((stage) => {
          const stageDeals = validatedDeals.filter(d => (d.stage || 'PROSPECT') === stage.id)
          const stageTotal = stageDeals.reduce((acc, d) => acc + (Number(d.valor) || 0), 0)

          return (
            <div key={stage.id} className="min-w-[280px] max-w-[280px] flex flex-col">
              {/* Header (Regra 7) */}
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                  {stage.label}
                  <Badge count={stageDeals.length} />
                </div>
                <div className="kanban-column-value">{formatCurrency(stageTotal)} acumulado</div>
              </div>
              
              {/* Cards List */}
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(2)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />)
                ) : (
                  stageDeals.map((deal) => (
                    <div key={deal.id} className="kanban-opportunity-card group">
                       <h4 className="text-[13px] font-bold text-white mb-2 leading-tight">{deal.titulo}</h4>
                       
                       <div className="flex items-center gap-2 mb-3">
                          <div className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex items-center gap-1.5", 
                            deal.prioridade === 'ALTA' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500")}>
                             <span className={cn("w-1.5 h-1.5 rounded-full", deal.prioridade === 'ALTA' ? "bg-red-500" : "bg-amber-500")} /> {deal.prioridade || 'Média'}
                          </div>
                       </div>

                       <div className="text-[14px] font-bold text-white truncate">{formatCurrency(deal.valor)}</div>

                       <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.04]">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold border border-white/5">{deal.contact?.nome?.[0] || 'S'}</div>
                             <span className="text-[10px] font-medium text-white/30 uppercase truncate max-w-[80px]">{deal.contact?.nome || 'Lead'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/10">
                             <Calendar size={10} /> <span className="text-[10px] font-bold">21 abr</span>
                          </div>
                       </div>
                    </div>
                  ))
                )}
                
                <button className="w-full py-3 border border-dashed border-white/10 hover:border-white/20 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-white/20 transition-all">
                  <PlusCircle size={14} /> Adicionar Deal
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Badge({ count }: { count: number }) {
  return (
    <span className="ml-auto bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold text-white/30">{count}</span>
  )
}
