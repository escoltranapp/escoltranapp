"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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
  CheckCircle2,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface Activity {
  id: string
  tipo: "CALL" | "MEETING" | "TASK" | "NOTE" | "WHATSAPP" | "EMAIL"
  status: "OPEN" | "DONE"
  titulo: string
  descricao?: string | null
  dueAt?: string | null
  doneAt?: string | null
  createdAt: string
  contact?: { nome: string; sobrenome?: string | null } | null
  deal?: { titulo: string } | null
}

const typeConfig = {
  CALL: { icon: Phone, label: "Ligação", color: "text-blue-400", bg: "bg-blue-400/10" },
  MEETING: { icon: Calendar, label: "Reunião", color: "text-purple-400", bg: "bg-purple-400/10" },
  TASK: { icon: CheckSquare, label: "Tarefa", color: "text-amber-400", bg: "bg-amber-400/10" },
  NOTE: { icon: FileText, label: "Nota", color: "text-gray-400", bg: "bg-gray-400/10" },
  WHATSAPP: { icon: MessageCircle, label: "WhatsApp", color: "text-green-400", bg: "bg-green-400/10" },
  EMAIL: { icon: Mail, label: "Email", color: "text-primary", bg: "bg-primary/10" },
}

function SkeletonRow() {
  return (
    <TableRow>
      {[...Array(6)].map((_, i) => (
        <TableCell key={i}><div className="h-4 rounded bg-muted animate-pulse" /></TableCell>
      ))}
    </TableRow>
  )
}

// ─── New Activity Modal ─────────────────────────────────────────────
function NewActivityModal({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    tipo: "TASK",
    titulo: "",
    descricao: "",
    dueAt: "",
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.titulo.trim()) throw new Error("Título é obrigatório")
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: form.tipo,
          titulo: form.titulo,
          descricao: form.descricao || null,
          dueAt: form.dueAt || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao criar atividade")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Atividade criada!" })
      onSuccess()
      onOpenChange(false)
      setForm({ tipo: "TASK", titulo: "", descricao: "", dueAt: "" })
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: err.message })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Nova Atividade</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Tipo *</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeConfig).map(([key, cfg]) => {
                  const Icon = cfg.icon
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                        {cfg.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input
              placeholder="Descreva a atividade..."
              value={form.titulo}
              onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea
              placeholder="Detalhes opcionais..."
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Prazo</Label>
            <Input
              type="datetime-local"
              value={form.dueAt}
              onChange={(e) => setForm((p) => ({ ...p, dueAt: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            className="escoltran-gradient-bg text-white"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.titulo.trim()}
          >
            {mutation.isPending ? "Criando..." : "Criar Atividade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main ───────────────────────────────────────────────────────────
export default function ActivitiesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "OPEN" | "DONE">("all")
  const [showNew, setShowNew] = useState(false)

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["activities", filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter !== "all") params.set("status", filter)
      const res = await fetch(`/api/activities?${params}`)
      if (!res.ok) throw new Error("Falha ao carregar atividades")
      return res.json()
    },
    staleTime: 15_000,
  })

  const toggleDone = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "OPEN" | "DONE" }) => {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Atividade atualizada!" })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
    onError: () => toast({ variant: "destructive", title: "Erro ao atualizar atividade" }),
  })

  const filtered = activities.filter((a) => {
    const q = search.toLowerCase()
    return !q || a.titulo.toLowerCase().includes(q) ||
      (a.contact ? `${a.contact.nome} ${a.contact.sobrenome || ""}`.toLowerCase().includes(q) : false)
  })

  const openCount = activities.filter((a) => a.status === "OPEN").length
  const doneCount = activities.filter((a) => a.status === "DONE").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Atividades</h1>
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Carregando..." : `${openCount} abertas • ${doneCount} concluídas`}
          </p>
        </div>
        <Button className="escoltran-gradient-bg text-white" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Atividade
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(typeConfig).map(([type, config]) => {
          const Icon = config.icon
          const count = activities.filter((a) => a.tipo === type).length
          return (
            <Card key={type} className="bg-card border-border">
              <CardContent className="p-3 flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center`}>
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
                <div>
                  {isLoading ? (
                    <div className="h-4 w-6 rounded bg-muted animate-pulse" />
                  ) : (
                    <p className="text-sm font-bold">{count}</p>
                  )}
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
              {isLoading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 opacity-30" />
                      <p className="text-sm">
                        {search ? `Nenhuma atividade encontrada para "${search}"` : "Nenhuma atividade ainda"}
                      </p>
                      {!search && (
                        <Button size="sm" className="mt-2 escoltran-gradient-bg text-white" onClick={() => setShowNew(true)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Criar primeira atividade
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((activity) => {
                  const config = typeConfig[activity.tipo]
                  const Icon = config.icon
                  const contactName = activity.contact
                    ? `${activity.contact.nome}${activity.contact.sobrenome ? " " + activity.contact.sobrenome : ""}`
                    : null

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
                          {contactName && <p className="text-xs font-medium">{contactName}</p>}
                          {activity.deal && <p className="text-xs text-muted-foreground">{activity.deal.titulo}</p>}
                          {!contactName && !activity.deal && <span className="text-xs text-muted-foreground">—</span>}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 ${activity.status === "OPEN" ? "text-green-400 hover:text-green-400" : "text-muted-foreground"}`}
                          title={activity.status === "OPEN" ? "Concluir" : "Reabrir"}
                          disabled={toggleDone.isPending}
                          onClick={() => toggleDone.mutate({
                            id: activity.id,
                            status: activity.status === "OPEN" ? "DONE" : "OPEN",
                          })}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewActivityModal
        open={showNew}
        onOpenChange={setShowNew}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["activities"] })}
      />
    </div>
  )
}
