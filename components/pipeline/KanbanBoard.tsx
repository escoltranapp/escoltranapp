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
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { DealCard, type Deal } from "./DealCard"
import { DealDetailSheet } from "./DealDetailSheet"

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
  const { setNodeRef } = useDroppable({ id: stage.id })
  return <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[40px]">{children}</div>
}

function hexWithOpacity(hex: string, opacity: number): string {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

export function KanbanBoard({ stages: initialStages, onDealMove, onAddDeal, onAddStage, onDealClick }: KanbanBoardProps) {
  const [stages, setStages] = useState(initialStages)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

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
    const overStage =
      stages.find((s) => s.id === over.id) ||
      findStageByDealId(over.id as string)

    if (!activeStage || !overStage) return
    if (activeStage.id === overStage.id) return

    const deal = activeStage.deals.find((d) => d.id === active.id)
    if (!deal) return

    setStages((prev) =>
      prev.map((s) => {
        if (s.id === activeStage.id) return { ...s, deals: s.deals.filter((d) => d.id !== active.id) }
        if (s.id === overStage.id) return { ...s, deals: [...s.deals, { ...deal, stageId: overStage.id }] }
        return s
      })
    )

    onDealMove?.(deal.id, activeStage.id, overStage.id)
  }

  const activeDeal = activeId
    ? stages.flatMap((s) => s.deals).find((d) => d.id === activeId)
    : null

  const handleCardClick = (deal: Deal) => {
    if (onDealClick) {
      onDealClick(deal)
    } else {
      setSelectedDeal(deal)
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-[14px] items-start">
          {stages.map((stage) => {
            const openDeals = stage.deals.filter((d) => d.status === "OPEN")
            const stageValue = openDeals.reduce((sum, d) => sum + (d.valorEstimado || 0), 0)
            const valueStr = stageValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            const countStr = openDeals.length === 0
              ? "sem deals"
              : openDeals.length === 1 ? "1 deal" : `${openDeals.length} deals`
            const borderColor = hexWithOpacity(stage.color, 0.18)

            return (
              <div key={stage.id} className="w-[240px] shrink-0 flex flex-col gap-2">
                {/* Column Header */}
                <div
                  className="flex items-center justify-between px-3 py-[10px] rounded-[10px] border"
                  style={{ borderColor }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: stage.color }}>
                      {stage.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-[7px] py-[2px] rounded-full bg-[#1e1e26]" style={{ color: stage.color }}>
                    {openDeals.length}
                  </span>
                </div>

                {/* Column value */}
                <div className="text-[11px] text-[#555] px-3 pb-1">
                  {valueStr} · {countStr}
                </div>

                {/* Cards */}
                <SortableContext items={openDeals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                  <DroppableColumn stage={stage}>
                    {openDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} onClick={() => handleCardClick(deal)} />
                    ))}
                  </DroppableColumn>
                </SortableContext>

                {/* Add card */}
                <button
                  onClick={() => onAddDeal?.(stage.id)}
                  className="flex items-center justify-center gap-1.5 py-[9px] rounded-[8px] border border-dashed border-[#1e1e28] text-[#444] text-[12px] hover:border-[#3a3a4e] hover:text-[#777] transition-all bg-transparent"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Adicionar card
                </button>
              </div>
            )
          })}

          {/* Add Column */}
          <button
            onClick={onAddStage}
            className="w-[240px] shrink-0 flex items-center justify-center gap-1.5 py-[10px] px-3 rounded-[10px] border border-dashed border-[#1e1e28] text-[#444] text-[12px] hover:border-[#3a3a4e] hover:text-[#777] transition-all bg-transparent self-start"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Nova Coluna
          </button>
        </div>

        <DragOverlay>
          {activeDeal ? (
            <div className="rotate-1 opacity-90 w-[240px]">
              <DealCard deal={activeDeal} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {!onDealClick && (
        <DealDetailSheet
          deal={selectedDeal}
          open={!!selectedDeal}
          onOpenChange={(open) => !open && setSelectedDeal(null)}
        />
      )}
    </>
  )
}
