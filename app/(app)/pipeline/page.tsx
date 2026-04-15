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
          TOPBAR DA PÁGINA (RESPIRO INDUSTRIAL)
          ════════════════════════════════════════ */}
      <header className="px-[64px] pt-[80px] pb-[48px]">
        <div className="flex items-start justify-between max-w-[1800px] mx-auto w-full">
           <div>
              <h1 className="text-[52px] font-black tracking-tighter leading-none mb-6 uppercase">Pipeline</h1>
              <p className="text-[16px] text-white/30 font-bold tracking-[0.2em] uppercase">Gestão de oportunidades · Visão Kanban</p>
           </div>

           <div className="flex items-center gap-[20px]">
               {/* PILL: PIPELINE PRINCIPAL */}
               <button className="flex items-center gap-3 px-[28px] py-[16px] bg-[#1a1a24] border border-white/10 rounded-2xl text-[15px] font-black text-white/90 hover:bg-white/[0.1] transition-all shadow-2xl">
                 <Clock size={20} className="text-[#818cf8]" />
                 {activeBoard}
                 <ChevronDown size={14} className="text-white/20 ml-2" />
               </button>

               {/* PILL: NOVO DEAL (IMAGE 2 SCALE) */}
               <button 
                 className="flex items-center gap-4 px-[40px] py-[16px] bg-[#4f46e5] hover:bg-[#4338ca] text-white font-black text-[15px] rounded-2xl transition-all shadow-[0_15px_35px_rgba(79,70,229,0.5)] active:scale-95 uppercase tracking-wider"
               >
                  <Plus size={22} strokeWidth={4} /> Novo Deal
               </button>
           </div>
        </div>
      </header>

      {/* ════════════════════════════════════════
          BARRA DE MÉTRICAS (HUGE BLOCK SCALE)
          ════════════════════════════════════════ */}
      <div className="px-[64px] mb-[80px] max-w-[1800px] mx-auto w-full">
        <div className="grid grid-cols-3 gap-[32px]">
           {/* Card 1 — Oportunidades */}
           <div className="bg-[#111118] border border-[#1e1e24] rounded-[32px] p-[40px] min-h-[220px] flex flex-col justify-center shadow-2xl transition-all hover:border-[#818cf8]/30 group relative overflow-hidden">
             <div className="flex items-center gap-8">
               <div className="w-[80px] h-[80px] rounded-[24px] bg-[#1a1a2e] flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                  <LayoutGrid size={32} className="text-[#818cf8]" />
               </div>
               <div>
                  <p className="text-[14px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">OPORTUNIDADES</p>
                  <div className="flex items-baseline gap-4">
                    <span className="text-[64px] font-black text-white leading-none tracking-tighter">{deals.length}</span>
                    <span className="text-[16px] text-white/10 font-bold uppercase tracking-[0.2em]">Ativos</span>
                  </div>
               </div>
             </div>
           </div>

           {/* Card 2 — Valor Total */}
           <div className="bg-[#111118] border border-[#1e1e24] rounded-[32px] p-[40px] min-h-[220px] flex flex-col justify-center shadow-2xl transition-all hover:border-[#4ade80]/30 group relative overflow-hidden">
             <div className="flex items-center gap-8">
               <div className="w-[80px] h-[80px] rounded-[24px] bg-[#0f1e14] flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                  <TrendingUp size={32} className="text-[#4ade80]" />
               </div>
               <div>
                  <p className="text-[14px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">VALOR TOTAL</p>
                  <div className="flex items-baseline gap-4">
                    <span className="text-[64px] font-black text-[#4ade80] leading-none tracking-tighter">R$ {totalValue.toLocaleString('pt-BR')}</span>
                    <span className="text-[16px] text-white/10 font-bold uppercase tracking-[0.2em]">Aberto</span>
                  </div>
               </div>
             </div>
           </div>

           {/* Card 3 — Alertas */}
           <div className="bg-[#111118] border border-[#1e1e24] rounded-[32px] p-[40px] min-h-[220px] flex flex-col justify-center shadow-2xl transition-all hover:border-[#f87171]/30 group relative overflow-hidden">
             <div className="flex items-center gap-8">
               <div className="w-[80px] h-[80px] rounded-[24px] bg-[#1f1010] flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                  <AlertTriangle size={32} className="text-[#f87171]" />
               </div>
               <div>
                  <p className="text-[14px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">ALERTAS</p>
                  <div className="flex items-baseline gap-4">
                    <span className="text-[64px] font-black text-[#f87171] leading-none tracking-tighter">{expiredCount}</span>
                    <span className="text-[16px] text-white/10 font-bold uppercase tracking-[0.2em]">+30 Dias</span>
                  </div>
               </div>
             </div>
           </div>
        </div>

        {/* PROGRESS BAR (HUGE & INDUSTRIAL) */}
        <div className="mt-[64px] px-4">
          <div className="h-[8px] w-full bg-[#1e1e24] rounded-full overflow-hidden shadow-2xl">
            <div 
              className="h-full bg-gradient-to-r from-[#4f46e5] to-[#818cf8] shadow-[0_0_30px_rgba(79,70,229,1)] transition-all duration-1000"
              style={{ width: '45%' }}
            />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          KANBAN BOARD (INDUSTRIAL VERTICAL SCALE)
          ════════════════════════════════════════ */}
      <div className="flex-1 overflow-x-auto kanban-scrollbar pl-[64px] pb-[100px]">
        {isLoading ? (
          <div className="flex gap-[32px]">
             {[1,2,3,4,5].map(i => <div key={i} className="w-[340px] min-h-[1200px] rounded-[32px] bg-[#111118]/60 animate-pulse border border-white/5" />)}
          </div>
        ) : (
          <div className="min-h-[1200px] inline-block min-w-full h-full">
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
