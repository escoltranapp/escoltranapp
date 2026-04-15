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
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DealCard, type Deal } from "./DealCard"
import { Plus } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

export interface Stage {
  id: string
  name: string
  color: string
  deals: Deal[]
}

interface KanbanBoardProps {
  stages: Stage[]
  onDealMove?: (dealId: string, fromStageId: string, toStageId: string) => void
  onAddDeal?: (stageId: string) => void
  onAddStage?: () => void
  onDealClick?: (deal: Deal) => void
}

function KanbanColumn({ stage, children, onAddDeal }: { stage: Stage, children: React.ReactNode, onAddDeal?: (id: string) => void }) {
  const { setNodeRef } = useSortable({ id: stage.id })
  const totalValue = stage.deals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0)

  // SaaS INDUSTRIAL COLOR PALETTE
  const configMap: Record<string, { dot: string, border: string, bg: string }> = {
    PROSPECT:      { dot: "#818cf8", border: "rgba(129,140,248,0.2)", bg: "rgba(129,140,248,0.03)" },
    QUALIFICATION: { dot: "#f59e0b", border: "rgba(245,158,11,0.2)",  bg: "rgba(245,158,11,0.03)"  },
    PROPOSAL:      { dot: "#a78bfa", border: "rgba(167,139,250,0.2)", bg: "rgba(167,139,250,0.03)" },
    NEGOTIATION:   { dot: "#22d3ee", border: "rgba(34,211,238,0.2)",  bg: "rgba(34,211,238,0.03)"  },
    FECHAMENTO:    { dot: "#4ade80", border: "rgba(74,222,128,0.2)",  bg: "rgba(74,222,128,0.03)"  }
  }

  const stageConfig = configMap[stage.id] || { dot: "#818cf8", border: "rgba(255,255,255,0.1)", bg: "transparent" }

  return (
    <div className="w-[300px] flex flex-col h-full shrink-0 group">
      {/* HEADER DA COLUNA (IMAGE 2 TARGET) */}
      <div 
        className="flex items-center justify-between p-[14px] px-[18px] border rounded-[16px] mb-4 shadow-xl"
        style={{ borderColor: stageConfig.border, backgroundColor: stageConfig.bg }}
      >
        <div className="flex items-center gap-[12px]">
          <div className="w-[10px] h-[10px] rounded-full shadow-[0_0_12px_rgba(255,255,255,0.3)]" style={{ backgroundColor: stageConfig.dot }} />
          <span className="text-[14px] font-black uppercase tracking-[0.1em] text-white/90">
            {stage.name}
          </span>
        </div>
        
        <div className="w-[24px] h-[24px] rounded-full bg-white/[0.08] flex items-center justify-center border border-white/5">
           <span className="text-[11px] font-bold text-white/60">{stage.deals.length}</span>
        </div>
      </div>

      {/* SUB-INFO (IMAGE 2 POSITION) */}
      <div className="px-[6px] mb-[16px] flex items-center justify-between">
        <span className="text-[13px] font-bold text-white/30 uppercase tracking-[0.15em]">
           R$ {totalValue.toLocaleString('pt-BR')} · {stage.deals.length} deals
        </span>
      </div>

      {/* DROPPABLE AREA */}
      <div 
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-[16px] overflow-y-auto scrollbar-hide"
      >
        <div className="flex flex-col gap-[16px] mb-4">
           {children}
        </div>
        
        {/* ADD CARD BUTTON (IMAGE 2 MINIMALIST) */}
        <button 
          onClick={() => onAddDeal?.(stage.id)}
          className="w-full p-[16px] border border-dashed border-white/[0.05] hover:border-white/20 hover:bg-white/[0.02] rounded-[16px] flex items-center justify-center gap-2 text-[13px] font-bold text-white/5 hover:text-white/40 transition-all mt-2"
        >
           <Plus size={16} /> Adicionar card
        </button>
      </div>
    </div>
  )
}

export function KanbanBoard({ stages: initialStages, onDealMove, onAddDeal, onAddStage, onDealClick }: KanbanBoardProps) {
  const [stages, setStages] = useState(initialStages)
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
    const overStage = stages.find((s) => s.id === over.id) || findStageByDealId(over.id as string)
    if (!activeStage || !overStage || activeStage.id === overStage.id) return
    const deal = activeStage.deals.find((d) => d.id === active.id)
    if (!deal) return
    setStages(prev => prev.map(s => {
      if (s.id === activeStage.id) return { ...s, deals: s.deals.filter(d => d.id !== active.id) }
      if (s.id === overStage.id) return { ...s, deals: [...s.deals, { ...deal, stageId: overStage.id }] }
      return s
    }))
    onDealMove?.(deal.id, activeStage.id, overStage.id)
  }

  const activeDeal = activeId ? stages.flatMap(s => s.deals).find(d => d.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-[14px] h-full p-[16px] px-[24px] pb-[24px]">
        <SortableContext items={stages.flatMap(s => s.deals.map(d => d.id))} strategy={verticalListSortingStrategy}>
          {stages.map((stage) => (
            <KanbanColumn key={stage.id} stage={stage} onAddDeal={onAddDeal}>
              {stage.deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onClick={() => onDealClick?.(deal)} />
              ))}
            </KanbanColumn>
          ))}
        </SortableContext>

        {/* REFINED NEW COLUMN PLACEHOLDER — 240px MATCH */}
        <div className="w-[240px] shrink-0">
           <button 
             onClick={onAddStage}
             className="w-full h-full min-h-[600px] border border-dashed border-white/[0.05] hover:border-[#4f46e5]/40 hover:bg-[#4f46e5]/[0.02] rounded-[10px] flex flex-col items-center justify-center gap-4 transition-all group"
           >
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white/[0.02] group-hover:bg-[#4f46e5]/[0.1]">
                <Plus size={24} className="text-white/20 group-hover:text-[#4f46e5]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover:text-[#4f46e5]">Nova Coluna</span>
           </button>
        </div>
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="scale-105 rotate-2 opacity-90">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
