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

  const getHeaderStyle = (nome: string) => {
    const colors: Record<string, { text: string; bg: string; border: string; dot: string }> = {
      default: { text: "#6366f1", bg: "#1a1a2e", border: "#6366f130", dot: "#6366f1" },
      "PROSPECÇÃO": { text: "#4f46e5", bg: "#11111e", border: "#4f46e540", dot: "#4f46e5" },
      "QUALIFICAÇÃO": { text: "#f59e0b", bg: "#1e1611", border: "#f59e0b40", dot: "#f59e0b" },
      "PROPOSTA": { text: "#8b5cf6", bg: "#1a111e", border: "#8b5cf640", dot: "#8b5cf6" },
      "NEGOCIAÇÃO": { text: "#06b6d4", bg: "#111e1e", border: "#06b6d440", dot: "#06b6d4" },
      "FECHAMENTO": { text: "#10b981", bg: "#111e15", border: "#10b98140", dot: "#10b981" },
    }
    const key = nome.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return colors[key] || colors.default
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
          const style = getHeaderStyle(stage.name)
          const totalValue = stage.deals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0)

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
                      {stage.name}
                    </h2>
                  </div>
                  <div className="bg-black/40 px-2.5 py-1 rounded-full text-[10px] font-bold text-white/40 border border-white/[0.05]">
                    {stage.deals.length}
                  </div>
                </div>
                
                <div className="px-1 mt-2 flex justify-between items-center opacity-40">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Total</span>
                   <span className="text-[11px] font-black text-white/80">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </span>
                </div>
              </div>

              {/* COLUMN BODY */}
              <KanbanColumn id={stage.id} deals={stage.deals}>
                <SortableContext
                  id={stage.id}
                  items={stage.deals.map((d) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-3">
                    {stage.deals.map((deal) => (
                      <DealCard 
                        key={deal.id} 
                        deal={deal} 
                        onClick={() => onDealClick?.(deal)}
                      />
                    ))}
                    
                    {/* ADD CARD BUTTON (RECTANGULAR STYLE) */}
                    <button 
                      onClick={() => onAddDeal?.(stage.id)}
                      className="flex items-center justify-center gap-2 w-full py-4 border border-dashed border-white/[0.05] rounded-[8px] text-[#444] hover:text-[#777] hover:border-white/10 hover:bg-white/[0.01] transition-all group mt-1"
                    >
                      <Plus size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[13px] font-medium tracking-tight">Adicionar card</span>
                    </button>
                  </div>
                </SortableContext>
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
