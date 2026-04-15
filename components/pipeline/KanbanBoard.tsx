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

function Droppable({ stage, children }: { stage: Stage; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-2.5 min-h-[60px] transition-colors rounded-lg"
      style={isOver ? { backgroundColor: "rgba(255,255,255,0.015)" } : undefined}
    >
      {children}
    </div>
  )
}

function hexAlpha(hex: string, a: number) {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
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
  const activeStageColor = activeId ? stageOf(activeId)?.color ?? "#6366f1" : "#6366f1"

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={e => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 items-start pb-2">
          {stages.map(stage => {
            const open = stage.deals.filter(d => d.status === "OPEN")
            const total = open.reduce((s, d) => s + (d.valorEstimado || 0), 0)

            return (
              <div key={stage.id} className="w-[272px] shrink-0 flex flex-col">
                {/* Column wrapper */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
                    border: `1px solid rgba(255,255,255,0.06)`,
                    boxShadow: `inset 0 1px 0 ${hexAlpha(stage.color, 0.15)}`,
                  }}
                >
                  {/* Top color line */}
                  <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${stage.color}, ${hexAlpha(stage.color, 0.2)})` }} />

                  {/* Column header */}
                  <div className="px-4 pt-3.5 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: stage.color }} />
                        <span className="text-[12px] font-semibold tracking-[0.03em]" style={{ color: stage.color }}>
                          {stage.name}
                        </span>
                      </div>
                      <div
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: hexAlpha(stage.color, 0.12), color: stage.color }}
                      >
                        {open.length}
                      </div>
                    </div>
                    <p className="text-[11px] pl-4" style={{ color: "rgba(255,255,255,0.2)" }}>
                      {total > 0
                        ? total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : "—"}
                    </p>
                  </div>

                  {/* Cards area */}
                  <div className="px-3 pb-3">
                    <SortableContext items={open.map(d => d.id)} strategy={verticalListSortingStrategy}>
                      <Droppable stage={stage}>
                        {open.map(deal => (
                          <DealCard
                            key={deal.id}
                            deal={deal}
                            stageColor={stage.color}
                            onClick={() => onDealClick ? onDealClick(deal) : setSelected(deal)}
                          />
                        ))}
                        {open.length === 0 && (
                          <div className="flex items-center justify-center h-14 rounded-lg border border-dashed border-white/[0.05] text-[11px] text-white/20">
                            Sem deals nesta etapa
                          </div>
                        )}
                      </Droppable>
                    </SortableContext>
                  </div>

                  {/* Add card button */}
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => onAddDeal?.(stage.id)}
                      className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[11px] font-medium transition-all"
                      style={{
                        color: "rgba(255,255,255,0.2)",
                        border: "1px dashed rgba(255,255,255,0.07)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = stage.color
                        ;(e.currentTarget as HTMLElement).style.borderColor = hexAlpha(stage.color, 0.35)
                        ;(e.currentTarget as HTMLElement).style.backgroundColor = hexAlpha(stage.color, 0.05)
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.2)"
                        ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"
                        ;(e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                      }}
                    >
                      <Plus size={12} />
                      Adicionar card
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add stage */}
          <button
            onClick={onAddStage}
            className="w-[272px] shrink-0 flex items-center gap-2 h-11 px-4 rounded-xl text-[12px] font-medium text-white/20 hover:text-white/40 transition-all self-start"
            style={{ border: "1px dashed rgba(255,255,255,0.07)" }}
          >
            <Plus size={13} />
            Nova Coluna
          </button>
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
          {activeDeal && (
            <div className="w-[272px] rotate-[1.5deg] scale-[1.02] opacity-95">
              <DealCard deal={activeDeal} stageColor={activeStageColor} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {!onDealClick && (
        <DealDetailSheet
          deal={selected}
          open={!!selected}
          onOpenChange={open => !open && setSelected(null)}
        />
      )}
    </>
  )
}
