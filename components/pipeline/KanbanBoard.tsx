"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DealCard, type Deal } from "./DealCard"
import { Plus } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

export interface Stage {
  id: string
  name: string
  color: string
  deals: Deal[]
}

interface KanbanBoardProps {
  stages: Stage[]
  onDealMove?: (dealId: string, fromStageId: string, toStageId: string) => void
  onAddDeal?: (stageId: string) => void
  onAddStage?: () => void
  onDealClick?: (deal: Deal) => void
}

function KanbanColumn({ stage, children, onAddDeal }: { stage: Stage, children: React.ReactNode, onAddDeal?: (id: string) => void }) {
  const { setNodeRef } = useSortable({ id: stage.id })
  const totalValue = stage.deals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0)

  const statusColors: Record<string, string> = {
    PROSPECT: "#4299e1",
    QUALIFICATION: "#9f7aea",
    MEETING: "#f6ad55",
    PROPOSAL: "#48c78e",
    NEGOTIATION: "#f87171",
    FOLLOW_UP: "#68d391"
  }
  const dotColor = statusColors[stage.id] || stage.color || "#4299e1"

  return (
    <div className="min-w-[300px] w-[300px] flex flex-col h-full shrink-0">
      {/* COLUMN CONTAINER — REFINED HARMONY */}
      <div className="bg-[var(--bg-surface)]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-[16px] flex flex-col h-full shadow-2xl transition-all">
        {/* REFINED HEADER */}
        <div className="flex items-center justify-between pb-[14px] border-b border-white/[0.05] mb-2 px-1">
           <div className="flex items-center gap-3">
              <div className="w-[10px] h-[10px] rounded-full shadow-[0_0_12px_rgba(255,255,255,0.1)] shrink-0" style={{ backgroundColor: dotColor }} />
              <span className="text-[15px] font-semibold text-[var(--text-primary)] leading-none truncate max-w-[140px]">{stage.name}</span>
           </div>
           
           <div className="h-[22px] px-2 rounded-[6px] bg-white/[0.05] flex items-center justify-center border border-white/[0.05]">
              <span className="text-[11px] font-bold text-[var(--text-muted)]">{stage.deals.length}</span>
           </div>
        </div>

        {/* VALUE LINE — REFINED */}
        <div className="flex items-center justify-between px-1 py-[8px] pb-[12px]">
           <span className="text-[12px] font-medium text-[var(--text-muted)]">Valor total</span>
           <span className="text-[13px] font-bold tracking-tight" style={{ color: dotColor }}>
             {formatCurrency(totalValue)}
           </span>
        </div>

        {/* DROPPABLE AREA — MORE SPACE BETWEEN CARDS */}
        <div 
          ref={setNodeRef}
          className="flex-1 flex flex-col gap-3 overflow-y-auto scrollbar-hide py-1"
        >
          <div className="flex flex-col gap-3 mb-2">
             {children}
          </div>
          
          {/* REFINED ADD DEAL BUTTON */}
          <button 
            onClick={() => onAddDeal?.(stage.id)}
            className="w-full p-[12px] border border-dashed border-white/[0.1] hover:border-[var(--pipeline-blue)]/40 hover:bg-[var(--pipeline-blue)]/5 rounded-[12px] flex items-center justify-center gap-2 text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--pipeline-blue)] transition-all mt-2"
          >
             <Plus size={14} /> Adicionar novo card
          </button>
        </div>
      </div>
    </div>
  )
}

export function KanbanBoard({ stages: initialStages, onDealMove, onAddDeal, onAddStage, onDealClick }: KanbanBoardProps) {
  const [stages, setStages] = useState(initialStages)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const findStageByDealId = (dealId: string) =>
    stages.find((s) => s.deals.some((d) => d.id === dealId))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const activeStage = findStageByDealId(active.id as string)
    const overStage = stages.find((s) => s.id === over.id) || findStageByDealId(over.id as string)
    if (!activeStage || !overStage || activeStage.id === overStage.id) return
    const deal = activeStage.deals.find((d) => d.id === active.id)
    if (!deal) return
    setStages(prev => prev.map(s => {
      if (s.id === activeStage.id) return { ...s, deals: s.deals.filter(d => d.id !== active.id) }
      if (s.id === overStage.id) return { ...s, deals: [...s.deals, { ...deal, stageId: overStage.id }] }
      return s
    }))
    onDealMove?.(deal.id, activeStage.id, overStage.id)
  }

  const activeDeal = activeId ? stages.flatMap(s => s.deals).find(d => d.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full pb-10">
        <SortableContext items={stages.flatMap(s => s.deals.map(d => d.id))} strategy={verticalListSortingStrategy}>
          {stages.map((stage) => (
            <KanbanColumn key={stage.id} stage={stage} onAddDeal={onAddDeal}>
              {stage.deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onClick={() => onDealClick?.(deal)} />
              ))}
            </KanbanColumn>
          ))}
        </SortableContext>

        {/* REFINED NEW COLUMN PLACEHOLDER */}
        <div className="min-w-[280px] w-[280px]">
           <button 
             onClick={onAddStage}
             className="w-full h-[600px] border border-dashed border-white/[0.12] hover:border-[#3B82F6] hover:bg-[#3B82F6]/[0.02] rounded-[12px] flex flex-col items-center justify-center gap-4 transition-all group"
           >
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white/[0.02] group-hover:bg-[#3B82F6]/[0.05]">
                <Plus size={24} className="text-[#8B949E] group-hover:text-[#3B82F6]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8B949E] group-hover:text-[#3B82F6]">Nova Coluna</span>
           </button>
        </div>
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="scale-105 rotate-2 opacity-90">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
