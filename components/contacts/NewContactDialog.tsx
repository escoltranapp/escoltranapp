"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface NewContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewContactDialog({ open, onOpenChange }: NewContactDialogProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    cargo: "",
    canalOrigem: "Indicação",
    tags: "",
    notas: ""
  })

  const originOptions = [
    { value: "Indicação", label: "INDICAÇÃO" },
    { value: "Busca Ativa", label: "BUSCA ATIVA" },
    { value: "Landing Page", label: "LANDING PAGE" },
    { value: "Instagram", label: "INSTAGRAM" },
    { value: "LinkedIn", label: "LINKEDIN" },
    { value: "WhatsApp", label: "WHATSAPP" },
    { value: "Outro", label: "OUTRO" }
  ]

  const createContact = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tags: data.tags.split(",").map(t => t.trim()).filter(t => t !== "")
        }),
      })
      if (!res.ok) throw new Error("Falha ao criar contato")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      toast({ 
        title: "ENTIDADE SINCRONIZADA 🛡️", 
        description: "Novo nó de contato adicionado ao diretório mestre." 
      })
      onOpenChange(false)
      setFormData({ 
        nome: "", empresa: "", email: "", telefone: "", 
        cargo: "", canalOrigem: "Indicação", tags: "", notas: "" 
      })
    },
    onError: () => {
      toast({ 
        title: "ERRO DE SINCRONIZAÇÃO", 
        description: "Não foi possível registrar a entidade no dataset.", 
        variant: "destructive" 
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0A0A0A] border border-white/[0.05] p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <DialogHeader className="p-8 bg-gradient-to-br from-[#F97316]/10 to-transparent border-b border-white/[0.03]">
          <div className="flex items-center gap-4 mb-2">
             <div className="w-10 h-10 rounded-full bg-[#F97316]/20 flex items-center justify-center border border-[#F97316]/30">
                <span className="material-symbols-outlined text-[#F97316] text-[22px]">person_add</span>
             </div>
             <div>
                <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter">Provisionar Nova Entidade</DialogTitle>
                <p className="text-[#6B7280] text-[11px] font-bold uppercase tracking-widest mt-0.5">Mapeamento de contato para o cluster Escoltran</p>
             </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#1A1A1A]">
          <div className="grid grid-cols-2 gap-6">
            {/* NOME */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Nome Completo *</label>
              <input 
                value={formData.nome}
                onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm"
                placeholder="Ex: João da Silva"
              />
            </div>

            {/* EMPRESA */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Organização / Empresa</label>
              <input 
                value={formData.empresa}
                onChange={e => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm"
                placeholder="Ex: Escoltran Solutions"
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Email Digital</label>
              <input 
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm"
                placeholder="nome@empresa.com"
              />
            </div>

            {/* TELEFONE */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Telefone / WhatsApp</label>
              <input 
                value={formData.telefone}
                onChange={e => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm"
                placeholder="(00) 00000-0000"
              />
            </div>

            {/* CARGO */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Cargo Decisório</label>
              <input 
                value={formData.cargo}
                onChange={e => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm"
                placeholder="Ex: Diretor de Operações"
              />
            </div>

            {/* CANAL DE ORIGEM */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Canal de Origem</label>
              <select 
                value={formData.canalOrigem}
                onChange={e => setFormData(prev => ({ ...prev, canalOrigem: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm h-[46px] appearance-none"
              >
                {originOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* TAGS */}
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Tags (separadas por vírgula)</label>
              <input 
                value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm"
                placeholder="VIP, Lead Frio, Tech, Decisor..."
              />
            </div>

            {/* NOTAS */}
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Notas Suplementares</label>
              <textarea 
                value={formData.notas}
                onChange={e => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                rows={4}
                className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-white focus:border-[#F97316]/50 outline-none transition-all font-bold text-sm resize-none"
                placeholder="Informações adicionais sobre o perfil ou contexto do contato..."
              />
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/[0.03] flex gap-4 bg-[#0A0A0A]">
           <button 
             onClick={() => onOpenChange(false)}
             className="flex-1 px-8 py-4 bg-[#1A1A1A] text-[#404040] rounded-xl text-[11px] font-black uppercase tracking-widest hover:text-[#F2F2F2] transition-all"
           >
              Abortar Registro
           </button>
           <button 
             onClick={() => createContact.mutate(formData)}
             disabled={!formData.nome || createContact.isPending}
             className="flex-[2] px-8 py-4 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#F97316]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
           >
              {createContact.isPending ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  Sincronizar no Diretório
                </>
              )}
           </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
