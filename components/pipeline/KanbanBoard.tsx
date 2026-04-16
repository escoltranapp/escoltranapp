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
        // Refresh stages
        // The parent component should ideally refetch, but we can optimistically add?
        // Let's assume the parent refetches via invalidateQueries if we provide a callback
        window.location.reload() // Quick fix to ensure full sync of order/ids
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
          "flex gap-8 h-full min-h-[calc(100vh-320px)] overflow-x-auto pb-12 transition-colors cursor-grab active:cursor-grabbing",
          "scrollbar-thin scrollbar-track-[#0A0A0A] scrollbar-thumb-[#F97316]/20 hover:scrollbar-thumb-[#F97316]/40"
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#F9731633 #0A0A0A'
        }}
      >
        {stages.map((stage) => {
          const totalValue = stage.deals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0)

          return (
            <div key={stage.id} className="flex flex-col min-w-[320px] max-w-[320px] select-none">
              {/* STAGE HEADER ESCOLTRAN STYLE */}
              <div className="mb-6 px-1 group/header">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.6)]" style={{ backgroundColor: stage.color || '#F97316' }} />
                    
                    {editingStageId === stage.id ? (
                      <div className="flex items-center gap-2">
                         <input 
                            autoFocus
                            value={editStageName}
                            onChange={(e) => setEditStageName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateStage(stage.id)}
                            className="bg-[#1A1A1A] border border-[#F97316]/30 rounded-lg px-2 py-1 text-[13px] font-black text-white w-32 focus:border-[#F97316] outline-none"
                         />
                         <button onClick={() => handleUpdateStage(stage.id)} className="text-[#F97316]">
                           <span className="material-symbols-outlined text-[18px]">check</span>
                         </button>
                         <button onClick={() => setEditingStageId(null)} className="text-[#404040]">
                           <span className="material-symbols-outlined text-[18px]">close</span>
                         </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/title">
                        <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#A3A3A3] italic">
                          {stage.name}
                        </h2>
                        <div className="flex opacity-0 group-hover/header:opacity-100 transition-opacity">
                            <button 
                               onClick={() => {
                                  setEditingStageId(stage.id)
                                  setEditStageName(stage.name)
                               }}
                               className="p-1 hover:text-[#F97316] transition-colors"
                            >
                               <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                            <button 
                               onClick={() => handleDeleteStage(stage.id, stage.deals.length)}
                               className="p-1 hover:text-red-500 transition-colors"
                            >
                               <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-black text-[#F97316] bg-[#F97316]/10 px-2.5 py-0.5 rounded-lg border border-[#F97316]/20">
                    {stage.deals.length}
                  </span>
                </div>
                
                <div className="text-[16px] font-mono font-black text-[#F2F2F2] tracking-widest pl-5">
                   {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </div>
              </div>

              {/* COLUMN BODY */}
              <KanbanColumn id={stage.id} deals={stage.deals}>
                <div className="flex flex-col gap-4 min-h-[200px] p-2.5 rounded-2xl bg-[#121212] border border-white/[0.04]">
                  <SortableContext id={stage.id} items={stage.deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                    {stage.deals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} onClick={() => onDealClick?.(deal)} />
                    ))}
                  </SortableContext>
                  
                  {/* ADD CARD BUTTON LARANJA */}
                  <button 
                    onClick={() => onAddDeal?.(stage.id)}
                    className="flex items-center justify-center gap-2 w-full py-5 border border-dashed border-white/5 rounded-2xl text-[#404040] hover:text-[#F97316] hover:bg-[#F97316]/5 transition-all group cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono">Expandir Dataset</span>
                  </button>
                </div>
              </KanbanColumn>
            </div>
          )
        })}

        {/* ADD STAGE COLUMN ESCOLTRAN STYLE */}
        <div className="flex flex-col min-w-[320px] max-w-[320px]">
           <div className="mb-6 h-[72px] flex items-center px-1">
              {!isAddingStage ? (
                 <button 
                  onClick={() => setIsAddingStage(true)}
                  className="w-full flex items-center gap-3 text-[#404040] hover:text-[#F97316] transition-all group py-2"
                 >
                    <div className="w-8 h-8 rounded-full border border-white/5 bg-[#1A1A1A] flex items-center justify-center group-hover:border-[#F97316]/50 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                       <span className="material-symbols-outlined text-[20px]">add</span>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Nova Etapa do Fluxo</span>
                 </button>
              ) : (
                 <div className="w-full space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input 
                       autoFocus
                       placeholder="Título da Etapa..."
                       value={newStageName}
                       onChange={e => setNewStageName(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleAddStage()}
                       className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-2.5 text-[12px] text-white focus:border-[#F97316]/50 outline-none transition-all font-black"
                    />
                    <div className="flex gap-2">
                       <button 
                        onClick={() => setIsAddingStage(false)}
                        className="flex-1 py-2 text-[9px] font-black uppercase tracking-widest text-[#404040] hover:text-[#F2F2F2]"
                       >
                          Abortar
                       </button>
                       <button 
                        onClick={handleAddStage}
                        className="flex-[2] py-2 bg-[#F97316] text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                       >
                          Confirmar
                       </button>
                    </div>
                 </div>
              )}
           </div>
           
           <div className="flex-1 rounded-2xl border border-dashed border-white/[0.03] bg-transparent flex flex-col items-center justify-center p-8 opacity-20">
              <span className="material-symbols-outlined text-[48px] mb-4">move_item</span>
              <div className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-center">Espaço Reservado para Dataset</div>
           </div>
        </div>
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="rotate-3 scale-105 shadow-2xl">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
