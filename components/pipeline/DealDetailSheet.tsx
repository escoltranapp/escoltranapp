"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Deal } from "./DealCard"
import { cn } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { format, isBefore, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DealDetailSheetProps {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ACTIVITY_ICONS: Record<string, string> = {
  CALL: "call",
  MEETING: "groups",
  TASK: "task_alt",
  NOTE: "description",
  WHATSAPP: "chat",
  EMAIL: "mail",
}

const ACTIVITY_COLORS: Record<string, string> = {
  CALL: "#3B82F6",
  MEETING: "#8B5CF6",
  TASK: "#F59E0B",
  NOTE: "#6B7280",
  WHATSAPP: "#22C55E",
  EMAIL: "#EC4899",
}

export function DealDetailSheet({ deal, open, onOpenChange }: DealDetailSheetProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const router = useRouter()
  const [lossReasonOpen, setLossReasonOpen] = useState(false)
  const [lossReason, setLossReason] = useState("")

  const updateStatus = useMutation({
    mutationFn: async ({ status, reason }: { status: "WON" | "LOST"; reason?: string }) => {
      const res = await fetch(`/api/deals/${deal?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, lossReason: reason }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar status")
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
      toast({ title: variables.status === "WON" ? "DEAL VENCIDO" : "DEAL PERDIDO", description: "O dataset foi atualizado." })
      onOpenChange(false)
      setLossReasonOpen(false)
    },
  })

  // Gap 4: fetch activities for this deal
  const { data: activitiesRaw, isLoading: loadingActivities } = useQuery({
    queryKey: ["deal-activities", deal?.id],
    queryFn: async () => {
      const res = await fetch(`/api/activities?dealId=${deal!.id}`)
      if (!res.ok) return []
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    enabled: open && !!deal?.id,
  })

  const activities: any[] = activitiesRaw ?? []
  const now = startOfDay(new Date())

  const safeDate = (v: any) => {
    if (!v) return null
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  }

  if (!deal) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl bg-[#0A0A0A] border-l border-[#1A1A1A] p-0 overflow-y-auto scrollbar-hide">
          <div className="h-40 bg-gradient-to-br from-[#F97316]/20 to-transparent border-b border-[#F97316]/10 p-8 flex items-end">
            <div className="flex-1">
              <div className="text-[10px] font-mono font-black text-[#F97316] uppercase tracking-[0.3em] mb-2 leading-none">
                Deal Identifier: {deal.id.slice(0, 8)}
              </div>
              <SheetTitle className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">
                {deal.titulo}
              </SheetTitle>
            </div>
          </div>

          <div className="p-8 space-y-12">
            {/* AÇÕES DE STATUS */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateStatus.mutate({ status: "WON" })}
                className="bg-green-600/10 border border-green-600/30 text-green-500 font-black py-4 rounded-xl text-[11px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-lg shadow-green-600/5"
              >
                Marcar como Ganho
              </button>
              <button
                onClick={() => setLossReasonOpen(true)}
                className="bg-red-600/10 border border-red-600/30 text-red-500 font-black py-4 rounded-xl text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-600/5"
              >
                Marcar como Perdido
              </button>
            </div>

            {/* DADOS UTM */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#F97316] rounded-full" />
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#A3A3A3] italic">Parâmetros UTM (Dataset)</h3>
              </div>
              <div className="grid grid-cols-2 gap-6 bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl">
                <div className="space-y-1">
                  <div className="text-[9px] font-mono font-bold text-[#404040] uppercase tracking-widest">First Source</div>
                  <div className="text-[13px] font-bold text-white uppercase italic">{deal.origin || "Direct"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-mono font-bold text-[#404040] uppercase tracking-widest">First Campaign</div>
                  <div className="text-[13px] font-bold text-white uppercase italic">Brand_Google_Search</div>
                </div>
                <div className="col-span-2 pt-4 border-t border-white/[0.04] space-y-1">
                  <div className="text-[9px] font-mono font-bold text-[#404040] uppercase tracking-widest">Last Click Path</div>
                  <div className="text-[12px] font-mono text-[#A3A3A3] break-all">escoltranapp.com/v2/pipeline?ref=nav_side</div>
                </div>
              </div>
            </div>

            {/* DATASET FINANCEIRO */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#F97316] rounded-full" />
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#A3A3A3] italic">Dataset Financeiro</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-[#1A1A1A] border border-white/5 rounded-2xl">
                  <div className="text-[10px] font-mono font-bold text-[#404040] mb-2 uppercase tracking-widest">Valor Estimado</div>
                  <div className="text-2xl font-black text-[#F97316] font-mono tracking-tighter">
                    {deal.valorEstimado?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "—"}
                  </div>
                </div>
                <div className="p-6 bg-[#1A1A1A] border border-white/5 rounded-2xl">
                  <div className="text-[10px] font-mono font-bold text-[#404040] mb-2 uppercase tracking-widest">Data Prevista</div>
                  <div className="text-[15px] font-bold text-white uppercase italic">
                    {deal.dataPrevista ? new Date(deal.dataPrevista).toLocaleDateString() : "PENDENTE"}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── GAP 4: ATIVIDADES ─────────────────────────────────── */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#F97316] rounded-full" />
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#A3A3A3] italic">Atividades</h3>
                  {activities.length > 0 && (
                    <span className="text-[10px] font-mono font-black text-[#F97316] bg-[#F97316]/5 px-2 py-0.5 rounded-full border border-[#F97316]/10">
                      {activities.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => router.push(`/activities?new=true&deal_id=${deal.id}`)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F97316] hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-[#F97316]/20 hover:bg-[#F97316]/10"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Nova Atividade
                </button>
              </div>

              {loadingActivities ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-[#1A1A1A] animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-[#1A1A1A] border border-white/5 rounded-2xl border-dashed">
                  <span className="material-symbols-outlined text-[32px] text-white/10 mb-3">pending_actions</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#404040]">
                    Nenhuma atividade vinculada
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.map((act: any) => {
                    const dueDate = safeDate(act.dueAt)
                    const isOverdue = dueDate && isBefore(dueDate, now) && act.status === "OPEN"
                    const color = ACTIVITY_COLORS[act.tipo] ?? "#6B7280"

                    return (
                      <div
                        key={act.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border transition-all",
                          act.status === "DONE"
                            ? "bg-[#0A0A0A] border-white/5 opacity-50"
                            : isOverdue
                            ? "bg-red-500/5 border-red-500/20"
                            : "bg-[#1A1A1A] border-white/5 hover:border-white/10"
                        )}
                      >
                        {/* icon */}
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                        >
                          <span className="material-symbols-outlined text-[16px]" style={{ color }}>
                            {ACTIVITY_ICONS[act.tipo] ?? "event_note"}
                          </span>
                        </div>

                        {/* content */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-[13px] font-bold text-white truncate",
                            act.status === "DONE" && "line-through text-[#A3A3A3]"
                          )}>
                            {act.titulo}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            {dueDate && (
                              <span className="text-[10px] font-mono text-[#6B7280]">
                                {format(dueDate, "dd MMM, HH:mm", { locale: ptBR })}
                              </span>
                            )}
                            {isOverdue && (
                              <span className="text-[8px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                Atrasada
                              </span>
                            )}
                            {act.status === "DONE" && (
                              <span className="text-[8px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                                Concluída
                              </span>
                            )}
                          </div>
                        </div>

                        {/* type label */}
                        <span
                          className="text-[8px] font-black uppercase tracking-widest shrink-0 px-2 py-0.5 rounded-full border"
                          style={{ color, backgroundColor: `${color}10`, borderColor: `${color}20` }}
                        >
                          {act.tipo}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            {/* ─── FIM ATIVIDADES ──────────────────────────────────────── */}

            {/* HISTÓRICO DE AUDITORIA */}
            <div className="space-y-6 pb-12">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#F97316] rounded-full" />
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#A3A3A3] italic">Cluster Audit Log</h3>
              </div>
              <div className="space-y-0.5">
                {[
                  { t: "12m ago", e: "Status movido para Qualificação por Ricardo M." },
                  { t: "2h ago", e: "Lead sincronizado via Google Ads Node" },
                  { t: "1d ago", e: "Entrada no dataset principal Escoltran" },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 p-4 border-l border-[#262626] bg-[#1A1A1A]/30 hover:bg-[#1A1A1A] transition-all">
                    <div className="text-[10px] font-mono font-black text-[#404040] min-w-[60px]">{log.t}</div>
                    <div className="text-[12px] text-[#A3A3A3] font-bold tracking-tight uppercase leading-none">{log.e}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* MODAL DE MOTIVO DE PERDA */}
      {lossReasonOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-[#1A1A1A] border border-[#F97316]/20 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(249,115,22,0.1)] animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter italic">Motivo de Perda Obrigatório</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#404040] font-black mb-3 block">
                  Descreva a neutralidade do Deal
                </label>
                <textarea
                  className="bg-[#0A0A0A] border border-white/10 rounded-2xl px-5 py-5 text-sm text-[#F2F2F2] focus:border-[#F97316]/50 outline-none w-full font-bold transition-all min-h-[120px] resize-none"
                  placeholder="Ex: Valor fora do budget ou perda para concorrência"
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  className="flex-1 bg-[#262626] text-[#6B7280] font-black py-4 rounded-xl text-[10px] uppercase tracking-widest"
                  onClick={() => setLossReasonOpen(false)}
                >
                  Abortar
                </button>
                <button
                  disabled={!lossReason.trim()}
                  className="flex-1 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-[#F97316]/20 disabled:opacity-30 disabled:grayscale transition-all"
                  onClick={() => updateStatus.mutate({ status: "LOST", reason: lossReason })}
                >
                  Registrar Perda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
