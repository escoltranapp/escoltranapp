"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DollarSign, Calendar, Clock, User, AlertCircle } from "lucide-react"
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
  color?: string // For custom stage color values
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

  // Priority Tokens
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
        "bg-[#1C2333]/40 backdrop-blur-sm border border-white/[0.08] rounded-[14px] p-5 mb-4 group hover:border-white/20 transition-all cursor-grab active:cursor-grabbing",
        isDragging && "shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/30"
      )}
    >
      {/* LINHA 1: TÍTULO + STATUS */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="text-[13px] font-bold text-white leading-tight uppercase tracking-tight group-hover:text-blue-400 transition-colors">
          {deal.titulo}
        </h4>
        <div className={cn(
          "card-status-badge",
          deal.status === "OPEN" ? "bg-blue-500/10 text-blue-400 border border-blue-500/10" : "bg-green-500/10 text-green-400 border border-green-500/10"
        )}>
          {deal.status === "OPEN" ? "Novo" : "Em andamento"}
        </div>
      </div>

      {/* LINHA 2: PRIORIDADE */}
      <div className="mb-4">
        <div className="priority-pill w-fit">
           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityMeta.color, boxShadow: `0 0 8px ${priorityMeta.color}` }} />
           <span className="text-white/40">{priorityMeta.label}</span>
        </div>
      </div>

      {/* LINHA 3: VALOR */}
      <div className="flex items-center gap-1.5 mb-5">
        <DollarSign size={14} className="text-white/20" />
        <span className="text-[16px] font-black text-white">
          {formatCurrency(deal.valorEstimado || 0)}
        </span>
      </div>

      {/* LINHA 4: RODAPÉ */}
      <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-[9px] font-black text-white/30">
            {getInitials(contactName)}
          </div>
          <span className="text-[10px] font-bold text-white/20 truncate max-w-[80px]">
            {contactName}
          </span>
        </div>
        
        <div className={cn(
          "flex items-center gap-1.5",
          isOverdue ? "text-red-500" : "text-white/10"
        )}>
          {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
          <span className="text-[9px] font-bold uppercase tracking-wider">
            {deal.dataPrevista ? format(new Date(deal.dataPrevista), "dd/MM") : "S/ Data"}
          </span>
        </div>
      </div>
    </div>
  )
}
