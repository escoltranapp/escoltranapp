"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { DealDetailSheet } from "@/components/pipeline/DealDetailSheet"
import { type Deal } from "@/components/pipeline/DealCard"
import { cn } from "@/lib/utils"

function KPICard({
  label, value, icon, trend, color = "#ffc880"
}: {
  label: string; value: string | number; icon: string; trend?: string; color?: string
}) {
  return (
    <div className="bg-surface-container border border-white/5 rounded-2xl p-6 hover:bg-surface-container-high transition-all group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
        </div>
        {trend && (
           <div className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-amber-500 bg-amber-500/10">
              {trend}
           </div>
        )}
      </div>
      <div className="space-y-1">
         <div className="text-2xl font-bold text-white tracking-tight font-mono">{value}</div>
         <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">{label}</div>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [showNewColumnModal, setShowNewColumnModal] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const { data: boardData, isLoading, refetch } = useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: async () => {
      const res = await fetch("/api/pipeline/stages")
      if (!res.ok) throw new Error("Falha ao carregar pipeline")
      return res.json()
    },
  })

  const updateDealMutation = useMutation({
    mutationFn: async ({ dealId, newStageId }: { dealId: string; newStageId: string }) => {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId: newStageId }),
      })
      if (!res.ok) throw new Error("Falha ao mover card")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
      toast({ title: "Card movido", description: "O fluxo foi atualizado com sucesso." })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
      toast({ title: "Erro ao mover", description: "Não foi possível sincronizar o card.", variant: "destructive" })
    }
  })

  const stages: Stage[] = (boardData?.stages || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    color: s.color || "#f5a623",
    deals: (s.deals || []).map((d: any) => ({
      ...d,
      valorEstimado: Number(d.valorEstimado) || 0,
      prioridade: (d.prioridade?.toUpperCase() || "MEDIA") as "ALTA" | "MEDIA" | "BAIXA",
      status: (d.status?.toUpperCase() || "OPEN") as "OPEN" | "WON" | "LOST",
    })),
  }))

  const allOpen = stages.flatMap(s => s.deals.filter(d => d.status === "OPEN"))
  const totalValue = allOpen.reduce((a, d) => a + (d.valorEstimado || 0), 0)
  const highPriority = allOpen.filter(d => d.prioridade === "ALTA").length

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      
      {/* HEADER ESCOLTRAN */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
           <h1 className="text-[32px] font-bold text-white tracking-tight">Pipeline Comercial</h1>
           <p className="text-slate-500 text-[14px] mt-1">Gestão de oportunidades e orquestração de vendas</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNewColumnModal(true)}
            className="bg-white/5 text-slate-400 border border-white/5 rounded-xl px-5 py-3 font-bold hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2 text-[12px] uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[20px]">add_column</span>
            <span>Coluna</span>
          </button>

          <button className="bg-amber-500 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-amber-500/10 text-[12px] uppercase tracking-widest">
            <span className="material-symbols-outlined text-[20px] font-bold">bolt</span>
            <span>Novo Registro</span>
          </button>
          
          <button 
            onClick={() => refetch()}
            className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/5 bg-surface-container text-slate-500 hover:text-white transition-all group"
          >
            <span className={cn("material-symbols-outlined text-[22px]", isLoading && "animate-spin")}>sync</span>
          </button>
        </div>
      </header>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <KPICard label="Leads Ativos" value={allOpen.length} icon="view_kanban" trend="Live Sync" color="#adc6ff" />
        <KPICard label="Volume em Negociação" value={totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} icon="payments" trend="+8.2%" color="#ffc880" />
        <KPICard label="Prioridade Alta" value={highPriority} icon="priority_high" trend="Risk Factor" color="#ffb4ab" />
        <KPICard label="Meta Mensal" value="84%" icon="ads_click" trend="On Track" color="#7ae982" />
      </div>

      {/* BOARD AREA */}
      <div className="min-h-[600px] bg-surface-lowest/40 rounded-3xl border border-dashed border-white/5 p-4">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-6 h-full">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-full bg-surface-container rounded-3xl animate-pulse" />)}
          </div>
        ) : (
          <KanbanBoard 
            stages={stages} 
            onDealMove={(dealId, _, newStageId) => updateDealMutation.mutate({ dealId, newStageId })}
            onDealClick={(deal) => setSelectedDeal(deal)}
            onAddDeal={(stageId) => {}}
          />
        )}
      </div>

      <DealDetailSheet 
        deal={selectedDeal} 
        open={!!selectedDeal}
        onOpenChange={(open) => !open && setSelectedDeal(null)} 
      />

      {/* MODAL NOVA COLUNA */}
      {showNewColumnModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-surface-container border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">Expandir Fluxo</h2>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 font-bold mb-2 block">Identificação da Coluna</label>
                    <input 
                      type="text" 
                      className="bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-4 text-sm text-on-surface focus:border-amber-500/50 outline-none w-full font-mono transition-all"
                      placeholder="Ex: Negociação Final"
                      value={newColumnName}
                      onChange={e => setNewColumnName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4 mt-8">
                     <button className="flex-1 bg-surface-container-high text-slate-400 font-bold py-3 rounded-xl text-[11px] uppercase tracking-widest" onClick={() => setShowNewColumnModal(false)}>Abortar</button>
                     <button className="flex-1 bg-amber-500 text-black font-bold py-3 rounded-xl text-[11px] uppercase tracking-widest shadow-lg shadow-amber-500/20">Sincronizar</button>
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
