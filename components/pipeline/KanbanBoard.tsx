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
import { Plus, TrendingUp } from "lucide-react"
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
}

function KanbanColumn({ stage, children, onAddDeal }: { stage: Stage, children: React.ReactNode, onAddDeal?: (id: string) => void }) {
  const { setNodeRef } = useSortable({ id: stage.id })
  const totalValue = stage.deals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0)

  return (
    <div className="min-w-[280px] w-[280px] flex flex-col h-full">
      {/* COLUMN HEADER */}
      <div className="kanban-col-header flex flex-col gap-2 px-1 mb-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color, boxShadow: `0 0 10px ${stage.color}40` }} />
              <span className="text-[12px] font-black text-white uppercase tracking-[0.1em]">{stage.name}</span>
           </div>
           {/* REFINED NUMERIC BADGE */}
           <div className="bg-white/[0.08] px-2 py-0.5 rounded-[20px] min-w-[24px] flex items-center justify-center">
              <span className="text-[12px] font-semibold text-[#8B949E]">{stage.deals.length}</span>
           </div>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
           <TrendingUp size={12} style={{ color: stage.color }} className="opacity-60" />
           <span className="text-[13px] font-black" style={{ color: stage.color }}>
             {formatCurrency(totalValue)}
           </span>
        </div>
      </div>

      {/* REFINED DROPPABLE AREA */}
      <div 
        ref={setNodeRef}
        className="flex-1 bg-[#161B22] border border-white/[0.07] rounded-[12px] p-3 min-h-[500px] flex flex-col gap-1 overflow-y-auto scrollbar-hide"
      >
        <div className="flex flex-col gap-3 mb-2">
           {children}
        </div>
        
        {/* REFINED ADD DEAL BUTTON */}
        <button 
          onClick={() => onAddDeal?.(stage.id)}
          className="w-full py-2.5 border border-dashed border-white/[0.15] hover:border-[#3B82F6] hover:bg-[#3B82F6]/[0.06] rounded-[8px] flex items-center justify-center gap-2 text-[11px] font-bold text-[#8B949E] hover:text-[#3B82F6] transition-all"
        >
           <Plus size={14} /> Adicionar Card
        </button>
      </div>
    </div>
  )
}

export function KanbanBoard({ stages: initialStages, onDealMove, onAddDeal, onAddStage }: KanbanBoardProps) {
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
                <DealCard key={deal.id} deal={deal} />
              ))}
            </KanbanColumn>
          ))}
        </SortableContext>

        {/* REFINED NEW COLUMN PLACEHOLDER */}
        <div className="min-w-[280px] w-[280px]">
           <button 
             onClick={onAddStage}
             className="w-full h-[600px] border border-dashed border-white/[0.12] hover:border-[#3B82F6] hover:bg-transparent rounded-[12px] flex flex-col items-center justify-center gap-4 transition-all group"
           >
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all">
                <Plus size={24} className="text-[#8B949E] group-hover:text-[#3B82F6]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.1em] text-[#8B949E] group-hover:text-[#3B82F6]">Nova Coluna</span>
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
