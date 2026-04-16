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
} from "@dnd-kit/sortable"
import { KanbanColumn } from "./KanbanColumn"
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

export function KanbanBoard({ stages: initialStages, onDealMove, onDealClick, onAddDeal }: KanbanBoardProps) {
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

  useEffect(() => {
    setStages(initialStages)
  }, [initialStages])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const dealId = active.id
    for (const stage of stages) {
      const deal = stage.deals.find((d) => d.id === dealId)
      if (deal) {
        setActiveDeal(deal)
        break
      }
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

      const newSourceDeals = sourceStage.deals.filter(d => d.id !== activeId)
      const newDestDeals = [...destStage.deals, { ...activeDeal, stageId: destStageId }]

      return prev.map(s => {
        if (s.id === sourceStageId) return { ...s, deals: newSourceDeals }
        if (s.id === destStageId) return { ...s, deals: newDestDeals }
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
      <div className="flex gap-8 h-full min-h-[calc(100vh-280px)] overflow-x-auto pb-8 scrollbar-hide">
        {stages.map((stage) => {
          const totalValue = stage.deals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0)

          return (
            <div key={stage.id} className="flex flex-col min-w-[280px] max-w-[280px]">
              {/* STAGE HEADER ESCOLTRAN */}
              <div className="mb-6 px-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                      {stage.name}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {stage.deals.length}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2">
                   <span className="text-[14px] font-mono font-bold text-white tracking-tight">
                      {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                   </span>
                </div>
              </div>

              {/* COLUMN BODY */}
              <KanbanColumn id={stage.id} deals={stage.deals}>
                <div className="flex flex-col gap-4 min-h-[200px]">
                  <SortableContext
                    id={stage.id}
                    items={stage.deals.map((d) => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {stage.deals.map((deal) => (
                      <DealCard 
                        key={deal.id} 
                        deal={deal} 
                        onClick={() => onDealClick?.(deal)}
                      />
                    ))}
                  </SortableContext>
                  
                  {/* ADD CARD BUTTON ESCOLTRAN */}
                  <button 
                    onClick={() => onAddDeal?.(stage.id)}
                    className="flex items-center justify-center gap-2 w-full py-4 border border-dashed border-white/5 rounded-xl text-slate-600 hover:text-amber-500/50 hover:bg-white/[0.02] transition-all cursor-pointer group"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest font-mono">Novo Card</span>
                  </button>
                </div>
              </KanbanColumn>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="opacity-80 rotate-2 scale-105">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
