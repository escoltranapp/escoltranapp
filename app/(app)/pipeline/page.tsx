"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  DollarSign, 
  LayoutGrid, 
  Plus, 
  AlertTriangle, 
  ChevronDown, 
  Grid
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

// ─── REUSABLE KPI CARD (REFINED) ────────────────────────────────
function KPICard({ label, value, icon: Icon, type = "default" }: any) {
  const configs: any = {
    blue: { bg: "rgba(59,130,246,0.15)", icon: "#3B82F6" },
    green: { bg: "rgba(16,185,129,0.15)", icon: "#10B981" },
    red: { bg: "rgba(239,68,68,0.15)", icon: "#EF4444" },
    default: { bg: "rgba(255,255,255,0.03)", icon: "#8B949E" }
  }
  const config = configs[type] || configs.default

  return (
    <div className="bg-[#161B22] border border-white/[0.08] rounded-[16px] p-6 flex-1 flex items-center gap-5">
      <div 
        className="w-10 h-10 rounded-[10px] flex items-center justify-center" 
        style={{ backgroundColor: config.bg, color: config.icon }}
      >
         <Icon size={20} />
      </div>
      <div>
        <div className="text-[10px] font-black text-[#8B949E] uppercase tracking-[0.2em] mb-1">{label}</div>
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
  const expiredCount = deals.filter(d => (d.priority === "Alta" && d.status === "OPEN")).length

  return (
    <div className="pipeline-layout">
      <div className="page-container max-w-[1700px] mx-auto px-1">
        
        {/* HEADER SECTION */}
        <header className="flex items-start justify-between mb-12">
          <div className="space-y-4">
             <div className="pipeline-header-badge">
                <Grid size={14} />
                <span>Pipeline Comercial</span>
             </div>
             <div>
                <h1 className="text-[48px] font-black text-white tracking-tighter leading-none uppercase">Pipeline</h1>
                <p className="text-[11px] font-bold text-[#8B949E] uppercase tracking-[0.4em] mt-3">Gestão de Oportunidades • Visão Kanban</p>
             </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
             <button className="flex items-center gap-4 px-6 py-4 bg-[#161B22] border border-white/[0.08] rounded-[12px] text-[13px] font-bold text-[#8B949E] hover:text-white transition-all">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                {activeBoard}
                <ChevronDown size={18} className="opacity-40" />
             </button>

             <button className="flex items-center gap-2.5 px-8 py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-[13px] uppercase tracking-wider rounded-[12px] shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all active:scale-95">
                <Plus size={18} strokeWidth={3} /> Nova Coluna
             </button>
          </div>
        </header>

        {/* METRICS BAR (REFINED) */}
        <div className="flex gap-6 mb-12">
           <KPICard label="Total de Cards" value={deals.length} icon={LayoutGrid} type="blue" />
           <KPICard label="Valor Total" value={formatCurrency(totalValue)} icon={DollarSign} type="green" />
           <KPICard label="Cards Vencidos" value={expiredCount} icon={AlertTriangle} type="red" />
        </div>

        {/* BOARD AREA (WITH GAP & PADDING REFINEMENT) */}
        <div className="relative mt-8 px-1 overflow-x-auto kanban-scrollbar">
          {isLoading ? (
            <div className="flex gap-4">
               {[1,2,3,4].map(i => <div key={i} className="min-w-[300px] h-[600px] rounded-[12px] bg-[#161B22] animate-pulse" />)}
            </div>
          ) : (
            <KanbanBoard stages={boardStages} />
          )}
        </div>

      </div>
    </div>
  )
}
