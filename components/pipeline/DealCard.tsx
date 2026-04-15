"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DollarSign, Calendar, Clock, AlertCircle } from "lucide-react"
import { formatCurrency, getInitials, cn } from "@/lib/utils"
import { format, isPast, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"

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
    ALTA: { label: "Alta", color: "#f87171" },
    MEDIA: { label: "Média", color: "#f6ad55" },
    BAIXA: { label: "Baixa", color: "#68d391" },
  }
  const priorityMeta = priorityMap[deal.prioridade] || priorityMap.MEDIA
  const hasValue = (deal.valorEstimado || 0) > 0

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#161b2a] border-[0.5px] border-white/[0.08] rounded-[10px] p-[14px] pb-[12px] group hover:bg-[#1c2236] hover:border-white/[0.16] transition-all cursor-grab active:cursor-grabbing",
        isDragging && "shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/30 z-50"
      )}
    >
      {/* LINHA 1: TÍTULO + BADGE NOVO */}
      <div className="flex items-start justify-between gap-3 mb-[12px]">
        <h4 className={cn(
          "text-[14px] font-medium leading-[1.3] truncate flex-1",
          hasValue ? "text-[#4299e1]" : "text-white"
        )}>
          {deal.titulo}
        </h4>
        <div className="bg-[#63b3ed]/12 border-[0.5px] border-[#63b3ed]/25 px-2 py-0.5 rounded-[6px] text-[11px] font-medium text-[#63b3ed] whitespace-nowrap shrink-0">
          Novo
        </div>
      </div>

      {/* LINHA 2: BADGE DE PRIORIDADE (PILL ARREDONDADO) */}
      <div className="mb-[10px] flex">
        <div 
           className="inline-flex items-center gap-[6px] px-[10px] pl-[8px] py-[4px] rounded-[20px] transition-colors border-[0.5px]"
           style={{ backgroundColor: `${priorityMeta.color}26`, borderColor: `${priorityMeta.color}4D` }}
        >
           <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: priorityMeta.color }} />
           <span className="text-[12px] font-medium leading-none" style={{ color: priorityMeta.color }}>
             {priorityMeta.label}
           </span>
        </div>
      </div>

      {/* LINHA 3: VALOR */}
      <div className="flex items-center gap-[6px] mb-[12px]">
        <span className="text-[11px] font-medium text-white/25">$</span>
        <span className={cn(
          "text-[14px] font-semibold",
          hasValue ? "text-[#48c78e]" : "text-white/55"
        )}>
          {formatCurrency(deal.valorEstimado || 0)}
        </span>
      </div>

      {/* DIVIDER */}
      <div className="h-[0.5px] bg-white/[0.06] mt-[2px] mb-[10px] -mx-0.5" />

      {/* FOOTER: RESPONSÁVEL (LEFT) + DATA (RIGHT) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[7px] max-w-[65%]">
          <div 
            className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-semibold text-[#0d0d0d] shrink-0"
            style={{ backgroundColor: `hsl(${contactName.length * 40}, 60%, 45%)` }}
          >
            {getInitials(contactName)}
          </div>
          <span className="text-[12px] font-normal text-white/45 truncate">
            {contactName}
          </span>
        </div>
        
        <div className={cn(
          "flex items-center gap-[4px]",
          isOverdue ? "text-[#f87171] font-medium" : "text-white/35"
        )}>
          {isOverdue ? <Clock size={12} className="text-[#f87171]" /> : <Calendar size={12} className="text-white/25" />}
          <span className="text-[11px]">
            {deal.dataPrevista ? format(new Date(deal.dataPrevista), "dd 'de' MMM", { locale: ptBR }) : "S/D"}
          </span>
        </div>
      </div>
    </div>
  )
}
