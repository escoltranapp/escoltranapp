"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface NewDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stages: { id: string, name: string }[]
  pipelineId?: string
  defaultStageId?: string
}

export function NewDealDialog({ open, onOpenChange, stages, pipelineId, defaultStageId }: NewDealDialogProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    titulo: "",
    valorEstimado: "",
    contactId: "",
    stageId: defaultStageId || stages[0]?.id || "",
    prioridade: "MEDIA",
    descricao: ""
  })

  // SYNC DEFAULT STAGE WHEN DATA LOADS OR PROP CHANGES
  useEffect(() => {
    if (open) {
      setFormData(prev => ({ 
        ...prev, 
        stageId: defaultStageId || stages[0]?.id || "" 
      }))
    }
  }, [open, defaultStageId, stages])

  // FETCH CONTACTS TO SELECT
  const { data: contactsData } = useQuery<any>({
    queryKey: ["contacts-list"],
    queryFn: async () => {
      const res = await fetch("/api/contacts?limit=100")
      if (!res.ok) return { contacts: [] }
      return res.json()
    },
    enabled: open
  })

  const contacts = Array.isArray(contactsData?.contacts) ? contactsData.contacts : []

  const createDeal = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, pipelineId }),
      })
      if (!res.ok) throw new Error("Falha ao criar deal")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
      toast({ title: "DEAL SINCRONIZADO 🛡️", description: "Nova oportunidade adicionada ao cluster." })
      onOpenChange(false)
      setFormData({ 
        titulo: "", 
        valorEstimado: "", 
        contactId: "", 
        stageId: defaultStageId || stages[0]?.id || "", 
        prioridade: "MEDIA", 
        descricao: "" 
      })
    },
    onError: () => {
      toast({ title: "ERRO DE SINCRONIZAÇÃO", description: "Não foi possível registrar o deal.", variant: "destructive" })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0A0A0A] border border-white/[0.05] p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-t-[32px] md:rounded-[40px] h-[90vh] md:h-auto">
        <DialogHeader className="p-6 md:p-8 bg-gradient-to-br from-[#F97316]/10 to-transparent border-b border-white/[0.03] shrink-0">
          <DialogTitle className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter leading-tight">Expandir Dataset Operacional</DialogTitle>
          <p className="text-[#6B7280] text-[10px] md:text-[12px] font-bold uppercase tracking-widest mt-1">Registrar nova oportunidade Escoltran</p>
        </DialogHeader>

        <div className="p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto scrollbar-hide flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* TÍTULO */}
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">Identificador do Deal / Título</label>
              <input 
                value={formData.titulo}
                onChange={e => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-5 py-3.5 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm"
                placeholder="Ex: Consultoria Tech Escoltran v1"
              />
            </div>

            {/* VALOR E PRIORIDADE */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">Valor Estimado (BRL)</label>
              <input 
                type="number"
                value={formData.valorEstimado}
                onChange={e => setFormData(prev => ({ ...prev, valorEstimado: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-5 py-3.5 text-[#F97316] focus:border-[#F97316]/50 outline-none transition-all font-mono font-black text-lg"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">Prioridade Neural</label>
              <select 
                value={formData.prioridade}
                onChange={e => setFormData(prev => ({ ...prev, prioridade: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-5 py-3.5 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm h-[52px] appearance-none"
              >
                <option value="ALTA">CRÍTICA (ALTA)</option>
                <option value="MEDIA">MODERADA (MÉDIA)</option>
                <option value="BAIXA">STANDBY (BAIXA)</option>
              </select>
            </div>

            {/* CONTATO E ETAPA */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">Entidade / Contato</label>
              <select 
                value={formData.contactId}
                onChange={e => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-5 py-3.5 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm h-[52px] appearance-none"
              >
                <option value="">NÃO ASSOCIADO</option>
                {contacts.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nome} {c.sobrenome ? `(${c.empresa || 'Empresa'})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">Etapa de Entrada no Fluxo</label>
              <select 
                value={formData.stageId}
                onChange={e => setFormData(prev => ({ ...prev, stageId: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-5 py-3.5 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm h-[52px] appearance-none"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-6 md:pt-8 border-t border-white/[0.03] flex flex-col sm:flex-row gap-4 shrink-0">
             <button 
               onClick={() => onOpenChange(false)}
               className="w-full sm:flex-1 px-8 py-4 bg-[#1A1A1A] text-[#404040] rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:text-[#F2F2F2] transition-all"
             >
                Abortar Processo
             </button>
             <button 
               onClick={() => createDeal.mutate(formData)}
               disabled={!formData.titulo || createDeal.isPending}
               className="w-full sm:flex-1 px-8 py-4 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#F97316]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
             >
                {createDeal.isPending ? 'Sincronizando...' : 'Concluir Registro'}
             </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
