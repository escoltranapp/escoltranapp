"use client"

import { useQuery } from "@tanstack/react-query"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, RefreshCw } from "lucide-react"

const mockStages: Stage[] = [
  {
    id: "stage-1",
    name: "Prospecção",
    color: "#6b7280",
    order: 0,
    deals: [
      {
        id: "deal-1",
        titulo: "João Silva - Plano Premium",
        valorEstimado: 2500,
        prioridade: "ALTA",
        status: "OPEN",
        origem: "Google Ads",
        stageId: "stage-1",
        contact: { nome: "João", sobrenome: "Silva", email: "joao@email.com" },
        createdAt: new Date().toISOString(),
      },
      {
        id: "deal-2",
        titulo: "Maria Santos - Consultoria",
        valorEstimado: 8000,
        prioridade: "MEDIA",
        status: "OPEN",
        origem: "Indicação",
        stageId: "stage-1",
        contact: { nome: "Maria", sobrenome: "Santos", email: "maria@email.com" },
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "stage-2",
    name: "Qualificação",
    color: "#f97316",
    order: 1,
    deals: [
      {
        id: "deal-3",
        titulo: "Pedro Costa - Enterprise",
        valorEstimado: 15000,
        prioridade: "ALTA",
        status: "OPEN",
        origem: "LinkedIn",
        stageId: "stage-2",
        contact: { nome: "Pedro", sobrenome: "Costa", email: "pedro@empresa.com" },
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "stage-3",
    name: "Proposta",
    color: "#f59e0b",
    order: 2,
    deals: [
      {
        id: "deal-4",
        titulo: "Ana Lima - Pacote Básico",
        valorEstimado: 1200,
        prioridade: "BAIXA",
        status: "OPEN",
        origem: "Facebook",
        stageId: "stage-3",
        contact: { nome: "Ana", sobrenome: "Lima", email: "ana@email.com" },
        createdAt: new Date().toISOString(),
      },
      {
        id: "deal-5",
        titulo: "Carlos Ferreira - Plano Anual",
        valorEstimado: 9600,
        prioridade: "MEDIA",
        status: "OPEN",
        origem: "Orgânico",
        stageId: "stage-3",
        contact: { nome: "Carlos", sobrenome: "Ferreira", email: "carlos@email.com" },
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "stage-4",
    name: "Negociação",
    color: "#8b5cf6",
    order: 3,
    deals: [
      {
        id: "deal-6",
        titulo: "Lucia Alves - Upgrade",
        valorEstimado: 4500,
        prioridade: "ALTA",
        status: "OPEN",
        origem: "Email Marketing",
        stageId: "stage-4",
        contact: { nome: "Lucia", sobrenome: "Alves", email: "lucia@email.com" },
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "stage-5",
    name: "Fechamento",
    color: "#22c55e",
    order: 4,
    deals: [
      {
        id: "deal-7",
        titulo: "Roberto Nunes - Renovação",
        valorEstimado: 6000,
        prioridade: "ALTA",
        status: "OPEN",
        origem: "Retenção",
        stageId: "stage-5",
        contact: { nome: "Roberto", sobrenome: "Nunes", email: "roberto@email.com" },
        createdAt: new Date().toISOString(),
      },
    ],
  },
]

export default function PipelinePage() {
  const { data: stages, isLoading, refetch } = useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/pipeline/stages")
        if (res.ok) return res.json()
      } catch {
        // ignore
      }
      return mockStages
    },
  })

  const totalDeals = (stages || mockStages).reduce(
    (sum: number, s: Stage) => sum + s.deals.filter((d) => d.status === "OPEN").length,
    0
  )
  const totalValue = (stages || mockStages).reduce(
    (sum: number, s: Stage) =>
      sum + s.deals.filter((d) => d.status === "OPEN").reduce((sv, d) => sv + (d.valorEstimado || 0), 0),
    0
  )

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
          <p className="text-muted-foreground text-sm">
            {totalDeals} deals abertos &bull; {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalValue)} em pipeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue="default">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Pipeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Pipeline Principal</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button className="escoltran-gradient-bg text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Deal
          </Button>
        </div>
      </div>

      {/* Kanban */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando pipeline...</div>
        </div>
      ) : (
        <KanbanBoard stages={stages || mockStages} />
      )}
    </div>
  )
}
