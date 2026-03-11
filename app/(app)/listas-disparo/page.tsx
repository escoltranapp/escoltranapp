"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Send,
  Plus,
  Play,
  Pause,
  StopCircle,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Lista {
  id: string
  nome: string
  descricao?: string
  status: "RASCUNHO" | "ATIVA" | "PAUSADA" | "EM_PROCESSAMENTO" | "CONCLUIDA" | "CANCELADA"
  totalLeads: number
  enviados: number
  falhos: number
  pendentes: number
  createdAt: string
}

const mockListas: Lista[] = [
  {
    id: "l1",
    nome: "Campanha Outubro",
    descricao: "Leads do Google Maps - SP",
    status: "EM_PROCESSAMENTO",
    totalLeads: 150,
    enviados: 87,
    falhos: 3,
    pendentes: 60,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "l2",
    nome: "Follow-up Novembro",
    descricao: "Leads qualificados",
    status: "ATIVA",
    totalLeads: 80,
    enviados: 0,
    falhos: 0,
    pendentes: 80,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "l3",
    nome: "Campanha Setembro",
    descricao: "Empresas CNPJ - RJ",
    status: "CONCLUIDA",
    totalLeads: 200,
    enviados: 189,
    falhos: 11,
    pendentes: 0,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: "l4",
    nome: "Nova Lista",
    descricao: "Rascunho em preparação",
    status: "RASCUNHO",
    totalLeads: 0,
    enviados: 0,
    falhos: 0,
    pendentes: 0,
    createdAt: new Date().toISOString(),
  },
]

const statusConfig = {
  RASCUNHO: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  ATIVA: { label: "Ativa", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  PAUSADA: { label: "Pausada", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  EM_PROCESSAMENTO: { label: "Em Processamento", className: "bg-primary/10 text-primary border-primary/20" },
  CONCLUIDA: { label: "Concluída", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  CANCELADA: { label: "Cancelada", className: "bg-red-500/10 text-red-400 border-red-500/20" },
}

export default function ListasDisparoPage() {
  const [listas] = useState<Lista[]>(mockListas)

  const totalEnviados = listas.reduce((sum, l) => sum + l.enviados, 0)
  const totalLeads = listas.reduce((sum, l) => sum + l.totalLeads, 0)
  const taxaSucesso = totalLeads > 0 ? ((totalEnviados / totalLeads) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Listas de Disparo</h1>
          <p className="text-muted-foreground text-sm">Gerenciar campanhas de disparo em massa</p>
        </div>
        <Button className="escoltran-gradient-bg text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Lista
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Listas", value: listas.length, icon: Send, color: "text-primary" },
          { label: "Total de Leads", value: totalLeads, icon: Users, color: "text-blue-400" },
          { label: "Enviados", value: totalEnviados, icon: CheckCircle, color: "text-green-400" },
          { label: "Taxa de Sucesso", value: `${taxaSucesso}%`, icon: XCircle, color: "text-amber-400" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Listas */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Listas</CardTitle>
          <CardDescription>Gerencie suas campanhas de disparo</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Progresso</TableHead>
                <TableHead className="hidden md:table-cell">Leads</TableHead>
                <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listas.map((lista) => {
                const config = statusConfig[lista.status]
                const progress = lista.totalLeads > 0
                  ? ((lista.enviados + lista.falhos) / lista.totalLeads) * 100
                  : 0

                return (
                  <TableRow key={lista.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{lista.nome}</p>
                        {lista.descricao && (
                          <p className="text-xs text-muted-foreground">{lista.descricao}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={config.className}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {lista.totalLeads > 0 ? (
                        <div className="space-y-1 w-36">
                          <Progress value={progress} className="h-1.5" />
                          <p className="text-xs text-muted-foreground">
                            {lista.enviados}/{lista.totalLeads} ({progress.toFixed(0)}%)
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-2 text-xs">
                        <span className="text-green-400 flex items-center gap-0.5">
                          <CheckCircle className="h-3 w-3" />{lista.enviados}
                        </span>
                        <span className="text-red-400 flex items-center gap-0.5">
                          <XCircle className="h-3 w-3" />{lista.falhos}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />{lista.pendentes}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(lista.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {lista.status === "ATIVA" || lista.status === "RASCUNHO" ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Play className="h-3 w-3 text-green-400" />
                          </Button>
                        ) : lista.status === "EM_PROCESSAMENTO" ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Pause className="h-3 w-3 text-amber-400" />
                          </Button>
                        ) : null}
                        {(lista.status === "ATIVA" || lista.status === "EM_PROCESSAMENTO" || lista.status === "PAUSADA") && (
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <StopCircle className="h-3 w-3 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
