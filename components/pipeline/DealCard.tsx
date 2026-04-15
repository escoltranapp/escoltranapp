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
    ALTA: { label: "Alta", bg: "#1f1010", text: "#ef4444", border: "#3e1a1a" },
    MEDIA: { label: "Média", bg: "#1c1a10", text: "#d97706", border: "#3a2e10" },
    NOVO:  { label: "Novo",  bg: "#1a1a2e", text: "#818cf8", border: "#2d2d4e" },
  }
  
  // Use deal.prioridade or mapping based on status
  const priorityKey = deal.prioridade === 'ALTA' ? 'ALTA' : (deal.prioridade === 'MEDIA' ? 'MEDIA' : 'NOVO')
  const priorityMeta = priorityMap[priorityKey as keyof typeof priorityMap]

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#18181f] border border-[#1e1e24] rounded-[10px] p-[14px] group hover:bg-[#1e1e28] hover:border-[#2e2e3e] transition-all cursor-grab active:cursor-grabbing shadow-sm",
        isDragging && "opacity-50 z-50 ring-2 ring-[#4f46e5]/50 scale-[1.02]"
      )}
    >
      {/* TOPO: NOME + BADGE */}
      <div className="flex items-start justify-between gap-3 mb-[10px]">
        <h4 className="text-[13px] font-medium text-[#e8e8f0] leading-tight truncate flex-1 tracking-tight">
          {deal.titulo}
        </h4>
        <div 
           className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold border shrink-0"
           style={{ backgroundColor: priorityMeta.bg, color: priorityMeta.text, borderColor: priorityMeta.border }}
        >
           {priorityMeta.label}
        </div>
      </div>

      {/* META INFO */}
      <div className="flex flex-col gap-1.5 mt-2">
        <div className="flex items-center gap-1.5">
           <User size={12} className="text-white/20" />
           <span className="text-[11px] text-white/40 truncate">{contactName}</span>
        </div>
        <div className="flex items-center gap-1.5">
           <DollarSign size={12} className="text-white/20" />
           <span className="text-[11px] text-white/40 font-medium tracking-tight">
             {formatCurrency(deal.valorEstimado || 0)}
           </span>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="h-[1px] bg-[#1e1e24] my-[12px] -mx-1" />

      {/* FOOTER: AVATAR + DATA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-[#7c7caa] shrink-0 bg-[#2a2a3e] border border-white/5"
            style={{ backgroundColor: `hsl(${contactName.length * 40}, 30%, 20%)` }}
          >
            {getInitials(contactName)}
          </div>
          <span className="text-[10px] font-semibold text-white/10 uppercase tracking-widest">OWNER</span>
        </div>
        
        <div className="flex items-center gap-1 text-white/10">
          <Calendar size={11} />
          <span className="text-[10px] font-medium">
            {deal.dataPrevista ? format(new Date(deal.dataPrevista), "dd/MM", { locale: ptBR }) : "--/--"}
          </span>
        </div>
      </div>
    </div>
  )
}
