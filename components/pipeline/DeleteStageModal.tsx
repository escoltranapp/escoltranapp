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
    },
    onError: (error: Error) => {
      toast({
        title: "ERRO DE OPERAÇÃO",
        description: error.message,
        variant: "destructive",
      })
    },
    onSettled: () => {
      setIsDeleting(null)
    }
  })

  const handleDelete = (stage: Stage) => {
    if (stage.deals.length > 0) {
      toast({
        title: "AÇÃO BLOQUEADA",
        description: "Não é possível remover nodes com dados ativos. Mova os negócios antes.",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Tem certeza que deseja desinstalar o node "${stage.name}"?`)) return

    setIsDeleting(stage.id)
    deleteStageMutation.mutate(stage.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0A0A0A] border border-white/[0.05] p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <DialogHeader className="p-8 bg-gradient-to-br from-red-500/10 to-transparent border-b border-white/[0.03]">
          <DialogTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Descomissionar Nodes</DialogTitle>
          <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest mt-1">Selecione a coluna que deseja remover da infraestrutura</p>
        </DialogHeader>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar">
          {stages.map((stage) => (
            <div 
              key={stage.id} 
              className="flex items-center justify-between p-4 bg-[#111111] border border-white/[0.03] rounded-2xl group hover:border-red-500/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]" 
                  style={{ backgroundColor: stage.color || '#F97316' }} 
                />
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-[#F2F2F2] uppercase tracking-wider">{stage.name}</span>
                  <span className="text-[9px] font-mono font-bold text-[#404040] uppercase">
                    Load: {stage.deals.length} active_deals
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(stage)}
                disabled={isDeleting === stage.id || stage.deals.length > 0}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 text-[#404040] hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-20 disabled:grayscale cursor-pointer"
              >
                {isDeleting === stage.id ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                )}
              </button>
            </div>
          ))}
          
          {stages.length === 0 && (
             <div className="text-center py-12">
                <span className="material-symbols-outlined text-[40px] text-[#262626] mb-4">analytics</span>
                <p className="text-[#404040] text-[10px] font-black uppercase tracking-[0.3em]">No_Nodes_Detected</p>
             </div>
          )}
        </div>

        <div className="p-6 border-t border-white/[0.03] bg-[#050505]">
           <button 
             onClick={onClose}
             className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-[#404040] hover:text-white transition-colors"
           >
              Fechar Terminal
           </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
