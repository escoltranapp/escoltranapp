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
  label, value, icon: Icon, color = "#3B8FE8"
}: {
  label: string; value: string | number; icon: React.ElementType; color?: string
}) {
  return (
    <div className="bg-[#111114] border border-white/[0.06] rounded-[16px] p-7 flex flex-col gap-5 group transition-all hover:border-white/10">
      <div className="flex items-center justify-between">
        <div style={{ color: color }} className="opacity-80">
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
      <div>
        <div className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em] mb-2">{label}</div>
        <div className="text-[28px] font-semibold text-white tracking-tight">{value}</div>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [showNewDeal, setShowNewDeal] = useState(false)
  const [newDealStageId, setNewDealStageId] = useState<string | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isPipelineMenuOpen, setIsPipelineMenuOpen] = useState(false)
  const [showNewColumnModal, setShowNewColumnModal] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [selectedColor, setSelectedColor] = useState("#3b82f6")

  const colors = [
    "#3b82f6", // Blue
    "#60a5fa", // Light Blue
    "#8b5cf6", // Purple
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#ec4899", // Pink
    "#10b981", // Green
  ]

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
  const overdueValue = allOpen.filter(d => d.prioridade === "ALTA").length

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
      <div className="page-container flex items-center justify-center min-h-[400px] bg-black">
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
    <div className="page-container animate-aether !bg-[#0A0A0A] !px-10 !pt-10">
      
      {/* ─── MODAL: NOVA COLUNA (REFINED PADDING) ────────────────── */}
      {showNewColumnModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowNewColumnModal(false)} />
          <div className="relative w-full max-w-md bg-[#111114] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Nova Coluna</h2>
              <button onClick={() => setShowNewColumnModal(false)} className="text-white/20 hover:text-white transition-colors">
                <Plus size={28} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Nome da Coluna</label>
                <input 
                  type="text" 
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Ex: Em Negociação"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Selecione a Cor</label>
                <div className="flex flex-wrap gap-4 px-1">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-9 h-9 rounded-full transition-all relative",
                        selectedColor === color ? "ring-2 ring-white/40 ring-offset-4 ring-offset-[#111114]" : "hover:scale-110"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-black/20 flex gap-4">
              <button 
                onClick={() => setShowNewColumnModal(false)}
                className="flex-1 py-4 px-6 rounded-2xl border border-white/5 text-xs font-bold text-white/40 hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={() => { setShowNewColumnModal(false); setNewColumnName(""); }}
                className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/10"
              >
                Criar Coluna
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ─── HEADER (REFACTORED SPACING) ─────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-[36px] font-bold text-white tracking-tight mb-1">Pipeline</h1>
          <div className="text-[12px] font-medium tracking-[0.1em] text-white/20 uppercase">Gestão de Oportunidades • Visão Kanban</div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsPipelineMenuOpen(!isPipelineMenuOpen)}
              className="flex items-center gap-4 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              <span className="text-[14px] font-medium text-white/80">Pipeline Principal</span>
              <Plus size={16} className={cn("text-white/20 transition-transform", isPipelineMenuOpen && "rotate-45")} />
            </button>
          </div>

          <button onClick={() => setShowNewColumnModal(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all font-bold text-[13px] shadow-lg shadow-blue-600/10">
            <Plus size={18} />
            <span className="uppercase tracking-wider">Nova Coluna</span>
          </button>

          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 transition-all text-[13px] font-bold uppercase tracking-wider">
            <Plus size={18} />
            <span>Novo Board</span>
          </button>
          
          <button onClick={() => refetch()} className="p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white/20">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* ─── METRICS (CLEAN NOIR) ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <KPICard 
          label="Total Leads"
          value={isLoading ? "..." : allOpen.length}
          icon={Layers}
          color="#3B82F6"
        />
        <KPICard 
          label="Volume Total"
          value={isLoading ? "..." : totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          icon={TrendingUp}
          color="#10B981"
        />
        <KPICard 
          label="Tickets Abertos"
          value={isLoading ? "..." : overdueValue}
          icon={AlertTriangle}
          color="#E85959"
        />
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
