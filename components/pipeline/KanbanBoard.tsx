"use client"

import { useState } from "react"
import {
  DndContext, DragEndEvent, DragOverlay,
  PointerSensor, useSensor, useSensors, closestCorners, useDroppable,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DealCard, type Deal } from "./DealCard"
import { DealDetailSheet } from "./DealDetailSheet"
import { Plus } from "lucide-react"

export interface Stage {
  id: string
  name: string
  color: string
  order: number
  deals: Deal[]
}

interface KanbanBoardProps {
  stages: Stage[]
  onDealMove?: (dealId: string, fromStageId: string, toStageId: string) => void
  onAddDeal?: (stageId: string) => void
  onAddStage?: () => void
  onDealClick?: (deal: Deal) => void
}

function DroppableCards({ stage, children }: { stage: Stage; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-[8px] min-h-[100px] transition-colors duration-200 rounded-[10px] ${isOver ? 'bg-white/5' : ''}`}
    >
      {children}
    </div>
  )
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function KanbanBoard({
  stages: initial, onDealMove, onAddDeal, onAddStage, onDealClick,
}: KanbanBoardProps) {
  const [stages, setStages] = useState(initial)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Deal | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const stageOf = (dealId: string) => stages.find(s => s.deals.some(d => d.id === dealId))

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const from = stageOf(active.id as string)
    const to = stages.find(s => s.id === over.id) ?? stageOf(over.id as string)
    if (!from || !to || from.id === to.id) return
    const deal = from.deals.find(d => d.id === active.id)
    if (!deal) return
    setStages(prev => prev.map(s => {
      if (s.id === from.id) return { ...s, deals: s.deals.filter(d => d.id !== deal.id) }
      if (s.id === to.id)   return { ...s, deals: [...s.deals, { ...deal, stageId: to.id }] }
      return s
    }))
    onDealMove?.(deal.id, from.id, to.id)
  }

  const activeDeal = activeId ? stages.flatMap(s => s.deals).find(d => d.id === activeId) : null

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={e => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-[14px] items-start pb-[24px] overflow-x-auto scrollbar-thin scrollbar-thumb-[#2a2a35] scrollbar-track-transparent">
          {stages.map(stage => {
            const open = stage.deals.filter(d => d.status === "OPEN")
            const total = open.reduce((s, d) => s + (d.valorEstimado || 0), 0)

            return (
              <div key={stage.id} className="w-[240px] shrink-0 flex flex-col gap-[8px]">
                <div 
                   className="flex items-center justify-between px-[12px] py-[10px] rounded-[10px] border border-[#1e1e24]"
                   style={{ borderLeftColor: stage.color, borderLeftWidth: '2px' }}
                >
                  <div className="flex items-center gap-[8px]">
                    <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: stage.color }}></div>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: stage.color }}>
                      {stage.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-[7px] py-[2px] rounded-full bg-[#1e1e26]" style={{ color: stage.color }}>
                    {open.length}
                  </span>
                </div>
                
                <div className="text-[11px] text-[#555] px-[12px] mb-[4px]">
                  R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · {open.length} {open.length === 1 ? 'deal' : 'deals'}
                </div>

                <SortableContext items={open.map(d => d.id)} strategy={verticalListSortingStrategy}>
                  <DroppableCards stage={stage}>
                    {open.map(deal => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onClick={() => onDealClick ? onDealClick(deal) : setSelected(deal)}
                      />
                    ))}
                    <button
                      onClick={() => onAddDeal?.(stage.id)}
                      className="w-full flex items-center justify-center gap-[6px] p-[9px] rounded-[8px] border border-dashed border-[#1e1e28] text-[#444] text-[12px] hover:border-[#3a3a4e] hover:text-[#777] transition-all bg-transparent"
                    >
                      <Plus size={12} strokeWidth={1.5} />
                      Adicionar card
                    </button>
                  </DroppableCards>
                </SortableContext>
              </div>
            )
          })}
          
          <button
            onClick={onAddStage}
            className="w-[240px] shrink-0 flex flex-col items-center justify-center gap-[6px] p-[20px] rounded-[10px] border border-dashed border-[#1e1e28] text-[#444] text-[12px] hover:border-[#3a3a4e] hover:text-[#777] transition-all bg-transparent min-h-[100px]"
          >
             <Plus size={16} strokeWidth={1.5} />
             Nova Coluna
          </button>
        </div>

        <DragOverlay>
          {activeDeal && (
            <div className="w-[240px] opacity-80 rotate-2 cursor-grabbing">
              <DealCard deal={activeDeal} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {!onDealClick && (
        <DealDetailSheet
          deal={selected}
          open={!!selected}
          onOpenChange={o => !o && setSelected(null)}
        />
      )}
    </>
  )
}
