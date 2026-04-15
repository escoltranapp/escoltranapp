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

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#111118] border border-white/[0.05] rounded-[14px] p-5 cursor-grab active:cursor-grabbing transition-all hover:bg-[#161620] group",
        isDragging && "z-50 ring-2 ring-indigo-500/50 shadow-2xl"
      )}
    >
      {/* HEADER: Title and Status Badge */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[15px] font-bold text-white tracking-tight">
          {deal.titulo}
        </h3>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#1c1c30] text-[#4f46e5] border border-transparent">
           Novo
        </span>
      </div>

      {/* METADATA LINES */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[#444] group-hover:text-[#555] transition-colors">
          <User size={14} />
          <span className="text-[13px] font-medium truncate">
            {deal.contact ? `${deal.contact.nome} ${deal.contact.sobrenome || ''}` : 'Sem responsável'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#444] group-hover:text-[#555] transition-colors">
          <CreditCard size={14} />
          <span className="text-[13px] font-medium italic">
            R$ {(deal.valorEstimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="h-[1px] bg-white/[0.03] mb-4"></div>

      {/* FOOTER */}
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-full bg-[#1c1c28] flex items-center justify-center text-[10px] font-bold text-[#4f46e5]">
           {deal.contact ? (deal.contact.nome[0] + (deal.contact.sobrenome?.[0] || '')).toUpperCase() : 'SR'}
        </div>
        <span className="text-[11px] font-bold text-[#333]">
           {deal.dataPrevista ? new Date(deal.dataPrevista).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase() : 'S/D'}
        </span>
      </div>
    </div>
  )
}
