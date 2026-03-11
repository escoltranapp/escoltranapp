"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  DollarSign,
  User,
  Phone,
  Tag,
  Link,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react"
import type { Deal } from "./DealCard"

interface DealDetailSheetProps {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DealDetailSheet({ deal, open, onOpenChange }: DealDetailSheetProps) {
  if (!deal) return null

  const contactName = deal.contact
    ? `${deal.contact.nome}${deal.contact.sobrenome ? " " + deal.contact.sobrenome : ""}`
    : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-l border-border" side="right">
        <SheetHeader className="mb-4">
          <div className="flex items-start justify-between pr-6">
            <div>
              <SheetTitle className="text-foreground text-lg">{deal.titulo}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={
                    deal.status === "WON"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : deal.status === "LOST"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-primary/10 text-primary border-primary/20"
                  }
                >
                  {deal.status === "OPEN" ? "Aberto" : deal.status === "WON" ? "Ganho" : "Perdido"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {deal.prioridade === "ALTA" ? "Alta Prioridade" : deal.prioridade === "MEDIA" ? "Média Prioridade" : "Baixa Prioridade"}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="space-y-4 pr-1">
            {/* Value */}
            {deal.valorEstimado && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Valor Estimado</span>
                </div>
                <p className="text-xl font-bold text-primary mt-1">
                  {formatCurrency(deal.valorEstimado)}
                </p>
              </div>
            )}

            {/* Contact */}
            {contactName && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Contato</h3>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contactName}</span>
                  </div>
                  {deal.contact?.email && (
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{deal.contact.email}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Details */}
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Detalhes</h3>

              <div className="grid grid-cols-2 gap-3">
                {deal.origem && (
                  <div>
                    <p className="text-xs text-muted-foreground">Origem</p>
                    <p className="text-sm font-medium">{deal.origem}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Criado em</p>
                  <p className="text-sm font-medium">{formatDate(deal.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Ações</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-400 border-green-500/20 hover:bg-green-500/10"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Ganho
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-500/20 hover:bg-red-500/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Marcar como Perdido
                </Button>
              </div>
            </div>

            {/* Activities placeholder */}
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Atividades</h3>
              <p className="text-sm text-muted-foreground">Nenhuma atividade registrada</p>
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Adicionar Atividade
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
