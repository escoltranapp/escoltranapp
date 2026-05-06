"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { ChannelIcon } from "@/components/ui/ChannelIcon"

interface NewContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: any // Para edição
}

export function NewContactDialog({ open, onOpenChange, contact }: NewContactDialogProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: contact?.nome || "",
    empresa: contact?.empresa || "",
    email: contact?.email || "",
    telefone: contact?.telefone || "",
    cargo: contact?.cargo || "",
    canalOrigem: contact?.canalOrigem || "Indicação",
    tags: contact?.tags?.join(", ") || "",
    notas: contact?.notas || "",
    status: contact?.status || "lead"
  })

  // Sincronizar campos quando o contato mudar (ao abrir para edição)
  useEffect(() => {
    if (contact) {
      setFormData({
        nome: contact.nome || "",
        empresa: contact.empresa || "",
        email: contact.email || "",
        telefone: contact.telefone || "",
        cargo: contact.cargo || "",
        canalOrigem: contact.canalOrigem || "Indicação",
        tags: Array.isArray(contact.tags) ? contact.tags.join(", ") : "",
        notas: contact.notas || "",
        status: contact.status || "lead"
      })
    }
  }, [contact])

  const originOptions = [
    { value: "Indicação", label: "INDICAÇÃO" },
    { value: "Busca Ativa", label: "BUSCA ATIVA" },
    { value: "Landing Page", label: "LANDING PAGE" },
    { value: "Instagram", label: "INSTAGRAM" },
    { value: "LinkedIn", label: "LINKEDIN" },
    { value: "WhatsApp", label: "WHATSAPP" },
    { value: "Outro", label: "OUTRO" }
  ]

  const saveContact = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = contact?.id ? `/api/contacts/${contact.id}` : "/api/contacts"
      const method = contact?.id ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tags: data.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t !== "")
        }),
      })
      if (!res.ok) throw new Error("Falha ao salvar contato")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      toast({ 
        title: contact?.id ? "ENTIDADE ATUALIZADA 🛡️" : "ENTIDADE SINCRONIZADA 🛡️", 
        description: contact?.id ? "As alterações foram replicadas no diretório Escoltran." : "Novo nó de contato adicionado ao diretório mestre." 
      })
      onOpenChange(false)
      if (!contact) {
         setFormData({ 
           nome: "", empresa: "", email: "", telefone: "", 
           cargo: "", canalOrigem: "Indicação", tags: "", notas: "", status: "lead" 
         })
      }
    },
    onError: () => {
      toast({ 
        title: "ERRO DE SINCRONIZAÇÃO", 
        description: "Não foi possível processar a operação no dataset.", 
        variant: "destructive" 
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/[0.06] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-t-[32px] md:rounded-[40px] h-[95vh] md:h-auto">
        {/* INTERNAL RADIAL GLOW */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#F97316]/5 blur-[100px] pointer-events-none" />

        <DialogHeader className="p-6 md:p-10 border-b border-white/[0.03] relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 md:gap-6 relative z-10">
             <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] shrink-0">
                <span className="material-symbols-outlined text-white text-[24px] md:text-[28px] font-black">{contact?.id ? "edit_note" : "person_add"}</span>
             </div>
             <div>
                <DialogTitle className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                   {contact?.id ? "Módulo: Atualizar" : "Módulo: Provisionar"}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 md:mt-3">
                   <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[8px] font-black font-mono text-[#F97316] uppercase tracking-[0.2em]">
                      STATUS: HANDSHAKE
                   </div>
                   <p className="text-[#404040] text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] font-mono whitespace-nowrap">
                      // {contact?.id ? `EDITING_NODE_${contact.id.slice(0,8)}` : "GENERATE_NEW_IDENTITY_HASH"}
                   </p>
                </div>
             </div>
          </div>
        </DialogHeader>

        <div className="p-6 md:p-10 space-y-8 md:space-y-10 overflow-y-auto scrollbar-hide relative z-10 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* INPUT FIELDS WRAPPED IN GLASS SURFACES */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono font-black text-[#6B7280] uppercase tracking-[0.4em] pl-1">Identidade Nominal</label>
              <div className="group/input relative">
                 <div className="absolute -inset-0.5 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-sm" />
                 <input 
                   value={formData.nome}
                   onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                   className="relative w-full bg-[#1A1A1A]/40 border border-white/[0.06] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#F97316]/40 transition-all font-black text-[13px] tracking-tight placeholder:text-[#262626]"
                   placeholder="NOME DA ENTIDADE..."
                 />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono font-black text-[#6B7280] uppercase tracking-[0.4em] pl-1">Organização Base</label>
              <div className="group/input relative">
                 <div className="absolute -inset-0.5 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-sm" />
                 <input 
                   value={formData.empresa}
                   onChange={e => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
                   className="relative w-full bg-[#1A1A1A]/40 border border-white/[0.06] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#F97316]/40 transition-all font-black text-[13px] tracking-tight placeholder:text-[#262626]"
                   placeholder="EMPRESA / CLUSTER..."
                 />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono font-black text-[#6B7280] uppercase tracking-[0.4em] pl-1">Endereço de Sync (Email)</label>
              <div className="group/input relative">
                 <div className="absolute -inset-0.5 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-sm" />
                 <input 
                   type="email"
                   value={formData.email}
                   onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                   className="relative w-full bg-[#1A1A1A]/40 border border-white/[0.06] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#F97316]/40 transition-all font-black text-[13px] tracking-tight placeholder:text-[#262626]"
                   placeholder="EMAIL_ADDR@DOMAIN.COM"
                 />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono font-black text-[#6B7280] uppercase tracking-[0.4em] pl-1">Canal de Comand (Telefone)</label>
              <div className="group/input relative">
                 <div className="absolute -inset-0.5 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-sm" />
                 <input 
                   value={formData.telefone}
                   onChange={e => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                   className="relative w-full bg-[#1A1A1A]/40 border border-white/[0.06] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#F97316]/40 transition-all font-black text-[13px] tracking-tight placeholder:text-[#262626]"
                   placeholder="+55 (00) 00000-0000"
                 />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono font-black text-[#6B7280] uppercase tracking-[0.4em] pl-1">Nível Hierárquico (Cargo)</label>
              <div className="group/input relative">
                 <div className="absolute -inset-0.5 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-sm" />
                 <input 
                   value={formData.cargo}
                   onChange={e => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                   className="relative w-full bg-[#1A1A1A]/40 border border-white/[0.06] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#F97316]/40 transition-all font-black text-[13px] tracking-tight placeholder:text-[#262626]"
                   placeholder="EX: CTO / DIRECTOR..."
                 />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono font-black text-[#6B7280] uppercase tracking-[0.4em] pl-1">Origem do Tráfego</label>
              <div className="group/input relative flex items-center">
                 <div className="absolute left-5 z-20 pointer-events-none opacity-50 group-focus-within/input:opacity-100 transition-opacity">
                    <ChannelIcon channel={formData.canalOrigem} />
                 </div>
                 <div className="absolute -inset-0.5 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-sm" />
                 <select 
                   value={formData.canalOrigem}
                   onChange={e => setFormData(prev => ({ ...prev, canalOrigem: e.target.value }))}
                   className="relative w-full bg-[#1A1A1A]/40 border border-white/[0.06] rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-[#F97316]/40 transition-all font-black text-[13px] tracking-tight appearance-none cursor-pointer"
                 >
                   {originOptions.map(opt => (
                     <option key={opt.value} value={opt.value} className="bg-[#0A0A0A]">{opt.label}</option>
                   ))}
                 </select>
              </div>
            </div>

            <div className="col-span-2 space-y-3">
              <label className="text-[10px] font-mono font-black text-[#6B7280] uppercase tracking-[0.4em] pl-1">Meta-Tags (Classificadores)</label>
              <div className="group/input relative">
                 <div className="absolute -inset-0.5 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-sm" />
                 <input 
                   value={formData.tags}
                   onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                   className="relative w-full bg-[#1A1A1A]/40 border border-white/[0.06] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#F97316]/40 transition-all font-black text-[13px] tracking-tight placeholder:text-[#262626]"
                   placeholder="TAG_1, TAG_2, TAG_3..."
                 />
              </div>
            </div>

            <div className="col-span-2 space-y-3">
              <label className="text-[10px] font-mono font-black text-[#6B7280] uppercase tracking-[0.4em] pl-1">Logs Complementares (Notas)</label>
              <div className="group/input relative">
                 <div className="absolute -inset-0.5 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-sm" />
                 <textarea 
                   value={formData.notas}
                   onChange={e => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                   rows={3}
                   className="relative w-full bg-[#1A1A1A]/40 border border-white/[0.06] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#F97316]/40 transition-all font-black text-[13px] tracking-tight placeholder:text-[#262626] resize-none"
                   placeholder="DESCASCAR LOGS ADICIONAIS AQUI..."
                 />
              </div>
            </div>
          </div>
        </div>

         <div className="p-6 md:p-10 border-t border-white/[0.03] flex flex-col sm:flex-row gap-4 md:gap-6 bg-[#0A0A0A]/80 backdrop-blur-3xl relative z-10 shrink-0">
            <button 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto px-10 py-4 md:py-5 bg-[#1A1A1A] text-[#404040] rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] hover:text-[#F2F2F2] hover:bg-[#262626] transition-all border border-white/[0.03]"
            >
               ABORT_SYNC
            </button>
            <button 
              onClick={() => saveContact.mutate(formData)}
              disabled={!formData.nome || saveContact.isPending}
              className="flex-1 px-10 py-4 md:py-5 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_10px_40px_rgba(249,115,22,0.3)] hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-4 group"
            >
               {saveContact.isPending ? (
                 <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
               ) : (
                 <>
                   <span className="material-symbols-outlined text-[18px] md:text-[20px] font-black group-hover:rotate-12 transition-transform">{contact?.id ? "database" : "data_saver_on"}</span>
                   {contact?.id ? "COMMIT_CHANGES" : "INITIALIZE_PROVISIONING"}
                 </>
               )}
            </button>
         </div>
      </DialogContent>
    </Dialog>
  )
}
