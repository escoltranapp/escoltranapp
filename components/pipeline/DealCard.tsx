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

  // Priority Styles tuned for high-density SaaS look
  const priorityStyles = {
    ALTA: { color: "#ef4444", bg: "#1a0d0d", label: "Crítico" },
    MEDIA: { color: "#f59e0b", bg: "#1a160d", label: "Média" },
    BAIXA: { color: "#3b82f6", bg: "#0d111a", label: "Novo" },
  }
  
  const p = (deal.prioridade === "BAIXA" && deal.status === "OPEN") 
    ? { color: "#3b82f6", bg: "#0d111a", label: "Novo" }
    : priorityStyles[deal.prioridade]

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#111118] border border-white/[0.03] rounded-[8px] p-[12px] cursor-grab active:cursor-grabbing transition-all hover:bg-[#151520] group",
        isDragging && "z-50 ring-2 ring-blue-500/30 shadow-2xl"
      )}
    >
      {/* HEADER: Dense layout */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-[12px] font-black text-white/90 tracking-tight leading-tight max-w-[70%]">
          {deal.titulo}
        </h3>
        <span 
          className="text-[9px] font-black px-2 py-0.5 rounded-[4px] border border-white/[0.02]"
          style={{ backgroundColor: p.bg, color: p.color }}
        >
           {p.label}
        </span>
      </div>

      {/* METADATA: High density, thin fonts */}
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center gap-1.5 text-[#333] group-hover:text-[#444] transition-colors">
          <User size={11} strokeWidth={1.5} className="opacity-50" />
          <span className="text-[11px] font-bold truncate tracking-tight">
            {deal.contact ? `${deal.contact.nome} ${deal.contact.sobrenome || ''}` : 'Sem responsável'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#333] group-hover:text-[#444] transition-colors">
          <CreditCard size={11} strokeWidth={1.5} className="opacity-50" />
          <span className="text-[11px] font-black italic tracking-tight italic">
            R$ {(deal.valorEstimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* FOOTER: Minimalist */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.02]">
        <div className="flex items-center">
           <div 
             className="w-[24px] h-[24px] rounded-full bg-[#181825] flex items-center justify-center text-[8px] font-black border border-white/[0.03]"
             style={{ color: '#4f46e5' }}
           >
              {deal.contact ? (deal.contact.nome[0] + (deal.contact.sobrenome?.[0] || '')).toUpperCase() : 'SR'}
           </div>
        </div>
        <span className="text-[9px] font-black text-[#2a2a2a] tracking-[0.1em] uppercase">
           {deal.dataPrevista ? new Date(deal.dataPrevista).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '').toUpperCase() : 'S/D'}
        </span>
      </div>
    </div>
  )
}
