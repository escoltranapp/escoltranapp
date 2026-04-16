"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { DealDetailSheet } from "@/components/pipeline/DealDetailSheet"
import { type Deal } from "@/components/pipeline/DealCard"
import { cn } from "@/lib/utils"

function KPICard({
  label, value, icon, trend, color = "#F97316"
}: {
  label: string; value: string | number; icon: string; trend?: string; color?: string
}) {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 hover:bg-[#262626] transition-all group overflow-hidden shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
        </div>
        {trend && (
           <div className="px-2 py-0.5 rounded-full text-[10px] font-black font-mono text-[#F97316] bg-[#F97316]/5 border border-[#F97316]/10 uppercase tracking-widest">
              {trend}
           </div>
        )}
      </div>
      <div>
         <div className="text-[10px] font-mono text-[#6B7280] uppercase tracking-[0.2em] font-black mb-1 italic">{label}</div>
         <div className="text-2xl font-black text-white tracking-tighter font-mono">{value}</div>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [pipelineSelection, setPipelineSelection] = useState("vendas-matriz")

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

  const stages: Stage[] = (boardData?.stages || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    color: s.color || "#F97316",
    deals: (s.deals || []).map((d: any) => ({
      ...d,
      valorEstimado: Number(d.valorEstimado) || 0,
       prioridade: (d.prioridade?.toUpperCase() || "MEDIA") as "ALTA" | "MEDIA" | "BAIXA",
      status: (d.status?.toUpperCase() || "OPEN") as "OPEN" | "WON" | "LOST",
    })),
  }))

  const allOpen = stages.flatMap(s => s.deals.filter(d => d.status === "OPEN"))
  const totalValue = allOpen.reduce((a, d) => a + (d.valorEstimado || 0), 0)

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      
      {/* HEADER ESCOLTRAN STYLE */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Fluxo Operacional</h1>
           <p className="text-[#6B7280] text-[15px] mt-2 font-bold tracking-tight">Gestão de pipelines e orquestração de deals Escoltran</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* SELETOR DE PIPELINE */}
          <select 
            value={pipelineSelection}
            onChange={(e) => setPipelineSelection(e.target.value)}
            className="bg-[#1A1A1A] text-[#F2F2F2] border border-[#262626] rounded-xl px-4 py-3 text-[12px] font-black uppercase tracking-widest focus:border-[#F97316]/50 outline-none cursor-pointer appearance-none min-w-[200px]"
          >
            <option value="vendas-matriz">Vendas Matriz</option>
            <option value="pos-vendas">Pós-Vendas / CS</option>
            <option value="retencao">Fluxo Retenção</option>
          </select>

          <button className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#F97316]/20 text-[12px] uppercase tracking-widest">
            <span className="material-symbols-outlined text-[20px] font-black">add_box</span>
            <span>Novo Registro</span>
          </button>
          
          <button 
            onClick={() => refetch()}
            className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/5 bg-[#1A1A1A] text-[#404040] hover:text-[#F97316] transition-all group"
          >
            <span className={cn("material-symbols-outlined text-[22px]", isLoading && "animate-spin font-black")}>sync</span>
          </button>
        </div>
      </header>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <KPICard label="Dataset Aberto" value={allOpen.length} icon="dataset" trend="Active" />
        <KPICard label="Volume em Fluxo" value={totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} icon="payments" trend="+8.2%" />
        <KPICard label="Network Active" value={boardData?.totalDeals || 0} icon="hub" trend="Live Sync" />
        <KPICard label="Eficiência Engine" value="84%" icon="settings_input_component" trend="Optimized" />
      </div>

      {/* BOARD AREA */}
      <div className="min-h-[600px] bg-[#0A0A0A] rounded-3xl border border-white/[0.03] p-4 relative overflow-hidden group">
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
            onAddDeal={(stageId) => {}}
          />
        )}
      </div>

      <DealDetailSheet 
        deal={selectedDeal} 
        open={!!selectedDeal}
        onOpenChange={(open) => !open && setSelectedDeal(null)} 
      />
    </div>
  )
}
