"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { DealCard, Deal } from "./DealCard"

export interface Stage {
  id: string
  name: string
  color: string
  deals: Deal[]
}

interface KanbanBoardProps {
  stages: Stage[]
  onDealMove: (dealId: string, oldStageId: string, newStageId: string) => void
  onAddDeal?: (stageId: string) => void
  onDealClick?: (deal: Deal) => void
}

export function KanbanColumn({ 
  id, 
  deals, 
  children 
}: { 
  id: string; 
  deals: Deal[]; 
  children: React.ReactNode 
}) {
  const { setNodeRef } = useSortable({
    id,
    data: { type: "column", columnId: id }
  })

  return (
    <div ref={setNodeRef} className="flex-1 min-h-[500px]">
      {children}
    </div>
  )
}

export function KanbanBoard({ stages: initialStages, onDealMove, onDealClick, onAddDeal }: KanbanBoardProps) {
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

  useEffect(() => { setStages(initialStages) }, [initialStages])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const dealId = active.id
    for (const stage of stages) {
      const deal = stage.deals.find((d) => d.id === dealId)
      if (deal) { setActiveDeal(deal); break }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    let sourceStageId = ""
    let destStageId = ""

    for (const stage of stages) {
      if (stage.deals.find(d => d.id === activeId)) sourceStageId = stage.id
      if (stage.id === overId || stage.deals.find(d => d.id === overId)) destStageId = stage.id
    }

    if (!sourceStageId || !destStageId || sourceStageId === destStageId) return

    setStages(prev => {
      const sourceStage = prev.find(s => s.id === sourceStageId)!
      const destStage = prev.find(s => s.id === destStageId)!
      const activeDeal = sourceStage.deals.find(d => d.id === activeId)!

      return prev.map(s => {
        if (s.id === sourceStageId) return { ...s, deals: s.deals.filter(d => d.id !== activeId) }
        if (s.id === destStageId) return { ...s, deals: [...s.deals, { ...activeDeal, stageId: destStageId }] }
        return s
      })
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
     setActiveDeal(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-8 h-full min-h-[calc(100vh-320px)] overflow-x-auto pb-8 scrollbar-hide">
        {stages.map((stage) => {
          const totalValue = stage.deals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0)

          return (
            <div key={stage.id} className="flex flex-col min-w-[320px] max-w-[320px]">
              {/* STAGE HEADER ESCOLTRAN STYLE */}
              <div className="mb-6 px-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" style={{ backgroundColor: stage.color || '#F97316' }} />
                    <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#A3A3A3] italic">
                      {stage.name}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono font-black text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded-lg border border-[#F97316]/20">
                    {stage.deals.length}
                  </span>
                </div>
                
                <div className="text-[15px] font-mono font-black text-[#F2F2F2] tracking-widest pl-5">
                   {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </div>
              </div>

              {/* COLUMN BODY */}
              <KanbanColumn id={stage.id} deals={stage.deals}>
                <div className="flex flex-col gap-4 min-h-[200px] p-2 rounded-2xl bg-[#121212] border border-white/[0.03]">
                  <SortableContext id={stage.id} items={stage.deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                    {stage.deals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} onClick={() => onDealClick?.(deal)} />
                    ))}
                  </SortableContext>
                  
                  {/* ADD CARD BUTTON LARANJA */}
                  <button 
                    onClick={() => onAddDeal?.(stage.id)}
                    className="flex items-center justify-center gap-2 w-full py-5 border border-dashed border-white/5 rounded-2xl text-[#404040] hover:text-[#F97316] hover:bg-[#F97316]/5 transition-all group cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono">Expandir Dataset</span>
                  </button>
                </div>
              </KanbanColumn>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="rotate-3 scale-105 shadow-2xl">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
