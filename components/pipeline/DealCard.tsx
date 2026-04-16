"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

export interface Deal {
  id: string
  titulo: string
  valorEstimado?: number | null
  prioridade: "ALTA" | "MEDIA" | "BAIXA"
  status: "OPEN" | "WON" | "LOST"
  stageId?: string | null
  createdAt: string
  dataPrevista?: string | null
  contact?: {
    nome: string
    sobrenome?: string | null
  } | null
}

interface DealCardProps {
  deal: Deal
  onClick?: () => void
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  }

  const priorityConfig = {
    ALTA: { color: "text-error", bg: "bg-error/10", border: "border-error/20", label: "URGENTE" },
    MEDIA: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "AGENDADO" },
    BAIXA: { color: "text-tertiary-container", bg: "bg-tertiary-container/10", border: "border-tertiary-container/20", label: "QUALIFICADO" },
  }
  
  const p = priorityConfig[deal.prioridade]

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-surface-container rounded-xl p-5 border border-white/5 transition-all duration-200 cursor-grab active:cursor-grabbing hover:bg-surface-container-high relative group",
        deal.prioridade === 'ALTA' && "border-l-4 border-l-error",
        isDragging && "z-50 ring-2 ring-primary-container/20"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-white tracking-tight leading-snug group-hover:text-amber-500 transition-colors">
          {deal.titulo}
        </h3>
        <span className="material-symbols-outlined text-slate-600 text-[18px]">more_vert</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={cn(
          "text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-widest border",
          p.bg, p.color, p.border
        )}>
          {p.label}
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5">
           <span className="material-symbols-outlined text-slate-500 text-[14px]">payments</span>
           <span className="text-[12px] font-mono font-bold text-amber-500">
             {deal.valorEstimado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </span>
        </div>

        <div className="flex items-center -space-x-1">
           <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-[9px] font-bold text-slate-400 font-mono">
              {deal.contact?.nome.slice(0, 2).toUpperCase() || "EC"}
           </div>
        </div>
      </div>
    </div>
  )
}
