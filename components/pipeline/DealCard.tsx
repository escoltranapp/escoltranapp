"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DollarSign, User, Calendar, Tag, Minus } from "lucide-react"
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
    ALTA: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", label: "CRÍTICO" },
    MEDIA: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)", label: "PENDENTE" },
    BAIXA: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.08)", label: "NOVO DEAL" },
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
        "bg-[#161b2a] border border-white/[0.05] rounded-xl p-5 cursor-grab active:cursor-grabbing transition-all duration-300 hover:bg-[#1c223c] hover:border-white/10 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group overflow-hidden relative",
        isDragging && "z-50 ring-2 ring-indigo-500/50 shadow-2xl"
      )}
    >
      {/* GLOW DECORATOR */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-[40px] pointer-events-none group-hover:bg-indigo-500/10 transition-all"></div>

      {/* TOP: Priority Badge */}
      <div className="flex items-center justify-between mb-5">
        <div 
           className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/[0.03] backdrop-blur-md" 
           style={{ backgroundColor: priority.bg }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: priority.color }}></div>
          <span 
            className="text-[9px] font-black uppercase tracking-[0.2em]" 
            style={{ color: priority.color }}
          >
            {priority.label}
          </span>
        </div>
        <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.03] group-hover:border-white/10 transition-all">
           <Tag size={10} className="text-white/20 group-hover:text-white/40" />
        </div>
      </div>

      {/* TITLE - Refined typography */}
      <h3 className="text-[15px] font-bold text-white/90 mb-5 leading-[1.4] tracking-tight group-hover:text-white transition-colors min-h-[42px] line-clamp-2">
        {deal.titulo}
      </h3>

      {/* METADATA GRID - More technical/clean look */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2.5 text-white/30 group-hover:text-white/50 transition-colors">
          <div className="w-5 h-5 rounded-md bg-white/[0.02] flex items-center justify-center">
            <User size={10} />
          </div>
          <span className="text-[11px] font-semibold tracking-wide truncate">
            {deal.contact ? `${deal.contact.nome} ${deal.contact.sobrenome || ''}` : 'Lead s/ Atribuição'}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-white/30 group-hover:text-white/50 transition-colors">
          <div className="w-5 h-5 rounded-md bg-white/[0.02] flex items-center justify-center">
            <Calendar size={10} />
          </div>
          <span className="text-[11px] font-medium font-mono text-white/25 group-hover:text-white/40">
            {deal.dataPrevista ? new Date(deal.dataPrevista).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase() : 'PREVISÃO: TBD'}
          </span>
        </div>
      </div>

      {/* FOOTER: Standardized value section */}
      <div className="flex items-center justify-between pt-5 border-t border-white/[0.04] relative">
        <div className="flex -space-x-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center text-[10px] font-black text-white/40 shadow-inner group-hover:border-indigo-500/30 transition-all">
             {deal.contact ? (deal.contact.nome[0] + (deal.contact.sobrenome?.[0] || '')).toUpperCase() : 'SR'}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
           <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] mb-1 group-hover:text-indigo-500/40 transition-colors">Estimation</span>
           <div className="flex items-baseline gap-1">
             <span className="text-[10px] font-bold text-white/20">R$</span>
             <span className="text-[16px] font-black text-white font-mono tracking-tighter group-hover:text-indigo-400 transition-colors">
                {(deal.valorEstimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
             </span>
           </div>
        </div>
      </div>
    </div>
  )
}
