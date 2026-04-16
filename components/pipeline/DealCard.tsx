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
  origin?: string | null
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
    ALTA: { color: "text-white", bg: "bg-red-600", border: "border-red-600", label: "ALTA" },
    MEDIA: { color: "text-[#F97316]", bg: "bg-[#F97316]/10", border: "border-[#F97316]/20", label: "MÉDIA" },
    BAIXA: { color: "text-[#6B7280]", bg: "bg-[#262626]", border: "border-white/5", label: "BAIXA" },
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
        "bg-[#1A1A1A] rounded-xl p-5 border border-white/5 transition-all duration-200 cursor-grab active:cursor-grabbing hover:bg-[#262626] relative group",
        isDragging && "z-50 ring-2 ring-[#F97316]/20 shadow-2xl shadow-black"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[14px] font-black text-white tracking-tight leading-snug group-hover:text-[#F97316] transition-colors uppercase italic">
          {deal.titulo}
        </h3>
        <span className="material-symbols-outlined text-[#404040] text-[18px]">drag_indicator</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
         <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-[14px] text-[#404040]">person</span>
            <span className="text-[11px] font-bold text-[#A3A3A3] truncate uppercase tracking-tight">
               {deal.contact?.nome || "Lead Sinc"}
            </span>
         </div>
         <div className="flex-1 h-px bg-white/[0.04]" />
         <span className={cn(
           "text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest border",
           p.bg, p.color, p.border
         )}>
           {p.label}
         </span>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col">
           <span className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest leading-none mb-1">Valor Estimado</span>
           <span className="text-[14px] font-mono font-black text-[#F97316] tracking-tighter">
              {deal.valorEstimado?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || "R$ 0,00"}
           </span>
        </div>

        <div className="flex items-center gap-2">
           {deal.origin && (
              <span className="material-symbols-outlined text-[18px] text-[#404040]" title={deal.origin}>
                 {deal.origin === 'google' ? 'public' : 'ads_click'}
              </span>
           )}
           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] p-[1px] shadow-lg shadow-[#F97316]/10">
              <div className="w-full h-full rounded-full bg-[#0A0A0A] flex items-center justify-center text-[9px] font-black text-[#F97316] font-mono">
                 {deal.contact?.nome?.slice(0, 1).toUpperCase() || "EC"}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
