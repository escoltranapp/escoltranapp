"use client"

import { useState } from "react"
import {
  DndContext, DragEndEvent, DragOverlay,
  PointerSensor, useSensor, useSensors, closestCorners, useDroppable,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DealCard, type Deal } from "./DealCard"
import { DealDetailSheet } from "./DealDetailSheet"
import { Plus, MoreHorizontal } from "lucide-react"

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

function DroppableColumn({ stage, children }: { stage: Stage; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-4 min-h-[150px] transition-all duration-300 rounded-xl p-1 ${isOver ? 'bg-white/[0.03] ring-1 ring-white/10' : ''}`}
    >
      {children}
    </div>
  )
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
        <div className="flex gap-6 items-start pb-8 overflow-x-auto kanban-scrollbar">
          {stages.map(stage => {
            const open = stage.deals.filter(d => d.status === "OPEN")
            const total = open.reduce((s, d) => s + (d.valorEstimado || 0), 0)

            return (
              <div key={stage.id} className="w-[300px] shrink-0 flex flex-col gap-4">
                {/* COLUMN HEADER */}
                <div className="kanban-col-header">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="stage-dot" style={{ backgroundColor: stage.color }}></div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/90">
                        {stage.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                        {open.length}
                      </span>
                    </div>
                    <button className="text-white/20 hover:text-white transition-colors">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                  <div className="text-[11px] font-medium text-white/20">
                     Total: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </div>
                </div>

                {/* CARDS AREA */}
                <SortableContext items={open.map(d => d.id)} strategy={verticalListSortingStrategy}>
                  <DroppableColumn stage={stage}>
                    {open.map(deal => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onClick={() => onDealClick ? onDealClick(deal) : setSelected(deal)}
                      />
                    ))}
                    
                    {/* ADD BUTTON */}
                    <button
                      onClick={() => onAddDeal?.(stage.id)}
                      className="w-full h-[44px] flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/5 bg-transparent text-white/20 hover:text-white/40 hover:bg-white/[0.02] hover:border-white/10 transition-all text-xs font-semibold"
                    >
                      <Plus size={14} /> Adicionar Deal
                    </button>
                  </DroppableColumn>
                </SortableContext>
              </div>
            )
          })}
          
          {/* NEW COLUMN ACTION */}
          <button
            onClick={onAddStage}
            className="w-[300px] h-[100px] shrink-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/5 bg-white/[0.01] text-white/10 hover:text-white/30 hover:bg-white/[0.03] transition-all group"
          >
             <div className="w-10 h-10 rounded-full border border-dashed border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={18} />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest">Nova Etapa</span>
          </button>
        </div>

        <DragOverlay>
          {activeId && activeDeal && (
            <div className="w-[300px] opacity-80 cursor-grabbing">
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
