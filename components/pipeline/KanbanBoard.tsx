"use client"

import { useState } from "react"
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { KanbanColumn } from "./KanbanColumn"
import { DealCard, Deal } from "./DealCard"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateDealStage } from "@/app/(app)/pipeline/actions"

interface Stage {
  id: string
  nome: string
  ordem: number
  cor: string
}

interface KanbanBoardProps {
  stages: Stage[]
  initialDeals: Deal[]
}

export function KanbanBoard({ stages, initialDeals }: KanbanBoardProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  const queryClient = useQueryClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const mutation = useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) =>
      updateDealStage(id, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
    },
  })

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const deal = deals.find((d) => d.id === active.id)
    if (deal) setActiveDeal(deal)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const activeIndex = deals.findIndex((d) => d.id === activeId)
    const overIndex = deals.findIndex((d) => d.id === overId)

    const isOverAColumn = stages.some((s) => s.id === overId)

    setDeals((prevDeals) => {
      const newDeals = [...prevDeals]
      const activeDeal = newDeals[activeIndex]

      if (isOverAColumn) {
        activeDeal.stageId = overId as string
        return arrayMove(newDeals, activeIndex, activeIndex)
      }

      const overDeal = newDeals[overIndex]
      if (activeDeal.stageId !== overDeal.stageId) {
        activeDeal.stageId = overDeal.stageId
        return arrayMove(newDeals, activeIndex, overIndex)
      }

      return arrayMove(newDeals, activeIndex, overIndex)
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) {
      setActiveDeal(null)
      return
    }

    const deal = deals.find((d) => d.id === active.id)
    if (deal && deal.stageId !== activeDeal?.stageId) {
      mutation.mutate({ id: deal.id, stageId: deal.stageId! })
    }

    setActiveDeal(null)
  }

  // Predefined colors from the image (Blue, Orange, Purple, Cyan, Green)
  const getHeaderStyle = (cor: string) => {
    // Basic mapping for the reference colors
    const colors: Record<string, { text: string; bg: string; border: string; dot: string }> = {
      default: { text: "#6366f1", bg: "#1a1a2e", border: "#6366f130", dot: "#6366f1" },
      PROSPECÇÃO: { text: "#4f46e5", bg: "#11111e", border: "#4f46e540", dot: "#4f46e5" },
      QUALIFICAÇÃO: { text: "#f59e0b", bg: "#1e1611", border: "#f59e0b40", dot: "#f59e0b" },
      PROPOSTA: { text: "#8b5cf6", bg: "#1a111e", border: "#8b5cf640", dot: "#8b5cf6" },
      NEGOCIAÇÃO: { text: "#06b6d4", bg: "#111e1e", border: "#06b6d440", dot: "#06b6d4" },
      FECHAMENTO: { text: "#10b981", bg: "#111e15", border: "#10b98140", dot: "#10b981" },
    }
    return colors[cor.toUpperCase()] || colors.default
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full min-h-[calc(100vh-250px)] overflow-x-auto pb-4 kanban-scrollbar">
        {stages.map((stage) => {
          const style = getHeaderStyle(stage.nome)
          const columnDeals = deals.filter((d) => d.stageId === stage.id)
          const totalValue = columnDeals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0)

          return (
            <div key={stage.id} className="flex flex-col min-w-[320px] max-w-[320px]">
              {/* STAGE HEADER BLOCK */}
              <div className="mb-4">
                <div 
                  className="flex items-center justify-between px-4 py-2.5 rounded-[12px] border transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                  style={{ 
                    backgroundColor: style.bg, 
                    borderColor: style.border,
                    color: style.text 
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ backgroundColor: style.dot }}
                    />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.15em]">
                      {stage.nome}
                    </h2>
                  </div>
                  <div className="bg-black/40 px-2.5 py-1 rounded-full text-[10px] font-bold text-white/40 border border-white/[0.05]">
                    {columnDeals.length}
                  </div>
                </div>
                
                {/* SUB-HEADER: Total Value */}
                <div className="px-1 mt-2 flex justify-between items-center opacity-40">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Total</span>
                   <span className="text-[11px] font-black text-white/80">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </span>
                </div>
              </div>

              {/* COLUMN BODY */}
              <KanbanColumn id={stage.id} deals={columnDeals}>
                <SortableContext
                  id={stage.id}
                  items={columnDeals.map((d) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-3 min-h-[150px]">
                    {columnDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))}
                  </div>
                </SortableContext>
              </KanbanColumn>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeDeal ? <DealCard deal={activeDeal} /> : null}
      </DragOverlay>

      <style jsx global>{`
        .kanban-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .kanban-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .kanban-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .kanban-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </DndContext>
  )
}
