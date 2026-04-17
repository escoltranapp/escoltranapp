"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { formatCurrency, cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ClosedDealsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ClosedDealsModal({ isOpen, onClose }: ClosedDealsModalProps) {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<"all" | "WON" | "LOST">("all")

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["closed-deals", filter],
    queryFn: async () => {
      const res = await fetch(`/api/deals?status=${filter === "all" ? "CLOSED" : filter}`)
      // Note: My API route GET treats 'status' literally, but I need to handle CLOSED specially or just fetch both.
      // For now, let's assume 'all' fetches both filtered by server if we update route, 
      // or I'll just fetch WON and LOST in parallel.
      // Actually, my route.ts does status filtering. I'll just use status=WON and status=LOST separately if current route doesn't support 'CLOSED' keyword
      
      const [wonRes, lostRes] = await Promise.all([
        fetch("/api/deals?status=WON"),
        fetch("/api/deals?status=LOST")
      ])
      
      const [won, lost] = await Promise.all([wonRes.json(), lostRes.json()])
      let combined = [...won, ...lost]
      
      if (filter === "WON") combined = won
      if (filter === "LOST") combined = lost
      
      return combined.sort((a, b) => new Date(b.fechadoEm).getTime() - new Date(a.fechadoEm).getTime())
    },
    enabled: isOpen
  })

  const reopen = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "OPEN" })
      })
      if (!res.ok) throw new Error("Erro ao reabrir")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline"] })
      queryClient.invalidateQueries({ queryKey: ["closed-deals"] })
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#141414] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-8 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-[#404040]">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white italic tracking-tight uppercase">Deals Fechados</h2>
              <p className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">Arquivo de negociações finalizadas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#404040] hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 bg-white/[0.02] border-b border-white/[0.05] flex gap-2 overflow-x-auto scrollbar-hide">
           {["all", "WON", "LOST"].map((t) => (
             <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                filter === t ? "bg-white text-black" : "bg-white/[0.03] text-[#404040] hover:bg-white/[0.06]"
              )}
             >
               {t === "all" ? "Todos" : t === "WON" ? "Ganhos" : "Perdidos"}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4 h-full scrollbar-thin scrollbar-thumb-white/[0.05]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 opacity-20">
               <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-20 opacity-20 space-y-4">
               <span className="material-symbols-outlined text-[64px]">inbox_customize</span>
               <p className="text-[11px] font-black uppercase tracking-[0.2em]">Nenhum deal arquivado</p>
            </div>
          ) : (
            deals.map((deal: any) => (
              <div key={deal.id} className="bg-[#0A0A0A] border border-white/[0.04] p-6 rounded-[24px] hover:border-white/[0.1] transition-all group">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-[15px] font-black text-white truncate max-w-[200px]">{deal.titulo}</h3>
                      <div className={cn(
                        "px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5",
                        deal.status === "WON" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                      )}>
                        <div className={cn("w-1 h-1 rounded-full", deal.status === "WON" ? "bg-emerald-500" : "bg-red-500")} />
                        {deal.status === "WON" ? "Ganho" : "Perdido"}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[12px] font-bold text-[#A3A3A3]">{deal.contact?.nome} {deal.contact?.sobrenome}</p>
                      <div className="flex items-center gap-4 text-[10px] font-mono text-[#404040] font-black uppercase tracking-widest">
                         <span className="text-[#3B82F6]">{formatCurrency(deal.valorEstimado || 0)}</span>
                         <span>•</span>
                         <span>Fechado em {format(new Date(deal.fechadoEm), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                    </div>

                    {deal.status === "LOST" && deal.motivoPerda && (
                       <p className="text-[10px] font-bold text-red-500/80 uppercase italic">
                         Motivo: {deal.motivoPerda}
                       </p>
                    )}
                  </div>

                  <button 
                    onClick={() => reopen.mutate(deal.id)}
                    disabled={reopen.isPending}
                    className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#404040] hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-50"
                  >
                    <span className={cn("material-symbols-outlined text-[18px]", reopen.isPending && "animate-spin")}>
                      {reopen.isPending ? "sync" : "refresh"}
                    </span>
                    Reabrir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
