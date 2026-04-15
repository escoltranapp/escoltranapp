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

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function DroppableCards({ stage, children }: { stage: Stage; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-2 min-h-[80px] transition-colors duration-200 rounded-[8px] p-1"
      style={isOver ? { backgroundColor: hexToRgba(stage.color, 0.05), outline: `1px dashed ${hexToRgba(stage.color, 0.3)}` } : undefined}
    >
      {children}
    </div>
  )
}

function AddCardButton({ stageColor, onClick }: { stageColor: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center justify-center gap-1.5 h-8 rounded-[8px] text-[11px] font-[500] transition-all duration-150"
      style={{
        color: hovered ? stageColor : "rgba(255,255,255,0.22)",
        border: `1px dashed ${hovered ? hexToRgba(stageColor, 0.4) : "rgba(255,255,255,0.08)"}`,
        background: hovered ? hexToRgba(stageColor, 0.06) : "transparent",
      }}
    >
      <Plus size={11} strokeWidth={2.5} />
      Adicionar card
    </button>
  )
}

function AddStageButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-[280px] shrink-0 flex items-center justify-center gap-2 h-11 px-4 rounded-[14px] text-[12px] font-[500] self-start transition-all duration-150"
      style={{
        border: "1px dashed rgba(255,255,255,0.07)",
        color: "rgba(255,255,255,0.2)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = "rgba(255,255,255,0.18)"
        el.style.color = "rgba(255,255,255,0.5)"
        el.style.background = "rgba(255,255,255,0.025)"
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = "rgba(255,255,255,0.07)"
        el.style.color = "rgba(255,255,255,0.2)"
        el.style.background = "transparent"
      }}
    >
      <Plus size={13} strokeWidth={2} />
      Nova Coluna
    </button>
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
  const activeStageColor = activeId ? (stageOf(activeId)?.color ?? "#6366f1") : "#6366f1"

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={e => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 items-start pb-6">

          {stages.map(stage => {
            const open = stage.deals.filter(d => d.status === "OPEN")
            const total = open.reduce((s, d) => s + (d.valorEstimado || 0), 0)

            return (
              <div key={stage.id} className="w-[280px] shrink-0 flex flex-col">
                <div
                  className="rounded-[14px] overflow-hidden flex flex-col"
                  style={{
                    background: "rgba(255,255,255,0.016)",
                    border: "1px solid rgba(255,255,255,0.052)",
                  }}
                >
                  {/* Top stage color line */}
                  <div
                    className="h-[3px] shrink-0"
                    style={{
                      background: `linear-gradient(90deg, ${stage.color} 0%, ${hexToRgba(stage.color, 0.1)} 100%)`,
                    }}
                  />

                  {/* Column header */}
                  <div className="px-4 pt-3.5 pb-3 shrink-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-[7px] h-[7px] rounded-full shrink-0"
                          style={{ backgroundColor: stage.color }}
                        />
                        <span
                          className="text-[11px] font-[600] uppercase tracking-[0.07em]"
                          style={{ color: stage.color }}
                        >
                          {stage.name}
                        </span>
                      </div>
                      <div
                        className="text-[10px] font-[700] px-[7px] py-[2.5px] rounded-full tabular-nums"
                        style={{
                          background: hexToRgba(stage.color, 0.1),
                          color: stage.color,
                          border: `1px solid ${hexToRgba(stage.color, 0.2)}`,
                        }}
                      >
                        {open.length}
                      </div>
                    </div>
                    <p
                      className="text-[11px] pl-[15px] font-[500]"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      {total > 0
                        ? total.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
                        : "—"}
                    </p>
                  </div>

                  {/* Divider */}
                  <div
                    className="mx-3.5 shrink-0"
                    style={{ height: "1px", background: "rgba(255,255,255,0.042)" }}
                  />

                  {/* Cards area — scrollable */}
                  <div
                    className="px-2.5 pt-2.5 flex-1 overflow-y-auto"
                    style={{
                      maxHeight: "calc(100vh - 340px)",
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(255,255,255,0.06) transparent",
                    }}
                  >
                    <SortableContext items={open.map(d => d.id)} strategy={verticalListSortingStrategy}>
                      <DroppableCards stage={stage}>
                        {open.map(deal => (
                          <DealCard
                            key={deal.id}
                            deal={deal}
                            stageColor={stage.color}
                            onClick={() => onDealClick ? onDealClick(deal) : setSelected(deal)}
                          />
                        ))}
                        {open.length === 0 && (
                          <div
                            className="flex items-center justify-center h-16 rounded-[8px] text-[11px] font-[500]"
                            style={{
                              border: "1px dashed rgba(255,255,255,0.05)",
                              color: "rgba(255,255,255,0.18)",
                            }}
                          >
                            Nenhum deal aqui
                          </div>
                        )}
                      </DroppableCards>
                    </SortableContext>
                  </div>

                  {/* Add card button */}
                  <div className="px-2.5 pt-2 pb-3 shrink-0">
                    <AddCardButton stageColor={stage.color} onClick={() => onAddDeal?.(stage.id)} />
                  </div>
                </div>
              </div>
            )
          })}

          <AddStageButton onClick={onAddStage} />
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
          {activeDeal && (
            <div
              className="w-[280px]"
              style={{
                transform: "rotate(2deg) scale(1.03)",
                filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.7))",
                opacity: 0.96,
              }}
            >
              <DealCard deal={activeDeal} stageColor={activeStageColor} />
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
