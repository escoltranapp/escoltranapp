"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DollarSign, User, GripVertical } from "lucide-react"
import { formatCurrency, getInitials } from "@/lib/utils"

export interface Deal {
  id: string
  titulo: string
  valorEstimado?: number | null
  prioridade: "ALTA" | "MEDIA" | "BAIXA"
  status: "OPEN" | "WON" | "LOST"
  origem?: string | null
  stageId?: string | null
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

const priorityConfig = {
  ALTA: { label: "Alta", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  MEDIA: { label: "Média", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  BAIXA: { label: "Baixa", className: "bg-green-500/10 text-green-400 border-green-500/20" },
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
    opacity: isDragging ? 0.5 : 1,
  }

  const priority = priorityConfig[deal.prioridade] || priorityConfig.MEDIA
  const contactName = deal.contact
    ? `${deal.contact.nome}${deal.contact.sobrenome ? " " + deal.contact.sobrenome : ""}`
    : null

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group mb-2"
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate mb-1">
                {deal.titulo}
              </p>

              {contactName && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                      {getInitials(contactName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">{contactName}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                {deal.valorEstimado ? (
                  <div className="flex items-center gap-1 text-xs text-primary font-medium">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(deal.valorEstimado)}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Sem valor</span>
                )}
                <Badge className={`text-[10px] px-1.5 py-0 ${priority.className}`}>
                  {priority.label}
                </Badge>
              </div>

              {deal.origem && (
                <p className="text-[10px] text-muted-foreground mt-1 truncate">
                  {deal.origem}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
