"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { Clock, TrendingUp, Minus, TrendingDown } from "lucide-react"

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

const PRIORITY = {
  ALTA:  { label: "Alta",  Icon: TrendingUp,   color: "#f87171", bg: "rgba(248,113,113,0.1)"  },
  MEDIA: { label: "Média", Icon: Minus,         color: "#fbbf24", bg: "rgba(251,191,36,0.1)"   },
  BAIXA: { label: "Baixa", Icon: TrendingDown,  color: "#818cf8", bg: "rgba(129,140,248,0.1)"  },
}

function daysInPipeline(createdAt: string) {
  const d = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
  if (d === 0) return "Hoje"
  if (d === 1) return "1 dia"
  return `${d} dias`
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function DealCard({ deal, onClick, stageColor = "#6366f1" }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id })

  const p = PRIORITY[deal.prioridade] ?? PRIORITY.MEDIA
  const PIcon = p.Icon
  const contactName = deal.contact
    ? `${deal.contact.nome}${deal.contact.sobrenome ? " " + deal.contact.sobrenome : ""}`
    : null
  const valor = deal.valorEstimado
    ? deal.valorEstimado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    : null
  const age = daysInPipeline(deal.createdAt)
  const isHot = deal.prioridade === "ALTA"

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group relative rounded-[10px] cursor-pointer select-none",
        "border transition-[background,border-color,box-shadow,transform] duration-150",
        "hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,0,0,0.55)]",
        isHot
          ? "bg-[#111422] border-red-400/[0.18] hover:bg-[#15182a] hover:border-red-400/[0.28]"
          : "bg-[#111422] border-white/[0.058] hover:bg-[#15182a] hover:border-white/[0.11]",
        isDragging && "opacity-0",
      )}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-r-full"
        style={{ backgroundColor: stageColor, opacity: 0.78 }}
      />

      <div className="pl-[14px] pr-3.5 pt-3.5 pb-3">

        {/* Title + Priority chip */}
        <div className="flex items-start gap-2 mb-3">
          <p
            className="flex-1 text-[13px] font-[500] leading-[1.45] line-clamp-2"
            style={{ color: "rgba(225,228,255,0.86)" }}
          >
            {deal.titulo}
          </p>
          <div
            className="flex items-center gap-[3px] shrink-0 px-[6px] py-[3px] rounded-[6px] mt-[1px]"
            style={{ background: p.bg }}
          >
            <PIcon size={8} color={p.color} strokeWidth={2.5} />
            <span
              className="text-[9px] font-[700] uppercase leading-none"
              style={{ color: p.color, letterSpacing: "0.05em" }}
            >
              {p.label}
            </span>
          </div>
        </div>

        {/* Contact + Value */}
        <div className="flex items-center gap-2 mb-2.5">
          {contactName ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-[700] shrink-0"
                style={{
                  background: hexToRgba(stageColor, 0.15),
                  color: stageColor,
                  border: `1px solid ${hexToRgba(stageColor, 0.24)}`,
                }}
              >
                {contactName.charAt(0).toUpperCase()}
              </div>
              <span
                className="text-[11px] truncate font-[400]"
                style={{ color: "rgba(255,255,255,0.36)" }}
              >
                {contactName}
              </span>
            </div>
          ) : (
            <div className="flex-1" />
          )}
          {valor && (
            <span
              className="text-[11.5px] font-[600] shrink-0 tabular-nums"
              style={{ color: "#34d399" }}
            >
              {valor}
            </span>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.042)" }}
        >
          <div className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.22)" }}>
            <Clock size={9} strokeWidth={2} />
            <span className="text-[10px] font-[500]">{age}</span>
          </div>
          {deal.dataPrevista && (
            <span className="text-[10px] font-[500]" style={{ color: "rgba(255,255,255,0.22)" }}>
              até {new Date(deal.dataPrevista).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
