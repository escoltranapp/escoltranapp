import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { User, Calendar, DollarSign } from "lucide-react"
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

  const priorityStyles = {
    ALTA: { color: "#EF4444", label: "Alta" },
    MEDIA: { color: "#F59E0B", label: "Média" },
    BAIXA: { color: "#10B981", label: "Baixa" },
  }
  
  const p = priorityStyles[deal.prioridade]

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-[#111114] border border-white/[0.05] rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-150 shadow-sm hover:border-white/10 hover:-translate-y-0.5 group relative",
        isDragging && "z-50 ring-1 ring-blue-500/20"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-[14px] font-medium text-white/90 tracking-tight group-hover:text-blue-400 transition-colors">
          {deal.titulo}
        </h3>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/[0.03] text-white/20 border border-white/5 uppercase">
           {deal.status === 'OPEN' ? 'Aberto' : deal.status === 'WON' ? 'Ganho' : 'Perdido'}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
         <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{p.label}</span>
         </div>
         <div className="w-px h-3 bg-white/5" />
         <div className="flex items-center gap-1 text-blue-500/80">
            <DollarSign size={10} />
            <span className="text-[12px] font-semibold tracking-tight">
              {(deal.valorEstimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
         </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.03]">
        <div className="flex items-center gap-2">
           <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[9px] font-bold text-white/30 border border-white/5">
              {deal.contact ? (deal.contact.nome[0] + (deal.contact.sobrenome?.[0] || '')).toUpperCase() : 'SR'}
           </div>
           <span className="text-[11px] text-white/40">
              {deal.contact ? deal.contact.nome : 'Sem Resp.'}
           </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-white/20">
           <Calendar size={11} />
           <span className="text-[11px]">
              {deal.dataPrevista ? new Date(deal.dataPrevista).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '').toLowerCase() : '---'}
           </span>
        </div>
      </div>
    </div>
  )
}
