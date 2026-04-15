"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DollarSign, Calendar, Clock, AlertCircle, User } from "lucide-react"
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
        "bg-[#18181f] border border-[#1e1e24] rounded-[12px] p-[16px] group hover:bg-[#1e1e28] hover:border-white/10 transition-all cursor-grab active:cursor-grabbing shadow-lg",
        isDragging && "opacity-50 z-50 ring-2 ring-[#4f46e5]/50 scale-[1.02]"
      )}
    >
      {/* TOPO: NOME + BADGE (IMAGE 1 POSITION) */}
      <div className="flex items-start justify-between gap-3 mb-[14px]">
        <h4 className="text-[14px] font-bold text-white leading-tight tracking-tight flex-1">
          {deal.titulo}
        </h4>
        <div 
           className="inline-flex items-center px-[8px] py-[3px] rounded-[6px] text-[10px] font-bold border shrink-0 uppercase tracking-wider"
           style={{ backgroundColor: priorityMeta.bg, color: priorityMeta.text, borderColor: priorityMeta.border }}
        >
           {priorityMeta.label}
        </div>
      </div>

      {/* META INFO (IMAGE 1 STYLE) */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex items-center gap-2">
           <User size={13} className="text-white/20" />
           <span className="text-[11px] font-medium text-white/40 truncate tracking-tight">{contactName}</span>
        </div>
        <div className="flex items-center gap-2">
           <DollarSign size={13} className="text-white/20" />
           <span className="text-[12px] font-bold text-white/70 tracking-tight">
             R$ {(deal.valorEstimado || 0).toLocaleString('pt-BR')}
           </span>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="h-[1px] bg-white/[0.04] mt-[16px] mb-[12px] -mx-1" />

      {/* FOOTER: AVATAR + STATUS INDICATOR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border border-white/10"
            style={{ backgroundColor: `hsl(${contactName.length * 40}, 30%, 25%)`, color: '#fff' }}
          >
            {getInitials(contactName)}
          </div>
          <span className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">{deal.stageId ? 'Ativo' : 'Owner'}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-white/10">
          <Calendar size={12} />
          <span className="text-[10px] font-bold">
            {deal.dataPrevista ? format(new Date(deal.dataPrevista), "dd/MM", { locale: ptBR }) : "--/--"}
          </span>
        </div>
      </div>
    </div>
  )
}
