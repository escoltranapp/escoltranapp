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

/* ── Helpers ──────────────────────────────────────── */
function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function currency(v: number) {
  if (v === 0) return "—"
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

/* ── Droppable zone inside each column ───────────── */
function DroppableZone({ stage, children }: { stage: Stage; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-2 min-h-[60px] rounded-lg p-1 transition-all duration-200"
      style={
        isOver
          ? {
              backgroundColor: hexToRgba(stage.color, 0.06),
              outline: `2px dashed ${hexToRgba(stage.color, 0.25)}`,
              outlineOffset: "-2px",
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}

/* ── Add card button ─────────────────────────────── */
function AddCardBtn({ color, onClick }: { color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 h-[34px] rounded-lg text-[11px] font-medium transition-all duration-150 mt-1"
      style={{
        color: "rgba(255,255,255,0.18)",
        border: "1px dashed rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = color
        e.currentTarget.style.borderColor = hexToRgba(color, 0.35)
        e.currentTarget.style.background = hexToRgba(color, 0.04)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.18)"
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
        e.currentTarget.style.background = "transparent"
      }}
    >
      <Plus size={12} strokeWidth={2.5} />
      Adicionar
    </button>
  )
}

/* ── Add stage placeholder ───────────────────────── */
function AddStageBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-[280px] shrink-0 flex flex-col items-center justify-center gap-3 self-stretch rounded-2xl transition-all duration-200 group"
      style={{
        border: "2px dashed rgba(255,255,255,0.05)",
        minHeight: "200px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"
        e.currentTarget.style.background = "rgba(99,102,241,0.02)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"
        e.currentTarget.style.background = "transparent"
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03] group-hover:bg-indigo-500/10 transition-colors">
        <Plus size={20} className="text-white/15 group-hover:text-indigo-400 transition-colors" />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-white/15 group-hover:text-indigo-400/80 transition-colors">
        Nova Coluna
      </span>
    </button>
  )
}

/* ════════════════════════════════════════════════════
   KANBAN BOARD — Premium SaaS Layout
   ════════════════════════════════════════════════════ */
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
              <div key={stage.id} className="w-[290px] shrink-0 flex flex-col">
                {/* ── COLUMN CONTAINER ─ LAYER 2: elevated above board ── */}
                <div
                  className="rounded-2xl flex flex-col overflow-hidden"
                  style={{
                    // LAYER 2: Subtle elevation above bg
                    background: "rgba(255,255,255,0.018)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.02)",
                  }}
                >
                  {/* Stage color strip — identity line */}
                  <div
                    className="h-[3px] shrink-0"
                    style={{
                      background: `linear-gradient(90deg, ${stage.color}, ${hexToRgba(stage.color, 0.15)})`,
                    }}
                  />

                  {/* ── Column header ───────────────────── */}
                  <div className="px-4 pt-4 pb-3 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: stage.color,
                            boxShadow: `0 0 6px ${hexToRgba(stage.color, 0.4)}`,
                          }}
                        />
                        <span
                          className="text-[12px] font-semibold uppercase tracking-[0.06em]"
                          style={{ color: stage.color }}
                        >
                          {stage.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Deal count badge */}
                        <div
                          className="text-[10px] font-bold px-2 py-[3px] rounded-md tabular-nums"
                          style={{
                            background: hexToRgba(stage.color, 0.1),
                            color: stage.color,
                            border: `1px solid ${hexToRgba(stage.color, 0.18)}`,
                          }}
                        >
                          {open.length}
                        </div>

                        {/* Column menu */}
                        <button className="text-white/15 hover:text-white/40 transition-colors p-0.5">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Stage total value */}
                    <p
                      className="text-[12px] font-medium pl-[18px] tabular-nums"
                      style={{ color: "rgba(255,255,255,0.22)" }}
                    >
                      {currency(total)}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="mx-3.5 shrink-0" style={{ height: "1px", background: "rgba(255,255,255,0.04)" }} />

                  {/* ── Cards area — scrollable ────────── */}
                  <div
                    className="px-2.5 pt-2.5 pb-2 flex-1 overflow-y-auto"
                    style={{
                      maxHeight: "calc(100vh - 340px)",
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(255,255,255,0.06) transparent",
                    }}
                  >
                    <SortableContext items={open.map(d => d.id)} strategy={verticalListSortingStrategy}>
                      <DroppableZone stage={stage}>
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
                            className="flex items-center justify-center h-16 rounded-lg text-[11px] font-medium"
                            style={{
                              border: "1px dashed rgba(255,255,255,0.05)",
                              color: "rgba(255,255,255,0.15)",
                            }}
                          >
                            Nenhum deal
                          </div>
                        )}
                      </DroppableZone>
                    </SortableContext>
                  </div>

                  {/* Add card button */}
                  <div className="px-2.5 pt-1 pb-3 shrink-0">
                    <AddCardBtn color={stage.color} onClick={() => onAddDeal?.(stage.id)} />
                  </div>
                </div>
              </div>
            )
          })}

          <AddStageBtn onClick={onAddStage} />
        </div>

        {/* Drag overlay — elevated ghost card */}
        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
          {activeDeal && (
            <div
              className="w-[290px]"
              style={{
                transform: "rotate(2.5deg) scale(1.04)",
                filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.7))",
                opacity: 0.95,
              }}
            >
              <DealCard deal={activeDeal} stageColor={activeStageColor} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Internal detail sheet (fallback when no onDealClick) */}
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
