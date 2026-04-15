"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { 
  DollarSign, 
  LayoutGrid, 
  Plus, 
  AlertTriangle, 
  ChevronDown, 
  Grid,
  Clock,
  TrendingUp
} from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { DealDetailSheet } from "@/components/pipeline/DealDetailSheet"
import { type Deal } from "@/components/pipeline/DealCard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function KPICard({ label, value, icon: Icon, type = "default" }: any) {
  const configs: any = {
    blue: { bg: "rgba(66,153,225,0.12)", icon: "#4299e1", text: "#ffffff" },
    green: { bg: "rgba(72,199,142,0.12)", icon: "#48c78e", text: "#48c78e" },
    red: { bg: "rgba(235,87,87,0.12)", icon: "#eb5757", text: "#f87171" },
    default: { bg: "rgba(255,255,255,0.06)", icon: "rgba(255,255,255,0.40)", text: "#ffffff" }
  }
  const config = configs[type] || configs.default

  return (
    <div className="bg-[#111520] border border-white/[0.09] rounded-[12px] p-[18px] px-[20px] flex-1 flex items-center gap-[16px]">
      <div 
        className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shrink-0" 
        style={{ backgroundColor: config.bg, color: config.icon }}
      >
         <Icon size={20} />
      </div>
      <div>
        <div className="text-[11px] font-medium text-white/40 uppercase tracking-[0.09em] leading-none mb-1.5">{label}</div>
        <div className="text-[26px] font-bold tracking-tight leading-none" style={{ color: config.text }}>{value}</div>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [activeBoard, setActiveBoard] = useState("Pipeline Principal")
  
  // Modals state
  const [isAddStageOpen, setIsAddStageOpen] = useState(false)
  const [isAddDealOpen, setIsAddDealOpen] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
  
  // Detail Sheet state
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { data: boardData, isLoading } = useQuery({
    queryKey: ["pipeline-stages", activeBoard],
    queryFn: async () => {
      const res = await fetch("/api/pipeline/stages")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
  })

  const stages = boardData?.stages || []
  const currentPipelineId = boardData?.pipelineId

  // Mutations
  const moveDealMutation = useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string, stageId: string }) => {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      })
      if (!res.ok) throw new Error("Falha ao mover")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
    }
  })

  const addStageMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/pipeline/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pipelineId: currentPipelineId }),
      })
      if (!res.ok) throw new Error("Falha ao criar coluna")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
      toast({ title: "Coluna criada!", description: "A nova etapa foi adicionada ao board." })
    }
  })

  const addDealMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, pipelineId: currentPipelineId }),
      })
      if (!res.ok) throw new Error("Falha ao criar card")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
      toast({ title: "Card adicionado!", description: "O novo deal já está no pipeline." })
    }
  })

  const boardStages: Stage[] = stages.map((s: any) => ({
    id: s.id,
    name: s.name,
    color: s.color || "#4299e1",
    deals: (s.deals || []).map((d: any) => ({
      ...d,
      valorEstimado: Number(d.valorEstimado) || 0,
      prioridade: (d.prioridade?.toUpperCase() || "MEDIA") as any,
      status: (d.status?.toUpperCase() || "OPEN") as any,
    }))
  }))

  const deals = stages.flatMap((s: any) => s.deals || [])
  const totalValue = deals.reduce((acc: number, d: any) => acc + (Number(d.valorEstimado) || 0), 0)
  const expiredCount = deals.filter((d: any) => (d.prioridade === "ALTA" && d.status === "OPEN")).length

  const handleAddStage = () => {
    const name = window.prompt("Nome da nova coluna:")
    if (name) addStageMutation.mutate(name)
  }

  const handleAddDeal = (stageId: string) => {
    setSelectedStageId(stageId)
    const titulo = window.prompt("Título do Card:")
    const valor = window.prompt("Valor Estimado:")
    if (titulo) {
      addDealMutation.mutate({ 
        titulo, 
        valorEstimado: valor ? parseFloat(valor) : 0,
        stageId 
      })
    }
  }

  return (
    <div className="pipeline-layout flex flex-col min-h-screen bg-[#090b11] text-white">
      {/* ════════════════════════════════════════
          TOPBAR DA PÁGINA (RESPIRO PREMIUM)
          ════════════════════════════════════════ */}
      <header className="px-[32px] pt-[40px] pb-[32px]">
        <div className="flex items-start justify-between">
           <div>
              <h1 className="text-[36px] font-bold tracking-tight leading-none mb-3">Pipeline</h1>
              <p className="text-[14px] text-white/40 font-medium">Gestão de oportunidades · Visão Kanban</p>
           </div>

           <div className="flex items-center gap-[12px]">
               {/* PILL: PIPELINE PRINCIPAL */}
               <button className="flex items-center gap-2 px-[20px] py-[11px] bg-[#1a1a24] border border-white/10 rounded-xl text-[13px] font-semibold text-white/90 hover:bg-white/[0.06] transition-all">
                 <Clock size={16} className="text-[#818cf8]" />
                 {activeBoard}
                 <ChevronDown size={14} className="text-white/20 ml-2" />
               </button>

               {/* PILL: NOVA COLUNA */}
               <button 
                 onClick={handleAddStage}
                 className="flex items-center gap-2 px-[20px] py-[11px] bg-[#1a1a24] border border-white/10 rounded-xl text-[13px] font-semibold text-white/90 hover:bg-white/[0.06] transition-all"
               >
                  <Plus size={18} className="text-white/40" />
                  Nova Coluna
               </button>

               {/* PILL: NOVO DEAL (IMAGE 2 VIBRANCE) */}
               <button 
                 className="flex items-center gap-2 px-[24px] py-[11px] bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-[13px] rounded-xl transition-all shadow-xl shadow-[#4f46e5]/20"
               >
                  <Plus size={18} strokeWidth={3} /> Novo Deal
               </button>
           </div>
        </div>
      </header>

      {/* ════════════════════════════════════════
          BARRA DE MÉTRICAS (LARGE SCALE GRID)
          ════════════════════════════════════════ */}
      <div className="px-[32px] mb-[40px]">
        <div className="grid grid-cols-3 gap-[20px]">
           {/* Card 1 — Oportunidades */}
           <div className="bg-[#111118]/70 border border-[#1e1e24] rounded-[16px] p-[28px] flex items-center gap-6 shadow-2xl transition-all hover:border-white/10 group">
             <div className="w-[56px] h-[56px] rounded-[16px] bg-[#1a1a2e] flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-[#1a1a3a] transition-colors">
                <LayoutGrid size={24} className="text-[#818cf8]" />
             </div>
             <div>
               <p className="text-[12px] font-bold text-white/30 uppercase tracking-[0.1em] mb-2">OPORTUNIDADES</p>
               <div className="flex items-baseline gap-2">
                 <span className="text-[36px] font-black text-white leading-none tracking-tight">{deals.length}</span>
                 <span className="text-[14px] text-white/20 font-semibold">cards ativos</span>
               </div>
             </div>
           </div>

           {/* Card 2 — Valor Total */}
           <div className="bg-[#111118]/70 border border-[#1e1e24] rounded-[16px] p-[28px] flex items-center gap-6 shadow-2xl transition-all hover:border-white/10 group">
             <div className="w-[56px] h-[56px] rounded-[16px] bg-[#0f1e14] flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-[#0f1e1a] transition-colors">
                <TrendingUp size={24} className="text-[#4ade80]" />
             </div>
             <div>
               <p className="text-[12px] font-bold text-white/30 uppercase tracking-[0.1em] mb-2">VALOR TOTAL</p>
               <div className="flex items-baseline gap-2">
                 <span className="text-[36px] font-black text-[#4ade80] leading-none tracking-tight">R$ {totalValue.toLocaleString('pt-BR')}</span>
                 <span className="text-[14px] text-white/20 font-semibold">em aberto</span>
               </div>
             </div>
           </div>

           {/* Card 3 — Alertas */}
           <div className="bg-[#111118]/70 border border-[#1e1e24] rounded-[16px] p-[28px] flex items-center gap-6 shadow-2xl transition-all hover:border-white/10 group">
             <div className="w-[56px] h-[56px] rounded-[16px] bg-[#1f1010] flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-[#2a1010] transition-colors">
                <AlertTriangle size={24} className="text-[#f87171]" />
             </div>
             <div>
               <p className="text-[12px] font-bold text-white/30 uppercase tracking-[0.1em] mb-2">ALERTAS</p>
               <div className="flex items-baseline gap-2">
                 <span className="text-[36px] font-black text-[#f87171] leading-none tracking-tight">{expiredCount}</span>
                 <span className="text-[14px] text-white/20 font-semibold">cards +30 dias</span>
               </div>
             </div>
           </div>
        </div>

        {/* PROGRESS BAR (IMAGE 2 INTEGRATION) */}
        <div className="mt-[32px] px-2">
          <div className="h-[5px] w-full bg-[#1e1e24] rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#4f46e5] to-[#818cf8] shadow-[0_0_20px_rgba(79,70,229,0.6)] transition-all duration-1000"
              style={{ width: '45%' }}
            />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          KANBAN BOARD (IMAGE 2 FULL SCALE)
          ════════════════════════════════════════ */}
      <div className="flex-1 overflow-x-auto kanban-scrollbar pl-[32px] pb-[40px]">
        {isLoading ? (
          <div className="flex gap-[20px] h-full">
             {[1,2,3,4,5].map(i => <div key={i} className="w-[300px] h-[calc(100vh-450px)] rounded-[20px] bg-[#111118]/40 animate-pulse border border-white/5" />)}
          </div>
        ) : (
          <div className="h-full inline-block min-w-full">
            <KanbanBoard 
              key={stages.map((s: any) => s.id + s.deals?.length).join('-')}
              stages={boardStages} 
              onDealMove={(dealId, _, stageId) => moveDealMutation.mutate({ dealId, stageId })}
              onAddDeal={handleAddDeal}
              onAddStage={handleAddStage}
              onDealClick={(deal) => {
                 setSelectedDeal(deal)
                 setIsDetailOpen(true)
              }}
            />
          </div>
        )}
      </div>

      <DealDetailSheet 
        deal={selectedDeal}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
