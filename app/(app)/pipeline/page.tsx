"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { DealDetailSheet } from "@/components/pipeline/DealDetailSheet"
import { NewDealDialog } from "@/components/pipeline/NewDealDialog"
import { type Deal } from "@/components/pipeline/DealCard"
import { cn } from "@/lib/utils"

import { ClosedDealsModal } from "@/components/pipeline/ClosedDealsModal"

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [pipelineSelection, setPipelineSelection] = useState("vendas-matriz")
  const [isNewDealOpen, setIsNewDealOpen] = useState(false)
  const [isArchivedOpen, setIsArchivedOpen] = useState(false)
  const [preselectedStageId, setPreselectedStageId] = useState<string | undefined>(undefined)

  const { data: boardData, isLoading, refetch } = useQuery({
    queryKey: ["pipeline-stages", pipelineSelection],
    queryFn: async () => {
      const res = await fetch(`/api/pipeline/stages?pipeline=${pipelineSelection}`)
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
    },
  })

  const now = new Date()
  const stages: Stage[] = (boardData?.stages || []).map((s: any) => ({
    id: s.id,
    pipelineId: s.pipelineId,
    name: s.name,
    color: s.color || "#F97316",
    deals: (s.deals || []).map((d: any) => {
      const pendingActs: Array<{ id: string; dueAt: string | null }> = d.activities || []
      return {
        ...d,
        valorEstimado: Number(d.valorEstimado) || 0,
        prioridade: (d.prioridade?.toUpperCase() || "MEDIA") as "ALTA" | "MEDIA" | "BAIXA",
        status: (d.status?.toUpperCase() || "OPEN") as "OPEN" | "WON" | "LOST",
        pendingActivitiesCount: pendingActs.length,
        hasOverdueActivities: pendingActs.some((a) => a.dueAt && new Date(a.dueAt) < now),
      }
    }),
  }))

  return (
    <div className="animate-in fade-in duration-700 pb-24 h-full flex flex-col">
      
      {/* HEADER ESCOLTRAN STYLE - MATCHING SCREENSHOT */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
           <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Pipeline</h1>
           
           <div className="relative group">
              <select 
                value={pipelineSelection}
                onChange={(e) => setPipelineSelection(e.target.value)}
                className="bg-[#111111] text-[#A3A3A3] border border-white/[0.05] rounded-xl pl-4 pr-10 py-2 text-[11px] font-black uppercase tracking-widest focus:border-[#3B82F6]/50 outline-none cursor-pointer appearance-none min-w-[160px] hover:bg-white/[0.02] transition-all"
              >
                <option value="vendas-matriz">Vendas Matriz</option>
                <option value="pos-vendas">Pós-Vendas / CS</option>
                <option value="retencao">Fluxo Retenção</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[16px] text-[#404040] pointer-events-none group-hover:text-white transition-colors">expand_more</span>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setIsArchivedOpen(true)}
            className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#A3A3A3] hover:text-white hover:bg-white/[0.05] transition-all"
           >
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              Arquivados
           </button>

           <button className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#A3A3A3] hover:text-white hover:bg-white/[0.05] transition-all">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Pipeline
           </button>

           <button 
            onClick={() => setIsNewDealOpen(true)}
            className="flex items-center gap-3 px-6 py-2.5 bg-[#3B82F6] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
           >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Deal
           </button>
        </div>
      </header>

      {/* BOARD AREA */}
      <div className="flex-1 min-h-0">
        {/* BACKGROUND ACCENT */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/5 blur-[128px] rounded-full pointer-events-none opacity-50" />
        
        {isLoading ? (
          <div className="grid grid-cols-4 gap-6 h-full p-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-[600px] bg-[#1A1A1A] rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <KanbanBoard 
            stages={stages} 
            onDealMove={(dealId, oldStage, newStage) => updateDealMutation.mutate({ dealId, newStageId: newStage })}
            onDealClick={(deal) => setSelectedDeal(deal)}
            onAddDeal={(stageId) => {
               setPreselectedStageId(stageId)
               setIsNewDealOpen(true)
            }}
          />
        )}
      </div>

      <ClosedDealsModal 
        isOpen={isArchivedOpen}
        onClose={() => setIsArchivedOpen(false)}
      />

      <DealDetailSheet 
        deal={selectedDeal} 
        open={!!selectedDeal}
        onOpenChange={(open) => !open && setSelectedDeal(null)} 
      />

      <NewDealDialog 
        open={isNewDealOpen}
        onOpenChange={(open) => {
           setIsNewDealOpen(open)
           if (!open) setPreselectedStageId(undefined)
        }}
        stages={stages}
        pipelineId={boardData?.pipelineId}
        defaultStageId={preselectedStageId}
      />
    </div>
  )
}
