"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DollarSign, User, Clock, Calendar } from "lucide-react"
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

  const priorityColors = {
    ALTA: { bg: "#1f1010", text: "#ef4444", border: "#3e1a1a", label: "Alta" },
    MEDIA: { bg: "#1c1a10", text: "#d97706", border: "#3a2e10", label: "Média" },
    BAIXA: { bg: "#1a1a2e", text: "#818cf8", border: "#2d2d4e", label: "Novo" },
  }
  
  const priority = priorityColors[deal.prioridade]

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#18181f] border border-[#1e1e24] rounded-[10px] p-[14px] cursor-pointer transition-all hover:bg-[#1e1e28] hover:border-[#2e2e3e] group",
        isDragging && "z-50 ring-2 ring-[#4f46e5]/50 shadow-2xl"
      )}
    >
      <div className="flex items-start justify-between mb-[10px]">
        <span className="text-[13px] font-medium text-[#e8e8f0] line-clamp-2 leading-[1.3]">
          {deal.titulo}
        </span>
        <span 
          className="text-[10px] font-semibold px-[8px] py-[2px] rounded-full shrink-0 mt-[1px]"
          style={{ background: priority.bg, color: priority.text, border: `1px solid ${priority.border}` }}
        >
          {priority.label}
        </span>
      </div>

      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center gap-[6px]">
          <User size={11} className="text-[#555]" />
          <span className="text-[11px] color-[#555]">
            {deal.contact ? `${deal.contact.nome} ${deal.contact.sobrenome || ''}` : 'Sem responsável'}
          </span>
        </div>
        <div className="flex items-center gap-[6px]">
          <DollarSign size={11} className="text-[#555]" />
          <span className="text-[11px] text-[#888] font-medium">
             R$ {(deal.valorEstimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="h-[1px] bg-[#1e1e24] my-[10px]"></div>

      <div className="flex items-center justify-between">
        <div className="w-[22px] h-[22px] rounded-full bg-[#2a2a3e] border border-[#333345] flex items-center justify-center text-[9px] font-semibold text-[#7c7caa]">
          SR
        </div>
        <div className="flex items-center gap-1 text-[#444]">
          <Calendar size={10} />
          <span className="text-[10px] font-bold">
            {deal.dataPrevista ? new Date(deal.dataPrevista).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'S/D'}
          </span>
        </div>
      </div>
    </div>
  )
}
