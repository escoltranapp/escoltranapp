"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  DollarSign, 
  LayoutGrid, 
  Plus, 
  AlertTriangle, 
  ChevronDown, 
  Grid,
  TrendingUp,
  X,
  PlusCircle
} from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"

// ─── STAGE CONFIG ──────────────────────────────────────────────
const STAGES_CONFIG = [
  { id: "PROSPECT", name: "NOVO LEAD", color: "#3B82F6" },
  { id: "QUALIFICATION", name: "QUALIFICAÇÃO", color: "#8B5CF6" },
  { id: "MEETING", name: "REUNIÃO MARCADA", color: "#F59E0B" },
  { id: "PROPOSAL", name: "PROPOSTA", color: "#10B981" },
  { id: "NEGOTIATION", name: "NEGOCIAÇÃO", color: "#EF4444" },
  { id: "FOLLOW_UP", name: "FOLLOW UP", color: "#3B82F6" },
]

// ─── REUSABLE KPI CARD ─────────────────────────────────────────
function KPICard({ label, value, icon: Icon, isWarning = false }: any) {
  return (
    <div className="kpi-card-v2 flex-1">
      <div className={cn(
        "kpi-icon-v2",
        isWarning ? "text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/10" : "text-white/40"
      )}>
         {isWarning ? <AlertTriangle size={24} /> : <Icon size={24} />}
      </div>
      <div>
        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-[22px] font-black text-white tracking-tighter leading-none">{value}</div>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const [activeBoard, setActiveBoard] = useState("Pipeline Principal")
  
  const { data: dealsData, isLoading } = useQuery<any[]>({
    queryKey: ["deals"],
    queryFn: async () => {
      const res = await fetch("/api/deals")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
  })

  const deals = Array.isArray(dealsData) ? dealsData : []
  
  // Transformation to Stage format for the KanbanBoard
  const boardStages: Stage[] = STAGES_CONFIG.map(config => ({
    ...config,
    deals: deals.filter(d => (d.stage === config.id) || (config.id === "PROSPECT" && !d.stage)).map(d => ({
      ...d,
      valorEstimado: Number(d.valor) || 0,
      prioridade: (d.priority?.toUpperCase() || "MEDIA") as any,
      status: (d.status?.toUpperCase() || "OPEN") as any,
    }))
  }))

  const totalValue = deals.reduce((acc, d) => acc + (Number(d.valor) || 0), 0)
  const expiredCount = deals.filter(d => d.priority === "Alta").length // Mocking expired count

  return (
    <div className="pipeline-layout">
      <div className="page-container max-w-[1700px] mx-auto overflow-hidden">
        
        {/* HEADER SECTION */}
        <header className="flex items-start justify-between mb-14">
          <div className="space-y-4">
             <div className="pipeline-header-badge">
                <Grid size={14} />
                <span>Pipeline Comercial</span>
             </div>
             <div>
                <h1 className="text-[52px] font-black text-white tracking-tighter leading-none uppercase">Pipeline</h1>
                <p className="text-[11px] font-bold text-white/10 uppercase tracking-[0.4em] mt-3">Gestão de Oportunidades • Visão Kanban</p>
             </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
             {/* Board Dropdown */}
             <button className="flex items-center gap-4 px-6 py-4 bg-[#161B22] border border-white/[0.08] rounded-[12px] text-[13px] font-bold text-white/60 hover:text-white transition-all">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                {activeBoard}
                <ChevronDown size={18} className="opacity-40" />
             </button>

             {/* Primary Actions */}
             <button className="flex items-center gap-2.5 px-8 py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-[13px] uppercase tracking-wider rounded-[12px] shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all">
                <Plus size={18} strokeWidth={3} /> Nova Coluna
             </button>

             <button className="flex items-center gap-2.5 px-6 py-4 bg-transparent border border-white/10 hover:bg-white/[0.02] text-white/40 hover:text-white font-black text-[13px] uppercase tracking-wider rounded-[12px] transition-all">
                <Plus size={18} /> Novo Board
             </button>
          </div>
        </header>

        {/* METRICS BAR */}
        <div className="flex gap-6 mb-12">
           <KPICard label="Total de Cards" value={deals.length} icon={LayoutGrid} />
           <KPICard label="Valor Total" value={formatCurrency(totalValue)} icon={DollarSign} />
           <KPICard label="Cards Vencidos" value={expiredCount} icon={AlertTriangle} isWarning={true} />
        </div>

        {/* KANBAN BOARD */}
        <div className="relative mt-8 min-h-[700px]">
          {isLoading ? (
            <div className="flex gap-8">
               {[1,2,3,4].map(i => <div key={i} className="min-w-[300px] h-[600px] rounded-[24px] bg-white/[0.02] animate-pulse" />)}
            </div>
          ) : (
            <KanbanBoard 
              stages={boardStages} 
              onDealMove={(id, from, to) => console.log(`Moved ${id} from ${from} to ${to}`)}
            />
          )}
        </div>

      </div>
    </div>
  )
}
