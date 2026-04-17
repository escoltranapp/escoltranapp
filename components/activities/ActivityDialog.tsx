"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"

interface ActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: any // For editing
}

const ACTIVITY_TYPES = [
  { value: 'CALL', label: 'Ligação', icon: 'call', color: '#3B82F6' },
  { value: 'MEETING', label: 'Reunião', icon: 'groups', color: '#8B5CF6' },
  { value: 'TASK', label: 'Tarefa', icon: 'task_alt', color: '#F59E0B' },
  { value: 'NOTE', label: 'Nota', icon: 'description', color: '#6B7280' },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: 'chat', color: '#22C55E' },
  { value: 'EMAIL', label: 'Email', icon: 'mail', color: '#EC4899' },
]

export function ActivityDialog({ open, onOpenChange, activity }: ActivityDialogProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  
  const [tipo, setTipo] = useState('TASK')
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [contactId, setContactId] = useState("")
  const [dealId, setDealId] = useState("")

  // Fetch contacts and deals for selection
  const { data: contactsRaw } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => fetch("/api/contacts").then(res => res.json())
  })

  const { data: dealsRaw } = useQuery({
    queryKey: ["deals"],
    queryFn: () => fetch("/api/deals").then(res => res.json())
  })

  const contacts = Array.isArray(contactsRaw) ? contactsRaw : []
  const deals = Array.isArray(dealsRaw) ? dealsRaw : []

  useEffect(() => {
    if (activity) {
      setTipo(activity.tipo)
      setTitulo(activity.titulo)
      setDescricao(activity.descricao || "")
      
      let safeDateStr = ""
      if (activity.dueAt) {
        try {
          const d = new Date(activity.dueAt)
          if (!isNaN(d.getTime())) {
            safeDateStr = d.toISOString().slice(0, 16)
          }
        } catch (e) {}
      }
      setDueAt(safeDateStr)
      
      setContactId(activity.contactId || "")
      setDealId(activity.dealId || "")
    } else {
      const qContactId = searchParams.get("contact_id")
      const qDealId = searchParams.get("deal_id")
      if (qContactId) setContactId(qContactId)
      if (qDealId) setDealId(qDealId)
      
      setTipo('TASK')
      setTitulo("")
      setDescricao("")
      setDueAt("")
    }
  }, [activity, open, searchParams])

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = activity ? `/api/activities/${activity.id}` : "/api/activities"
      const method = activity ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Erro ao salvar atividade")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      toast({ title: activity ? "Atividade atualizada" : "Atividade criada" })
      onOpenChange(false)
    },
    onError: () => {
      toast({ title: "Erro ao salvar", variant: "destructive" })
    }
  })

  const handleSave = () => {
    if (!titulo) return toast({ title: "Título é obrigatório", variant: "destructive" })
    mutation.mutate({ tipo, titulo, descricao, dueAt, contactId: contactId || null, dealId: dealId || null })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1A1A] border border-white/5 text-white max-w-2xl overflow-hidden rounded-[32px] p-0 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F97316] to-transparent opacity-50" />
        
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-[32px]">
              {activity ? 'edit_note' : 'add_task'}
            </span>
            {activity ? 'Editar Atividade' : 'Nova Atividade'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 py-4 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* TYPE SELECTOR */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTipo(t.value)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-2 group",
                  tipo === t.value 
                    ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(249,115,22,0.1)] scale-105" 
                    : "bg-background border-border hover:border-primary/30"
                )}
              >
                <span className={cn(
                  "material-symbols-outlined text-[20px] transition-transform group-hover:scale-110",
                  tipo === t.value ? "text-primary" : "text-secondary"
                )} style={{ color: tipo === t.value ? t.color : undefined }}>
                  {t.icon}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-black text-secondary uppercase tracking-[0.2em] ml-1 italic">Título do Compromisso</label>
            <input 
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Follow-up de proposta"
              className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm font-bold text-foreground focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-secondary uppercase tracking-[0.2em] ml-1 italic">Agendamento</label>
              <input 
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm font-bold text-foreground focus:border-primary/50 outline-none transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-secondary uppercase tracking-[0.2em] ml-1 italic">Vincular Contato</label>
              <select 
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm font-bold text-foreground focus:border-primary/50 outline-none transition-all appearance-none"
              >
                <option value="">Nenhum contato</option>
                {contacts?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nome} {c.sobrenome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-black text-secondary uppercase tracking-[0.2em] ml-1 italic">Vincular Deal / Negócio</label>
            <select 
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm font-bold text-foreground focus:border-primary/50 outline-none transition-all appearance-none"
            >
              <option value="">Nenhum negócio vinculado</option>
              {deals?.map((d: any) => (
                <option key={d.id} value={d.id}>{d.titulo}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-black text-secondary uppercase tracking-[0.2em] ml-1 italic">Descrição e Notas</label>
            <textarea 
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="Detalhes adicionais sobre a atividade..."
              className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm font-bold text-foreground focus:border-primary/50 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-background/50 border-t border-border">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-3 rounded-xl text-secondary font-black uppercase tracking-widest text-[11px] hover:text-foreground transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="bg-gradient-to-br from-primary to-orange-400 text-white font-black px-8 py-3 rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20 text-[11px] uppercase tracking-[0.2em] disabled:opacity-50"
          >
            {mutation.isPending ? 'Salvando...' : 'Confirmar Registro'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
