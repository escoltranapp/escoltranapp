"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, RefreshCw, Kanban, DollarSign, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

function SkeletonBoard() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="shrink-0 w-72 h-96 rounded-xl bg-card border border-border animate-pulse" />
      ))}
    </div>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [dealForm, setDealForm] = useState({
    titulo: "",
    valorEstimado: "",
    prioridade: "MEDIA",
    origem: "",
    stageId: "",
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: async () => {
      const res = await fetch("/api/pipeline/stages")
      if (!res.ok) throw new Error("Falha ao carregar pipeline")
      return res.json() as Promise<{ stages: Stage[]; pipelineId: string; pipelineName: string }>
    },
    staleTime: 10_000,
  })

  const moveDeal = useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      })
      if (!res.ok) throw new Error("Falha ao mover deal")
      return res.json()
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro ao mover deal" })
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
    },
  })

  const createDeal = useMutation({
    mutationFn: async () => {
      if (!dealForm.titulo.trim()) throw new Error("Título obrigatório")
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dealForm,
          valorEstimado: dealForm.valorEstimado || null,
          pipelineId: data?.pipelineId,
          stageId: dealForm.stageId || data?.stages[0]?.id,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Falha ao criar deal")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Deal criado com sucesso!" })
      setShowNewDeal(false)
      setDealForm({ titulo: "", valorEstimado: "", prioridade: "MEDIA", origem: "", stageId: "" })
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: err.message })
    },
  })

  const stages: Stage[] = data?.stages || []

  const totalDeals = stages.reduce((sum, s) => sum + s.deals.filter((d) => d.status === "OPEN").length, 0)
  const totalValue = stages.reduce(
    (sum, s) => sum + s.deals.filter((d) => d.status === "OPEN").reduce((sv, d) => sv + (d.valorEstimado || 0), 0),
    0
  )

  // Cards vencidos: deals sem data (use createdAt + 30 dias como proxy)
  const overdueDeals = stages.reduce(
    (sum, s) =>
      sum +
      s.deals.filter((d) => {
        if (d.status !== "OPEN") return false
        const age = Date.now() - new Date(d.createdAt).getTime()
        return age > 30 * 24 * 3600 * 1000 // > 30 dias
      }).length,
    0
  )

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Pipeline Comercial
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
          <p className="text-muted-foreground text-sm">
            Gestão de Oportunidades • Visão Kanban
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue="main">
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Pipeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">{data?.pipelineName || "Pipeline Principal"}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => refetch()} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button className="escoltran-gradient-bg text-white" onClick={() => setShowNewDeal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Deal
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <Kanban className="h-7 w-7 text-primary" />
            <div>
              <p className="text-xl font-bold">{isLoading ? "—" : totalDeals}</p>
              <p className="text-xs text-muted-foreground">Total de Cards</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <DollarSign className="h-7 w-7 text-green-400" />
            <div>
              <p className="text-xl font-bold">{isLoading ? "—" : formatCurrency(totalValue)}</p>
              <p className="text-xs text-muted-foreground">Valor Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className={`h-7 w-7 ${overdueDeals > 0 ? "text-red-400" : "text-muted-foreground"}`} />
            <div>
              <p className={`text-xl font-bold ${overdueDeals > 0 ? "text-red-400" : ""}`}>
                {isLoading ? "—" : overdueDeals}
              </p>
              <p className="text-xs text-muted-foreground">Cards +30 dias</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban */}
      {isLoading ? (
        <SkeletonBoard />
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p>Erro ao carregar pipeline. Verifique a conexão com o banco.</p>
          <Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      ) : stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
          <Kanban className="h-8 w-8 opacity-30" />
          <p>Nenhum estágio encontrado</p>
        </div>
      ) : (
        <KanbanBoard
          stages={stages}
          onDealMove={(dealId, _from, toStageId) =>
            moveDeal.mutate({ dealId, stageId: toStageId })
          }
        />
      )}

      {/* New Deal Modal */}
      <Dialog open={showNewDeal} onOpenChange={setShowNewDeal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Novo Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                placeholder="Ex: João Silva - Plano Premium"
                value={dealForm.titulo}
                onChange={(e) => setDealForm((p) => ({ ...p, titulo: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="valor">Valor Estimado</Label>
                <Input
                  id="valor"
                  type="number"
                  placeholder="0,00"
                  value={dealForm.valorEstimado}
                  onChange={(e) => setDealForm((p) => ({ ...p, valorEstimado: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Prioridade</Label>
                <Select
                  value={dealForm.prioridade}
                  onValueChange={(v) => setDealForm((p) => ({ ...p, prioridade: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="MEDIA">Média</SelectItem>
                    <SelectItem value="BAIXA">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Estágio inicial</Label>
              <Select
                value={dealForm.stageId}
                onValueChange={(v) => setDealForm((p) => ({ ...p, stageId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Primeiro estágio" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="origem">Canal de Origem</Label>
              <Input
                id="origem"
                placeholder="Google Ads, Indicação..."
                value={dealForm.origem}
                onChange={(e) => setDealForm((p) => ({ ...p, origem: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDeal(false)}>
              Cancelar
            </Button>
            <Button
              className="escoltran-gradient-bg text-white"
              onClick={() => createDeal.mutate()}
              disabled={createDeal.isPending || !dealForm.titulo.trim()}
            >
              {createDeal.isPending ? "Criando..." : "Criar Deal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
