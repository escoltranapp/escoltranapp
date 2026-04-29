"use client"

import { useState, useEffect, useRef } from "react"
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { DealCard, Deal } from "./DealCard"

export interface Stage {
  id: string
  pipelineId: string
  name: string
  color: string
  deals: Deal[]
}

interface KanbanBoardProps {
  stages: Stage[]
  onDealMove: (dealId: string, oldStageId: string, newStageId: string) => void
  onAddDeal?: (stageId: string) => void
  onDealClick?: (deal: Deal) => void
}

export function KanbanColumn({ 
  id, 
  deals, 
  children 
}: { 
  id: string; 
  deals: Deal[]; 
  children: React.ReactNode 
}) {
  const { setNodeRef } = useSortable({
    id,
    data: { type: "column", columnId: id }
  })

  return (
    <div ref={setNodeRef} className="flex-1 min-h-[500px]">
      {children}
    </div>
  )
}

export function KanbanBoard({ stages: initialStages, onDealMove, onDealClick, onAddDeal }: KanbanBoardProps) {
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  const [isAddingStage, setIsAddingStage] = useState(false)
  const [newStageName, setNewStageName] = useState("")
  const [editingStageId, setEditingStageId] = useState<string | null>(null)
  const [editStageName, setEditStageName] = useState("")
  
  // DRAGGABLE SCROLL LOGIC
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDraggingScroll, setIsDraggingScroll] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => { setStages(initialStages) }, [initialStages])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const dealId = active.id
    for (const stage of stages) {
      const deal = stage.deals.find((d) => d.id === dealId)
      if (deal) { setActiveDeal(deal); break }
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

      return prev.map(s => {
        if (s.id === sourceStageId) return { ...s, deals: s.deals.filter(d => d.id !== activeId) }
        if (s.id === destStageId) return { ...s, deals: [...s.deals, { ...activeDeal, stageId: destStageId }] }
        return s
      })
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event
    
    if (activeDeal) {
      const activeId = active.id as string
      let currentStageId = ""
      for (const stage of stages) {
        if (stage.deals.some(d => d.id === activeId)) {
          currentStageId = stage.id
          break
        }
      }

      let originalStageId = ""
      for (const stage of initialStages) {
        if (stage.deals.some(d => d.id === activeId)) {
          originalStageId = stage.id
          break
        }
      }

      if (currentStageId && originalStageId && currentStageId !== originalStageId) {
        onDealMove(activeId, originalStageId, currentStageId)
      }
    }

    setActiveDeal(null)
  }

  const handleUpdateStage = async (id: string) => {
    if (!editStageName.trim()) return
    try {
      const res = await fetch(`/api/pipeline/stages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editStageName })
      })
      if (res.ok) {
        setEditingStageId(null)
        window.location.reload()
      }
    } catch (e) { console.error(e) }
  }

  const handleDeleteStage = async (id: string, dealsCount: number) => {
    if (dealsCount > 0) {
      alert("Não é possível excluir uma etapa que contém registros.")
      return
    }
    if (!confirm("Tem certeza que deseja excluir esta etapa?")) return

    try {
      const res = await fetch(`/api/pipeline/stages/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        window.location.reload()
      }
    } catch (e) { console.error(e) }
  }

  const handleAddStage = async () => {
    if (!newStageName.trim() || !initialStages[0]?.pipelineId) return
    
    try {
      const res = await fetch("/api/pipeline/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newStageName,
          pipelineId: stages[0]?.pipelineId || (initialStages as any).pipelineId
        })
      })
      if (res.ok) {
        setNewStageName("")
        setIsAddingStage(false)
        window.location.reload()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // MOUSE DRAG SCROLL HANDLERS
  const onMouseDown = (e: React.MouseEvent) => {
    if (activeDeal) return // Don't scroll if dragging a card
    setIsDraggingScroll(true)
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0)
  }

  const onMouseLeave = () => { setIsDraggingScroll(false) }
  const onMouseUp = () => { setIsDraggingScroll(false) }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingScroll || activeDeal) return
    e.preventDefault()
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2 // Scroll speed multiplier
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div 
        ref={scrollContainerRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className={cn(
          "flex gap-10 h-full min-h-[calc(100vh-320px)] overflow-x-auto pb-20 pt-4 transition-colors cursor-grab active:cursor-grabbing scrollbar-hide perspective-[2000px]",
        )}
      >
        {stages.map((stage) => {
          const totalValue = stage.deals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0)

          return (
            <div key={stage.id} className="flex flex-col min-w-[340px] max-w-[340px] select-none group/column transition-transform duration-500">
              
              {/* STAGE HEADER - ELITE AETHER STYLE */}
              <div className="mb-6 px-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color || '#F97316' }} />
                    <h2 className="text-[13px] font-black text-white uppercase tracking-tight italic">
                      {stage.name}
                    </h2>
                    <span className="text-[10px] font-mono font-black text-[#404040] bg-white/[0.03] px-2 py-0.5 rounded-lg border border-white/[0.05]">
                      {stage.deals.length}
                    </span>
                  </div>
                  
                  <div className="text-[12px] font-black text-[#F97316] font-mono tracking-tighter">
                    {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              {/* COLUMN BODY - GLASS COMPONENT */}
              <KanbanColumn id={stage.id} deals={stage.deals}>
                <div className="flex flex-col gap-5 min-h-[400px] p-4 rounded-[32px] bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/[0.04] shadow-[0_30px_60px_rgba(0,0,0,0.5)] group-hover/column:border-white/[0.08] transition-all relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col gap-5">
                    <SortableContext id={stage.id} items={stage.deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                      {stage.deals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} onClick={() => onDealClick?.(deal)} />
                      ))}
                    </SortableContext>
                    
                    {/* ADD CARD BUTTON - HIGH CONTRAST */}
                    <button 
                      onClick={() => onAddDeal?.(stage.id)}
                      className="flex items-center justify-center gap-4 w-full py-6 bg-[#1A1A1A]/20 border border-dashed border-white/5 rounded-2xl text-[#404040] hover:text-white hover:bg-[#F97316]/10 hover:border-[#F97316]/30 transition-all group/btn shadow-inner mt-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#0A0A0A] flex items-center justify-center border border-white/5 group-hover/btn:border-[#F97316]/40 transition-all shadow-xl">
                        <span className="material-symbols-outlined text-[20px] group-hover/btn:rotate-90 transition-transform">add</span>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] font-mono italic">Novo Negócio</span>
                    </button>
                  </div>
                </div>
              </KanbanColumn>
            </div>
          )
        })}

        {/* ADD STAGE COLUMN - ELITE AETHER STYLE */}
        <div className="flex flex-col min-w-[360px] max-w-[360px]">
           <div className="mb-8 min-h-[100px] flex items-center justify-center px-4">
              {!isAddingStage ? (
                 <button 
                  onClick={() => setIsAddingStage(true)}
                  className="w-full h-24 flex items-center justify-center gap-6 text-[#404040] hover:text-[#F97316] bg-[#1A1A1A]/20 border border-dashed border-white/5 rounded-[32px] transition-all group"
                 >
                    <div className="w-12 h-12 rounded-2xl border border-white/5 bg-[#0A0A0A] flex items-center justify-center group-hover:border-[#F97316]/50 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] duration-700">
                       <span className="material-symbols-outlined text-[28px] group-hover:rotate-180 transition-transform duration-700">add</span>
                    </div>
                    <span className="text-[13px] font-black uppercase tracking-[0.4em] italic font-mono">Novo Estágio</span>
                 </button>
              ) : (
                 <div className="w-full p-8 bg-[#1A1A1A]/40 backdrop-blur-3xl border border-[#F97316]/20 rounded-[32px] space-y-6 animate-in zoom-in-95 duration-500 shadow-2xl">
                    <div className="text-[10px] font-mono font-black text-[#F97316] uppercase tracking-[0.4em]">New_Node_Provisioning</div>
                    <input 
                       autoFocus
                       placeholder="DEFINIR TÍTULO DA ETAPA..."
                       value={newStageName}
                       onChange={e => setNewStageName(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleAddStage()}
                       className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl px-6 py-4 text-[13px] text-white focus:border-[#F97316]/50 outline-none transition-all font-black placeholder:text-[#262626] tracking-widest uppercase italic"
                    />
                    <div className="flex gap-4">
                       <button 
                        onClick={() => setIsAddingStage(false)}
                        className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-[#404040] hover:text-[#F2F2F2] transition-colors"
                       >
                          Abortar
                       </button>
                       <button 
                        onClick={handleAddStage}
                        className="flex-[2] py-4 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_15px_30px_rgba(249,115,22,0.3)] transition-all hover:scale-[1.05]"
                       >
                          Confirmar Node
                       </button>
                    </div>
                 </div>
              )}
           </div>
           
           <div className="flex-1 rounded-[40px] border border-dashed border-white/[0.04] bg-[#0A0A0A]/20 flex flex-col items-center justify-center p-12 opacity-10">
              <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center mb-10">
                 <span className="material-symbols-outlined text-[56px]">layers</span>
              </div>
              <div className="text-[12px] font-mono font-black uppercase tracking-[0.5em] text-center italic">Aguardando Expansão de Cluster</div>
           </div>
        </div>
      </div>

      <DragOverlay dropAnimation={{
          duration: 400,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeDeal ? (
          <div className="rotate-2 scale-[1.08] shadow-[0_50px_100px_rgba(0,0,0,0.9)] opacity-90 transition-transform">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
