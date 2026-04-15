"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Plus, RefreshCw, Layers, TrendingUp, AlertTriangle, X, Clock, ChevronDown } from "lucide-react"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { DealDetailSheet } from "@/components/pipeline/DealDetailSheet"
import { type Deal } from "@/components/pipeline/DealCard"
import { cn } from "@/lib/utils"

/* ── Stat card ─────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, iconBg, iconColor
}: {
  label: string; value: string; sub: string; icon: React.ElementType; iconBg: string; iconColor: string
}) {
  return (
    <div className="bg-[#18181f] border border-[#1e1e24] rounded-[10px] padding-[14px 16px] p-4 flex items-center gap-[12px]">
      <div 
        className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={16} color={iconColor} strokeWidth={2} />
      </div>
      <div>
        <div className="text-[11px] text-[#555] uppercase font-medium tracking-[0.06em] mb-[3px]">{label}</div>
        <div className="text-[20px] font-semibold text-white leading-none">{value}</div>
        <div className="text-[11px] text-[#555] mt-[3px]">{sub}</div>
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────── */
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
    color: s.color || "#4f46e5",
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

  const addStageAction = useMutation({
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
  })

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6 bg-[#0d0d0f] text-white font-sans overflow-hidden">
      
      {/* ── TOPBAR (kb-topbar) ─────────────────────────── */}
      <div className="flex items-center justify-between p-[16px_24px] border-b border-[#1e1e24] shrink-0">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-[-0.3px]">Pipeline</h1>
          <p className="text-[12px] text-[#555] mt-[2px] tracking-[0.02em]">Gestão de oportunidades · Visão Kanban</p>
        </div>
        
        <div className="flex items-center gap-[8px]">
          <div className="flex items-center gap-[6px] p-[7px_14px] rounded-[8px] text-[12px] font-medium cursor-pointer border border-[#2a2a32] bg-[#18181f] text-[#aaa] hover:bg-[#222230] hover:text-[#ddd] transition-all">
            <Clock size={12} strokeWidth={2} />
            Pipeline Principal
            <ChevronDown size={10} strokeWidth={2.5} />
          </div>
          <div 
            onClick={() => {
              const name = window.prompt("Nome da nova coluna:")
              if (name) addStageAction.mutate(name)
            }}
            className="flex items-center gap-[6px] p-[7px_14px] rounded-[8px] text-[12px] font-medium cursor-pointer border border-[#2a2a32] bg-[#18181f] text-[#aaa] hover:bg-[#222230] hover:text-[#ddd] transition-all"
          >
            <Plus size={12} strokeWidth={2} />
            Nova Coluna
          </div>
          <div className="flex items-center gap-[6px] p-[7px_14px] rounded-[8px] text-[12px] font-medium cursor-pointer border border-[#4f46e5] bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-all shadow-[0_2px_8px_rgba(79,70,229,0.3)]">
            <Plus size={12} strokeWidth={2.5} />
            Novo Deal
          </div>
        </div>
      </div>

      {/* ── STATS (kb-stats) ───────────────────────────── */}
      <div className="grid grid-cols-3 gap-[12px] p-[16px_24px] border-b border-[#1e1e24] shrink-0">
        <StatCard 
          label="Oportunidades"
          value={isLoading ? "—" : String(allOpen.length)}
          sub="cards ativos"
          icon={Layers}
          iconBg="#1a1a2e"
          iconColor="#818cf8"
        />
        <StatCard 
          label="Valor total"
          value={isLoading ? "—" : `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          sub="em aberto"
          icon={TrendingUp}
          iconBg="#0f1e14"
          iconColor="#4ade80"
        />
        <StatCard 
          label="Alertas"
          value={isLoading ? "—" : String(overdue)}
          sub="cards +30 dias"
          icon={AlertTriangle}
          iconBg="#1f1010"
          iconColor="#f87171"
        />
      </div>

      {/* ── PROGRESS BAR ───────────────────────────────── */}
      <div className="h-[2px] bg-[#1e1e24] rounded-[1px] m-[0_24px_16px] overflow-hidden shrink-0 mt-4">
        <div 
           className="h-full rounded-[1px] bg-gradient-to-r from-[#4f46e5] to-[#818cf8] transition-all duration-500" 
           style={{ width: '20%' }}
        ></div>
      </div>

      {/* ── BOARD AREA ─────────────────────────────────── */}
      <div className="flex-1 overflow-hidden px-[24px]">
        {isLoading ? (
          <div className="flex gap-[14px]">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-[240px] h-[400px] bg-[#18181f]/50 border border-[#1e1e24] rounded-[10px] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <KanbanBoard
            stages={stages}
            onDealMove={(id, _, stageId) => moveDeal.mutate({ dealId: id, stageId })}
            onAddDeal={(sId) => {
              setNewDealStageId(sId)
              setShowNewDeal(true)
            }}
            onAddStage={() => {
              const name = window.prompt("Nome da nova coluna:")
              if (name) addStageAction.mutate(name)
            }}
            onDealClick={(d) => setSelectedDeal(d)}
          />
        )}
      </div>

      <DealDetailSheet
        deal={selectedDeal}
        open={!!selectedDeal}
        onOpenChange={o => !o && setSelectedDeal(null)}
      />
    </div>
  )
}
