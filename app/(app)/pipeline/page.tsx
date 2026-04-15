"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Plus, ChevronDown, LayoutGrid, TrendingUp, AlertTriangle } from "lucide-react"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { DealDetailSheet } from "@/components/pipeline/DealDetailSheet"
import { type Deal } from "@/components/pipeline/DealCard"
import { cn } from "@/lib/utils"

/* ─── Modal: Novo Deal ──────────────────────────────────────────── */
function NewDealModal({
  open,
  stages,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean
  stages: Stage[]
  onClose: () => void
  onSubmit: (data: { titulo: string; valorEstimado: string; prioridade: string; stageId: string }) => void
  isPending: boolean
}) {
  const [form, setForm] = useState({ titulo: "", valorEstimado: "", prioridade: "MEDIA", stageId: "" })

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#111118] border border-[#2a2a32] rounded-[14px] p-8 w-full max-w-[420px] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-[15px] font-semibold text-white mb-6">Novo Deal</h2>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] text-[#555] uppercase tracking-wider mb-1.5 block">Título *</label>
            <input
              value={form.titulo}
              onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Ex: João Silva – Plano Pro"
              className="w-full bg-[#18181f] border border-[#2a2a32] rounded-[8px] h-9 px-3 text-[13px] text-white focus:outline-none focus:border-[#4f46e5]/60 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#555] uppercase tracking-wider mb-1.5 block">Valor</label>
              <input
                type="number"
                value={form.valorEstimado}
                onChange={e => setForm(p => ({ ...p, valorEstimado: e.target.value }))}
                placeholder="0,00"
                className="w-full bg-[#18181f] border border-[#2a2a32] rounded-[8px] h-9 px-3 text-[13px] text-white focus:outline-none focus:border-[#4f46e5]/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#555] uppercase tracking-wider mb-1.5 block">Prioridade</label>
              <select
                value={form.prioridade}
                onChange={e => setForm(p => ({ ...p, prioridade: e.target.value }))}
                className="w-full bg-[#18181f] border border-[#2a2a32] rounded-[8px] h-9 px-3 text-[13px] text-white focus:outline-none"
              >
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#555] uppercase tracking-wider mb-1.5 block">Estágio</label>
            <select
              value={form.stageId}
              onChange={e => setForm(p => ({ ...p, stageId: e.target.value }))}
              className="w-full bg-[#18181f] border border-[#2a2a32] rounded-[8px] h-9 px-3 text-[13px] text-white focus:outline-none"
            >
              <option value="">Primeiro estágio</option>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onClose} className="px-4 h-9 text-[12px] font-medium text-[#555] hover:text-[#aaa] transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { onSubmit(form); setForm({ titulo: "", valorEstimado: "", prioridade: "MEDIA", stageId: "" }) }}
            disabled={isPending || !form.titulo.trim()}
            className="px-5 h-9 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[12px] font-semibold rounded-[8px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Criando..." : "Criar Deal"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function PipelinePage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [newDealStageId, setNewDealStageId] = useState<string | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const { data: boardData, isLoading } = useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: async () => {
      const res = await fetch("/api/pipeline/stages")
      if (!res.ok) throw new Error("Falha ao carregar pipeline")
      return res.json()
    },
    staleTime: 10_000,
  })

  const stages: Stage[] = (boardData?.stages || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    color: s.color || "#818cf8",
    order: s.order ?? 0,
    deals: (s.deals || []).map((d: any) => ({
      ...d,
      valorEstimado: Number(d.valorEstimado) || 0,
      prioridade: (d.prioridade?.toUpperCase() || "MEDIA") as "ALTA" | "MEDIA" | "BAIXA",
      status: (d.status?.toUpperCase() || "OPEN") as "OPEN" | "WON" | "LOST",
    })),
  }))

  const allDeals = stages.flatMap(s => s.deals.filter(d => d.status === "OPEN"))
  const totalValue = allDeals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0)
  const overdueDeals = allDeals.filter(d => {
    const age = Date.now() - new Date(d.createdAt).getTime()
    return age > 30 * 24 * 3600 * 1000
  }).length
  const totalDealsInPipeline = stages.reduce((acc, s) => acc + s.deals.filter(d => d.status === "OPEN").length, 0)
  const maxStageDeals = Math.max(...stages.map(s => s.deals.filter(d => d.status === "OPEN").length), 1)
  const progressPct = Math.min(100, (totalDealsInPipeline / (stages.length * Math.max(maxStageDeals, 1))) * 100)

  const moveDeal = useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      })
      if (!res.ok) throw new Error("Falha ao mover")
      return res.json()
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
    },
  })

  const createDeal = useMutation({
    mutationFn: async (data: { titulo: string; valorEstimado: string; prioridade: string; stageId: string }) => {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: data.titulo,
          valorEstimado: data.valorEstimado || null,
          prioridade: data.prioridade,
          stageId: data.stageId || stages[0]?.id,
          pipelineId: boardData?.pipelineId,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Falha ao criar deal")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Deal criado!" })
      setShowNewDeal(false)
      setNewDealStageId(null)
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: err.message })
    },
  })

  const addStage = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/pipeline/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pipelineId: boardData?.pipelineId }),
      })
      if (!res.ok) throw new Error("Falha ao criar coluna")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Coluna criada!" })
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
    },
    onError: (err: Error) => toast({ variant: "destructive", title: err.message }),
  })

  const handleAddDeal = (stageId: string) => {
    setNewDealStageId(stageId)
    setShowNewDeal(true)
  }

  const handleAddStage = () => {
    const name = window.prompt("Nome da nova coluna:")
    if (name?.trim()) addStage.mutate(name.trim())
  }

  const stagesWithSelected = newDealStageId
    ? stages
    : stages

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d0f] text-white -m-4 md:-m-6">

      {/* ── TOPBAR ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e24]">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-[-0.3px]">Pipeline</h1>
          <p className="text-[12px] text-[#555] mt-[2px] tracking-[0.02em]">Gestão de oportunidades · Visão Kanban</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Pipeline selector */}
          <button className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-[8px] text-[12px] font-medium border border-[#2a2a32] bg-[#18181f] text-[#aaa] hover:bg-[#222230] hover:text-[#ddd] transition-all">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#aaa" strokeWidth="1.5"/>
              <path d="M8 5v3l2 1.5" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {boardData?.pipelineName || "Pipeline Principal"}
            <ChevronDown size={10} className="text-[#555] ml-1" />
          </button>

          {/* Nova Coluna */}
          <button
            onClick={handleAddStage}
            className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-[8px] text-[12px] font-medium border border-[#2a2a32] bg-[#18181f] text-[#aaa] hover:bg-[#222230] hover:text-[#ddd] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Nova Coluna
          </button>

          {/* Novo Deal */}
          <button
            onClick={() => { setNewDealStageId(null); setShowNewDeal(true) }}
            className="flex items-center gap-1.5 px-4 py-[7px] bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[12px] font-semibold rounded-[8px] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Novo Deal
          </button>
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-[#1e1e24]">
        {/* Oportunidades */}
        <div className="bg-[#18181f] border border-[#1e1e24] rounded-[10px] px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#1a1a2e] flex items-center justify-center shrink-0">
            <LayoutGrid size={16} className="text-[#818cf8]" />
          </div>
          <div>
            <div className="text-[11px] text-[#555] uppercase tracking-[0.06em] mb-[3px]">Oportunidades</div>
            <div className="text-[20px] font-semibold text-white leading-none">
              {isLoading ? "—" : allDeals.length}
            </div>
            <div className="text-[11px] text-[#555] mt-[3px]">cards ativos</div>
          </div>
        </div>

        {/* Valor total */}
        <div className="bg-[#18181f] border border-[#1e1e24] rounded-[10px] px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#0f1e14] flex items-center justify-center shrink-0">
            <TrendingUp size={16} className="text-[#4ade80]" />
          </div>
          <div>
            <div className="text-[11px] text-[#555] uppercase tracking-[0.06em] mb-[3px]">Valor total</div>
            <div className="text-[20px] font-semibold text-white leading-none">
              {isLoading ? "—" : totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <div className="text-[11px] text-[#555] mt-[3px]">em aberto</div>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-[#18181f] border border-[#1e1e24] rounded-[10px] px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#1f1010] flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-[#f87171]" />
          </div>
          <div>
            <div className="text-[11px] text-[#555] uppercase tracking-[0.06em] mb-[3px]">Alertas</div>
            <div className={cn("text-[20px] font-semibold leading-none", overdueDeals > 0 ? "text-[#f87171]" : "text-white")}>
              {isLoading ? "—" : overdueDeals}
            </div>
            <div className="text-[11px] text-[#555] mt-[3px]">cards +30 dias</div>
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR ───────────────────────────────────── */}
      <div className="h-[2px] mx-6 mb-4 mt-0 bg-[#1e1e24] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4f46e5] to-[#818cf8] transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── KANBAN BOARD ───────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto pb-8 px-6" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a35 transparent" }}>
        {isLoading ? (
          <div className="flex gap-[14px]">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-[240px] shrink-0 flex flex-col gap-2">
                <div className="h-10 rounded-[10px] bg-[#18181f] animate-pulse" />
                <div className="h-[120px] rounded-[10px] bg-[#18181f]/60 animate-pulse" />
                <div className="h-[120px] rounded-[10px] bg-[#18181f]/40 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <KanbanBoard
            key={stages.map(s => s.id + s.deals.length).join("-")}
            stages={stages}
            onDealMove={(dealId, _, stageId) => moveDeal.mutate({ dealId, stageId })}
            onAddDeal={handleAddDeal}
            onAddStage={handleAddStage}
            onDealClick={deal => setSelectedDeal(deal)}
          />
        )}
      </div>

      {/* ── MODALS ─────────────────────────────────────────── */}
      <NewDealModal
        open={showNewDeal}
        stages={stages}
        onClose={() => { setShowNewDeal(false); setNewDealStageId(null) }}
        onSubmit={data => createDeal.mutate({ ...data, stageId: data.stageId || newDealStageId || "" })}
        isPending={createDeal.isPending}
      />

      <DealDetailSheet
        deal={selectedDeal}
        open={!!selectedDeal}
        onOpenChange={open => !open && setSelectedDeal(null)}
      />
    </div>
  )
}
