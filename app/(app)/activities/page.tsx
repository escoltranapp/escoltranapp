"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Phone,
  Calendar,
  FileText,
  MessageCircle,
  Mail,
  CheckSquare,
  Plus,
  Search,
  Check,
  Clock,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Activity {
  id: string
  tipo: "CALL" | "MEETING" | "TASK" | "NOTE" | "WHATSAPP" | "EMAIL"
  status: "OPEN" | "DONE"
  titulo: string
  descricao?: string
  dueAt?: string
  doneAt?: string
  contactName?: string
  dealTitle?: string
  createdAt: string
}

const typeConfig = {
  CALL: { icon: Phone, label: "Ligação", color: "text-blue-400", bg: "bg-blue-400/10" },
  MEETING: { icon: Calendar, label: "Reunião", color: "text-purple-400", bg: "bg-purple-400/10" },
  TASK: { icon: CheckSquare, label: "Tarefa", color: "text-amber-400", bg: "bg-amber-400/10" },
  NOTE: { icon: FileText, label: "Nota", color: "text-gray-400", bg: "bg-gray-400/10" },
  WHATSAPP: { icon: MessageCircle, label: "WhatsApp", color: "text-green-400", bg: "bg-green-400/10" },
  EMAIL: { icon: Mail, label: "Email", color: "text-primary", bg: "bg-primary/10" },
}

const mockActivities: Activity[] = [
  {
    id: "a1",
    tipo: "CALL",
    status: "OPEN",
    titulo: "Ligar para João Santos",
    descricao: "Discutir proposta enviada",
    dueAt: new Date(Date.now() + 3600000 * 2).toISOString(),
    contactName: "João Santos",
    dealTitle: "Enterprise Deal",
    createdAt: new Date().toISOString(),
  },
  {
    id: "a2",
    tipo: "MEETING",
    status: "OPEN",
    titulo: "Reunião de apresentação",
    descricao: "Demo do produto para Empresa Beta",
    dueAt: new Date(Date.now() + 86400000).toISOString(),
    contactName: "Ana Lima",
    dealTitle: "Plano Premium",
    createdAt: new Date().toISOString(),
  },
  {
    id: "a3",
    tipo: "TASK",
    status: "DONE",
    titulo: "Enviar proposta comercial",
    contactName: "Carlos Ferreira",
    doneAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "a4",
    tipo: "WHATSAPP",
    status: "DONE",
    titulo: "Follow-up após proposta",
    contactName: "Maria Silva",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "a5",
    tipo: "EMAIL",
    status: "OPEN",
    titulo: "Enviar contrato para assinatura",
    dueAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    contactName: "Roberto Nunes",
    dealTitle: "Renovação Anual",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
]

export default function ActivitiesPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "OPEN" | "DONE">("all")

  const filtered = mockActivities.filter((a) => {
    const matchSearch = !search || a.titulo.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || a.status === filter
    return matchSearch && matchFilter
  })

  const openCount = mockActivities.filter((a) => a.status === "OPEN").length
  const doneCount = mockActivities.filter((a) => a.status === "DONE").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Atividades</h1>
          <p className="text-muted-foreground text-sm">
            {openCount} abertas &bull; {doneCount} concluídas
          </p>
        </div>
        <Button className="escoltran-gradient-bg text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Atividade
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(typeConfig).map(([type, config]) => {
          const Icon = config.icon
          const count = mockActivities.filter((a) => a.tipo === type).length
          return (
            <Card key={type} className="bg-card border-border cursor-pointer hover:border-primary/40 transition-colors">
              <CardContent className="p-3 flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center`}>
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold">{count}</p>
                  <p className="text-[10px] text-muted-foreground">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atividades..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(["all", "OPEN", "DONE"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "Todas" : f === "OPEN" ? "Abertas" : "Concluídas"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atividade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden sm:table-cell">Contato / Deal</TableHead>
                <TableHead className="hidden md:table-cell">Prazo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma atividade encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((activity) => {
                  const config = typeConfig[activity.tipo]
                  const Icon = config.icon
                  return (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div>
                          <p className={`text-sm font-medium ${activity.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                            {activity.titulo}
                          </p>
                          {activity.descricao && (
                            <p className="text-xs text-muted-foreground">{activity.descricao}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${config.bg} ${config.color}`}>
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div>
                          {activity.contactName && (
                            <p className="text-xs font-medium">{activity.contactName}</p>
                          )}
                          {activity.dealTitle && (
                            <p className="text-xs text-muted-foreground">{activity.dealTitle}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {activity.dueAt ? (
                          <div className={`flex items-center gap-1 text-xs ${
                            new Date(activity.dueAt) < new Date() && activity.status === "OPEN"
                              ? "text-red-400"
                              : "text-muted-foreground"
                          }`}>
                            <Clock className="h-3 w-3" />
                            {formatDate(activity.dueAt)}
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            activity.status === "DONE"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }
                        >
                          {activity.status === "DONE" ? "Concluída" : "Aberta"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {activity.status === "OPEN" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Concluir">
                            <Check className="h-3 w-3 text-green-400" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
