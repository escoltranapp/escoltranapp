"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface ContactDetailSheetProps {
  contact: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (contact: any) => void
}

export function ContactDetailSheet({ contact, open, onOpenChange, onEdit }: ContactDetailSheetProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Falha ao excluir")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      toast({ title: "ENTIDADE REMOVIDA 🗑️", description: "O nó de contato foi excluído do diretório mestre." })
      onOpenChange(false)
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar status")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      toast({ title: "STATUS ATUALIZADO ⚡", description: "A posição no funil foi sincronizada." })
    }
  })

  if (!contact) return null

  const funnelStages = [
    { id: "lead", label: "LEAD" },
    { id: "qualificado", label: "QUALIFICADO" },
    { id: "reuniao", label: "REUNIÃO" },
    { id: "proposta", label: "PROPOSTA" },
    { id: "cliente", label: "CLIENTE" },
    { id: "inativo", label: "INATIVO" }
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl bg-[#0A0A0A] border-l border-white/[0.05] p-0 overflow-y-auto scrollbar-hide">
        {/* HEADER ESCOLTRAN HIGH-FIDELITY */}
        <div className="p-8 bg-gradient-to-br from-[#1A1A1A] to-transparent border-b border-white/[0.03]">
           <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F97316]/20 to-[#FB923C]/5 border border-[#F97316]/20 flex items-center justify-center text-[#F97316] font-black text-2xl shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                    {contact.nome?.slice(0, 1).toUpperCase()}
                 </div>
                 <div>
                    <SheetTitle className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">
                       {contact.nome}
                    </SheetTitle>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px]">corporate_fare</span>
                          {contact.empresa || "Pessoa Física"}
                       </span>
                       <div className="w-1 h-1 rounded-full bg-[#262626]" />
                       <span className="px-2 py-0.5 rounded bg-[#F97316]/10 text-[#F97316] text-[9px] font-black uppercase tracking-widest border border-[#F97316]/20">
                          {contact.status || "Novo Lead"}
                       </span>
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => onEdit(contact)}
                   className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1A1A1A] border border-white/5 text-[#6B7280] hover:text-[#F97316] hover:border-[#F97316]/30 transition-all group"
                 >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                 </button>
                 <button 
                   onClick={() => {
                      if(confirm("Deseja realmente remover esta entidade do cluster?")) deleteMutation.mutate()
                   }}
                   className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 border border-red-500/10 text-[#404040] hover:text-red-500 hover:border-red-500/30 transition-all"
                 >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                 </button>
              </div>
           </div>

           {/* ESTÁGIO NO FUNIL (CAPSULES) */}
           <div className="space-y-4">
              <div className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.2em]">Estágio no Funil Operacional</div>
              <div className="flex items-center gap-2 flex-wrap">
                 {funnelStages.map((stage, idx) => {
                    const isActive = contact.status === stage.id
                    return (
                       <div key={stage.id} className="flex items-center gap-2">
                          <button 
                            onClick={() => updateStatusMutation.mutate(stage.id)}
                            className={cn(
                               "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                               isActive 
                                 ? "bg-[#F97316] text-white border-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.3)]" 
                                 : "bg-[#0A0A0A] text-[#404040] border-white/5 hover:border-white/10"
                            )}
                          >
                             {stage.label}
                          </button>
                          {idx < funnelStages.length - 1 && (
                             <span className="material-symbols-outlined text-[#1A1A1A] text-[16px]">chevron_right</span>
                          )}
                       </div>
                    )
                 })}
              </div>
           </div>
        </div>

        <div className="p-8 space-y-12">
           {/* GRID DADOS */}
           <div className="grid grid-cols-2 gap-10">
              {/* DADOS DE CONTATO */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3 border-b border-white/[0.03] pb-3">
                    <span className="material-symbols-outlined text-[#F97316] text-[18px]">contact_page</span>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#A3A3A3] italic">Dados de Contato</h3>
                 </div>
                 
                 <div className="space-y-5">
                    <div className="space-y-1">
                       <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest">Telefone</label>
                       <div className="text-[14px] font-bold text-white tracking-tight">{contact.telefone || "Não informado"}</div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest">Email Digital</label>
                       <div className="text-[14px] font-bold text-white tracking-tight lowercase">{contact.email || "Não informado"}</div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest">Cargo Decisório</label>
                       <div className="text-[14px] font-bold text-white tracking-tight uppercase italic">{contact.cargo || "Não informado"}</div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest">Canal de Origem</label>
                       <div className="text-[11px] font-black text-[#F97316] uppercase tracking-[0.1em]">{contact.canalOrigem || "Direto"}</div>
                    </div>
                 </div>
              </div>

              {/* DADOS DA EMPRESA */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3 border-b border-white/[0.03] pb-3">
                    <span className="material-symbols-outlined text-[#F97316] text-[18px]">domain</span>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#A3A3A3] italic">Dados da Empresa</h3>
                 </div>
                 
                 <div className="space-y-5">
                    <div className="space-y-1">
                       <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest">Razão Social</label>
                       <div className="text-[14px] font-bold text-white tracking-tight uppercase">{contact.empresa || "Pessoa Física"}</div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest">Endereço Cluster</label>
                       <div className="text-[13px] font-bold text-[#6B7280] tracking-tight uppercase italic">Rastreando Localização...</div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest">Identificador Fiscal</label>
                       <div className="text-[13px] font-bold text-[#6B7280] tracking-tight uppercase italic">Aguardando CNPJ...</div>
                    </div>
                 </div>
              </div>
           </div>

           {/* NOTAS INTERNAS */}
           <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-white/[0.03] pb-3">
                 <span className="material-symbols-outlined text-[#F97316] text-[18px]">sticky_note_2</span>
                 <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#A3A3A3] italic">Notas e Observações</h3>
              </div>
              <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 min-h-[120px]">
                 <p className="text-[13px] text-[#A3A3A3] leading-relaxed italic">
                    {contact.notas || "Sem observações registradas para este nó."}
                 </p>
              </div>
           </div>

           {/* ACTIONS FOOTER */}
           <div className="pt-6 border-t border-white/[0.03] flex items-center justify-between">
              <div className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">
                 Sincronizado via: {contact.canalOrigem}
              </div>
              <div className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">
                 ID: #{contact.id.slice(0, 8)}
              </div>
           </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
