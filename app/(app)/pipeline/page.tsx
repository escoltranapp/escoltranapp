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
    <div className="bg-[#1B2035] border border-white/[0.06] rounded-[12px] p-[20px_24px] flex flex-col gap-4 group">
      <div className="flex items-center justify-between">
        <div style={{ color: color }} className="opacity-80">
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
      <div>
        <div className="text-[11px] font-bold text-[#8A8FA3] uppercase tracking-[0.05em] mb-1">{label}</div>
        <div className="text-[24px] font-semibold text-white tracking-tight">{value}</div>
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
    <div className="page-container animate-aether !bg-[#0A0A0A]">
      
      {/* ─── MODAL: NOVA COLUNA (REFERENCE MATCH) ────────────────── */}
      {showNewColumnModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setShowNewColumnModal(false)}
          />
          <div className="relative w-full max-w-[440px] bg-[#0c0c0e] border border-white/10 rounded-[28px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Nova Coluna</h2>
               <button 
                 onClick={() => setShowNewColumnModal(false)}
                 className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors"
                >
                 <Plus size={18} className="rotate-45 text-white/40" />
               </button>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">Nome da Coluna</label>
                  <input 
                    autoFocus
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Ex: Em Negociação"
                    className="w-full bg-[#111115] border border-white/5 rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                  />
               </div>

               <div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">Cor</label>
                  <div className="flex flex-wrap gap-3">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all duration-300 relative",
                          selectedColor === color ? "scale-110 ring-2 ring-white/20 ring-offset-2 ring-offset-[#0c0c0e]" : "hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                      >
                         {selectedColor === color && (
                            <div className="absolute inset-0 rounded-full shadow-[0_0_15px_currentColor]" style={{ color }} />
                         )}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3 mt-10">
               <button 
                 onClick={() => setShowNewColumnModal(false)}
                 className="flex-1 py-3.5 rounded-xl border border-white/5 text-xs font-black text-white/40 hover:bg-white/5 hover:text-white transition-all"
                >
                 Cancelar
               </button>
               <button 
                 className="flex-1 py-3.5 rounded-xl bg-blue-600 text-xs font-black text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] hover:bg-blue-500 transition-all"
                 onClick={() => {
                   setShowNewColumnModal(false)
                   setNewColumnName("")
                 }}
                >
                 Criar Coluna
               </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ─── HEADER (REFACTORED) ─────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="animate-slide-up">
          <h1 className="text-[30px] font-bold text-white tracking-tight mb-1">
            Pipeline
          </h1>
          <div className="text-[11px] font-medium tracking-[0.08em] text-[#8A8FA3] uppercase">
            Gestão de Oportunidades • Visão Kanban
          </div>
        </div>
        
        <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {/* PIPELINE SELECTOR */}
          <div className="relative">
            <button 
              onClick={() => setIsPipelineMenuOpen(!isPipelineMenuOpen)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-[12px] bg-[#0d0d0d] border transition-all group whitespace-nowrap",
                isPipelineMenuOpen ? "border-blue-500/50 bg-[#121212]" : "border-white/[0.08] hover:border-white/20"
              )}
            >
              <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]" />
              <span className="text-[13px] font-bold text-white/70">Pipeline Principal</span>
              <Plus 
                size={14} 
                className={cn(
                  "text-white/20 group-hover:text-white/40 transition-transform ml-1",
                  isPipelineMenuOpen ? "rotate-[225deg]" : "rotate-45"
                )} 
              />
            </button>

            {/* DROPDOWN MENU */}
            {isPipelineMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsPipelineMenuOpen(false)} 
                />
                <div className="absolute top-full left-0 mt-2 w-full min-w-[220px] bg-[#0d0d12] border border-white/[0.1] rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1">
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 transition-all">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                      <span className="text-[13px] font-black">Pipeline Principal</span>
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-[8px] hover:bg-white/5 text-white/40 hover:text-white transition-all">
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                      <span className="text-[13px] font-bold">Vendas Internas</span>
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-[8px] hover:bg-white/5 text-white/40 hover:text-white transition-all">
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                      <span className="text-[13px] font-bold">Pós-Venda</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* NOVA COLUNA */}
          <button 
            onClick={() => setShowNewColumnModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#2563EB] text-white hover:bg-blue-600 transition-all duration-150 cursor-pointer shadow-none"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="text-[13px] font-medium">Nova Coluna</span>
          </button>

          {/* NOVO BOARD */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-transparent border border-white/15 text-white/80 hover:border-white/30 hover:bg-white/[0.02] transition-all duration-150 cursor-pointer text-[13px] font-medium">
            <Plus size={16} />
            <span>Novo Board</span>
          </button>
          
          <button 
            onClick={() => refetch()}
            className="p-2 rounded-[8px] border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white"
            title="Atualizar"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard 
          label="Total Leads"
          value={isLoading ? "..." : allOpen.length}
          icon={Layers}
          color="#3B8FE8"
        />
        <KPICard 
          label="Volume Total"
          value={isLoading ? "..." : totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          icon={TrendingUp}
          color="#3BE87A"
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
