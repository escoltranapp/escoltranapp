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
import { Plus, TrendingUp, MoreHorizontal } from "lucide-react"
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
    <div className="min-w-[300px] w-[300px] flex flex-col h-full">
      {/* COLUMN HEADER */}
      <div className="kanban-col-header flex flex-col gap-2 px-1">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="stage-dot" style={{ backgroundColor: stage.color, boxShadow: `0 0 10px ${stage.color}40` }} />
              <span className="text-[12px] font-black text-white uppercase tracking-[0.15em]">{stage.name}</span>
           </div>
           <div className="bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/5">
              <span className="text-[10px] font-bold text-white/40">{stage.deals.length}</span>
           </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
           <TrendingUp size={14} style={{ color: stage.color }} className="opacity-60" />
           <span className="text-[14px] font-black" style={{ color: stage.color }}>
             {formatCurrency(totalValue)}
           </span>
        </div>
      </div>

      {/* DROPPABLE AREA */}
      <div 
        ref={setNodeRef}
        className="flex-1 bg-[#161B22]/40 border border-white/[0.03] rounded-[16px] p-3 min-h-[500px] flex flex-col gap-1 overflow-y-auto scrollbar-hide"
      >
        {children}
        
        {/* ADD DEAL BUTTON */}
        <button 
          onClick={() => onAddDeal?.(stage.id)}
          className="w-full py-4 mt-2 border border-dashed border-white/[0.05] hover:border-white/20 hover:bg-white/[0.02] rounded-[12px] flex items-center justify-center gap-2 text-[11px] font-bold text-white/10 hover:text-white/40 transition-all uppercase tracking-widest"
        >
           <Plus size={16} /> Adicionar Card
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
      <div className="flex gap-8 h-full pb-10">
        <SortableContext items={stages.flatMap(s => s.deals.map(d => d.id))} strategy={verticalListSortingStrategy}>
          {stages.map((stage) => (
            <KanbanColumn key={stage.id} stage={stage} onAddDeal={onAddDeal}>
              {stage.deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </KanbanColumn>
          ))}
        </SortableContext>

        {/* NEW COLUMN PLACEHOLDER */}
        <div className="min-w-[300px] w-[300px]">
           <button 
             onClick={onAddStage}
             className="w-full h-[600px] border border-dashed border-white/[0.05] hover:border-white/20 hover:bg-white/[0.02] rounded-[16px] flex flex-col items-center justify-center gap-4 transition-all group"
           >
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-all">
                <Plus size={24} className="text-white/10 group-hover:text-white/40" />
              </div>
              <span className="text-[12px] font-black uppercase tracking-[0.3em] text-white/10 group-hover:text-white/40">Nova Coluna</span>
           </button>
        </div>
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="scale-105 rotate-3 opacity-90 shadow-2xl">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
