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
} from "@dnd-kit/sortable"
import { DealCard, type Deal } from "./DealCard"
import { DealDetailSheet } from "./DealDetailSheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

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
}

export function KanbanBoard({ stages: initialStages, onDealMove }: KanbanBoardProps) {
  const [stages, setStages] = useState(initialStages)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
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
    const overStage =
      stages.find((s) => s.id === over.id) ||
      findStageByDealId(over.id as string)

    if (!activeStage || !overStage) return
    if (activeStage.id === overStage.id) return

    const deal = activeStage.deals.find((d) => d.id === active.id)
    if (!deal) return

    setStages((prev) =>
      prev.map((s) => {
        if (s.id === activeStage.id) {
          return { ...s, deals: s.deals.filter((d) => d.id !== active.id) }
        }
        if (s.id === overStage.id) {
          return { ...s, deals: [...s.deals, { ...deal, stageId: overStage.id }] }
        }
        return s
      })
    )

    onDealMove?.(deal.id, activeStage.id, overStage.id)
  }

  const activeDeal = activeId
    ? stages.flatMap((s) => s.deals).find((d) => d.id === activeId)
    : null

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const totalValue = stage.deals
              .filter((d) => d.status === "OPEN")
              .reduce((sum, d) => sum + (d.valorEstimado || 0), 0)

            return (
              <div
                key={stage.id}
                className="shrink-0 w-72 flex flex-col rounded-xl bg-card border border-border"
                id={stage.id}
              >
                {/* Stage Header */}
                <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-sm font-semibold text-foreground truncate">
                        {stage.name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stage.deals.filter((d) => d.status === "OPEN").length}
                    </Badge>
                  </div>
                  {totalValue > 0 && (
                    <p className="text-xs text-muted-foreground pl-4">
                      {formatCurrency(totalValue)}
                    </p>
                  )}
                </div>

                {/* Deals */}
                <ScrollArea className="flex-1 p-2">
                  <SortableContext
                    items={stage.deals.map((d) => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {stage.deals
                      .filter((d) => d.status === "OPEN")
                      .map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          onClick={() => setSelectedDeal(deal)}
                        />
                      ))}
                  </SortableContext>
                  {stage.deals.filter((d) => d.status === "OPEN").length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-xs text-muted-foreground">Nenhum deal</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Add Deal */}
                <div className="p-2 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar Deal
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <div className="rotate-2 opacity-90">
              <DealCard deal={activeDeal} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DealDetailSheet
        deal={selectedDeal}
        open={!!selectedDeal}
        onOpenChange={(open) => !open && setSelectedDeal(null)}
      />
    </>
  )
}
