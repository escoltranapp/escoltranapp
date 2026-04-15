"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Plus, RefreshCw, ChevronDown, Layers, TrendingUp, AlertTriangle, X } from "lucide-react"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { DealDetailSheet } from "@/components/pipeline/DealDetailSheet"
import { type Deal } from "@/components/pipeline/DealCard"
import { cn } from "@/lib/utils"

/* ─── New Deal Modal ─────────────────────────────────────────────── */
function NewDealModal({
  open, stages, initialStageId, onClose, onSubmit, isPending,
}: {
  open: boolean
  stages: Stage[]
  initialStageId?: string | null
  onClose: () => void
  onSubmit: (d: { titulo: string; valorEstimado: string; prioridade: string; stageId: string }) => void
  isPending: boolean
}) {
  const [form, setForm] = useState({
    titulo: "", valorEstimado: "", prioridade: "MEDIA", stageId: initialStageId ?? "",
  })

  if (!open) return null

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[440px] rounded-t-2xl sm:rounded-2xl p-7 shadow-2xl"
        style={{
          background: "linear-gradient(145deg, #14162b 0%, #0f1022 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[16px] font-semibold text-white">Novo Deal</h2>
            <p className="text-[12px] text-white/30 mt-0.5">Adicionar oportunidade ao pipeline</p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
              Título *
            </label>
            <input
              autoFocus
              value={form.titulo}
              onChange={e => set("titulo", e.target.value)}
              placeholder="Ex: João Silva – Plano Pro"
              className="w-full rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50 transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
          </div>

          {/* Value + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
                Valor estimado
              </label>
              <input
                type="number"
                value={form.valorEstimado}
                onChange={e => set("valorEstimado", e.target.value)}
                placeholder="0,00"
                className="w-full rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50 transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
                Prioridade
              </label>
              <select
                value={form.prioridade}
                onChange={e => set("prioridade", e.target.value)}
                className="w-full rounded-xl h-10 px-3.5 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <option value="ALTA">🔴 Alta</option>
                <option value="MEDIA">🟡 Média</option>
                <option value="BAIXA">🔵 Baixa</option>
              </select>
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-[11px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
              Estágio inicial
            </label>
            <select
              value={form.stageId}
              onChange={e => set("stageId", e.target.value)}
              className="w-full rounded-xl h-10 px-3.5 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <option value="">Primeiro estágio</option>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-[13px] font-medium text-white/30 hover:text-white/60 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSubmit(form)
              setForm({ titulo: "", valorEstimado: "", prioridade: "MEDIA", stageId: "" })
            }}
            disabled={isPending || !form.titulo.trim()}
            className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              boxShadow: isPending || !form.titulo.trim() ? "none" : "0 4px 16px rgba(99,102,241,0.4)",
            }}
          >
            {isPending ? "Criando..." : "Criar Deal"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Stat card ─────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: string; sub?: string; icon: React.ElementType; accent: string
}) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-xl flex-1 min-w-0"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}18` }}
      >
        <Icon size={16} color={accent} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          {label}
        </p>
        <p className="text-[18px] font-semibold leading-none text-white truncate">{value}</p>
        {sub && <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>{sub}</p>}
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

  const { data: boardData, isLoading, error, refetch } = useQuery({
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
    color: s.color || "#6366f1",
    order: s.order ?? 0,
    deals: (s.deals || []).map((d: any) => ({
      ...d,
      valorEstimado: Number(d.valorEstimado) || 0,
      prioridade: (d.prioridade?.toUpperCase() || "MEDIA") as "ALTA" | "MEDIA" | "BAIXA",
      status: (d.status?.toUpperCase() || "OPEN") as "OPEN" | "WON" | "LOST",
    })),
  }))

  const allOpen = stages.flatMap(s => s.deals.filter(d => d.status === "OPEN"))
  const totalValue = allOpen.reduce((a, d) => a + (d.valorEstimado || 0), 0)
  const overdue = allOpen.filter(d => Date.now() - new Date(d.createdAt).getTime() > 30 * 86400_000).length

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
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
      toast({ variant: "destructive", title: "Erro ao mover deal" })
    },
  })

  const createDeal = useMutation({
    mutationFn: async (data: { titulo: string; valorEstimado: string; prioridade: string; stageId: string }) => {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: data.titulo,
          valorEstimado: data.valorEstimado ? parseFloat(data.valorEstimado) : null,
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
    onError: (err: Error) => toast({ variant: "destructive", title: err.message }),
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

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6 bg-[#080a12]">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="px-6 pt-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                Pipeline Comercial
              </div>
            </div>
            <h1 className="text-[24px] font-bold text-white tracking-[-0.4px] leading-none">Pipeline</h1>
            <p className="text-[13px] text-white/25 mt-1.5 font-medium">
              {boardData?.pipelineName || "Pipeline Principal"} · Visão Kanban
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => refetch()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/25 hover:text-white/60 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
              title="Atualizar"
            >
              <RefreshCw size={14} />
            </button>

            <button
              onClick={() => { setNewDealStageId(null); setShowNewDeal(true) }}
              className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              Novo Deal
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <StatCard
            label="Oportunidades"
            value={isLoading ? "—" : String(allOpen.length)}
            sub="cards ativos"
            icon={Layers}
            accent="#818cf8"
          />
          <StatCard
            label="Valor do Pipeline"
            value={isLoading ? "—" : totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            sub="em aberto"
            icon={TrendingUp}
            accent="#34d399"
          />
          <StatCard
            label="Alertas"
            value={isLoading ? "—" : String(overdue)}
            sub="deals +30 dias"
            icon={AlertTriangle}
            accent={overdue > 0 ? "#f87171" : "#6b7280"}
          />
        </div>
      </div>

      {/* ── BOARD ──────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-x-auto px-6 pt-6"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.08) transparent",
        }}
      >
        {isLoading ? (
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-[272px] shrink-0 rounded-xl animate-pulse"
                style={{
                  height: "420px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/25">
            <AlertTriangle size={28} className="text-red-400/60" />
            <p className="text-[14px]">Erro ao carregar pipeline.</p>
            <button
              onClick={() => refetch()}
              className="text-[12px] text-[#818cf8] hover:text-[#6366f1] underline underline-offset-2"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <KanbanBoard
            key={stages.map(s => s.id + s.deals.length).join("-")}
            stages={stages}
            onDealMove={(id, _, stageId) => moveDeal.mutate({ dealId: id, stageId })}
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
        initialStageId={newDealStageId}
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
