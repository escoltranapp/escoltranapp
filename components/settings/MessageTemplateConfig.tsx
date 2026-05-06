"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MessageTemplate {
  id: string
  nome: string
  canal: string
  conteudo: string
  variaveis: string[]
}

const CANAL_CONFIG: Record<string, { label: string, icon: string, color: string, bg: string }> = {
  WHATSAPP: { label: 'WhatsApp', icon: 'chat', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' },
  EMAIL: { label: 'E-mail', icon: 'mail', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
}

export function MessageTemplateConfig() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Partial<MessageTemplate> | null>(null)

  const { data: templates, isLoading } = useQuery<MessageTemplate[]>({
    queryKey: ["message-templates"],
    queryFn: async () => {
      const res = await fetch("/api/message-templates")
      if (!res.ok) return []
      return res.json()
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<MessageTemplate>) => {
      const isEditing = !!data.id
      const url = isEditing ? `/api/message-templates/${data.id}` : "/api/message-templates"
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error("Erro ao salvar template")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] })
      setIsDialogOpen(false)
      toast({ title: "TEMPLATE SALVO", description: "O modelo de mensagem foi atualizado com sucesso." })
    },
    onError: (err: any) => {
      toast({ title: "FALHA AO SALVAR", description: err.message, variant: "destructive" })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/message-templates/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao excluir template")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] })
      toast({ title: "TEMPLATE EXCLUÍDO", description: "O modelo de mensagem foi removido." })
    }
  })

  const handleOpenDialog = (template?: MessageTemplate) => {
    setEditingTemplate(template || { nome: "", canal: "WHATSAPP", conteudo: "", variaveis: [] })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!editingTemplate?.nome || !editingTemplate?.conteudo) {
      toast({ title: "CAMPOS OBRIGATÓRIOS", description: "Preencha o nome e o conteúdo do modelo.", variant: "destructive" })
      return
    }
    saveMutation.mutate(editingTemplate)
  }

  const insertVariable = (variable: string) => {
    if (!editingTemplate) return
    setEditingTemplate({
      ...editingTemplate,
      conteudo: (editingTemplate.conteudo || "") + ` {{${variable}}}`
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-[10px] font-mono font-black text-[#F97316] uppercase tracking-[0.4em] mb-2 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-[#F97316]/30"></span>
            Gestão de Modelos
          </h2>
          <p className="text-secondary text-[12px] font-medium max-w-md">
            Padronize a comunicação da sua equipe com modelos de mensagens dinâmicos e variáveis personalizadas.
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(249,115,22,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">add</span>
          NOVO MODELO
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl border border-white/[0.03]" />
          ))}
        </div>
      ) : templates?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[#1A1A1A]/20 border border-white/5 border-dashed rounded-3xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
             <span className="material-symbols-outlined text-[32px] text-white/10">description</span>
          </div>
          <p className="text-secondary font-black uppercase tracking-[0.3em] text-[10px]">Nenhum modelo cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map(template => {
            const config = CANAL_CONFIG[template.canal] || CANAL_CONFIG.WHATSAPP
            return (
              <div 
                key={template.id}
                className="group relative bg-[#1A1A1A]/40 border border-white/[0.05] p-6 rounded-3xl hover:border-[#F97316]/30 transition-all duration-300 overflow-hidden shadow-xl"
              >
                <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
                   <span className="material-symbols-outlined text-[80px]">{config.icon}</span>
                </div>

                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div 
                    className="p-3 rounded-2xl border border-white/5 shadow-inner"
                    style={{ color: config.color, backgroundColor: config.bg }}
                  >
                    <span className="material-symbols-outlined text-[22px]">{config.icon}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={() => handleOpenDialog(template)}
                      className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-secondary hover:text-white hover:bg-white/10 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm("Deseja realmente excluir este modelo?")) deleteMutation.mutate(template.id)
                      }}
                      className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500/70 hover:text-red-500 hover:bg-red-500/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
                
                <h3 className="text-[15px] font-black text-white uppercase tracking-tight mb-3 truncate relative z-10 italic">
                  {template.nome}
                </h3>
                <div className="relative z-10">
                  <p className="text-[12px] text-secondary font-medium line-clamp-3 leading-relaxed italic bg-black/20 p-3 rounded-xl border border-white/[0.03]">
                    "{template.conteudo}"
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.03] flex items-center justify-between relative z-10">
                  <span className="text-[9px] font-mono font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }}></span>
                    {config.label}
                  </span>
                  <div className="flex gap-1.5">
                    {template.variaveis.slice(0, 2).map(v => (
                      <span key={v} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-secondary uppercase tracking-widest">
                        {v}
                      </span>
                    ))}
                    {template.variaveis.length > 2 && (
                      <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black text-secondary">
                        +{template.variaveis.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0A0A0A]/95 backdrop-blur-2xl border-white/10 text-white max-w-2xl rounded-[32px] overflow-hidden p-0 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F97316] to-transparent opacity-50" />
          
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F97316]/10 rounded-2xl flex items-center justify-center border border-[#F97316]/20">
                 <span className="material-symbols-outlined text-[#F97316]">{editingTemplate?.id ? 'edit_document' : 'add_circle'}</span>
              </div>
              {editingTemplate?.id ? "Editar Modelo" : "Novo Modelo"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-8 space-y-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-black text-[#6B7280] uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
                   <span className="material-symbols-outlined text-[14px]">label</span>
                   Nome do Modelo
                </label>
                <Input 
                  className="bg-[#1A1A1A] border-white/10 h-14 rounded-2xl px-5 text-sm focus:border-[#F97316]/50 transition-all font-medium"
                  value={editingTemplate?.nome}
                  onChange={e => setEditingTemplate({ ...editingTemplate, nome: e.target.value })}
                  placeholder="Ex: Saudação Inicial"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-black text-[#6B7280] uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
                   <span className="material-symbols-outlined text-[14px]">cell_tower</span>
                   Canal de Envio
                </label>
                <Select
                  value={editingTemplate?.canal}
                  onValueChange={val => setEditingTemplate({ ...editingTemplate, canal: val })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-white/10 h-14 rounded-2xl px-5 text-sm focus:border-[#F97316]/50 transition-all">
                    <SelectValue placeholder="Selecione o canal" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                    <SelectItem value="WHATSAPP" className="hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest py-3">WhatsApp</SelectItem>
                    <SelectItem value="EMAIL" className="hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest py-3">E-mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <label className="text-[10px] font-mono font-black text-[#6B7280] uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
                   <span className="material-symbols-outlined text-[14px]">article</span>
                   Conteúdo da Mensagem
                </label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => insertVariable("nome")}
                    className="px-4 py-2 bg-[#F97316]/5 text-[#F97316] text-[9px] font-black uppercase rounded-xl border border-[#F97316]/10 hover:bg-[#F97316]/10 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[14px]">person_add</span>
                    + Nome
                  </button>
                  <button 
                    onClick={() => insertVariable("empresa")}
                    className="px-4 py-2 bg-[#F97316]/5 text-[#F97316] text-[9px] font-black uppercase rounded-xl border border-[#F97316]/10 hover:bg-[#F97316]/10 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[14px]">business</span>
                    + Empresa
                  </button>
                </div>
              </div>
              <Textarea 
                className="bg-[#1A1A1A] border-white/10 min-h-[180px] rounded-[24px] p-6 leading-relaxed resize-none focus:border-[#F97316]/50 transition-all text-sm font-medium"
                value={editingTemplate?.conteudo}
                onChange={e => setEditingTemplate({ ...editingTemplate, conteudo: e.target.value })}
                placeholder="Escreva sua mensagem aqui... Use {{nome}} para personalizar."
              />
              <p className="text-[9px] text-secondary/50 font-mono italic px-2">
                As variáveis serão substituídas automaticamente pelos dados do contato no momento do envio.
              </p>
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 bg-white/[0.02] border-t border-white/[0.03] gap-4">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-secondary hover:text-white transition-all flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#F97316]/20 transition-all disabled:opacity-50 flex-1 flex items-center justify-center gap-3"
            >
              {saveMutation.isPending ? (
                 <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
              ) : (
                 <span className="material-symbols-outlined text-[18px]">save</span>
              )}
              {saveMutation.isPending ? "SALVANDO..." : "SALVAR MODELO"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
        </DialogContent>
      </Dialog>
    </div>
  )
}
