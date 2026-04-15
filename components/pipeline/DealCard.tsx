"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { User, CreditCard } from "lucide-react"
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

  // Priority Styles based on the Média/Novo badges in image
  const priorityStyles = {
    ALTA: { color: "#ef4444", bg: "#1f1010", label: "Crítico" },
    MEDIA: { color: "#f59e0b", bg: "#1f1a10", label: "Média" },
    BAIXA: { color: "#4f46e5", bg: "#1a1a2e", label: "Novo" },
  }
  
  const p = (deal.prioridade === "BAIXA" && deal.status === "OPEN") 
    ? { color: "#4f46e5", bg: "#1a1a2e", label: "Novo" }
    : priorityStyles[deal.prioridade]

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#111118] border border-white/[0.04] rounded-[10px] p-[16px] cursor-grab active:cursor-grabbing transition-all hover:bg-[#15151e] group",
        isDragging && "z-50 ring-2 ring-indigo-500/40 shadow-2xl"
      )}
    >
      {/* HEADER: Title and Status Badge */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-[13px] font-bold text-white tracking-tight leading-tight">
          {deal.titulo}
        </h3>
        <span 
          className="text-[10px] font-bold px-[10px] py-[3px] rounded-full"
          style={{ backgroundColor: p.bg, color: p.color }}
        >
           {p.label}
        </span>
      </div>

      {/* METADATA LINES - Compact and Muted */}
      <div className="flex flex-col gap-1.5 mb-3">
        <div className="flex items-center gap-2 text-[#444] group-hover:text-[#555] transition-colors">
          <User size={13} strokeWidth={1.5} />
          <span className="text-[12px] font-medium truncate tracking-[0.01em]">
            {deal.contact ? `${deal.contact.nome} ${deal.contact.sobrenome || ''}` : 'Sem responsável'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#444] group-hover:text-[#555] transition-colors">
          <CreditCard size={13} strokeWidth={1.5} />
          <span className="text-[12px] font-medium italic tracking-[0.01em]">
            R$ {(deal.valorEstimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* DIVIDER - Very subtle */}
      <div className="h-[1px] bg-white/[0.02] mb-3"></div>

      {/* FOOTER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 relative">
           <div className="w-[28px] h-[28px] rounded-full bg-[#1c1c28] flex items-center justify-center text-[9px] font-bold text-[#4f46e5] border border-white/[0.02]">
              {deal.contact ? (deal.contact.nome[0] + (deal.contact.sobrenome?.[0] || '')).toUpperCase() : 'SR'}
           </div>
        </div>
        <span className="text-[10px] font-bold text-[#333] tracking-widest">
           {deal.dataPrevista ? new Date(deal.dataPrevista).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase() : 'S/D'}
        </span>
      </div>
    </div>
  )
}
