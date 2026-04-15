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
  Filter,
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
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
  CALL: { icon: Phone, label: "Ligação", color: "text-info", bg: "bg-info/10" },
  MEETING: { icon: Calendar, label: "Reunião", color: "text-accent", bg: "bg-accent/10" },
  TASK: { icon: CheckSquare, label: "Tarefa", color: "text-warning", bg: "bg-warning/10" },
  NOTE: { icon: FileText, label: "Nota", color: "text-text-muted", bg: "bg-white/5" },
  WHATSAPP: { icon: MessageCircle, label: "WhatsApp", color: "text-success", bg: "bg-success/10" },
  EMAIL: { icon: Mail, label: "Email", color: "text-white", bg: "bg-white/10" },
}

function SkeletonRow() {
  return (
    <TableRow>
      {[...Array(6)].map((_, i) => (
        <TableCell key={i}><div className="h-4 rounded bg-white/5 animate-pulse" /></TableCell>
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
      toast({ title: "Atividade registrada com sucesso!" })
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
      <DialogContent className="sm:max-w-[480px] bg-surface-overlay border-border-strong animate-entrance">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-text-primary">Nova Atividade</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Classificação *</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}>
              <SelectTrigger className="h-11 bg-black/20 border-border-subtle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface-overlay border-border-strong">
                {Object.entries(typeConfig).map(([key, cfg]) => {
                  const Icon = cfg.icon
                  return (
                    <SelectItem key={key} value={key} className="focus:bg-white/5 uppercase font-mono text-[10px] font-bold tracking-widest">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                        {cfg.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Assunto / Objetivo *</Label>
            <Input
              placeholder="Ex: Call de fechamento trimestral"
              className="h-11 bg-black/20 border-border-subtle"
              value={form.titulo}
              onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Contexto Adicional</Label>
            <Textarea
              placeholder="Detalhes relevantes para a atividade..."
              className="bg-black/20 border-border-subtle min-h-[100px]"
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Cronograma (Deadline)</Label>
            <Input
              type="datetime-local"
              className="h-11 bg-black/20 border-border-subtle"
              value={form.dueAt}
              onChange={(e) => setForm((p) => ({ ...p, dueAt: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter className="border-t border-border-subtle pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.titulo.trim()}
          >
            {mutation.isPending ? "Processando..." : "Registrar Atividade"}
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
      toast({ title: "Status da atividade atualizado" })
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
    <div className="space-y-6 pb-8 animate-entrance">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter leading-none">Célula de Atividades</h1>
          <p className="text-sm font-display italic text-accent opacity-80 mt-1">
            {isLoading ? "Consultando dataset..." : `${openCount} Pendentes • ${doneCount} Concluídas`}
          </p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Atividade
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(typeConfig).map(([type, config], i) => {
          const Icon = config.icon
          const count = activities.filter((a) => a.tipo === type).length
          return (
            <Card key={type} className="bg-surface border-border-subtle group hover:border-border-default transition-all animate-entrance" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border border-border-subtle group-hover:bg-white/[0.02] transition-colors", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div>
                  <p className="text-sm font-black font-sans leading-none">{isLoading ? "—" : count}</p>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted mt-1 opacity-60 truncate">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-surface border-border-subtle overflow-hidden">
        <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted group-focus-within:text-accent transition-colors" />
              <Input
                placeholder="Filtro de busca inteligente (Título, Contato...)"
                className="pl-9 h-10 bg-black/20 border-border-subtle focus:border-accent/40 text-[13px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-lg border border-border-subtle">
              {(["all", "OPEN", "DONE"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-[10px] font-black font-mono uppercase tracking-widest transition-all",
                    filter === f ? "bg-accent text-black" : "text-text-muted hover:text-text-primary hover:bg-white/5"
                  )}
                >
                  {f === "all" ? "Geral" : f === "OPEN" ? "Abertas" : "Finalizadas"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Atividade</TableHead>
                <TableHead className="text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Categoria</TableHead>
                <TableHead className="hidden sm:table-cell text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Auditório / Lead</TableHead>
                <TableHead className="hidden md:table-cell text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Deadline</TableHead>
                <TableHead className="text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Status</TableHead>
                <TableHead className="text-right text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-24">
                    <div className="flex flex-col items-center gap-4 text-text-muted opacity-30">
                      <CheckCircle2 className="h-12 w-12" />
                      <p className="text-sm font-mono uppercase tracking-widest">Pipeline de atividades limpo</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((activity, i) => {
                  const config = typeConfig[activity.tipo]
                  const Icon = config.icon
                  const contactName = activity.contact
                    ? `${activity.contact.nome}${activity.contact.sobrenome ? " " + activity.contact.sobrenome : ""}`
                    : null
                  const isOverdue = activity.dueAt && new Date(activity.dueAt) < new Date() && activity.status === "OPEN"

                  return (
                    <TableRow key={activity.id} className="border-border-subtle hover:bg-white/[0.01] group transition-colors animate-entrance" style={{ animationDelay: `${i * 50}ms` }}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className={cn(
                            "text-[13px] font-black uppercase tracking-tight transition-all",
                            activity.status === "DONE" ? "text-text-muted line-through opacity-50" : "text-text-primary"
                          )}>
                            {activity.titulo}
                          </p>
                          {activity.descricao && (
                            <p className="text-[10px] font-display italic text-text-muted opacity-60 truncate max-w-[250px]">{activity.descricao}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={cn("inline-flex items-center gap-1.5 text-[9px] font-black font-mono uppercase tracking-widest px-2 py-1 rounded border border-border-subtle", config.bg, config.color)}>
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-0.5">
                          {contactName && <p className="text-[11px] font-black uppercase text-text-primary">{contactName}</p>}
                          {activity.deal && <p className="text-[10px] font-display italic text-accent opacity-80">{activity.deal.titulo}</p>}
                          {!contactName && !activity.deal && <span className="text-[10px] font-mono text-text-muted opacity-40">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-[11px] font-mono">
                        {activity.dueAt ? (
                          <div className={cn("flex items-center gap-1.5 font-bold", isOverdue ? "text-danger animate-pulse" : "text-text-muted opacity-80")}>
                            <Clock className="h-3 w-3 opacity-50" />
                            {formatDate(activity.dueAt)}
                          </div>
                        ) : <span className="text-text-muted opacity-40">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={activity.status === "DONE" ? "ativa" : "novo"} className="uppercase font-mono text-[9px] tracking-widest">
                          {activity.status === "DONE" ? "Finalizada" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8 transition-all hover:bg-success/20",
                            activity.status === "OPEN" ? "text-success" : "text-text-muted rotate-180"
                          )}
                          title={activity.status === "OPEN" ? "Finalizar" : "Reabrir"}
                          disabled={toggleDone.isPending}
                          onClick={() => toggleDone.mutate({
                            id: activity.id,
                            status: activity.status === "OPEN" ? "DONE" : "OPEN",
                          })}
                        >
                          <Check className="h-4 w-4" />
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
