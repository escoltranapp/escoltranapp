"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Deal } from "./DealCard"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface DealDetailSheetProps {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DealDetailSheet({ deal, open, onOpenChange }: DealDetailSheetProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
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
      toast({ title: variables.status === "WON" ? "DEAL VENCIDO 🛡️" : "DEAL PERDIDO ❌", description: "O dataset foi atualizado." })
      onOpenChange(false)
      setLossReasonOpen(false)
    }
  })

  if (!deal) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl bg-[#0A0A0A] border-l border-[#1A1A1A] p-0 overflow-y-auto scrollbar-hide">
          <div className="h-40 bg-gradient-to-br from-[#F97316]/20 to-transparent border-b border-[#F97316]/10 p-8 flex items-end">
             <div className="flex-1">
                <div className="text-[10px] font-mono font-black text-[#F97316] uppercase tracking-[0.3em] mb-2 leading-none">Deal Identifier: {deal.id.slice(0, 8)}</div>
                <SheetTitle className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">
                   {deal.titulo}
                </SheetTitle>
             </div>
          </div>

          <div className="p-8 space-y-12">
             {/* AÇÕES DE STATUS ESPECÍFICAS */}
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

             {/* DADOS UTM ESCOLTRAN */}
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

             {/* VALORES E FINANCEIRO */}
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-[#F97316] rounded-full" />
                   <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#A3A3A3] italic">Dataset Financeiro</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-6 bg-[#1A1A1A] border border-white/5 rounded-2xl">
                      <div className="text-[10px] font-mono font-bold text-[#404040] mb-2 uppercase tracking-widest">Valor Estimado</div>
                      <div className="text-2xl font-black text-[#F97316] font-mono tracking-tighter">
                         {deal.valorEstimado?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                      { t: "1d ago", e: "Entrada no dataset principal Escoltran" }
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

      {/* MODAL DE MOTIVO DE PERDA (OBRIGATÓRIO) */}
      {lossReasonOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
           <div className="bg-[#1A1A1A] border border-[#F97316]/20 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(249,115,22,0.1)] animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter italic">Motivo de Perda Obrigatório</h2>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#404040] font-black mb-3 block">Descreva a neutralidade do Deal</label>
                    <textarea 
                      className="bg-[#0A0A0A] border border-white/10 rounded-2xl px-5 py-5 text-sm text-[#F2F2F2] focus:border-[#F97316]/50 outline-none w-full font-bold transition-all min-h-[120px] resize-none"
                      placeholder="Ex: Valor fora do budget ou perda para concorrência"
                      value={lossReason}
                      onChange={e => setLossReason(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4 mt-8">
                     <button className="flex-1 bg-[#262626] text-[#6B7280] font-black py-4 rounded-xl text-[10px] uppercase tracking-widest" onClick={() => setLossReasonOpen(false)}>Abortar</button>
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
