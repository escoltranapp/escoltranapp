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

interface MessageTemplate {
  id: string
  nome: string
  canal: string
  conteudo: string
  variaveis: string[]
}

const CANAL_CONFIG: Record<string, { label: string, icon: string, color: string }> = {
  WHATSAPP: { label: 'WhatsApp', icon: 'chat', color: '#22C55E' },
  EMAIL: { label: 'E-mail', icon: 'mail', color: '#3B82F6' },
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-mono font-black text-[#F97316] uppercase tracking-[0.4em] mb-2 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-[#F97316]/30"></span>
            Gestão de Modelos
          </h2>
          <p className="text-secondary text-[12px] font-medium max-w-md">
            Padronize a comunicação da sua equipe com modelos de mensagens dinâmicos.
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
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
          <span className="material-symbols-outlined text-[48px] text-white/5 mb-4">description</span>
          <p className="text-secondary font-black uppercase tracking-[0.3em] text-[10px]">Nenhum modelo cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map(template => {
            const config = CANAL_CONFIG[template.canal] || CANAL_CONFIG.WHATSAPP
            return (
              <div 
                key={template.id}
                className="group relative bg-[#1A1A1A]/40 border border-white/[0.05] p-6 rounded-2xl hover:border-[#F97316]/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="p-2.5 rounded-xl border border-white/5"
                    style={{ color: config.color, backgroundColor: `${config.color}10` }}
                  >
                    <span className="material-symbols-outlined text-[20px]">{config.icon}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenDialog(template)}
                      className="p-2 text-secondary hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm("Deseja realmente excluir este modelo?")) deleteMutation.mutate(template.id)
                      }}
                      className="p-2 text-secondary hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
                
                <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 truncate">
                  {template.nome}
                </h3>
                <p className="text-[11px] text-secondary font-medium line-clamp-3 leading-relaxed italic">
                  "{template.conteudo}"
                </p>

                <div className="mt-6 pt-4 border-t border-white/[0.03] flex items-center justify-between">
                  <span className="text-[9px] font-mono font-black text-secondary uppercase tracking-widest">
                    {config.label}
                  </span>
                  <div className="flex gap-1">
                    {template.variaveis.slice(0, 2).map(v => (
                      <span key={v} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] font-mono text-secondary">
                        {v}
                      </span>
                    ))}
                    {template.variaveis.length > 2 && (
                      <span className="text-[8px] font-mono text-secondary">+{template.variaveis.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tight">
              {editingTemplate?.id ? "Editar Modelo" : "Novo Modelo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-mono font-black text-secondary uppercase tracking-[0.3em]">Nome do Modelo</label>
                <Input 
                  className="bg-white/5 border-white/10 h-12 rounded-xl px-4"
                  value={editingTemplate?.nome}
                  onChange={e => setEditingTemplate({ ...editingTemplate, nome: e.target.value })}
                  placeholder="Ex: Saudação Inicial"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-mono font-black text-secondary uppercase tracking-[0.3em]">Canal</label>
                <select
                  className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 outline-none focus:border-[#F97316]/50"
                  value={editingTemplate?.canal}
                  onChange={e => setEditingTemplate({ ...editingTemplate, canal: e.target.value })}
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="EMAIL">E-mail</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-mono font-black text-secondary uppercase tracking-[0.3em]">Conteúdo da Mensagem</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => insertVariable("nome")}
                    className="px-2 py-1 bg-[#F97316]/10 text-[#F97316] text-[8px] font-black uppercase rounded hover:bg-[#F97316]/20 transition-all"
                  >
                    + Nome
                  </button>
                  <button 
                    onClick={() => insertVariable("empresa")}
                    className="px-2 py-1 bg-[#F97316]/10 text-[#F97316] text-[8px] font-black uppercase rounded hover:bg-[#F97316]/20 transition-all"
                  >
                    + Empresa
                  </button>
                </div>
              </div>
              <Textarea 
                className="bg-white/5 border-white/10 min-h-[160px] rounded-2xl p-4 leading-relaxed resize-none"
                value={editingTemplate?.conteudo}
                onChange={e => setEditingTemplate({ ...editingTemplate, conteudo: e.target.value })}
                placeholder="Escreva sua mensagem aqui... Use {{nome}} para personalizar."
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-secondary hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-[#F97316] hover:bg-[#FB923C] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#F97316]/20 transition-all disabled:opacity-50"
            >
              {saveMutation.isPending ? "SALVANDO..." : "SALVAR MODELO"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
