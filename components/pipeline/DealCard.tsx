"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, Tag } from "lucide-react"
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
    MEDIA: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", label: "Média" },
    BAIXA: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", label: "Baixa" },
  }
  
  const p = priorityStyles[deal.prioridade]

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#111522] border-[1.5px] border-white/[0.04] rounded-[18px] p-6 cursor-grab active:cursor-grabbing transition-all duration-300 hover:bg-[#161b2a] hover:border-blue-500/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] group",
        isDragging && "z-50 ring-2 ring-blue-500/50 shadow-2xl"
      )}
    >
      {/* HEADER: Title & Status Badge */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[17px] font-bold text-blue-500 tracking-tight leading-tight">
          {deal.titulo}
        </h3>
        <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400/80 border border-blue-500/10 uppercase tracking-widest">
           Novo
        </span>
      </div>

      {/* PRIORITY PILL */}
      <div className="flex mb-5">
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.05]" 
          style={{ backgroundColor: p.bg, borderColor: `${p.color}20` }}
        >
          <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: p.color }}></div>
          <span className="text-[11px] font-bold" style={{ color: p.color }}>{p.label}</span>
        </div>
      </div>

      {/* VALUE: Bold Blue Section */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[14px] font-bold text-blue-500/40">$</span>
        <span className="text-[18px] font-black text-blue-500 tracking-tightest">
          R$ {(deal.valorEstimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* DIVIDER */}
      <div className="h-[1px] bg-white/[0.05] mb-5"></div>

      {/* FOOTER: Avatar, Name & Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center">
             <span className="text-[10px] font-black text-emerald-500/60 uppercase">
                {deal.contact ? deal.contact.nome[0] : 'S'}
                {deal.contact?.sobrenome ? deal.contact.sobrenome[0] : 'E'}
             </span>
          </div>
          <span className="text-[13px] font-medium text-white/30 truncate max-w-[80px]">
            {deal.contact ? deal.contact.nome : 'Sem'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-white/10 group-hover:text-white/20 transition-colors">
          <Calendar size={14} className="opacity-50" />
          <span className="text-[12px] font-medium">
            {deal.dataPrevista ? new Date(deal.dataPrevista).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '21 de abr'}
          </span>
        </div>
      </div>
    </div>
  )
}
