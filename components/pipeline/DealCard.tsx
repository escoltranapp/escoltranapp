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

  // Priority Styles tuned for high-fidelity SaaS look
  const priorityStyles = {
    ALTA: { color: "#E85959", bg: "rgba(232, 89, 89, 0.1)", label: "Alta" },
    MEDIA: { color: "#E8A93B", bg: "rgba(232, 169, 59, 0.1)", label: "Média" },
    BAIXA: { color: "#3BE87A", bg: "rgba(59, 232, 122, 0.1)", label: "Baixa" },
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
        "bg-[#141928] border border-white/[0.08] rounded-[10px] p-[14px_16px] cursor-grab active:cursor-grabbing transition-all duration-150 shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:border-white/[0.15] hover:-translate-y-0.5 group relative",
        isDragging && "z-50 ring-2 ring-blue-500/30"
      )}
    >
      {/* 1. TOP LINE: NAME + STATUS */}
      <div className="flex items-start justify-between mb-2.5">
        <h3 className="text-[14.5px] font-medium text-white tracking-tight leading-tight group-hover:text-[#3B8FE8] transition-colors">
          {deal.titulo}
        </h3>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/[0.03] text-white/30 border border-white/[0.05] uppercase">
           {deal.status === 'OPEN' ? 'Aberto' : deal.status === 'WON' ? 'Ganho' : 'Perdido'}
        </span>
      </div>

      {/* 2. PRIORITY BADGE */}
      <div className="mb-3">
         <div 
           className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
           style={{ color: p.color, backgroundColor: p.bg }}
         >
            {p.label}
         </div>
      </div>

      {/* 3. MONETARY VALUE */}
      <div className="flex items-center gap-1.5 mb-4">
         <div className="w-5 h-5 rounded-md bg-[#3B8FE8]/10 flex items-center justify-center">
            <DollarSign size={12} className="text-[#3B8FE8]" />
         </div>
         <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-medium text-[#3B8FE8]/60">R$</span>
            <span className="text-[13px] font-medium text-[#3B8FE8] tracking-tight">
              {(deal.valorEstimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
         </div>
      </div>

      {/* 4. FOOTER: AVATAR + DATE */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
           <div className="w-[22px] h-[22px] rounded-full bg-white/[0.05] flex items-center justify-center text-[10px] font-bold text-white/40 border border-white/[0.05]">
              {deal.contact ? (deal.contact.nome[0] + (deal.contact.sobrenome?.[0] || '')).toUpperCase() : 'SR'}
           </div>
           <span className="text-[12px] font-normal text-[#6B7080]">
              {deal.contact ? `${deal.contact.nome}` : 'S/ Resp'}
           </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-[#6B7080]">
           <Calendar size={12} strokeWidth={2} />
           <span className="text-[12px] font-normal tracking-tight">
              {deal.dataPrevista ? new Date(deal.dataPrevista).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '').toLowerCase() : '---'}
           </span>
        </div>
      </div>
    </div>
  )
}
