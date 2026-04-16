"use client"

import { useState, useEffect } from "react"
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl bg-[#0A0A0A] border-l border-white/[0.05] p-0 overflow-y-auto scrollbar-hide shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        
        {/* TOP GLOW ACCENT */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#F97316]/5 via-transparent to-transparent pointer-events-none" />

        {/* HEADER AREA */}
        <div className="relative p-10 border-b border-white/[0.03]">
           <div className="flex items-start justify-between mb-12">
              <div className="flex items-center gap-8">
                 <div className="relative group">
                    <div className="absolute -inset-4 bg-[#F97316]/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#F97316]/30 flex items-center justify-center text-[#F97316] font-black text-3xl shadow-2xl relative z-10 transition-transform hover:scale-105">
                       {contact.nome?.slice(0, 1).toUpperCase()}
                    </div>
                 </div>
                 
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="px-3 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316] text-[10px] font-black uppercase tracking-[0.2em] border border-[#F97316]/20">
                          {contact.status || "Novo Lead"}
                       </span>
                    </div>
                    <SheetTitle className="text-4xl font-black text-white italic tracking-tighter uppercase leading-tight mb-2">
                       {contact.nome}
                    </SheetTitle>
                    <div className="flex items-center gap-4 text-[#6B7280]">
                       <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#F97316]">corporate_fare</span>
                          <span className="text-[11px] font-black uppercase tracking-widest italic">{contact.empresa || "Pessoa Física"}</span>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="flex flex-col gap-2 relative z-10">
                 <button 
                   onClick={() => onEdit(contact)}
                   className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-white/10 text-white hover:text-[#F97316] hover:border-[#F97316]/40 hover:bg-[#F97316]/5 transition-all shadow-xl"
                 >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                 </button>
                 <button 
                   onClick={() => {
                      if(confirm("Deseja realmente remover esta entidade do cluster?")) deleteMutation.mutate()
                   }}
                   className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-600/10 border border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                 >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                 </button>
              </div>
           </div>

           {/* PIPELINE PROGRESS VISUALIZER */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-mono font-black text-[#404040] uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-[#262626]" />
                    ESTÁGIO NO FUNIL OPERACIONAL
                 </h4>
              </div>
              
              <div className="grid grid-cols-6 gap-3">
                 {funnelStages.map((stage) => {
                    const isActive = localStatus === stage.id
                    return (
                       <button 
                         key={stage.id}
                         onClick={() => updateStatusMutation.mutate(stage.id)}
                         className={cn(
                            "group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all border relative overflow-hidden",
                            isActive 
                              ? "bg-gradient-to-br from-[#F97316] to-[#FB923C] border-[#F97316] shadow-[0_10px_25px_rgba(249,115,22,0.3)]" 
                              : "bg-[#0A0A0A] border-white/[0.03] hover:border-white/10"
                         )}
                       >
                          <span className={cn(
                             "material-symbols-outlined text-[20px] transition-transform group-hover:scale-110",
                             isActive ? "text-white" : "text-[#404040]"
                          )}>
                             {stage.icon}
                          </span>
                          <span className={cn(
                             "text-[9px] font-black tracking-widest uppercase",
                             isActive ? "text-white" : "text-[#404040]"
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
        <div className="p-10 space-y-16">
           
           {/* DATA MODULES GRID */}
           <div className="grid grid-cols-2 gap-12">
              
              {/* MODULE: IDENTITY DYNAMICS */}
              <div className="space-y-8">
                 <div className="flex items-center gap-4 border-b border-white/[0.04] pb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#F97316]">
                       <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                    </div>
                    <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#F97316] italic">DADOS DE CONTATO</h3>
                 </div>

                 <div className="space-y-8 pl-4">
                    {[
                       { label: "TELEFONE", value: contact.telefone, icon: "call", copy: true },
                       { label: "EMAIL DIGITAL", value: contact.email, icon: "alternate_email", copy: true },
                       { label: "CARGO DECISÓRIO", value: contact.cargo, icon: "badge" },
                       { label: "CANAL DE ORIGEM", value: contact.canalOrigem, icon: "hub", color: "text-[#F97316]" },
                    ].map((row: any, i: number) => (
                       <div key={i} className="group flex items-start gap-4">
                          <div className="mt-1 w-6 h-6 flex items-center justify-center text-[#404040] group-hover:text-[#F97316] transition-colors">
                             <span className="material-symbols-outlined text-[18px]">{row.icon}</span>
                          </div>
                          <div className="flex-1 space-y-1">
                             <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest leading-none">{row.label}</label>
                             <div className="flex items-center gap-3 min-h-[15px]">
                                <span className={cn(
                                   "text-[15px] font-bold text-white tracking-tight leading-none uppercase",
                                   row.color,
                                   !row.value && "text-[#262626] font-mono italic"
                                )}>
                                   {row.value || "Informação não provisionada"}
                                </span>
                                {row.copy && row.value && (
                                   <button 
                                     onClick={() => copyToClipboard(row.value, row.label)}
                                     className="opacity-0 group-hover:opacity-100 transition-opacity text-[#404040] hover:text-[#F97316]"
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
              <div className="space-y-8">
                 <div className="flex items-center gap-4 border-b border-white/[0.04] pb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#F97316]">
                       <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
                    </div>
                    <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#F97316] italic">DADOS DA EMPRESA</h3>
                 </div>

                 <div className="space-y-8 pl-4">
                    {[
                       { label: "RAZÃO SOCIAL", value: contact.empresa, icon: "domain" },
                       { label: "ENDEREÇO CLUSTER", value: "", icon: "location_on", placeholder: "LOCALIZAÇÃO EM ANÁLISE" },
                       { label: "IDENTIFICADOR FISCAL", value: "", icon: "contract_edit", placeholder: "AGUARDANDO DOCUMENTAÇÃO" },
                    ].map((row: any, i: number) => (
                       <div key={i} className="group flex items-start gap-4">
                          <div className="mt-1 w-6 h-6 flex items-center justify-center text-[#404040] group-hover:text-[#F97316] transition-colors">
                             <span className="material-symbols-outlined text-[18px]">{row.icon}</span>
                          </div>
                          <div className="flex-1 space-y-1">
                             <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest leading-none">{row.label}</label>
                             <div className={cn(
                                "text-[15px] font-bold text-white tracking-tight leading-none uppercase",
                                !row.value && "italic text-[#262626] font-mono",
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
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#F97316]">
                    <span className="material-symbols-outlined text-[18px]">forum</span>
                 </div>
                 <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#F97316] italic">NOTAS E OBSERVAÇÕES</h3>
              </div>
              <div className="relative group">
                 <div className="absolute -inset-0.5 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                 <div className="relative bg-[#1A1A1A] border border-white/5 rounded-3xl p-8 min-h-[160px] shadow-2xl">
                    <p className="text-[14px] text-[#A3A3A3] leading-relaxed italic font-medium">
                       {contact.notas || "Nenhuma observação registrada para este contato."}
                    </p>
                 </div>
              </div>
           </div>

           {/* TEMPORAL AUDIT TIMELINE */}
           <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#F97316]">
                       <span className="material-symbols-outlined text-[18px]">history</span>
                    </div>
                    <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#F97316] italic">HISTÓRICO OPERACIONAL</h3>
                 </div>
              </div>
              
              <div className="space-y-1 font-mono">
                 {[
                    { t: "AGORA", e: "Entidade acessada pelo terminal", c: "text-[#F97316]" },
                    { t: "SINC", e: "Dataset atualizado via Cloud API", c: "text-[#404040]" },
                 ].map((log: any, i: number) => (
                    <div key={i} className="flex gap-6 p-4 border-l border-[#262626] bg-[#1A1A1A]/20 hover:bg-[#1A1A1A]/40 transition-all rounded-r-xl">
                       <div className={cn("text-[10px] font-black min-w-[60px]", log.c)}>{log.t}</div>
                       <div className="text-[11px] text-[#404040] font-bold tracking-tight uppercase leading-none italic">{log.e}</div>
                    </div>
                 ))}
              </div>
           </div>

           {/* SYSTEM FOOTER */}
           <div className="pt-10 border-t border-white/[0.03] flex items-center justify-between opacity-30">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.3em]">Status: Conectado ao Cluster</span>
              </div>
              <div className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.3em]">
                 Escoltran Cloud Architecture
              </div>
           </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
