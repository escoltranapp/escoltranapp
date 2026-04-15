"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DollarSign, User, Calendar, Tag } from "lucide-react"
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
  stageColor?: string
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

  const priorityStyles = {
    ALTA: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", label: "Crítico" },
    MEDIA: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", label: "Pendente" },
    BAIXA: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", label: "Novo" },
  }
  
  const priority = priorityStyles[deal.prioridade]

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#161b2a] border border-white/[0.05] rounded-xl p-5 cursor-grab active:cursor-grabbing transition-all hover:bg-[#1c223c] hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl group",
        isDragging && "z-50 ring-2 ring-indigo-500/50 shadow-2xl"
      )}
    >
      {/* TOP: Priority & Badge */}
      <div className="flex items-center justify-between mb-4">
        <div 
           className="priority-pill" 
           style={{ color: priority.color, backgroundColor: priority.bg, borderColor: `${priority.color}20` }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priority.color }}></div>
          {priority.label}
        </div>
        <Tag size={12} className="text-white/10 group-hover:text-white/20 transition-colors" />
      </div>

      {/* TITLE */}
      <h3 className="text-sm font-bold text-white/90 mb-4 leading-tight group-hover:text-white transition-colors">
        {deal.titulo}
      </h3>

      {/* METADATA GRID */}
      <div className="space-y-2.5 mb-5">
        <div className="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
          <User size={12} />
          <span className="text-[11px] font-medium leading-none">
            {deal.contact ? `${deal.contact.nome} ${deal.contact.sobrenome || ''}` : 'Sem responsável'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
          <Calendar size={12} />
          <span className="text-[11px] font-medium leading-none">
            {deal.dataPrevista ? new Date(deal.dataPrevista).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : 'Previsão: S/D'}
          </span>
        </div>
      </div>

      {/* FOOTER: VALUE & INITIALS */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-white/20">
             {deal.contact ? (deal.contact.nome[0] + (deal.contact.sobrenome?.[0] || '')).toUpperCase() : 'SR'}
          </div>
        </div>
        
        <div className="text-right">
           <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Valor</div>
           <div className="text-[13px] font-black text-white group-hover:text-indigo-400 transition-colors">
              R$ {(deal.valorEstimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
           </div>
        </div>
      </div>
    </div>
  )
}
