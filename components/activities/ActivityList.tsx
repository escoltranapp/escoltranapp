"use client"

import { format, isToday, isTomorrow, isBefore, isAfter, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface ActivityListProps {
  activities: any[]
  onEdit: (activity: any) => void
}

const TYPE_CONFIG: Record<string, { label: string, icon: string, color: string, bg: string }> = {
  CALL: { label: 'Ligação', icon: 'call', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  MEETING: { label: 'Reunião', icon: 'groups', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.1)' },
  TASK: { label: 'Tarefa', icon: 'task_alt', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  NOTE: { label: 'Nota', icon: 'description', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)' },
  WHATSAPP: { label: 'WhatsApp', icon: 'chat', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' },
  EMAIL: { label: 'Email', icon: 'mail', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)' },
}

export function ActivityList({ activities, onEdit }: ActivityListProps) {
  const [mounted, setMounted] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Erro")
      return { data: await res.json(), previousStatus: status === "DONE" ? "OPEN" : "DONE" }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      
      const isDone = variables.status === "DONE"
      toast({
        title: isDone ? "ATIVIDADE CONCLUÍDA ✅" : "ATIVIDADE REABERTA 🔄",
        description: isDone ? "A tarefa foi movida para o histórico." : "A tarefa voltou para sua lista de pendências.",
        action: (
          <button 
            onClick={() => toggleMutation.mutate({ id: variables.id, status: data.previousStatus })}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
          >
            Desfazer
          </button>
        )
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/activities/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      toast({ title: "Atividade removida" })
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-28 bg-white/5 animate-pulse rounded-2xl" />)}
    </div>
  )

  const now = startOfDay(new Date())
  
  const safeDate = (dateStr: any) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
  }

  const groups = [
    { title: 'ATRASADAS', items: activities.filter(a => {
      const d = safeDate(a.dueAt)
      return a.status === "OPEN" && d && isBefore(d, now) && a.deal?.status !== "LOST"
    }), color: '#EF4444' },
    { title: 'HOJE', items: activities.filter(a => {
      const d = safeDate(a.dueAt)
      return a.status === "OPEN" && d && isToday(d) && a.deal?.status !== "LOST"
    }), color: '#F97316' },
    { title: 'AMANHÃ', items: activities.filter(a => {
      const d = safeDate(a.dueAt)
      return a.status === "OPEN" && d && isTomorrow(d) && a.deal?.status !== "LOST"
    }), color: '#F97316' },
    { title: 'PRÓXIMAS', items: activities.filter(a => {
      const d = safeDate(a.dueAt)
      return a.status === "OPEN" && d && isAfter(startOfDay(d), startOfDay(new Date(now.getTime() + 86400000))) && a.deal?.status !== "LOST"
    }), color: '#F97316' },
    { title: 'SEM DATA', items: activities.filter(a => a.status === "OPEN" && !safeDate(a.dueAt) && a.deal?.status !== "LOST"), color: '#404040' },
    { title: 'CONCLUÍDAS', items: activities.filter(a => a.status === "DONE" && a.deal?.status !== "LOST"), color: '#22C55E' },
    { title: 'NEGÓCIOS PERDIDOS', items: activities.filter(a => a.deal?.status === "LOST"), color: '#EF4444' },
  ].filter(g => g.items.length > 0)

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-[#1A1A1A]/20 border border-white/5 rounded-3xl border-dashed">
         <span className="material-symbols-outlined text-[64px] text-white/5 mb-6">inventory_2</span>
         <p className="text-secondary font-black uppercase tracking-[0.5em] text-[10px]">Silêncio por aqui...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-20">
      {groups.map((group) => (
        <div key={group.title} className="space-y-6">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">{group.title} ({group.items.length})</h3>
          </div>

          <div className="space-y-4">
            {group.items.map((item) => {
              const config = TYPE_CONFIG[item.tipo] || TYPE_CONFIG.TASK
              const d = safeDate(item.dueAt)
              
              return (
                <div 
                  key={item.id} 
                  className={cn(
                    "flex items-start gap-6 p-6 rounded-2xl border transition-all duration-300 group bg-[#1A1A1A]/30 border-white/[0.03] hover:border-white/10 hover:bg-[#1A1A1A]/50",
                    item.status === "DONE" && "opacity-50"
                  )}
                >
                  {/* CHECKBOX */}
                  <button 
                    onClick={() => toggleMutation.mutate({ id: item.id, status: item.status === "OPEN" ? "DONE" : "OPEN" })}
                    className={cn(
                      "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 hover:scale-110 active:scale-90 shadow-lg shadow-black/20",
                      item.status === "DONE" 
                        ? "bg-emerald-500 border-emerald-500 shadow-emerald-500/20" 
                        : "border-white/20 hover:border-[#F97316]/50 hover:bg-[#F97316]/5"
                    )}
                  >
                    {item.status === "DONE" ? (
                      <span className="material-symbols-outlined text-[16px] text-white font-black animate-in zoom-in duration-300">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px] text-white/0 group-hover:text-[#F97316]/40 transition-all font-black">check</span>
                    )}
                  </button>

                  {/* CONTENT */}
                  <div className="flex-1 space-y-4 min-w-0">
                    <div className="space-y-1">
                      {/* TYPE TAG */}
                      <div 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider mb-2"
                        style={{ backgroundColor: config.bg, color: config.color }}
                      >
                        <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
                        {config.label}
                      </div>

                      <h4 className={cn(
                        "text-[16px] font-black text-white tracking-tight leading-none uppercase",
                        item.status === "DONE" && "line-through text-secondary"
                      )}>
                        {item.titulo}
                      </h4>
                      <p className="text-[12px] text-secondary font-medium leading-relaxed max-w-4xl line-clamp-2 italic">
                        {item.descricao || "Sem descrição disponível"}
                      </p>
                    </div>

                    {/* METADATA */}
                    <div className="flex flex-wrap items-center gap-6">
                      <div className={cn(
                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-wider",
                        d && isBefore(d, now) && item.status === "OPEN" ? "text-red-500" : "text-[#F97316]"
                      )}>
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {d ? (isToday(d) ? `Hoje às ${format(d, "HH:mm")}` : isTomorrow(d) ? `Amanhã às ${format(d, "HH:mm")}` : format(d, "dd/MM 'às' HH:mm", { locale: ptBR })) : "Sem data"}
                      </div>

                      {item.contact && (
                        <div className="flex items-center gap-2 text-[10px] text-secondary font-black uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          {item.contact.nome}
                        </div>
                      )}

                      {item.deal && (
                        <div className="flex items-center gap-2 text-[10px] text-secondary font-black uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[16px]">business_center</span>
                          {item.deal.titulo}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="relative group/actions">
                    <button className="w-10 h-10 flex items-center justify-center text-secondary hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                    
                    <div className="absolute right-0 top-10 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl opacity-0 scale-95 group-hover/actions:opacity-100 group-hover/actions:scale-100 transition-all pointer-events-none group-hover/actions:pointer-events-auto z-50 overflow-hidden">
                      <button 
                        onClick={() => onEdit(item)}
                        className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider hover:bg-white/5 flex items-center gap-3"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Editar
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Deseja realmente excluir esta atividade?")) deleteMutation.mutate(item.id)
                        }}
                        className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider hover:bg-red-500/10 text-red-500 flex items-center gap-3 border-t border-white/5"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
