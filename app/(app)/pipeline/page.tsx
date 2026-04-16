"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Plus, RefreshCw, Layers, TrendingUp, AlertTriangle, Filter, Layout } from "lucide-react"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { DealDetailSheet } from "@/components/pipeline/DealDetailSheet"
import { type Deal } from "@/components/pipeline/DealCard"
import { cn } from "@/lib/utils"

/* ═══════════════════════════════════════════════════════
   KPI CARD — Standardized with Aether Design System
   ═══════════════════════════════════════════════════════ */
function KPICard({
  label, value, subtext, icon: Icon, color = "#d4af37"
}: {
  label: string; value: string | number; subtext: string; icon: React.ElementType; color?: string
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-container" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={20} />
      </div>
      <div className="kpi-label-row">
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-subtext">{subtext}</div>
    </div>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [showNewDeal, setShowNewDeal] = useState(false)
  const [newDealStageId, setNewDealStageId] = useState<string | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const { data: boardData, isLoading, error, refetch } = useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: async () => {
      const res = await fetch("/api/pipeline/stages")
      if (!res.ok) throw new Error("Falha ao carregar pipeline")
      return res.json()
    },
    staleTime: 15_000,
  })

  const stages: Stage[] = (boardData?.stages || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    color: s.color || "#3b82f6",
    order: s.order ?? 0,
    deals: (s.deals || []).map((d: any) => ({
      ...d,
      valorEstimado: Number(d.valorEstimado) || 0,
      prioridade: (d.prioridade?.toUpperCase() || "MEDIA") as "ALTA" | "MEDIA" | "BAIXA",
      status: (d.status?.toUpperCase() || "OPEN") as "OPEN" | "WON" | "LOST",
    })),
  }))

  const allOpen = stages.flatMap(s => s.deals.filter(d => d.status === "OPEN"))
  const totalValue = allOpen.reduce((a, d) => a + (d.valorEstimado || 0), 0)
  const overdueValue = allOpen.filter(d => Date.now() - new Date(d.createdAt).getTime() > 30 * 86400_000).length

  const moveDeal = useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      })
      if (!res.ok) throw new Error("Falha ao mover deal")
      return res.json()
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
      toast({ variant: "destructive", title: "Erro ao mover deal" })
    },
  })

  if (error) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">Ops! Algo deu errado.</h2>
          <p className="text-sm text-white/40 mb-6">Não conseguimos carregar o seu pipeline.</p>
          <button onClick={() => refetch()} className="btn-cta-primary">Tentar Novamente</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container animate-aether">
      
      {/* ─── HEADER (REFINED SAAS DESIGN) ─────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-3">
            Pipeline
          </h1>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
            <span>GESTÃO DE OPORTUNIDADES</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>VISÃO KANBAN</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {/* PIPELINE SELECTOR */}
          <button className="flex items-center gap-3 px-5 py-3 rounded-[12px] bg-[#111118] border border-white/[0.08] hover:border-white/20 transition-all group">
            <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]" />
            <span className="text-[13px] font-bold text-white/70">Pipeline Principal</span>
            <Plus size={14} className="text-white/20 group-hover:text-white/40 rotate-45 transition-transform ml-1" />
          </button>

          {/* NOVA COLUNA (PRIMARY GLOW) */}
          <button className="relative flex items-center gap-2 px-6 py-3 rounded-[12px] bg-[#2563eb] hover:bg-[#3b82f6] text-white transition-all shadow-[0_8px_20px_-8px_rgba(37,99,235,0.5)]">
            <Plus size={16} strokeWidth={3} />
            <span className="text-[13px] font-black tracking-tight">Nova Coluna</span>
          </button>

          {/* NOVO BOARD */}
          <button className="flex items-center gap-2 px-5 py-3 rounded-[12px] bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] text-white/40 hover:text-white transition-all">
            <Plus size={16} />
            <span className="text-[14px] font-bold">Novo Board</span>
          </button>
          
          <button 
            onClick={() => refetch()}
            className="p-3 rounded-[12px] border border-white/[0.08] bg-white/5 hover:bg-white/10 transition-all text-white/20 hover:text-white"
            title="Atualizar"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* ─── KPI GRID ─────────────────────────────────────────── */}
      <div className="kpi-grid">
        <KPICard 
          label="Total Leads"
          value={isLoading ? "..." : allOpen.length}
          subtext="oportunidades ativas"
          icon={Layers}
          color="#3b82f6"
        />
        <KPICard 
          label="Volume Total"
          value={isLoading ? "..." : totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          subtext="valor em negociação"
          icon={TrendingUp}
          color="#10b981"
        />
        <KPICard 
          label="Tickets Abertos"
          value={isLoading ? "..." : overdueValue}
          subtext="revisão necessária"
          icon={AlertTriangle}
          color="#f59e0b"
        />
        <div className="flex items-center justify-center border border-dashed border-white/10 rounded-[14px] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group">
           <div className="text-center">
              <Plus size={20} className="mx-auto mb-1 text-white/10 group-hover:text-white/40 transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/10 group-hover:text-white/40 transition-colors">Nova Métrica</span>
           </div>
        </div>
      </div>

      {/* ─── PIPELINE BOARD ───────────────────────────────────── */}
      <div className="mt-4">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[500px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <KanbanBoard
            stages={stages}
            onDealMove={(id, _, stageId) => moveDeal.mutate({ dealId: id, stageId })}
            onAddDeal={(sId) => {
              setNewDealStageId(sId)
              setShowNewDeal(true)
            }}
            onDealClick={(d) => setSelectedDeal(d)}
          />
        )}
      </div>

      <DealDetailSheet
        deal={selectedDeal}
        open={!!selectedDeal}
        onOpenChange={o => !o && setSelectedDeal(null)}
      />
    </div>
  )
}
