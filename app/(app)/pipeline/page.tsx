"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { DealDetailSheet } from "@/components/pipeline/DealDetailSheet"
import { type Deal } from "@/components/pipeline/DealCard"
import { cn } from "@/lib/utils"

function KPICard({
  label, value, icon, color = "#ffc880"
}: {
  label: string; value: string | number; icon: string; color?: string
}) {
  return (
    <div className="bg-surface-container border border-white/5 rounded-xl p-6 hover:bg-surface-container-high transition-all group">
      <div className="flex items-center justify-between mb-4">
        <span className="material-symbols-outlined text-[24px]" style={{ color }}>{icon}</span>
        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest leading-none">Status: OK</span>
      </div>
      <div className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold mb-1">{label}</div>
      <div className="text-3xl font-bold text-white tracking-tight font-mono">{value}</div>
    </div>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [showNewColumnModal, setShowNewColumnModal] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [selectedColor, setSelectedColor] = useState("#f5a623")
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const { data: boardData, isLoading, refetch } = useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: async () => {
      const res = await fetch("/api/pipeline/stages")
      if (!res.ok) throw new Error("Falha ao carregar pipeline")
      return res.json()
    },
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
  const overdueCount = allOpen.filter(d => d.prioridade === "ALTA").length

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* HEADER ESCOLTRAN */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline Comercial</h1>
          <p className="text-slate-400 text-sm mt-1">Gestão de Oportunidades • <span className="font-mono text-[11px] text-amber-500 uppercase font-bold tracking-widest ml-1">Modo Kanban</span></p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNewColumnModal(true)}
            className="bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-lg px-5 py-2.5 font-bold hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2 text-[13px]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Nova Coluna</span>
          </button>

          <button className="bg-primary-container text-on-primary-container font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-amber-500/10 text-[13px]">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>Novo Card</span>
          </button>
          
          <button 
            onClick={() => refetch()}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/5 bg-surface-container text-slate-400 hover:text-white transition-all"
          >
            <span className={cn("material-symbols-outlined", isLoading && "animate-spin")}>refresh</span>
          </button>
        </div>
      </header>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <KPICard label="Total Leads" value={allOpen.length} icon="layers" color="#ffc880" />
        <KPICard label="Volume Financeiro" value={totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} icon="payments" color="#7ae982" />
        <KPICard label="Leads Críticos" value={overdueCount} icon="priority_high" color="#ffb4ab" />
      </div>

      {/* BOARD AREA */}
      <div className="min-h-[600px] bg-surface-container-lowest/50 rounded-2xl border border-dashed border-white/5 p-2">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-surface-container rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <KanbanBoard 
            stages={stages} 
            onDealClick={(deal) => setSelectedDeal(deal)}
            onAddDeal={(stageId) => {}}
          />
        )}
      </div>

      {selectedDeal && (
        <DealDetailSheet 
          deal={selectedDeal} 
          onClose={() => setSelectedDeal(null)} 
        />
      )}

      {/* MODAL NOVA COLUNA */}
      {showNewColumnModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
           <div className="bg-surface-container border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold text-white mb-6">Criar Coluna</h2>
              <div className="space-y-6">
                 <div>
                    <label className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2 block">Nome da Coluna</label>
                    <input 
                      type="text" 
                      className="bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface focus:border-amber-500/50 outline-none w-full"
                      placeholder="Ex: Qualificação"
                      value={newColumnName}
                      onChange={e => setNewColumnName(e.target.value)}
                    />
                 </div>
                 <div className="flex gap-4">
                    <button className="flex-1 bg-slate-800 text-slate-400 font-bold py-3 rounded-lg text-sm" onClick={() => setShowNewColumnModal(false)}>Cancelar</button>
                    <button className="flex-1 bg-primary-container text-on-primary-container font-bold py-3 rounded-lg text-sm shadow-lg shadow-amber-500/10">Salvar Coluna</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
