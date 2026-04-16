"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
      <DialogContent className="max-w-4xl bg-[#0A0A0A] border border-white/[0.05] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[40px]">
        
        {/* TOP GLOW ACCENT */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#F97316]/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-h-[90vh] overflow-y-auto scrollbar-hide">
          {/* HEADER AREA */}
          <div className="relative p-12 border-b border-white/[0.03]">
             <div className="flex items-start justify-between mb-12">
                <div className="flex items-center gap-10">
                   <div className="relative group">
                      <div className="absolute -inset-4 bg-[#F97316]/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#F97316]/30 flex items-center justify-center text-[#F97316] font-black text-4xl shadow-2xl relative z-10 transition-transform hover:scale-105">
                         {contact.nome?.slice(0, 1).toUpperCase()}
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="flex items-center gap-4">
                         <span className="px-5 py-1rounded-full bg-[#F97316]/10 text-[#F97316] text-[11px] font-black uppercase tracking-[0.3em] border border-[#F97316]/20">
                            {localStatus?.toUpperCase() || "NOVO MODO"}
                         </span>
                         <div className="w-1.5 h-1.5 rounded-full bg-[#262626]" />
                         <span className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.4em]">
                            STATION_ID: #{contact.id.slice(-6).toUpperCase()}
                         </span>
                      </div>
                      <DialogTitle className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-2">
                         {contact.nome}
                      </DialogTitle>
                      <div className="flex items-center gap-6 text-[#6B7280]">
                         <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-[#F97316]">corporate_fare</span>
                            <span className="text-[12px] font-black uppercase tracking-widest italic">{contact.empresa || "Entidade Independente"}</span>
                         </div>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => onEdit(contact)}
                     className="h-14 w-14 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/10 text-white hover:text-[#F97316] hover:border-[#F97316]/40 hover:bg-[#F97316]/5 transition-all shadow-xl"
                   >
                      <span className="material-symbols-outlined text-[24px]">edit</span>
                   </button>
                   <button 
                     onClick={() => {
                        if(confirm("Deseja realmente remover esta entidade do cluster?")) deleteMutation.mutate()
                     }}
                     className="h-14 w-14 flex items-center justify-center rounded-2xl bg-red-600/10 border border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                   >
                      <span className="material-symbols-outlined text-[24px]">delete</span>
                   </button>
                </div>
             </div>

             {/* PIPELINE PROGRESS VISUALIZER */}
             <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <h4 className="text-[11px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] flex items-center gap-4">
                      <span className="w-12 h-[1px] bg-[#262626]" />
                      ORQUESTRAÇÃO DO FLUXO OPERACIONAL
                   </h4>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#F97316] animate-ping" />
                      <span className="text-[9px] font-mono font-black text-[#F97316] uppercase tracking-[0.2em]">Live Synchronization</span>
                   </div>
                </div>
                
                <div className="grid grid-cols-6 gap-4">
                   {funnelStages.map((stage) => {
                      const isActive = localStatus === stage.id
                      return (
                         <button 
                           key={stage.id}
                           onClick={() => updateStatusMutation.mutate(stage.id)}
                           className={cn(
                              "group flex flex-col items-center gap-4 p-6 rounded-3xl transition-all border relative overflow-hidden",
                              isActive 
                                ? "bg-gradient-to-br from-[#F97316] to-[#FB923C] border-[#F97316] shadow-[0_20px_40px_rgba(249,115,22,0.3)] scale-[1.02]" 
                                : "bg-[#0A0A0A] border-white/[0.04] hover:border-white/20 hover:bg-[#1A1A1A]/40"
                           )}
                         >
                            <span className={cn(
                               "material-symbols-outlined text-[24px] transition-transform group-hover:scale-125 duration-500",
                               isActive ? "text-white" : "text-[#404040]"
                            )}>
                               {stage.icon}
                            </span>
                            <span className={cn(
                               "text-[10px] font-black tracking-[0.2em] uppercase",
                               isActive ? "text-white" : "text-[#404040]"
                            )}>
                               {stage.label}
                            </span>
                            {isActive && (
                               <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/20 blur-[50px] rounded-full" />
                            )}
                         </button>
                      )
                   })}
                </div>
             </div>
          </div>

          {/* CONTENT DENSITY AREA */}
          <div className="p-12 space-y-20">
             
             {/* DATA MODULES GRID */}
             <div className="grid grid-cols-2 gap-16">
                
                {/* MODULE: IDENTITY DYNAMICS */}
                <div className="space-y-10">
                   <div className="flex items-center gap-5 border-b border-white/[0.06] pb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#F97316]/20 flex items-center justify-center text-[#F97316] shadow-xl">
                         <span className="material-symbols-outlined text-[22px]">contact_page</span>
                      </div>
                      <h3 className="text-[16px] font-black uppercase tracking-[0.3em] text-white italic">DADOS DE CONTATO</h3>
                   </div>

                   <div className="space-y-10 pl-6 border-l border-[#1A1A1A]">
                      {[
                         { label: "TELEFONE", value: contact.telefone, icon: "call", copy: true },
                         { label: "EMAIL DIGITAL", value: contact.email, icon: "alternate_email", copy: true },
                         { label: "CARGO DECISÓRIO", value: contact.cargo, icon: "badge" },
                         { label: "CANAL DE ORIGEM", value: contact.canalOrigem, icon: "hub", color: "text-[#F97316]" },
                      ].map((row: any, i: number) => (
                         <div key={i} className="group flex items-start gap-6">
                            <div className="mt-1.5 w-8 h-8 flex items-center justify-center text-[#404040] group-hover:text-[#F97316] group-hover:bg-[#F97316]/5 rounded-lg transition-all">
                               <span className="material-symbols-outlined text-[20px]">{row.icon}</span>
                            </div>
                            <div className="flex-1 space-y-2">
                               <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.5em] leading-none">{row.label}</label>
                               <div className="flex items-center gap-4 min-h-[18px]">
                                  <span className={cn(
                                     "text-[17px] font-black text-white tracking-tight leading-none uppercase",
                                     row.color,
                                     !row.value && "text-[#262626] font-mono italic text-[14px]"
                                  )}>
                                     {row.value || "Informação não provisionada"}
                                  </span>
                                  {row.copy && row.value && (
                                     <button 
                                       onClick={() => copyToClipboard(row.value, row.label)}
                                       className="opacity-0 group-hover:opacity-100 transition-opacity text-[#404040] hover:text-[#F97316]"
                                     >
                                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                     </button>
                                  )}
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* MODULE: CORPORATE CLUSTER */}
                <div className="space-y-10">
                   <div className="flex items-center gap-5 border-b border-white/[0.06] pb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#F97316]/20 flex items-center justify-center text-[#F97316] shadow-xl">
                         <span className="material-symbols-outlined text-[22px]">corporate_fare</span>
                      </div>
                      <h3 className="text-[16px] font-black uppercase tracking-[0.3em] text-white italic">DADOS DA EMPRESA</h3>
                   </div>

                   <div className="space-y-10 pl-6 border-l border-[#1A1A1A]">
                      {[
                         { label: "RAZÃO SOCIAL", value: contact.empresa, icon: "domain" },
                         { label: "ENDEREÇO CLUSTER", value: "", icon: "location_on", placeholder: "LOCALIZAÇÃO EM ANÁLISE" },
                         { label: "IDENTIFICADOR FISCAL", value: "", icon: "contract_edit", placeholder: "AGUARDANDO DOCUMENTAÇÃO" },
                      ].map((row: any, i: number) => (
                         <div key={i} className="group flex items-start gap-6">
                            <div className="mt-1.5 w-8 h-8 flex items-center justify-center text-[#404040] group-hover:text-[#F97316] group-hover:bg-[#F97316]/5 rounded-lg transition-all">
                               <span className="material-symbols-outlined text-[20px]">{row.icon}</span>
                            </div>
                            <div className="flex-1 space-y-2">
                               <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.5em] leading-none">{row.label}</label>
                               <div className={cn(
                                  "text-[17px] font-black text-white tracking-tight leading-none uppercase",
                                  !row.value && "italic text-[#262626] font-mono text-[14px]",
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
             <div className="space-y-8">
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#F97316]/20 flex items-center justify-center text-[#F97316] shadow-xl">
                      <span className="material-symbols-outlined text-[22px]">forum</span>
                   </div>
                   <h3 className="text-[16px] font-black uppercase tracking-[0.3em] text-white italic">NOTAS E OBSERVAÇÕES</h3>
                </div>
                <div className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-br from-[#F97316]/10 to-transparent rounded-[40px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                   <div className="relative bg-[#0A0A0A] border border-white/[0.06] rounded-[40px] p-10 min-h-[200px] shadow-3xl">
                      <p className="text-[16px] text-[#A3A3A3] leading-relaxed italic font-medium">
                         {contact.notas || "Nenhuma observação registrada para este contato. O dataset permanece em estado de neutralidade informativa até a próxima interação manual."}
                      </p>
                   </div>
                </div>
             </div>

             {/* TEMPORAL AUDIT TIMELINE */}
             <div className="space-y-8 pb-12">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-6">
                   <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#F97316]/20 flex items-center justify-center text-[#F97316] shadow-xl">
                         <span className="material-symbols-outlined text-[22px]">history</span>
                      </div>
                      <h3 className="text-[16px] font-black uppercase tracking-[0.3em] text-white italic">HISTÓRICO OPERACIONAL</h3>
                   </div>
                </div>
                
                <div className="space-y-1 font-mono">
                   {[
                      { t: "AGORA", e: "Interface centralizada ativada por operador", c: "text-[#F97316]", bg: "bg-[#F97316]/5 border-[#F97316]/10" },
                      { t: "SINC", e: "Dataset revalidado via Escoltran Cloud", c: "text-[#404040]", bg: "bg-[#1A1A1A]/20 border-white/[0.02]" },
                   ].map((log: any, i: number) => (
                      <div key={i} className={cn("flex gap-8 p-6 border-l-2 transition-all rounded-r-3xl", log.bg, log.c.replace('text-', 'border-'))}>
                         <div className={cn("text-[11px] font-black min-w-[70px]", log.c)}>{log.t}</div>
                         <div className="text-[12px] text-[#404040] font-bold tracking-[0.1em] uppercase leading-none italic">{log.e}</div>
                      </div>
                   ))}
                </div>
             </div>

             {/* SYSTEM FOOTER */}
             <div className="pt-12 border-t border-white/[0.04] flex items-center justify-between opacity-30 pb-4">
                <div className="flex items-center gap-5">
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                   <span className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.5em]">OPERATIONAL_STATUS: CONNECTED_CLUSTER</span>
                </div>
                <div className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.5em]">
                   ESCOLTRAN_SYSTEMS_CORE_v2.5
                </div>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
