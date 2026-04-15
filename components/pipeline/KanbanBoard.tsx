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

  // Mapping status colors based on stage name/id if possible, or using stage.color
  const statusColors: Record<string, string> = {
    PROSPECT: "#6b7280",
    QUALIFICATION: "#f2994a",
    PROPOSAL: "#63b3ed",
    NEGOTIATION: "#27ae60",
    FOLLOW_UP: "#eb5757"
  }
  const dotColor = statusColors[stage.id] || stage.color || "#6b7280"

  return (
    <div className="min-w-[280px] w-[280px] flex flex-col h-full">
      {/* COLUMN HEADER */}
      <div className="flex flex-col gap-2 px-1 mb-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2.5">
              <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: dotColor }} />
              <span className="text-[13px] font-semibold text-white uppercase tracking-[0.08em]">{stage.name}</span>
           </div>
           {/* REFINED NUMERIC BADGE 20x20 */}
           <div className="w-5 h-5 rounded-[6px] bg-white/[0.08] flex items-center justify-center">
              <span className="text-[11px] font-medium text-white">{stage.deals.length}</span>
           </div>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
           <span className="text-[12px] font-medium text-[#27ae60] flex items-center gap-1">
             <span className="text-[10px]">↑</span> {formatCurrency(totalValue)}
           </span>
        </div>
      </div>

      {/* REFINED DROPPABLE AREA */}
      <div 
        ref={setNodeRef}
        className="flex-1 bg-[#0f1117] rounded-[12px] p-3 min-h-[500px] flex flex-col gap-2 overflow-y-auto scrollbar-hide"
      >
        <div className="flex flex-col gap-2 mb-2">
           {children}
        </div>
        
        {/* REFINED ADD DEAL BUTTON */}
        <button 
          onClick={() => onAddDeal?.(stage.id)}
          className="w-full p-[10px] border-[0.5px] border-dashed border-white/[0.12] hover:border-white/[0.25] hover:bg-white/[0.03] rounded-[10px] flex items-center justify-center gap-2 text-[12px] font-normal text-white/30 hover:text-white/60 transition-all mt-1"
        >
           <Plus size={14} /> Adicionar Card
        </button>
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
