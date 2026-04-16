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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { KanbanColumn } from "./KanbanColumn"
import { DealCard, Deal } from "./DealCard"

export interface Stage {
  id: string
  name: string
  color: string
  order: number
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
    const { active, over } = event
    if (!over) {
      setActiveDeal(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    let destStageId = overId
    if (!stages.find(s => s.id === overId)) {
        for (const stage of stages) {
            if (stage.deals.find(d => d.id === overId)) {
                destStageId = stage.id
                break
            }
        }
    }

    const startStageId = initialStages.find(s => s.deals.some(d => d.id === activeId))?.id
    if (startStageId && destStageId !== startStageId) {
      onDealMove(activeId, startStageId, destStageId)
    }

    setActiveDeal(null)
  }


  const getStageHeaderInfo = (name: string) => {
    const n = name.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const map: Record<string, string> = {
      "NOVO LEAD": "#3B8FE8",
      "PROSPECCAO": "#3B8FE8",
      "QUALIFICACAO": "#8B5CF6",
      "REUNIAO MARCADA": "#E8A93B",
      "REUNIAO": "#E8A93B",
      "PROPOSTA": "#3BE87A",
      "NEGOCIACAO": "#E85959",
      "FECHAMENTO": "#10B981",
    }
    return map[n] || "#3B8FE8"
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full min-h-[calc(100vh-250px)] overflow-x-auto pb-6 kanban-scrollbar">
        {stages.map((stage) => {
          const totalValue = stage.deals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0)
          const stageColor = getStageHeaderInfo(stage.name)

          return (
            <div key={stage.id} className="flex flex-col min-w-[280px] max-w-[280px]">
              {/* STAGE HEADER (CLEAN NOIR) */}
              <div className="mb-4 px-1">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: stageColor }}
                    />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/90">
                      {stage.name}
                    </h2>
                    <span className="text-[10px] font-bold text-white/20 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
                      {stage.deals.length}
                    </span>
                  </div>
                </div>
                
                <div className="px-0.5">
                   <span className="text-[12px] font-medium text-white/40">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </span>
                </div>
              </div>

              {/* COLUMN BODY */}
              <KanbanColumn id={stage.id} deals={stage.deals}>
                <div className="flex flex-col gap-3 min-h-[150px]">
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
                  
                  {/* ADD CARD BUTTON (MINIMAL) */}
                  <button 
                    onClick={() => onAddDeal?.(stage.id)}
                    className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-white/5 rounded-xl text-white/10 hover:text-white/30 hover:bg-white/[0.02] transition-all cursor-pointer group"
                  >
                    <Plus size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Novo Item</span>
                  </button>
                </div>
              </KanbanColumn>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="opacity-80 rotate-3 scale-105">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
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
