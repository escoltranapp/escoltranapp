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
        "bg-[var(--bg-surface-2)] border border-white/[0.08] rounded-[10px] p-4 group hover:bg-[var(--pipeline-card-hover)] hover:border-white/20 transition-all cursor-grab active:cursor-grabbing",
        isDragging && "shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/30"
      )}
    >
      {/* LINHA 1: TÍTULO + STATUS */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="text-[12px] font-bold text-white leading-tight uppercase tracking-tight">
          {deal.titulo}
        </h4>
        <div className={cn(
          "px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase",
          deal.status === "OPEN" ? "bg-blue-500/10 text-blue-400" : "bg-green-500/10 text-green-400"
        )}>
          {deal.status === "OPEN" ? "Novo" : "Ativo"}
        </div>
      </div>

      {/* LINHA 2: PRIORIDADE */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] w-fit">
           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityMeta.color }} />
           <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{priorityMeta.label}</span>
        </div>
      </div>

      {/* LINHA 3: VALOR */}
      <div className="flex items-center gap-1.5 mb-4">
        <DollarSign size={12} className="text-white/20" />
        <span className="text-[14px] font-black text-white">
          {formatCurrency(deal.valorEstimado || 0)}
        </span>
      </div>

      {/* LINHA 4: RODAPÉ */}
      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center text-[8px] font-black text-white/30 truncate">
            {getInitials(contactName)}
          </div>
          <span className="text-[9px] font-bold text-white/20 truncate max-w-[70px]">
            {contactName}
          </span>
        </div>
        
        <div className={cn(
          "flex items-center gap-1.5",
          isOverdue ? "text-red-500" : "text-white/10"
        )}>
          {isOverdue ? <AlertCircle size={10} /> : <Calendar size={10} />}
          <span className="text-[9px] font-bold">
            {deal.dataPrevista ? format(new Date(deal.dataPrevista), "dd/MM") : "S/D"}
          </span>
        </div>
      </div>
    </div>
  )
}
