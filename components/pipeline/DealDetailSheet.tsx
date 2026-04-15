"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import {
  DollarSign,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Tag
} from "lucide-react"
import type { Deal } from "./DealCard"

interface DealDetailSheetProps {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DealDetailSheet({ deal, open, onOpenChange }: DealDetailSheetProps) {
  const queryClient = useQueryClient()

  const updateStatus = useMutation({
    mutationFn: async (status: "WON" | "LOST") => {
      const res = await fetch(`/api/deals/${deal!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar")
      return res.json()
    },
    onSuccess: (_, status) => {
      toast({ title: status === "WON" ? "Deal Ganho!" : "Deal Perdido." })
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ["deals"] })
    },
  })

  if (!deal) return null

  const contactName = deal.contact ? `${deal.contact.nome} ${deal.contact.sobrenome || ""}` : "Sem Responsável"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl bg-[#0a0c10] border-l border-white/10 p-0" side="right">
        
        <div className="h-full flex flex-col">
          {/* Header Area */}
          <div className="p-10 pb-6 bg-gradient-to-b from-white/[0.02] to-transparent">
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                   {deal.status}
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest">
                   #{deal.id.slice(0, 8)}
                </div>
             </div>
             <SheetTitle className="text-[32px] font-black text-white tracking-tighter leading-none mb-4 uppercase">
                {deal.titulo}
             </SheetTitle>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-white/30">
                   <Clock size={14} />
                   <span className="text-[11px] font-bold uppercase tracking-wider">Criado em {formatDate(new Date().toISOString())}</span>
                </div>
             </div>
          </div>

          <ScrollArea className="flex-1 px-10">
            <div className="space-y-12 pb-20">
              
              {/* Financial Box */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-[24px] p-8">
                 <div className="flex items-center gap-3 text-white/20 mb-4">
                    <DollarSign size={18} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Estimativa Financeira</span>
                 </div>
                 <div className="text-[42px] font-black text-white tracking-tighter">
                   {formatCurrency(deal.valorEstimado || 0)}
                 </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/20">
                       <User size={14} />
                       <span className="text-[11px] font-black uppercase tracking-widest">Responsável</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400">
                         {contactName[0]}
                       </div>
                       <span className="text-[14px] font-bold text-white/80">{contactName}</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/20">
                       <Zap size={14} />
                       <span className="text-[11px] font-black uppercase tracking-widest">Prioridade</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                       <span className="text-[14px] font-bold text-white/80">{deal.prioridade}</span>
                    </div>
                 </div>
              </div>

              {/* Actions */}
              {deal.status === "OPEN" && (
                <div className="pt-10 border-t border-white/5">
                   <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">Ações Estratégicas</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <Button
                        className="h-16 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-black text-[12px] uppercase tracking-widest rounded-2xl"
                        onClick={() => updateStatus.mutate("WON")}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle className="mr-3" size={20} />
                        Ganho
                      </Button>
                      <Button
                        className="h-16 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-black text-[12px] uppercase tracking-widest rounded-2xl"
                        onClick={() => updateStatus.mutate("LOST")}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="mr-3" size={20} />
                        Perdido
                      </Button>
                   </div>
                </div>
              )}

            </div>
          </ScrollArea>
        </div>

      </SheetContent>
    </Sheet>
  )
}
