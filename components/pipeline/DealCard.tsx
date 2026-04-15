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
        "bg-[var(--bg-card)] border border-white/[0.05] rounded-[14px] p-[16px] pb-[14px] group hover:bg-[var(--bg-card-hover)] hover:border-white/[0.12] transition-all cursor-grab active:cursor-grabbing shadow-lg",
        isDragging && "shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/20 z-50 scale-[1.02]"
      )}
    >
      {/* LINHA 1: TÍTULO + BADGE NOVO — REFINADO */}
      <div className="flex items-start justify-between gap-3 mb-[12px]">
        <h4 className={cn(
          "text-[14px] font-semibold leading-[1.4] truncate flex-1 tracking-tight transition-colors",
          hasValue ? "text-[var(--pipeline-blue)]" : "text-[var(--text-primary)]"
        )}>
          {deal.titulo}
        </h4>
        <div className="bg-white/[0.05] border border-white/[0.05] px-2 py-0.5 rounded-[6px] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap shrink-0">
          Novo
        </div>
      </div>

      {/* LINHA 2: BADGE DE PRIORIDADE (PILULA MINIMALISTA) */}
      <div className="mb-[12px] flex">
        <div 
           className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full border border-white/[0.03] shadow-sm"
           style={{ backgroundColor: `${priorityMeta.color}15` }}
        >
           <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: priorityMeta.color }} />
           <span className="text-[11px] font-semibold leading-none tracking-tight" style={{ color: priorityMeta.color }}>
             {priorityMeta.label}
           </span>
        </div>
      </div>

      {/* LINHA 3: VALOR — DESTAQUE LIMPO */}
      <div className="flex items-center gap-[6px] mb-[12px]">
        <span className="text-[12px] font-medium text-[var(--text-muted)]">$</span>
        <span className={cn(
          "text-[15px] font-bold tracking-tight",
          hasValue ? "text-[var(--pipeline-green)]" : "text-[var(--text-muted)]"
        )}>
          {formatCurrency(deal.valorEstimado || 0)}
        </span>
      </div>

      {/* DIVIDER — SUTIL */}
      <div className="h-[1px] bg-white/[0.04] mb-[12px] -mx-1" />

      {/* FOOTER: RESPONSÁVEL + DATA — EQUILÍBRIO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px] max-w-[65%]">
          <div 
            className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-inner"
            style={{ backgroundColor: `hsl(${contactName.length * 40}, 55%, 40%)` }}
          >
            {getInitials(contactName)}
          </div>
          <span className="text-[12px] font-medium text-[var(--text-secondary)] truncate">
            {contactName}
          </span>
        </div>
        
        <div className={cn(
          "flex items-center gap-[4px] transition-colors",
          isOverdue ? "text-[var(--pipeline-red)]" : "text-[var(--text-muted)]"
        )}>
          {isOverdue ? <Clock size={12} /> : <Calendar size={12} className="opacity-50" />}
          <span className="text-[11px] font-medium tracking-tight">
            {deal.dataPrevista ? format(new Date(deal.dataPrevista), "dd 'de' MMM", { locale: ptBR }) : "S/D"}
          </span>
        </div>
      </div>
    </div>
  )
}
