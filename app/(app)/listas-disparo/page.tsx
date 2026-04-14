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
} from "lucide-react"
import { formatDate } from "@/lib/utils"
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

const statusConfig = {
  RASCUNHO: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  ATIVA: { label: "Ativa", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  PAUSADA: { label: "Pausada", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  EM_PROCESSAMENTO: { label: "Em Processamento", className: "bg-primary/10 text-primary border-primary/20" },
  CONCLUIDA: { label: "Concluída", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  CANCELADA: { label: "Cancelada", className: "bg-red-500/10 text-red-400 border-red-500/20" },
}

// ─── Skeleton row ───────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <TableRow>
      {[...Array(6)].map((_, i) => (
        <TableCell key={i}><div className="h-4 rounded bg-muted animate-pulse" /></TableCell>
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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Nova Lista de Disparo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nome da Lista *</Label>
            <Input
              placeholder="Campanha Novembro"
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input
              placeholder="Leads Google Maps - SP"
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Números de Telefone (um por linha) *</Label>
              {form.telefones && (
                <span className={`text-xs ${parsed.valid.length === parsed.total ? "text-green-400" : "text-amber-400"}`}>
                  {parsed.valid.length} válidos / {parsed.total} total
                </span>
              )}
            </div>
            <Textarea
              placeholder={`+5511999990001\n+5521988880002\n5531977770003`}
              value={form.telefones}
              onChange={(e) => setForm((p) => ({ ...p, telefones: e.target.value }))}
              rows={8}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: +5511999990001, 5511999990001, 11999990001
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            className="escoltran-gradient-bg text-white"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.nome.trim() || parsed.valid.length === 0}
          >
            {mutation.isPending ? "Criando..." : `Criar Lista (${parsed.valid.length} números)`}
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
    refetchInterval: 10_000, // poll for progress updates
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
  const ativas = listas.filter((l) => l.status === "ATIVA").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Listas de Disparo</h1>
          <p className="text-muted-foreground text-sm">Gerenciar campanhas de disparo em massa</p>
        </div>
        <Button className="escoltran-gradient-bg text-white" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Lista
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Listas Ativas", value: isLoading ? "—" : ativas, icon: Send, color: "text-primary" },
          { label: "Em Progresso", value: isLoading ? "—" : emProgresso, icon: Clock, color: "text-amber-400" },
          { label: "Enviados", value: isLoading ? "—" : totalEnviados, icon: CheckCircle, color: "text-green-400" },
          { label: "Taxa de Sucesso", value: isLoading ? "—" : `${taxaSucesso}%`, icon: Users, color: "text-blue-400" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className={`h-7 w-7 ${stat.color}`} />
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Table */}
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
              {isLoading ? (
                [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
              ) : listas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Send className="h-8 w-8 opacity-30" />
                      <p className="text-sm">Nenhuma lista criada ainda</p>
                      <Button size="sm" className="mt-2 escoltran-gradient-bg text-white" onClick={() => setShowNew(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Criar primeira lista
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                listas.map((lista) => {
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
                          {/* Play: ATIVA ou RASCUNHO → start */}
                          {(lista.status === "ATIVA" || lista.status === "RASCUNHO") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Iniciar disparo"
                              onClick={() => patchStatus.mutate({ id: lista.id, status: "EM_PROCESSAMENTO" })}
                            >
                              <Play className="h-3 w-3 text-green-400" />
                            </Button>
                          )}
                          {/* Pause: EM_PROCESSAMENTO → pausar */}
                          {lista.status === "EM_PROCESSAMENTO" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Pausar"
                              onClick={() => patchStatus.mutate({ id: lista.id, status: "PAUSADA" })}
                            >
                              <Pause className="h-3 w-3 text-amber-400" />
                            </Button>
                          )}
                          {/* Resume: PAUSADA → resume */}
                          {lista.status === "PAUSADA" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Retomar"
                              onClick={() => patchStatus.mutate({ id: lista.id, status: "EM_PROCESSAMENTO" })}
                            >
                              <Play className="h-3 w-3 text-green-400" />
                            </Button>
                          )}
                          {/* Stop: EM_PROCESSAMENTO or PAUSADA → cancel */}
                          {(lista.status === "EM_PROCESSAMENTO" || lista.status === "PAUSADA") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Cancelar"
                              onClick={() => patchStatus.mutate({ id: lista.id, status: "CANCELADA" })}
                            >
                              <StopCircle className="h-3 w-3 text-red-400" />
                            </Button>
                          )}
                          {/* Delete: only RASCUNHO or CANCELADA or CONCLUIDA */}
                          {(lista.status === "RASCUNHO" || lista.status === "CANCELADA" || lista.status === "CONCLUIDA") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-400 hover:text-red-400"
                              title="Excluir"
                              onClick={() => setDeleteId(lista.id)}
                            >
                              <Trash2 className="h-3 w-3" />
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Excluir lista?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta ação não pode ser desfeita. A lista e todos os seus leads serão removidos.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
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
