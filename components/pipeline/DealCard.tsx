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

/* ── Priority config ───────────────────────────────── */
const PRIORITY: Record<string, {
  label: string
  Icon: React.ElementType
  color: string
  bg: string
  glow: string
}> = {
  ALTA:  { label: "Alta",  Icon: TrendingUp,  color: "#ef4444", bg: "rgba(239,68,68,0.08)",  glow: "0 0 12px rgba(239,68,68,0.3)" },
  MEDIA: { label: "Média", Icon: Minus,        color: "#f59e0b", bg: "rgba(245,158,11,0.08)", glow: "none" },
  BAIXA: { label: "Baixa", Icon: TrendingDown, color: "#6366f1", bg: "rgba(99,102,241,0.08)", glow: "none" },
}

/* ── Helpers ────────────────────────────────────────── */
function daysAgo(d: string) {
  const n = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000)
  if (n === 0) return "Hoje"
  if (n === 1) return "1 dia"
  return `${n}d`
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase()
}

function currency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

/* ── Component ─────────────────────────────────────── */
export function DealCard({ deal, onClick, stageColor = "#6366f1" }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id })

  const p = PRIORITY[deal.prioridade] ?? PRIORITY.MEDIA
  const PIcon = p.Icon
  const isHot = deal.prioridade === "ALTA"
  const contactName = deal.contact
    ? `${deal.contact.nome}${deal.contact.sobrenome ? " " + deal.contact.sobrenome : ""}`
    : null
  const valor = deal.valorEstimado ? currency(deal.valorEstimado) : null
  const age = daysAgo(deal.createdAt)
  const daysNum = Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / 86_400_000)
  const isStale = daysNum > 30

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
        // LAYER 3: Card surface — elevated above column
        "group relative rounded-[12px] cursor-pointer select-none",
        "bg-[#151823] border transition-all duration-200 ease-out",
        // Hover: lift + enhanced shadow
        "hover:-translate-y-[2px]",
        "hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)]",
        // Default state
        isHot
          ? "border-red-500/[0.12] shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(239,68,68,0.08)]"
          : "border-white/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.03)]",
        // Hover border
        "hover:border-white/[0.1]",
        // Drag state
        isDragging && "opacity-0 scale-95",
      )}
    >
      {/* Left accent bar — stage identity */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-opacity"
        style={{ backgroundColor: stageColor, opacity: 0.6 }}
      />

      {/* Hot deal glow indicator */}
      {isHot && (
        <div className="absolute -top-px -right-px w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
      )}

      <div className="pl-4 pr-3.5 py-3.5">

        {/* ROW 1: Title + Priority */}
        <div className="flex items-start gap-2 mb-2.5">
          <p
            className="flex-1 text-[13.5px] font-semibold leading-[1.4] line-clamp-2 text-white/90 group-hover:text-white transition-colors"
          >
            {deal.titulo}
          </p>
          <div
            className="flex items-center gap-1 shrink-0 px-[7px] py-[3px] rounded-md mt-0.5"
            style={{ background: p.bg, boxShadow: p.glow }}
          >
            <PIcon size={9} color={p.color} strokeWidth={2.5} />
            <span
              className="text-[9px] font-bold uppercase leading-none tracking-wide"
              style={{ color: p.color }}
            >
              {p.label}
            </span>
          </div>
        </div>

        {/* ROW 2: Value — prominent */}
        {valor && (
          <p className="text-[15px] font-bold text-emerald-400 mb-3 tracking-tight tabular-nums">
            {valor}
          </p>
        )}

        {/* ROW 3: Contact */}
        {contactName && (
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{
                background: `linear-gradient(135deg, ${stageColor}22, ${stageColor}11)`,
                color: stageColor,
                border: `1px solid ${stageColor}33`,
              }}
            >
              {initials(contactName)}
            </div>
            <span className="text-[11.5px] text-white/35 truncate font-medium">
              {contactName}
            </span>
          </div>
        )}

        {/* ROW 4: Footer — divider + metadata */}
        <div
          className="flex items-center justify-between pt-2.5 mt-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div
            className={cn(
              "flex items-center gap-1.5 text-[10px] font-medium",
              isStale ? "text-red-400/60" : "text-white/20"
            )}
          >
            <Clock size={10} strokeWidth={2} />
            <span>{age}</span>
            {isStale && <span className="text-[8px] uppercase tracking-wider font-bold ml-1 text-red-400/80">atrasado</span>}
          </div>

          {deal.dataPrevista && (
            <span className="text-[10px] font-medium text-white/18">
              {new Date(deal.dataPrevista).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
