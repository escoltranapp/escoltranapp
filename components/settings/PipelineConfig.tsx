"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"

interface Stage {
  id: string
  name: string
  color: string
  order: number
}

export function PipelineConfig() {
  const [stages, setStages] = useState<Stage[]>([])
  const [pipelineId, setPipelineId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState<Stage | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newStage, setNewStage] = useState({ name: "", color: "#F97316" })

  const fetchStages = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/pipeline/stages')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setStages(data.stages || [])
      setPipelineId(data.pipelineId)
    } catch {
      toast({ title: "ERRO AO CARREGAR", description: "Não foi possível carregar as etapas.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStages()
  }, [])

  const handleAdd = async () => {
    if (!newStage.name) return toast({ title: "NOME OBRIGATÓRIO", variant: "destructive" })
    try {
      const res = await fetch('/api/pipeline/stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newStage, pipelineId })
      })
      if (!res.ok) throw new Error()
      toast({ title: "ETAPA ADICIONADA", description: "O pipeline foi atualizado com sucesso." })
      setIsAdding(false)
      setNewStage({ name: "", color: "#F97316" })
      fetchStages()
    } catch {
      toast({ title: "ERRO AO ADICIONAR", variant: "destructive" })
    }
  }

  const handleUpdate = async () => {
    if (!isEditing || !isEditing.name) return
    try {
      const res = await fetch(`/api/pipeline/stages/${isEditing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: isEditing.name, color: isEditing.color })
      })
      if (!res.ok) throw new Error()
      toast({ title: "ETAPA ATUALIZADA", description: "As alterações foram salvas." })
      setIsEditing(null)
      fetchStages()
    } catch {
      toast({ title: "ERRO AO ATUALIZAR", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta etapa?")) return
    try {
      const res = await fetch(`/api/pipeline/stages/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao excluir")
      }
      toast({ title: "ETAPA REMOVIDA", description: "O pipeline foi reorganizado." })
      fetchStages()
    } catch (e: any) {
      toast({ title: "ERRO AO EXCLUIR", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-br from-[#F97316]/10 to-transparent rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
        <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-3xl border border-white/[0.06] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/[0.03] bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-4 bg-[#F97316] rounded-full" />
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white">Estrutura do Funil</span>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#F97316] text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Nova Etapa
            </button>
          </div>
          
          <div className="p-8">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <span className="material-symbols-outlined text-[32px] text-[#262626] animate-spin">refresh</span>
                  <p className="text-[10px] font-mono text-[#404040] uppercase tracking-widest">Carregando estrutura...</p>
                </div>
              ) : stages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                   <span className="material-symbols-outlined text-[48px] text-white/5">view_kanban</span>
                   <p className="text-[11px] font-black text-white uppercase tracking-widest italic">Pipeline Vazio</p>
                   <p className="text-[9px] font-mono text-[#404040] uppercase tracking-widest max-w-[250px]">Adicione etapas para começar a gerenciar seus negócios.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {stages.map((stage) => (
                    <div 
                      key={stage.id} 
                      className="group/item flex items-center justify-between p-4 bg-[#111111]/40 border border-white/[0.03] rounded-2xl hover:bg-[#1A1A1A]/60 hover:border-[#F97316]/20 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div 
                          className="w-2 h-10 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]" 
                          style={{ backgroundColor: stage.color }} 
                        />
                        <div>
                          <h4 className="text-[12px] font-black text-white uppercase tracking-tight italic">{stage.name}</h4>
                          <p className="text-[9px] font-mono text-[#404040] uppercase tracking-widest mt-0.5">ORDEM: {stage.order + 1}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setIsEditing(stage)}
                          className="p-2 hover:bg-white/5 rounded-lg text-[#404040] hover:text-[#F97316] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(stage.id)}
                          className="p-2 hover:bg-white/5 rounded-lg text-[#404040] hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-8 p-4 bg-[#F97316]/5 border border-[#F97316]/10 rounded-xl flex items-center gap-4">
              <span className="material-symbols-outlined text-[#F97316] text-[20px]">info</span>
              <p className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wide leading-relaxed">
                As etapas definem o fluxo de trabalho do seu time. <br />
                <span className="text-[#F97316]/60 italic font-black">Dica: Mantenha nomes curtos e objetivos para facilitar a visualização no Pipeline.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ADICIONAR */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="bg-[#0A0A0A] border-white/5">
          <DialogHeader>
            <DialogTitle className="text-[12px] font-black uppercase tracking-widest text-white italic">Nova Etapa do Pipeline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#404040] uppercase tracking-widest ml-1">Nome da Etapa</label>
              <Input 
                value={newStage.name}
                onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                className="bg-[#1A1A1A] border-white/5 text-white text-[11px] h-12 uppercase font-black italic tracking-widest"
                placeholder="EX: QUALIFICAÇÃO"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#404040] uppercase tracking-widest ml-1">Cor de Identificação</label>
              <div className="flex gap-2">
                {["#6b7280", "#F97316", "#22C55E", "#3B82F6", "#EF4444", "#A855F7", "#EAB308"].map(c => (
                  <button 
                    key={c}
                    onClick={() => setNewStage({ ...newStage, color: c })}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all",
                      newStage.color === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
             <button 
               onClick={handleAdd}
               className="w-full bg-[#F97316] text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
             >
               Confirmar Etapa
             </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL EDITAR */}
      <Dialog open={!!isEditing} onOpenChange={(open) => !open && setIsEditing(null)}>
        <DialogContent className="bg-[#0A0A0A] border-white/5">
          <DialogHeader>
            <DialogTitle className="text-[12px] font-black uppercase tracking-widest text-white italic">Editar Etapa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#404040] uppercase tracking-widest ml-1">Nome da Etapa</label>
              <Input 
                value={isEditing?.name || ""}
                onChange={(e) => setIsEditing(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="bg-[#1A1A1A] border-white/5 text-white text-[11px] h-12 uppercase font-black italic tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#404040] uppercase tracking-widest ml-1">Cor de Identificação</label>
              <div className="flex gap-2">
                {["#6b7280", "#F97316", "#22C55E", "#3B82F6", "#EF4444", "#A855F7", "#EAB308"].map(c => (
                  <button 
                    key={c}
                    onClick={() => setIsEditing(prev => prev ? { ...prev, color: c } : null)}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all",
                      isEditing?.color === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
             <button 
               onClick={handleUpdate}
               className="w-full bg-[#F97316] text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
             >
               Salvar Alterações
             </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
