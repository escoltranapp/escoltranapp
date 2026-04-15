"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export interface Deal {
  id: string
  titulo: string
  valorEstimado?: number | null
  prioridade: "ALTA" | "MEDIA" | "BAIXA"
  status: "OPEN" | "WON" | "LOST"
  stageId?: string | null
  createdAt: string
  dataPrevista?: string | null
  origem?: string | null
  contact?: {
    nome: string
    sobrenome?: string | null
    email?: string | null
  } | null
}

interface DealCardProps {
  deal: Deal
  onClick?: () => void
}

const badgeStyle: Record<string, string> = {
  ALTA:  "bg-[#1f1010] text-[#ef4444] border border-[#3e1a1a]",
  MEDIA: "bg-[#1c1a10] text-[#d97706] border border-[#3a2e10]",
  BAIXA: "bg-[#1a1a2e] text-[#818cf8] border border-[#2d2d4e]",
}

const badgeLabel: Record<string, string> = {
  ALTA: "Alta", MEDIA: "Média", BAIXA: "Baixa",
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  }

  const contactName = deal.contact
    ? `${deal.contact.nome}${deal.contact.sobrenome ? " " + deal.contact.sobrenome : ""}`
    : "Sem responsável"

  const valor = (deal.valorEstimado || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const dateStr = deal.dataPrevista
    ? format(new Date(deal.dataPrevista), "dd/MM", { locale: ptBR })
    : "S/D"

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#18181f] border border-[#1e1e24] rounded-[10px] p-[14px] cursor-pointer transition-all select-none",
        "hover:bg-[#1e1e28] hover:border-[#2e2e3e]",
        isDragging && "opacity-50 ring-2 ring-[#4f46e5]/40"
      )}
    >
      {/* Top: name + badge */}
      <div className="flex items-start justify-between mb-[10px] gap-1.5">
        <span className="text-[13px] font-medium text-[#e8e8f0] leading-snug line-clamp-2 flex-1">
          {deal.titulo}
        </span>
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 leading-tight", badgeStyle[deal.prioridade])}>
          {badgeLabel[deal.prioridade]}
        </span>
      </div>

      {/* Meta rows */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="6" r="2.5" stroke="#555" strokeWidth="1.2"/>
            <path d="M3 13c0-2.8 2.2-4 5-4s5 1.2 5 4" stroke="#555" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-[11px] text-[#555] truncate">{contactName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#555" strokeWidth="1.2"/>
            <path d="M5 7h6M5 10h4" stroke="#555" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-[11px] text-[#888]">{valor}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#1e1e24] my-[10px]" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="w-[22px] h-[22px] rounded-full bg-[#2a2a3e] border border-[#333345] flex items-center justify-center text-[9px] font-semibold text-[#7c7caa]">
          {contactName === "Sem responsável" ? "SR" : contactName.slice(0, 2).toUpperCase()}
        </div>
        <span className="text-[10px] text-[#444]">{dateStr}</span>
      </div>
    </div>
  )
}
