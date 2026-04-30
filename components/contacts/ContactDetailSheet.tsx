"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { ChannelIcon } from "@/components/ui/ChannelIcon"

interface ContactDetailSheetProps {
  contact: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (contact: any) => void
}

export function ContactDetailSheet({ contact, open, onOpenChange, onEdit }: ContactDetailSheetProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  // OPTIMISTIC UI STATE
  const [localStatus, setLocalStatus] = useState<string>("")

  useEffect(() => {
    if (contact?.status) {
      setLocalStatus(contact.status)
    }
  }, [contact])

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
      toast({ 
        title: "ENTIDADE REMOVIDA", 
        description: "O contato foi desvinculado do sistema com sucesso." 
      })
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
    onMutate: async (newStatus) => {
      // Optimistic update
      setLocalStatus(newStatus)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      toast({ 
        title: "STATUS ATUALIZADO", 
        description: "A nova etapa foi sincronizada no diretório." 
      })
    },
    onError: () => {
      // Rollback
      if (contact?.status) setLocalStatus(contact.status)
      toast({
        title: "ERRO DE SINCRONIZAÇÃO",
        description: "Não foi possível validar a transição no banco de dados.",
        variant: "destructive"
      })
    }
  })

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast({ title: "COPIADO", description: `${label} salvo na área de transferência.` })
  }

  if (!contact) return null

  const funnelStages = [
    { id: "lead", label: "LEAD", icon: "radar" },
    { id: "qualificado", label: "QUALIFICADO", icon: "verified" },
    { id: "reuniao", label: "REUNIÃO", icon: "calendar_today" },
    { id: "proposta", label: "PROPOSTA", icon: "description" },
    { id: "cliente", label: "CLIENTE", icon: "shield_person" },
    { id: "inativo", label: "INATIVO", icon: "block" }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#0A0A0A] border border-white/[0.05] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-2xl">
        
        {/* TOP GLOW ACCENT */}
        <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-[#F97316]/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-h-[85vh] overflow-y-auto scrollbar-hide">
          {/* HEADER AREA */}
          <div className="relative p-6 border-b border-white/[0.03]">
             <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                   <div className="relative group">
                      <div className="absolute -inset-2 bg-[#F97316]/20 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#F97316]/30 flex items-center justify-center text-[#F97316] font-black text-xl shadow-lg relative z-10 transition-transform hover:scale-105">
                         {contact.nome?.slice(0, 1).toUpperCase()}
                      </div>
                   </div>
                   
                   <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                         <span className="px-3 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316] text-[9px] font-black uppercase tracking-[0.2em] border border-[#F97316]/20">
                            {localStatus?.toUpperCase() || "NOVO"}
                         </span>
                      </div>
                      <DialogTitle className="text-2xl font-black text-white italic tracking-tight uppercase leading-none">
                         {contact.nome}
                      </DialogTitle>
                      <div className="flex items-center gap-2 text-[#A3A3A3]">
                         <span className="material-symbols-outlined text-[14px] text-[#F97316]">corporate_fare</span>
                         <span className="text-xs font-bold uppercase tracking-wider italic">{contact.empresa || "Entidade Independente"}</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => onEdit(contact)}
                     className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-white/10 text-[#A3A3A3] hover:text-[#F97316] hover:border-[#F97316]/40 hover:bg-[#F97316]/5 transition-all"
                   >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                   </button>
                   <button 
                     onClick={() => {
                        if(confirm("Deseja realmente remover esta entidade do cluster?")) deleteMutation.mutate()
                     }}
                     className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                   >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                   </button>
                </div>
             </div>

             {/* PIPELINE PROGRESS VISUALIZER */}
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h4 className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-widest flex items-center gap-3">
                      <span className="w-8 h-[1px] bg-[#404040]" />
                      ORQUESTRAÇÃO DO FLUXO
                   </h4>
                </div>
                
                <div className="grid grid-cols-6 gap-2">
                   {funnelStages.map((stage) => {
                      const isActive = localStatus === stage.id
                      return (
                         <button 
                           key={stage.id}
                           onClick={() => updateStatusMutation.mutate(stage.id)}
                           className={cn(
                              "group flex flex-col items-center gap-2 p-3 rounded-xl transition-all border relative overflow-hidden",
                              isActive 
                                ? "bg-gradient-to-br from-[#F97316] to-[#FB923C] border-[#F97316] shadow-lg scale-[1.02]" 
                                : "bg-[#111111] border-white/[0.04] hover:border-white/20 hover:bg-[#1A1A1A]/60"
                           )}
                         >
                            <span className={cn(
                               "material-symbols-outlined text-[18px] transition-transform group-hover:scale-110",
                               isActive ? "text-white" : "text-[#6B7280]"
                            )}>
                               {stage.icon}
                            </span>
                            <span className={cn(
                               "text-[9px] font-bold tracking-wider uppercase",
                               isActive ? "text-white" : "text-[#6B7280]"
                            )}>
                               {stage.label}
                            </span>
                         </button>
                      )
                   })}
                </div>
             </div>
          </div>

          {/* CONTENT DENSITY AREA */}
          <div className="p-6 space-y-10">
             
             {/* DATA MODULES GRID */}
             <div className="grid grid-cols-2 gap-8">
                
                {/* MODULE: IDENTITY DYNAMICS */}
                <div className="space-y-5">
                   <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#F97316]/20 flex items-center justify-center text-[#F97316]">
                         <span className="material-symbols-outlined text-[16px]">contact_page</span>
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white italic">DADOS DE CONTATO</h3>
                   </div>

                   <div className="space-y-5 pl-4 border-l border-white/[0.05]">
                      {[
                         { label: "TELEFONE", value: contact.telefone, icon: "call", copy: true },
                         { label: "EMAIL", value: contact.email, icon: "alternate_email", copy: true },
                         { label: "CARGO", value: contact.cargo, icon: "badge" },
                         { label: "ORIGEM", value: contact.canalOrigem, icon: "hub", color: "text-[#F97316]" },
                      ].map((row: any, i: number) => (
                         <div key={i} className="group flex items-start gap-4">
                            <div className="mt-0.5 w-6 h-6 flex items-center justify-center text-[#6B7280] group-hover:text-[#F97316] group-hover:bg-[#F97316]/5 rounded transition-all">
                               {row.label === "ORIGEM" ? (
                                   <ChannelIcon channel={row.value} />
                                ) : (
                                   <span className="material-symbols-outlined text-[16px]">{row.icon}</span>
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                               <label className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">{row.label}</label>
                               <div className="flex items-center gap-3 min-h-[16px]">
                                  <span className={cn(
                                     "text-[13px] font-bold text-white tracking-tight uppercase",
                                     row.color,
                                     !row.value && "text-[#404040] font-mono italic text-[11px]"
                                  )}>
                                     {row.value || "Não informado"}
                                  </span>
                                  {row.copy && row.value && (
                                     <button 
                                       onClick={() => copyToClipboard(row.value, row.label)}
                                       className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6B7280] hover:text-[#F97316]"
                                     >
                                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                     </button>
                                  )}
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* MODULE: CORPORATE CLUSTER */}
                <div className="space-y-5">
                   <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#F97316]/20 flex items-center justify-center text-[#F97316]">
                         <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white italic">EMPRESA</h3>
                   </div>

                   <div className="space-y-5 pl-4 border-l border-white/[0.05]">
                      {[
                         { label: "RAZÃO SOCIAL", value: contact.empresa, icon: "domain" },
                         { label: "ENDEREÇO", value: "", icon: "location_on", placeholder: "Em análise" },
                         { label: "DOCUMENTO FISCAL", value: "", icon: "contract_edit", placeholder: "Aguardando documentação" },
                      ].map((row: any, i: number) => (
                         <div key={i} className="group flex items-start gap-4">
                            <div className="mt-0.5 w-6 h-6 flex items-center justify-center text-[#6B7280] group-hover:text-[#F97316] group-hover:bg-[#F97316]/5 rounded transition-all">
                               <span className="material-symbols-outlined text-[16px]">{row.icon}</span>
                            </div>
                            <div className="flex-1 space-y-1">
                               <label className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">{row.label}</label>
                               <div className={cn(
                                  "text-[13px] font-bold text-white tracking-tight uppercase",
                                  !row.value && "italic text-[#404040] font-mono text-[11px]",
                                  row.color
                               )}>
                                  {row.value || row.placeholder || "---"}
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* INTERNAL INTELLIGENCE / NOTES */}
             <div className="space-y-5">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#F97316]/20 flex items-center justify-center text-[#F97316]">
                      <span className="material-symbols-outlined text-[16px]">forum</span>
                   </div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-white italic">OBSERVAÇÕES</h3>
                </div>
                <div className="bg-[#111111] border border-white/[0.04] rounded-xl p-5 min-h-[100px]">
                   <p className="text-[13px] text-[#A3A3A3] leading-relaxed font-medium">
                      {contact.notas || "Nenhuma observação registrada."}
                   </p>
                </div>
             </div>

             {/* TEMPORAL AUDIT TIMELINE */}
             <div className="space-y-5 pb-6">
                <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
                   <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#F97316]/20 flex items-center justify-center text-[#F97316]">
                      <span className="material-symbols-outlined text-[16px]">history</span>
                   </div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-white italic">HISTÓRICO</h3>
                </div>
                
                <div className="space-y-1 font-mono">
                   {[
                      { t: "AGORA", e: "Interface ativada", c: "text-[#F97316]", bg: "bg-[#F97316]/5 border-[#F97316]/10" },
                      { t: "SINC", e: "Dataset atualizado", c: "text-[#6B7280]", bg: "bg-[#111111] border-white/[0.02]" },
                   ].map((log: any, i: number) => (
                      <div key={i} className={cn("flex gap-4 p-3 border-l-2 rounded-r-lg", log.bg, log.c.replace('text-', 'border-'))}>
                         <div className={cn("text-[9px] font-bold min-w-[50px]", log.c)}>{log.t}</div>
                         <div className="text-[10px] text-[#A3A3A3] font-medium uppercase">{log.e}</div>
                      </div>
                   ))}
                </div>
             </div>

             {/* SYSTEM FOOTER */}
             <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between opacity-50 pb-2">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[8px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">SYNCED</span>
                </div>
                <div className="text-[8px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">
                   V2.5
                </div>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
