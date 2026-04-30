"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Stage } from "./KanbanBoard"

interface DeleteStageModalProps {
  isOpen: boolean
  onClose: () => void
  stages: Stage[]
}

export function DeleteStageModal({ isOpen, onClose, stages }: DeleteStageModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [confirmStageId, setConfirmStageId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const deleteStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      const res = await fetch(`/api/pipeline/stages/${stageId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Falha ao excluir etapa")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
      toast({
        title: "SISTEMA ATUALIZADO 🗑️",
        description: "A etapa foi removida do cluster com sucesso.",
      })
      setConfirmStageId(null)
    },
    onError: (error: Error) => {
      toast({
        title: "ERRO DE OPERAÇÃO",
        description: error.message,
        variant: "destructive",
      })
      setConfirmStageId(null)
    },
    onSettled: () => {
      setIsDeleting(null)
    }
  })

  const handleDelete = (stageId: string) => {
    setIsDeleting(stageId)
    deleteStageMutation.mutate(stageId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setConfirmStageId(null)
        onClose()
      }
    }}>
      <DialogContent className="max-w-md bg-[#0A0A0A] border border-white/[0.05] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-3xl">
        <DialogHeader className="p-8 bg-gradient-to-br from-red-500/10 via-transparent to-transparent border-b border-white/[0.03] relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <span className="material-symbols-outlined text-[60px]">delete_sweep</span>
          </div>
          <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter relative z-10 flex items-center gap-3">
             <span className="w-2 h-8 bg-red-600 rounded-full" />
             Descomissionar Nodes
          </DialogTitle>
          <p className="text-[#6B7280] text-[10px] font-black font-mono uppercase tracking-[0.3em] mt-2 pl-5">
             // SELECIONE A UNIDADE PARA REMOÇÃO DEFINITIVA
          </p>
        </DialogHeader>

        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4 custom-scrollbar bg-[#0A0A0A]">
          {stages.map((stage) => {
            const isConfirming = confirmStageId === stage.id
            const hasDeals = stage.deals.length > 0

            return (
              <div 
                key={stage.id} 
                className={cn(
                  "relative flex flex-col p-5 rounded-2xl transition-all duration-500 border",
                  isConfirming 
                    ? "bg-red-500/5 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]" 
                    : "bg-[#111111]/40 border-white/[0.03] hover:border-white/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-1.5 h-6 rounded-full" 
                      style={{ backgroundColor: stage.color || '#F97316', boxShadow: `0 0 15px ${stage.color || '#F97316'}40` }} 
                    />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-white uppercase tracking-widest">{stage.name}</span>
                      <span className="text-[9px] font-mono font-bold text-[#404040] uppercase tracking-tighter">
                         DATA_LOAD: {stage.deals.length} active_deals
                      </span>
                    </div>
                  </div>

                  {!isConfirming ? (
                    <button
                      onClick={() => {
                        if (hasDeals) {
                          toast({
                            title: "BLOQUEIO DE SEGURANÇA",
                            description: "Não é possível remover nodes com dados ativos. Mova os negócios primeiro.",
                            variant: "destructive"
                          })
                          return
                        }
                        setConfirmStageId(stage.id)
                      }}
                      className={cn(
                        "w-11 h-11 flex items-center justify-center rounded-xl transition-all group/btn",
                        hasDeals 
                          ? "bg-white/[0.02] text-[#262626] cursor-not-allowed" 
                          : "bg-white/[0.03] text-[#6B7280] hover:text-red-500 hover:bg-red-500/10 border border-white/[0.02] hover:border-red-500/20"
                      )}
                    >
                      <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">delete</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                       <button
                         onClick={() => setConfirmStageId(null)}
                         className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#6B7280] hover:text-white hover:bg-white/5 transition-all"
                       >
                          CANCELAR
                       </button>
                       <button
                         onClick={() => handleDelete(stage.id)}
                         disabled={isDeleting === stage.id}
                         className="px-5 py-2 rounded-lg bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                       >
                          {isDeleting === stage.id ? (
                            <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                          ) : (
                            "CONFIRMAR"
                          )}
                       </button>
                    </div>
                  )}
                </div>
                
                {isConfirming && (
                   <div className="mt-4 pt-4 border-t border-red-500/10 text-center animate-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-black text-red-500/80 uppercase tracking-[0.2em]">
                         ⚠️ ESTA OPERAÇÃO É IRREVERSÍVEL NO CLUSTER
                      </p>
                   </div>
                )}
              </div>
            )
          })}
          
          {stages.length === 0 && (
             <div className="text-center py-20 bg-[#050505] rounded-3xl border border-white/[0.02]">
                <span className="material-symbols-outlined text-[60px] text-[#111111] mb-4">dataset_linked</span>
                <p className="text-[#262626] text-[11px] font-black uppercase tracking-[0.4em] italic font-mono">
                   NO_NODES_IN_INFRASTRUCTURE
                </p>
             </div>
          )}
        </div>

        <div className="p-8 border-t border-white/[0.03] bg-[#050505]/50 flex justify-center">
           <button 
             onClick={onClose}
             className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#404040] hover:text-[#F97316] transition-all"
           >
              <span className="w-6 h-[1px] bg-[#262626] group-hover:bg-[#F97316]/40 transition-all" />
              FECHAR_MODAL
              <span className="w-6 h-[1px] bg-[#262626] group-hover:bg-[#F97316]/40 transition-all" />
           </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
