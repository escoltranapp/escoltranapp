import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DollarSign, GripVertical, Calendar, AlertTriangle, TrendingUp } from "lucide-react"
import { formatCurrency, getInitials } from "@/lib/utils"
import { format, isPast, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

export interface Deal {
  id: string
  titulo: string
  valorEstimado?: number | null
  prioridade: "ALTA" | "MEDIA" | "BAIXA"
  status: "OPEN" | "WON" | "LOST"
  origem?: string | null
  stageId?: string | null
  dataPrevista?: string | null
  descricao?: string | null
  contact?: {
    nome: string
    sobrenome?: string | null
    email?: string | null
  } | null
  createdAt: string
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
    opacity: isDragging ? 0.3 : 1,
  }

  const contactName = deal.contact
    ? `${deal.contact.nome}${deal.contact.sobrenome ? " " + deal.contact.sobrenome : ""}`
    : null

  const isOverdue = deal.dataPrevista && isPast(new Date(deal.dataPrevista)) && !isToday(new Date(deal.dataPrevista))

  return (
    <div ref={setNodeRef} style={style} className="group/sortable relative">
      <Card
        className={cn(
          "bg-surface border-border-subtle hover:border-accent/40 hover:bg-surface-elevated transition-all duration-300 cursor-pointer overflow-hidden active:scale-95 group",
          isOverdue && "border-danger/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 relative">
          {/* Draggable Grip Indicator */}
          <div
            {...attributes}
            {...listeners}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-text-muted opacity-0 group-hover:opacity-40 transition-opacity p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3 w-3" />
          </div>

          <div className="pl-2 space-y-3">
            {/* Header: Title + Status */}
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-[13px] font-black font-sans leading-tight text-text-primary tracking-tight group-hover:text-accent transition-colors">
                {deal.titulo}
              </h4>
              <Badge variant={deal.status === "OPEN" ? "novo" : deal.status === "WON" ? "ativa" : "destructive"}>
                {deal.status === "OPEN" ? "Novo" : deal.status === "WON" ? "Ganho" : "Perdido"}
              </Badge>
            </div>

            {/* Middle: Priority + Contact */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={deal.prioridade.toLowerCase() as any}>
                  {deal.prioridade}
                </Badge>
                {deal.origem && (
                  <span className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/5">
                    {deal.origem}
                  </span>
                )}
              </div>
              
              {contactName && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5 border border-border-subtle group-hover:border-accent/30 transition-all">
                    <AvatarFallback className="text-[7px] font-black bg-surface-elevated text-text-muted">
                      {getInitials(contactName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] font-display italic text-text-muted group-hover:text-text-secondary transition-colors truncate">
                    {contactName}
                  </span>
                </div>
              )}
            </div>

            {/* Footer: Value + Date */}
            <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50 group-hover:border-border-subtle transition-colors">
              {deal.valorEstimado ? (
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-mono font-black text-accent tracking-tighter">
                    {formatCurrency(deal.valorEstimado)}
                  </span>
                </div>
              ) : <div />}

              {deal.dataPrevista && (
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-tighter",
                  isOverdue ? "text-danger animate-pulse" : "text-text-muted"
                )}>
                  {isOverdue ? <AlertTriangle className="h-2.5 w-2.5" /> : <Calendar className="h-2.5 w-2.5 opacity-60" />}
                  <span>
                    {format(new Date(deal.dataPrevista), "dd/MM", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
