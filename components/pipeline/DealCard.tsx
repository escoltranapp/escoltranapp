import { useRouter } from "next/navigation"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn, formatCurrency } from "@/lib/utils"

export interface Deal {
  id: string
  titulo: string
  valorEstimado?: number | null
  prioridade: "ALTA" | "MEDIA" | "BAIXA"
  status: "OPEN" | "WON" | "LOST"
  stageId?: string | null
  telefone?: string | null
  origem?: string | null
  dataPrevista?: string | null
  createdAt: string
  contact?: {
    nome: string
    sobrenome?: string | null
    telefone?: string | null
    tags?: string[]
  } | null
  user?: {
    name: string | null
  } | null
  pendingActivitiesCount?: number
  hasOverdueActivities?: boolean
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
  capturedAt?: string | null
  landingPage?: string | null
  referrer?: string | null
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

  const phone = deal.telefone || deal.contact?.telefone

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#1A1A1A]/40 backdrop-blur-xl rounded-[24px] p-5 border border-white/[0.04] transition-all duration-500 cursor-grab active:cursor-grabbing hover:bg-[#1A1A1A]/60 hover:border-[#F97316]/30 relative group overflow-hidden shadow-xl",
        isDragging && "scale-[1.02] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-[#F97316]/20"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[14px] font-black text-white tracking-tight leading-tight group-hover:text-[#F97316] transition-colors pr-4">
          {deal.titulo}
        </h3>
        <button className="text-[#404040] hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-[#A3A3A3]">{deal.contact?.nome} {deal.contact?.sobrenome}</p>
          {phone && (
            <div className="flex items-center gap-2 text-[#404040] group-hover:text-[#F97316]/60 transition-colors">
              <span className="material-symbols-outlined text-[14px]">call</span>
              <span className="text-[10px] font-mono font-black">{phone}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 text-[9px] font-black text-[#F97316] italic">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
            {deal.user?.name || "Sem Atribuição"}
          </div>
          
          {deal.origem && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[8px] font-black text-[#404040] uppercase tracking-widest">
               {deal.origem}
            </div>
          )}

          {deal.contact?.tags?.map((tag, i) => (
            <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[8px] font-black text-[#404040] uppercase tracking-widest">
               {tag}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
           <div className="text-[16px] font-black text-[#F97316] tracking-tighter">
              {deal.valorEstimado ? formatCurrency(deal.valorEstimado) : "R$ 0"}
           </div>
           
           <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#22C55E]">chat</span>
              {deal.pendingActivitiesCount !== undefined && deal.pendingActivitiesCount > 0 && (
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  deal.hasOverdueActivities ? "bg-red-500 animate-pulse" : "bg-amber-500"
                )} />
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
