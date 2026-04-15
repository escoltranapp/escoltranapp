"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
  Trash2,
  AlertTriangle,
  Activity,
  TrendingUp,
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface Lista {
  id: string
  nome: string
  descricao?: string | null
  status: "RASCUNHO" | "ATIVA" | "PAUSADA" | "EM_PROCESSAMENTO" | "CONCLUIDA" | "CANCELADA"
  totalLeads: number
  enviados: number
  falhos: number
  pendentes: number
  createdAt: string
}

// ─── Skeleton row ───────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <TableRow>
      {[...Array(6)].map((_, i) => (
        <TableCell key={i}><div className="h-4 rounded bg-white/5 animate-pulse" /></TableCell>
      ))}
    </TableRow>
  )
}

// ─── Validate phone format ──────────────────────────────────────────
function parsePhones(raw: string): { valid: string[]; total: number } {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean)
  const valid = lines.filter((l) => {
    const digits = l.replace(/\D/g, "")
    return digits.length >= 10 && digits.length <= 15
  })
  return { valid, total: lines.length }
}

// ─── Nova Lista Modal ───────────────────────────────────────────────
function NovaListaModal({ open, onOpenChange, onSuccess }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({ nome: "", descricao: "", telefones: "" })
  const parsed = parsePhones(form.telefones)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Nome é obrigatório")
      if (parsed.valid.length === 0) throw new Error("Informe pelo menos um número válido")
      const res = await fetch("/api/listas-disparo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao || null,
          telefones: parsed.valid,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao criar lista")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Lista criada com sucesso!" })
      onSuccess()
      onOpenChange(false)
      setForm({ nome: "", descricao: "", telefones: "" })
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: err.message })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-surface-overlay border-border-strong animate-entrance">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-text-primary">Nova Lista de Disparo</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Identificador da Campanha *</Label>
            <Input
              placeholder="Ex: Black Friday 2024"
              className="h-11"
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Observações Estratégicas</Label>
            <Input
              placeholder="Canal: WhatsApp / Leads Inbound"
              className="h-11"
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Dataset de Contatos (Números) *</Label>
              {form.telefones && (
                <span className={cn(
                  "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full",
                  parsed.valid.length === parsed.total ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                )}>
                  {parsed.valid.length} Válidos
                </span>
              )}
            </div>
            <Textarea
              placeholder={`+5511999990001\n+5521988880002`}
              value={form.telefones}
              onChange={(e) => setForm((p) => ({ ...p, telefones: e.target.value }))}
              rows={6}
              className="font-mono text-xs bg-black/20 border-border-subtle focus:border-accent/40"
            />
            <p className="text-[10px] text-text-muted font-display italic">
              Insira um número por linha com código de área (ex: 11999998888)
            </p>
          </div>
        </div>
        <DialogFooter className="border-t border-border-subtle pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Abortar</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.nome.trim() || parsed.valid.length === 0}
            className="px-8"
          >
            {mutation.isPending ? "Configurando Disparos..." : `Gerar Campanha (${parsed.valid.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main ───────────────────────────────────────────────────────────
export default function ListasDisparoPage() {
  const queryClient = useQueryClient()
  const [showNew, setShowNew] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: listas = [], isLoading } = useQuery<Lista[]>({
    queryKey: ["listas-disparo"],
    queryFn: async () => {
      const res = await fetch("/api/listas-disparo")
      if (!res.ok) throw new Error("Falha ao carregar listas")
      return res.json()
    },
    staleTime: 15_000,
    refetchInterval: 10_000,
  })

  const patchStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/listas-disparo/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar status")
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listas-disparo"] }),
    onError: () => toast({ variant: "destructive", title: "Erro ao atualizar status" }),
  })

  const deleteLista = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/listas-disparo/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao deletar")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Lista removida" })
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ["listas-disparo"] })
    },
    onError: () => toast({ variant: "destructive", title: "Erro ao remover lista" }),
  })

  const totalEnviados = listas.reduce((sum, l) => sum + l.enviados, 0)
  const totalLeads = listas.reduce((sum, l) => sum + l.totalLeads, 0)
  const taxaSucesso = totalLeads > 0 ? ((totalEnviados / totalLeads) * 100).toFixed(1) : "0"
  const emProgresso = listas.filter((l) => l.status === "EM_PROCESSAMENTO").length

  return (
    <div className="space-y-6 pb-8 animate-entrance">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter leading-none">Listas de Disparo</h1>
          <p className="text-sm font-display italic text-accent opacity-80 mt-1">Orquestração de campanhas massivas</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Lista
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Campanhas", value: listas.length, icon: Send, color: "text-accent" },
          { label: "Disparando", value: emProgresso, icon: Activity, color: "text-info" },
          { label: "Total Leads", value: totalLeads, icon: Users, color: "text-white" },
          { label: "Taxa Flow", value: `${taxaSucesso}%`, icon: TrendingUp, color: "text-success" },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-surface border-border-subtle group hover:border-border-default transition-all animate-entrance" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center border border-border-subtle group-hover:bg-white/[0.02] transition-colors">
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-black font-sans leading-none">{stat.value}</p>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted mt-1 opacity-60">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Table Section */}
      <Card className="bg-surface border-border-subtle overflow-hidden">
        <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4">
          <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-text-muted">Campaign Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Campanha</TableHead>
                <TableHead className="text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Fase</TableHead>
                <TableHead className="hidden sm:table-cell text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted w-48">Execution Pulse</TableHead>
                <TableHead className="hidden md:table-cell text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Volumetria</TableHead>
                <TableHead className="hidden lg:table-cell text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Criação</TableHead>
                <TableHead className="text-right text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
              ) : listas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-24">
                    <div className="flex flex-col items-center gap-4 text-text-muted opacity-30">
                      <Send className="h-12 w-12" />
                      <p className="text-sm font-mono uppercase tracking-widest">Nenhuma campanha orquestrada</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                listas.map((lista, i) => {
                  const progress = lista.totalLeads > 0 ? ((lista.enviados + lista.falhos) / lista.totalLeads) * 100 : 0
                  const isProcessing = lista.status === "EM_PROCESSAMENTO"
                  const statusVariant = lista.status === "CONCLUIDA" ? "ativa" : lista.status === "CANCELADA" ? "inativa" : "novo"

                  return (
                    <TableRow key={lista.id} className="border-border-subtle hover:bg-white/[0.01] group transition-colors animate-entrance" style={{ animationDelay: `${i * 100}ms` }}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="text-[13px] font-black text-text-primary uppercase tracking-tight">{lista.nome}</p>
                          <p className="text-[10px] font-display italic text-text-muted opacity-60 truncate max-w-[200px]">{lista.descricao || "Sem notas descritivas"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant} className={cn(isProcessing && "animate-pulse")}>{lista.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1.5 pt-1">
                          <Progress value={progress} className="h-1 bg-surface-elevated" />
                          <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase text-text-muted tracking-tighter">
                            <span>{progress.toFixed(1)}% Completed</span>
                            <span>{lista.enviados} / {lista.totalLeads}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex gap-4 text-[11px] font-mono">
                          <div className="flex items-center gap-1.5 text-success font-bold"><CheckCircle className="h-3 w-3 opacity-50" /> {lista.enviados}</div>
                          <div className="flex items-center gap-1.5 text-danger font-bold"><XCircle className="h-3 w-3 opacity-50" /> {lista.falhos}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-[11px] font-mono text-text-muted">
                        {formatDate(lista.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-10 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Controls */}
                          {(lista.status === "ATIVA" || lista.status === "RASCUNHO" || lista.status === "PAUSADA") && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-success" onClick={() => patchStatus.mutate({ id: lista.id, status: "EM_PROCESSAMENTO" })}>
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {isProcessing && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-warning" onClick={() => patchStatus.mutate({ id: lista.id, status: "PAUSADA" })}>
                              <Pause className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {(isProcessing || lista.status === "PAUSADA") && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-danger" onClick={() => patchStatus.mutate({ id: lista.id, status: "CANCELADA" })}>
                              <StopCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {(lista.status === "RASCUNHO" || lista.status === "CANCELADA" || lista.status === "CONCLUIDA") && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-danger/60 hover:text-danger" onClick={() => setDeleteId(lista.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NovaListaModal
        open={showNew}
        onOpenChange={setShowNew}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["listas-disparo"] })}
      />

      {/* Delete/Expurge Alert */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[420px] bg-surface-overlay border-border-strong p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-danger" /> Expurgo de Campanha
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-sans italic text-text-muted leading-relaxed">
              Você está prestes a deletar permanentemente esta lista de disparo. Todos os metadados de progresso e logs de envios serão perdidos. Esta ação é <span className="text-text-primary font-bold">irreversível</span>.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Desistir</Button>
            <Button
              variant="destructive"
              className="bg-danger text-white hover:bg-danger/80"
              onClick={() => deleteId && deleteLista.mutate(deleteId)}
              disabled={deleteLista.isPending}
            >
              {deleteLista.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
