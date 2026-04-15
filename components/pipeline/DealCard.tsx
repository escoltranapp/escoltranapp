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

  const contactName = deal.contact ? `${deal.contact.nome} ${deal.contact.sobrenome || ""}` : "Sem Responsável"

  const priorityColors = {
    ALTA: { bg: "rgba(248, 113, 113, 0.15)", text: "#f87171", dot: "#f87171" },
    MEDIA: { bg: "rgba(251, 191, 36, 0.15)", text: "#fbbf24", dot: "#fbbf24" },
    BAIXA: { bg: "rgba(129, 140, 248, 0.15)", text: "#818cf8", dot: "#818cf8" }
  }
  const colors = priorityColors[deal.prioridade as keyof typeof priorityColors] || priorityColors.MEDIA

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#111118]/80 border border-[#23232b] hover:border-[#4f46e5]/40 p-[28px] rounded-[24px] transition-all cursor-grab active:cursor-grabbing shadow-2xl hover:shadow-[#4f46e5]/10 group min-h-[180px] flex flex-col justify-between backdrop-blur-md",
        isDragging && "opacity-50 z-50 ring-4 ring-[#4f46e5]/30 scale-[1.05]"
      )}
    >
      {/* TOP: STATUS & PRIORITY BADGE */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-[10px] h-[10px] rounded-full shadow-[0_0_12px_rgba(255,255,255,0.2)]" style={{ backgroundColor: colors.dot }} />
          <span className="text-[11px] font-black text-white/10 uppercase tracking-[0.25em]">Pipeline</span>
        </div>
        
        <div 
          className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {deal.prioridade}
        </div>
      </div>

      {/* CENTER: TITLE (UPPERCASE IMPACT) */}
      <div className="mb-6">
        <h4 className="text-[16px] font-black text-white/90 leading-tight mb-4 group-hover:text-[#818cf8] transition-colors uppercase tracking-tight">
          {deal.titulo}
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5">
             <User size={15} className="text-white/15" />
             <span className="text-[12px] font-bold text-white/30 truncate">{getInitials(contactName)} · {contactName.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-2.5">
             <DollarSign size={15} className="text-[#4ade80]/40" />
             <span className="text-[13px] font-black text-[#4ade80]">R$ {(deal.valorEstimado || 0).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="h-[1px] w-full bg-white/[0.04] mb-4" />

      {/* FOOTER: AVATAR & DATE */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#1e1e2d] to-[#111118] border border-white/10 flex items-center justify-center shadow-inner">
             <span className="text-[11px] font-black text-white/20">SR</span>
          </div>
          <span className="text-[10px] font-black text-white/5 uppercase tracking-[0.2em]">{deal.stageId ? 'Ativo' : 'Lead'}</span>
        </div>

        <div className="flex items-center gap-2 text-white/10 group-hover:text-[#4f46e5]/40 transition-colors">
          <Calendar size={14} strokeWidth={3} />
          <span className="text-[11px] font-black">
            {deal.dataPrevista ? format(new Date(deal.dataPrevista), "dd/MM") : "--/--"}
          </span>
        </div>
      </div>
    </div>
  )
}
