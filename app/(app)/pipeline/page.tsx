"use client"

import { useQuery } from "@tanstack/react-query"
import { DollarSign, LayoutGrid, Calendar, Sparkles, PlusCircle, AlertCircle, TrendingUp } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

// ─── Reusable Component: KPI Card Enterprise ───────────────────────
function KPICard({ 
  label, value, subtext, icon: Icon, trend, color = "var(--accent-blue)" 
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

const STAGES = [
  { id: "PROSPECT", label: "NOVO LEAD", color: "#3b82f6" },
  { id: "QUALIFICATION", label: "QUALIFICAÇÃO", color: "#a855f7" },
  { id: "MEETING", label: "REUNIÃO MARCADA", color: "#f59e0b" },
  { id: "PROPOSAL", label: "PROPOSTA", color: "#10b981" },
  { id: "NEGOTIATION", label: "NEGOCIAÇÃO", color: "#ef4444" },
]

export default function PipelinePage() {
  const { data: deals = [], isLoading } = useQuery<any[]>({
    queryKey: ["deals"],
    queryFn: async () => {
      const res = await fetch("/api/deals")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 15_000,
  })

  const totalValue = (deals || []).reduce((acc, d) => acc + (Number(d.valor) || 0), 0)

  return (
    <div className="page-container animate-aether">
      
      {/* 1. HEADER DE PÁGINA */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <Sparkles size={12} /> SALES INTELLIGENCE
          </div>
          <h1 className="page-title-h1">Pipeline</h1>
          <p className="page-subtitle">Gestão visual de oportunidades em visão Kanban</p>
        </div>
        <button className="btn-cta-primary flex items-center gap-2">
           <PlusCircle size={18} /> Novo Item
        </button>
      </header>

      {/* 2. KPI CARDS */}
      <div className="kpi-grid">
         <KPICard label="Total Inventory" value={(deals || []).length} subtext="Oportunidades no funil" icon={LayoutGrid} color="#3b82f6" />
         <KPICard label="Pipeline Value" value={formatCurrency(totalValue)} subtext="Receita em prospecção" icon={DollarSign} trend="+15%" color="#10b981" />
         <KPICard label="Fadiga Operacional" value="01" subtext="Cards sem interação" icon={AlertCircle} color="#ef4444" />
         <KPICard label="Dataset Health" value="100%" subtext="Fluxo sincronizado" icon={TrendingUp} color="#a855f7" />
      </div>

      {/* 3. KANBAN BOARD */}
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
        {STAGES.map((stage) => {
          const stageDeals = (deals || []).filter(d => (d.stage || 'PROSPECT') === stage.id)
          const stageTotal = stageDeals.reduce((acc, d) => acc + (Number(d.valor) || 0), 0)

          return (
            <div key={stage.id} className="min-w-[300px] flex flex-col gap-5">
              {/* Column Header */}
              <div className="flex flex-col gap-2 p-1">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                       <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">{stage.label}</span>
                    </div>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold text-white/30">{stageDeals.length}</span>
                 </div>
                 <div className="text-[14px] font-bold text-white/90">{formatCurrency(stageTotal)}</div>
              </div>
              
              {/* Cards List */}
              <div className="flex flex-col gap-3">
                {isLoading ? (
                  [...Array(2)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />)
                ) : (
                  stageDeals.map((deal) => (
                    <div key={deal.id} className="kpi-card p-5 group hover:border-blue-600/30 transition-all cursor-pointer">
                       <h4 className="text-[13px] font-bold text-white mb-2 leading-tight group-hover:text-blue-400">{deal.titulo}</h4>
                       <div className="text-[15px] font-bold text-blue-500 mb-4">{formatCurrency(deal.valor)}</div>
                       
                       <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-2">
                          <div className="flex items-center gap-2">
                             <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[9px] font-bold text-white/20">{deal.contact?.nome?.[0] || 'S'}</div>
                             <span className="text-[10px] font-bold text-white/40 uppercase">{deal.contact?.nome || 'Lead'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/10">
                             <Calendar size={10} /> <span className="text-[9px] font-bold">21 abr</span>
                          </div>
                       </div>
                    </div>
                  ))
                )}
                <button className="py-3 border border-dashed border-white/5 hover:border-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-white/10 hover:text-white/20 transition-all">
                   + Adicionar Deal
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
