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
import { formatCurrency, cn } from "@/lib/utils"

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
}

export function KanbanBoard({ stages: initialStages, onDealMove, onAddDeal, onAddStage }: KanbanBoardProps) {
  const [stages, setStages] = useState(initialStages)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Update stages if props change
  if (initialStages !== stages && initialStages.length !== stages.length) {
    setStages(initialStages)
  }

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
        <div className="flex gap-5 overflow-x-auto pb-6 items-start h-[calc(100vh-180px)] scrollbar-hide">
          {stages.map((stage) => {
            const openDeals = stage.deals.filter((d) => d.status === "OPEN")
            const totalValue = openDeals.reduce((sum, d) => sum + (d.valorEstimado || 0), 0)

            return (
              <div
                key={stage.id}
                className="shrink-0 w-[300px] flex flex-col rounded-xl bg-surface-elevated/40 border border-border-subtle overflow-hidden h-full max-h-full"
                id={stage.id}
              >
                {/* Stage Accent Line */}
                <div 
                  className="h-1 w-full shrink-0" 
                  style={{ backgroundColor: stage.color }}
                />

                {/* Stage Header */}
                <div className="p-4 border-b border-border-subtle bg-white/[0.01]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-[13px] font-black font-sans uppercase tracking-tight text-text-primary truncate">
                        {stage.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-mono h-4 px-1 opacity-70">
                        {openDeals.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-mono font-bold text-accent">
                      {formatCurrency(totalValue)}
                    </span>
                    <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest opacity-60">Total Estimado</span>
                  </div>
                </div>

                {/* Deals List */}
                <ScrollArea className="flex-1 px-2.5 py-3">
                  <SortableContext
                    items={stage.deals.map((d) => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 pb-4">
                      {openDeals.map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          onClick={() => setSelectedDeal(deal)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  {openDeals.length === 0 && (
                    <div className="py-12 text-center rounded-lg border border-dashed border-border-default/50 m-2">
                      <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black opacity-30">Vazio</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Add Deal Action */}
                <div className="p-2 border-t border-border-subtle bg-black/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[11px] font-mono font-black uppercase tracking-widest hover:bg-accent/10 hover:text-accent transition-all h-10"
                    onClick={() => onAddDeal?.(stage.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Deal
                  </Button>
                </div>
              </div>
            )
          })}

          {/* New Column Action */}
          <button
            onClick={onAddStage}
            className="shrink-0 w-[300px] h-[120px] rounded-xl border-2 border-dashed border-border-default bg-white/[0.01] flex flex-col items-center justify-center gap-3 hover:bg-white/[0.03] hover:border-accent/40 transition-all group animate-entrance"
          >
            <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/10 transition-all border border-border-subtle">
              <Plus className="h-5 w-5 text-text-muted group-hover:text-accent" />
            </div>
            <span className="text-[11px] font-black font-mono text-text-muted group-hover:text-text-primary uppercase tracking-[0.2em]">Add Estágio</span>
          </button>
        </div>

        <DragOverlay>
          {activeDeal ? (
            <div className="rotate-3 opacity-95 scale-105 transition-transform duration-200">
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
