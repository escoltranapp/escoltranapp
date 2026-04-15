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
  Grid
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

// ─── STAGE CONFIG ──────────────────────────────────────────────
const STAGES_CONFIG = [
  { id: "PROSPECT", name: "NOVO LEAD", color: "#3B82F6" },
  { id: "QUALIFICATION", name: "QUALIFICAÇÃO", color: "#8B5CF6" },
  { id: "MEETING", name: "REUNIÃO MARCADA", color: "#F59E0B" },
  { id: "PROPOSAL", name: "PROPOSTA", color: "#10B981" },
  { id: "NEGOTIATION", nafunction KPICard({ label, value, icon: Icon, type = "default" }: any) {
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
    <div className="pipeline-layout p-[28px] pt-[28px] space-y-[28px]">
      {/* PAGE HEADER */}
      <header className="flex items-start justify-between">
        <div>
           <h1 className="text-[32px] font-bold text-white leading-none">Pipeline</h1>
           <p className="text-[11px] font-normal text-white/35 uppercase tracking-[0.1em] mt-1">Gestão de Oportunidades • Visão Kanban</p>
        </div>

        <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-[14px] py-[8px] bg-white/5 border border-white/10 rounded-[8px] text-[13px] font-medium text-white hover:bg-white/[0.08] transition-all outline-none">
                  <div className="w-2 h-2 rounded-full bg-[#4299e1]" />
                  {activeBoard}
                  <ChevronDown size={14} className="opacity-40 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#111520] border-white/10 text-white min-w-[200px]">
                <DropdownMenuItem onClick={() => setActiveBoard("Pipeline Principal")} className="hover:bg-white/5 cursor-pointer">
                  Pipeline Principal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button 
              onClick={handleAddStage}
              className="flex items-center gap-2 px-[18px] py-[8px] bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-[13px] rounded-[8px] transition-all active:scale-95"
            >
               <Plus size={16} /> Nova Coluna
            </button>

            <button 
              onClick={() => toast({ title: "Módulo em Breve", description: "Boards adicionais serão liberados em breve." })}
              className="flex items-center gap-2 px-[14px] py-[8px] bg-transparent border border-white/15 hover:bg-white/5 text-white/70 font-medium text-[13px] rounded-[8px] transition-all active:scale-95"
            >
               <Plus size={16} /> Novo Board
            </button>
        </div>
      </header>

      {/* METRICS BAR */}
      <div className="flex gap-[16px]">
         <KPICard label="Total de Cards" value={deals.length} icon={LayoutGrid} type="blue" />
         <KPICard label="Valor Total" value={formatCurrency(totalValue)} icon={DollarSign} type="green" />
         <KPICard label="Cards Vencidos" value={expiredCount} icon={AlertTriangle} type="red" />
      </div>

      {/* KANBAN BOARD */}
      <div className="overflow-x-auto kanban-scrollbar -mx-1 px-1">
        {isLoading ? (
          <div className="flex gap-[12px]">
             {[1,2,3,4].map(i => <div key={i} className="min-w-[280px] h-[600px] rounded-[12px] bg-[#111520] animate-pulse" />)}
          </div>
        ) : (
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
