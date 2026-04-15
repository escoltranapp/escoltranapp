"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
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
  stageColor?: string
}

const priority = {
  ALTA:  { label: "Alta",  dot: "#f87171", bg: "rgba(248,113,113,0.12)", text: "#f87171" },
  MEDIA: { label: "Média", dot: "#fbbf24", bg: "rgba(251,191,36,0.12)",  text: "#fbbf24" },
  BAIXA: { label: "Baixa", dot: "#818cf8", bg: "rgba(129,140,248,0.12)", text: "#818cf8" },
}

export function DealCard({ deal, onClick, stageColor = "#6366f1" }: DealCardProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  }

  const p = priority[deal.prioridade] ?? priority.MEDIA
  const contactName = deal.contact
    ? `${deal.contact.nome}${deal.contact.sobrenome ? " " + deal.contact.sobrenome : ""}`
    : null
  const valor = deal.valorEstimado
    ? deal.valorEstimado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group relative bg-[#12141f] border border-white/[0.07] rounded-xl p-4 cursor-pointer select-none",
        "hover:border-white/[0.14] hover:bg-[#161928] transition-all duration-150",
        "shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        isDragging && "opacity-0"
      )}
    >
      {/* Colored left accent */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
        style={{ backgroundColor: stageColor, opacity: 0.7 }}
      />

      {/* Title */}
      <p className="text-[13.5px] font-medium text-white/90 leading-snug mb-3 pr-1 line-clamp-2">
        {deal.titulo}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-3">
        {contactName && (
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="w-[18px] h-[18px] rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-white/30 shrink-0 border border-white/[0.06]">
              {contactName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] text-white/30 truncate">{contactName}</span>
          </div>
        )}
        {valor && (
          <span className="text-[11px] font-semibold text-emerald-400/80 shrink-0 ml-auto">
            {valor}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05]">
        <div
          className="flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[10px] font-semibold"
          style={{ backgroundColor: p.bg, color: p.text }}
        >
          <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: p.dot }} />
          {p.label}
        </div>
        <span className="text-[10px] text-white/[0.18]">
          {new Date(deal.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </span>
      </div>
    </div>
  )
}
