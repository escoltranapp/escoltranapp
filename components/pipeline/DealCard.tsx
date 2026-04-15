"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DollarSign, Calendar, Clock, AlertCircle } from "lucide-react"
import { formatCurrency, getInitials, cn } from "@/lib/utils"
import { format, isPast, isToday } from "date-fns"

export interface Deal {
  id: string
  titulo: string
  valorEstimado?: number | null
  prioridade: "ALTA" | "MEDIA" | "BAIXA"
  status: "OPEN" | "WON" | "LOST"
  stageId?: string | null
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

  const isOverdue = deal.dataPrevista && isPast(new Date(deal.dataPrevista)) && !isToday(new Date(deal.dataPrevista))
  const contactName = deal.contact ? `${deal.contact.nome} ${deal.contact.sobrenome || ""}` : "Sem Responsável"

  const priorityMap = {
    ALTA: { label: "Alta", color: "#EF4444" },
    MEDIA: { label: "Média", color: "#F59E0B" },
    BAIXA: { label: "Baixa", color: "#10B981" },
  }
  const priorityMeta = priorityMap[deal.prioridade] || priorityMap.MEDIA

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[var(--pipeline-card)] border border-white/[0.07] rounded-[10px] p-[14px] px-[16px] group hover:bg-[var(--pipeline-card-hover)] hover:border-white/20 transition-all cursor-grab active:cursor-grabbing shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
        isDragging && "shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/30"
      )}
    >
      {/* LINHA 1: TÍTULO + STATUS */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="text-[14px] font-semibold text-[#E6EDF3] leading-tight truncate flex-1">
          {deal.titulo}
        </h4>
        <div className="bg-[#388BFD]/15 border border-[#388BFD]/30 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#388BFD] whitespace-nowrap">
          {deal.status === "OPEN" ? "Novo" : "Ativo"}
        </div>
      </div>

      {/* LINHA 2: PRIORIDADE PILL */}
      <div className="mb-4">
        <div 
           className="flex items-center gap-2 px-2.5 py-1 rounded-full w-fit"
           style={{ backgroundColor: `${priorityMeta.color}26` }} // 15% opacity
        >
           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityMeta.color }} />
           <span className="text-[12px] font-medium uppercase tracking-tight" style={{ color: priorityMeta.color }}>
             {priorityMeta.label}
           </span>
        </div>
      </div>

      {/* LINHA 3: VALOR */}
      <div className="flex items-center gap-[6px] mb-4">
        <DollarSign size={13} className="text-[#8B949E]" />
        <span className="text-[15px] font-bold text-white">
          {formatCurrency(deal.valorEstimado || 0)}
        </span>
      </div>

      {/* LINHA 4: RODAPÉ */}
      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-[65%]">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white/90 shrink-0"
            style={{ backgroundColor: `hsl(${contactName.length * 40}, 60%, 45%)` }}
          >
            {getInitials(contactName)}
          </div>
          <span className="text-[12px] font-medium text-[#8B949E] truncate">
            {contactName}
          </span>
        </div>
        
        <div className={cn(
          "flex items-center gap-1.5",
          isOverdue ? "text-[#EF4444]" : "text-[#8B949E]"
        )}>
          {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
          <span className="text-[12px] font-medium">
            {deal.dataPrevista ? format(new Date(deal.dataPrevista), "dd/MM") : "S/D"}
          </span>
        </div>
      </div>
    </div>
  )
}
