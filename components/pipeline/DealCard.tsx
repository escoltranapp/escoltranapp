"use client"

import { useRouter } from "next/navigation"
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
  origin?: string | null
  createdAt: string
  dataPrevista?: string | null
  contact?: {
    nome: string
    sobrenome?: string | null
  } | null
  // Gap 2: activity badge data
  pendingActivitiesCount?: number
  hasOverdueActivities?: boolean
}

interface DealCardProps {
  deal: Deal
  onClick?: () => void
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const router = useRouter()
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
    zIndex: isDragging ? 100 : 1,
  }

  const priorityConfig = {
    ALTA: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "PRIORITY_CRITICAL", animation: "animate-pulse" },
    MEDIA: { color: "text-[#F97316]", bg: "bg-[#F97316]/10", border: "border-[#F97316]/20", label: "PRIORITY_ACTIVE", animation: "" },
    BAIXA: { color: "text-[#404040]", bg: "bg-white/[0.02]", border: "border-white/[0.04]", label: "PRIORITY_STABLE", animation: "" },
  }

  const p = priorityConfig[deal.prioridade]
  const hasPending = (deal.pendingActivitiesCount ?? 0) > 0
  const isOverdue = deal.hasOverdueActivities === true

  // Gap 3: navigate to activities with deal pre-filled
  const handleAddActivity = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/activities?new=true&deal_id=${deal.id}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#1A1A1A]/40 backdrop-blur-xl rounded-2xl p-6 border border-white/5 transition-all duration-500 cursor-grab active:cursor-grabbing hover:bg-[#1A1A1A]/60 hover:border-[#F97316]/30 relative group overflow-hidden shadow-2xl",
        isDragging && "scale-[1.02] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-[#F97316]/20"
      )}
    >
      {/* INTERNAL RADIAL GLOW */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#F97316]/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-6 relative z-10">
        <h3 className="text-[17px] font-black text-white tracking-tighter leading-none group-hover:text-[#F97316] transition-colors uppercase italic pr-4">
          {deal.titulo}
        </h3>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#262626] group-hover:text-[#F97316]/40 transition-colors text-[20px]">drag_pan</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] border border-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-[#F97316]">account_circle</span>
          </div>
          <span className="text-[11px] font-black text-[#A3A3A3] truncate uppercase tracking-widest italic leading-none">
            {deal.contact
              ? [deal.contact.nome, deal.contact.sobrenome].filter(Boolean).join(" ")
              : "Sem contato"}
          </span>
        </div>
      </div>

      <div className="space-y-4 relative z-10 pt-4 border-t border-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] leading-none">VALOR_ESTIMADO</span>
            <span className="text-[18px] font-mono font-black text-[#F2F2F2] tracking-tighter group-hover:text-[#F97316] transition-colors">
              {deal.valorEstimado?.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) || "R$ ---"}
            </span>
          </div>

          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black tracking-[0.2em] uppercase",
            p.bg, p.color, p.border, p.animation
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", p.color.replace("text-", "bg-"))} />
            {p.label}
          </div>
        </div>

        {/* Gap 2 + Gap 3: activity badge + quick add button */}
        <div className="flex items-center justify-between">
          {/* Activity badge */}
          {hasPending ? (
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black font-mono uppercase tracking-widest",
              isOverdue
                ? "bg-red-500/10 border-red-500/20 text-red-500"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            )}>
              <span className="material-symbols-outlined text-[12px]">
                {isOverdue ? "alarm_off" : "pending_actions"}
              </span>
              {deal.pendingActivitiesCount} {isOverdue ? "atrasada(s)" : "pendente(s)"}
            </div>
          ) : (
            <div /> // spacer
          )}

          {/* Gap 3: quick add activity button */}
          <button
            onClick={handleAddActivity}
            title="Nova atividade para este deal"
            className="w-7 h-7 rounded-lg bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-[#404040] hover:text-[#F97316] hover:border-[#F97316]/40 transition-all opacity-0 group-hover:opacity-100 shrink-0"
          >
            <span className="material-symbols-outlined text-[15px]">event_available</span>
          </button>
        </div>

        <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            {deal.origin && (
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#404040]">router</span>
                <span className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest">{deal.origin}</span>
              </div>
            )}
          </div>
          <div className="text-[9px] font-mono font-black text-[#262626] uppercase tracking-widest">
            SYNC_NODE: #{deal.id.slice(-4).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
}
