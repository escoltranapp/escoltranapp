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
import { UTMInfoCard } from "@/components/utm/UTMInfoCard"

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
      toast({ 
        title: variables.status === "WON" ? "DEAL VENCIDO" : "DEAL PERDIDO", 
        description: variables.status === "WON" ? "Redirecionando para atividades..." : "O dataset foi atualizado." 
      })
      onOpenChange(false)
      setLossReasonOpen(false)

      if (variables.status === "WON") {
        // Redireciona para atividades com o modal de nova atividade aberto e o negócio vinculado
        router.push(`/activities?new=true&deal_id=${deal?.id}`)
      }
    },
  })

  // Gap 5: fetch real audit log for this deal
  const { data: auditLogsRaw } = useQuery({
    queryKey: ["deal-audit-log", deal?.id],
    queryFn: async () => {
      const res = await fetch(`/api/deals/${deal!.id}/audit-log`)
      if (!res.ok) return []
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    enabled: open && !!deal?.id,
  })
  const auditLogs: Array<{ id: string; evento: string; createdAt: string }> = auditLogsRaw ?? []

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
        <SheetContent className="w-full sm:max-w-[500px] bg-[#0A0A0A] border-l border-[#1A1A1A] p-0 flex flex-col h-full">
          {/* HEADER */}
          <div className="p-6 pb-0 flex flex-col gap-4 relative">
            <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4 text-[#A3A3A3] hover:text-white">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex items-center gap-3 pr-8">
              <div className="w-10 h-10 rounded-full bg-[#1e293b] text-blue-400 font-black flex items-center justify-center text-sm">
                {deal.contact?.nome ? deal.contact.nome.charAt(0).toUpperCase() : "D"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-white">{deal.titulo}</h2>
                  <span className="material-symbols-outlined text-[14px] text-[#A3A3A3] cursor-pointer hover:text-white">edit</span>
                </div>
                <p className="text-xs text-[#A3A3A3] font-medium">{deal.contact?.nome || "Sem contato"}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-2xl font-black text-blue-500 tracking-tight">
                {deal.valorEstimado?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0,00"}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-white/[0.05] text-[10px] font-bold text-white uppercase">{deal.status === "OPEN" ? "Aberto" : deal.status}</span>
                <span className="px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-white/[0.05] text-[10px] font-bold text-amber-500 uppercase">{deal.prioridade}</span>
                <span className="px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase">Nova Lead</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
               <div className="flex items-center gap-3 bg-[#111111] border border-white/[0.05] rounded-xl p-3">
                 <span className="material-symbols-outlined text-amber-500 text-[18px]">trending_up</span>
                 <div>
                   <p className="text-white text-xs font-bold">{(activities || []).length} atividades</p>
                   <p className="text-[#6B7280] text-[10px]">pendentes</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 bg-[#111111] border border-white/[0.05] rounded-xl p-3">
                 <span className="material-symbols-outlined text-[#A3A3A3] text-[18px]">schedule</span>
                 <div>
                   <p className="text-white text-xs font-bold">0 dias</p>
                   <p className="text-[#6B7280] text-[10px]">neste estágio</p>
                 </div>
               </div>
            </div>

            {/* TABS */}
            <div className="flex items-center gap-6 mt-6 border-b border-white/[0.05] overflow-x-auto scrollbar-hide">
              <button className="text-[11px] font-bold text-white border-b-2 border-white pb-3 px-1 whitespace-nowrap">Dados</button>
              <button className="text-[11px] font-medium text-[#6B7280] hover:text-white transition-colors pb-3 px-1 whitespace-nowrap">UTM</button>
              <button className="text-[11px] font-medium text-[#6B7280] hover:text-white transition-colors pb-3 px-1 whitespace-nowrap">Atividades</button>
              <button className="text-[11px] font-medium text-[#6B7280] hover:text-white transition-colors pb-3 px-1 whitespace-nowrap">Histórico</button>
              <button className="text-[11px] font-medium text-[#6B7280] hover:text-white transition-colors pb-3 px-1 whitespace-nowrap">Anotações</button>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
             {/* Contato Vinculado */}
             <div>
                <div className="flex items-center gap-2 mb-4 text-white text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  Contato Vinculado
                </div>
                <div className="bg-[#111111] border border-white/[0.05] rounded-2xl p-4">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-full bg-[#1e293b] text-blue-400 font-black flex items-center justify-center text-xs">
                       {deal.contact?.nome ? deal.contact.nome.charAt(0).toUpperCase() : "C"}
                     </div>
                     <div>
                       <p className="text-xs font-bold text-white">{deal.contact?.nome || "Sem nome"}</p>
                       <div className="flex items-center gap-1 text-[#6B7280] text-[10px]">
                         <span className="material-symbols-outlined text-[12px]">call</span>
                         {deal.telefone || deal.contact?.telefone || "Sem telefone"}
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-transparent border border-white/[0.05] hover:bg-white/[0.02] transition-colors rounded-lg text-[11px] font-bold text-white">
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        Ver
                     </button>
                     <button 
                       onClick={() => {
                         const phone = deal.telefone || deal.contact?.telefone || ""
                         let cleanPhone = phone.replace(/\D/g, "")
                         if (cleanPhone) {
                           if (cleanPhone.length <= 11) {
                             cleanPhone = "55" + cleanPhone
                           }
                           window.open(`https://wa.me/${cleanPhone}`, '_blank')
                         } else {
                           toast({ title: "Aviso", description: "Este contato não possui um número de telefone cadastrado." })
                         }
                       }}
                       className="flex-1 flex items-center justify-center gap-2 py-2 bg-transparent border border-green-500/20 hover:bg-green-500/10 transition-colors rounded-lg text-[11px] font-bold text-green-500"
                     >
                        WhatsApp
                     </button>
                   </div>
                </div>
             </div>

             {/* Informações do Deal */}
             <div>
                <div className="flex items-center gap-2 mb-4 text-white text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Informações do Deal
                </div>
                <div className="bg-[#111111] border border-white/[0.05] rounded-2xl p-4">
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                     <div>
                       <p className="text-[9px] font-black uppercase text-[#6B7280] mb-1 tracking-widest">Produto</p>
                       <p className="text-xs font-medium text-white">Sistema/App</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-black uppercase text-[#6B7280] mb-1 tracking-widest">Ramo da Empresa</p>
                       <p className="text-xs font-medium text-white">—</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-black uppercase text-[#6B7280] mb-1 tracking-widest">Faturamento Mensal</p>
                       <p className="text-xs font-medium text-white">—</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-black uppercase text-[#6B7280] mb-1 tracking-widest">Origem</p>
                       <select className="bg-transparent border-b border-white/10 text-xs font-medium text-white pb-1 w-full outline-none focus:border-white/30">
                         <option className="bg-[#111111]">Selecionar origem</option>
                       </select>
                     </div>
                     <div>
                       <p className="text-[9px] font-black uppercase text-[#6B7280] mb-1 tracking-widest">Prioridade</p>
                       <select className="bg-transparent border-b border-white/10 text-xs font-medium text-white pb-1 w-full outline-none focus:border-white/30">
                         <option className="bg-[#111111]">Média</option>
                       </select>
                     </div>
                     <div>
                       <p className="text-[9px] font-black uppercase text-[#6B7280] mb-1 tracking-widest">Vendedor</p>
                       <select className="bg-transparent border-b border-white/10 text-xs font-medium text-white pb-1 w-full outline-none focus:border-white/30">
                         <option className="bg-[#111111]">Sem vendedor</option>
                       </select>
                     </div>
                     <div>
                       <p className="text-[9px] font-black uppercase text-[#6B7280] mb-1 tracking-widest">Criado</p>
                       <p className="text-xs font-medium text-white">{new Date(deal.createdAt).toLocaleDateString("pt-BR")}</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-black uppercase text-[#6B7280] mb-1 tracking-widest">Atualizado</p>
                       <p className="text-xs font-medium text-white">há pouco</p>
                     </div>
                  </div>
                </div>
             </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="p-4 border-t border-white/[0.05] bg-[#0A0A0A] flex items-center justify-between">
             <div className="flex items-center gap-1">
               <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/[0.05] hover:bg-white/[0.05] text-[#A3A3A3] transition-colors">
                 <span className="material-symbols-outlined text-[18px]">call</span>
               </button>
               <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/[0.05] hover:bg-white/[0.05] text-[#A3A3A3] transition-colors">
                 <span className="material-symbols-outlined text-[18px]">chat</span>
               </button>
               <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/[0.05] hover:bg-white/[0.05] text-[#A3A3A3] transition-colors">
                 <span className="material-symbols-outlined text-[18px]">mail</span>
               </button>
             </div>
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => updateStatus.mutate({ status: "WON" })}
                 className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-green-500/20 text-green-500 font-bold text-xs hover:bg-green-500/10 transition-colors"
               >
                 <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                 Ganho
               </button>
               <button 
                 onClick={() => setLossReasonOpen(true)}
                 className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-red-500/20 text-red-500 font-bold text-xs hover:bg-red-500/10 transition-colors"
               >
                 <span className="material-symbols-outlined text-[16px]">close</span>
                 Perdido
               </button>
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
