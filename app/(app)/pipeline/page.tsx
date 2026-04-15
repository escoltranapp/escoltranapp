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

function KPICard({ label, value, icon: Icon, type = "default" }: any) {
  const configs: any = {
    blue: { bg: "rgba(59,130,246,0.15)", icon: "#3B82F6" },
    green: { bg: "rgba(16,185,129,0.15)", icon: "#10B981" },
    red: { bg: "rgba(239,68,68,0.15)", icon: "#EF4444" },
    default: { bg: "rgba(255,255,255,0.03)", icon: "#8B949E" }
  }
  const config = configs[type] || configs.default

  return (
    <div className="bg-[var(--bg-surface)] border border-white/[0.08] rounded-[16px] p-6 flex-1 flex items-center gap-5">
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
    <div className="pipeline-layout page-container">
      {/* HEADER SECTION (SENIOR REF RECOVERY) */}
      <header className="flex items-start justify-between mb-12">
        <div className="space-y-4">
           <div className="pipeline-header-badge">
              <Grid size={13} />
              <span>Pipeline Comercial</span>
           </div>
           <div>
              <h1 className="text-[42px] font-bold text-white tracking-tight leading-none">Pipeline</h1>
              <p className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-[0.3em] mt-3">Gestão de Oportunidades • Visão Kanban</p>
           </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
           {/* Pipeline Switcher */}
           <button className="flex items-center gap-3 px-4 py-2.5 bg-[var(--bg-surface)] border border-white/[0.08] rounded-[10px] text-[12px] font-semibold text-[#8B949E] hover:text-white transition-all">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              {activeBoard}
              <ChevronDown size={14} className="opacity-40" />
           </button>

           {/* ACTIONS */}
           <button className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[12px] uppercase tracking-wide rounded-[10px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
              <Plus size={16} strokeWidth={3} /> Nova Coluna
           </button>

           <button className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-white/[0.15] hover:border-white/[0.3] text-[#8B949E] hover:text-white font-bold text-[12px] uppercase tracking-wide rounded-[10px] transition-all active:scale-95">
              <Plus size={16} /> Novo Board
           </button>
        </div>
      </header>

      {/* METRICS BAR */}
      <div className="flex gap-4 mb-10">
         <KPICard label="Total de Cards" value={deals.length} icon={LayoutGrid} type="blue" />
         <KPICard label="Valor Total" value={formatCurrency(totalValue)} icon={DollarSign} type="green" />
         <KPICard label="Cards Vencidos" value={expiredCount} icon={AlertTriangle} type="red" />
      </div>

      {/* KANBAN BOARD (CLEAN WRAPPER FOR SIDEBAR ALIGNMENT) */}
      <div className="overflow-x-auto kanban-scrollbar -mx-1 px-1">
        {isLoading ? (
          <div className="flex gap-4">
             {[1,2,3,4].map(i => <div key={i} className="min-w-[280px] h-[600px] rounded-[12px] bg-[var(--bg-surface)] animate-pulse" />)}
          </div>
        ) : (
          <KanbanBoard stages={boardStages} />
        )}
      </div>
    </div>
  )
}
