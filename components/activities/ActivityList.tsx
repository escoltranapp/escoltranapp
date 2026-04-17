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

const TYPE_ICONS: Record<string, string> = {
  CALL: 'call',
  MEETING: 'groups',
  TASK: 'task_alt',
  NOTE: 'description',
  WHATSAPP: 'chat',
  EMAIL: 'mail',
}

const TYPE_COLORS: Record<string, string> = {
  CALL: '#3B82F6',
  MEETING: '#A855F7',
  TASK: '#F59E0B',
  NOTE: '#94A3B8',
  WHATSAPP: '#22C55E',
  EMAIL: '#EC4899',
}

export function ActivityList({ activities, onEdit }: ActivityListProps) {
  const [mounted, setMounted] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-surface/50 animate-pulse rounded-[32px]" />)}</div>

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Erro")
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities"] })
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

  const now = startOfDay(new Date())
  
  const safeDate = (dateStr: any) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
  }

  const groups = [
    { title: 'Atrasadas', items: activities.filter(a => {
      const d = safeDate(a.dueAt)
      return a.status === "OPEN" && d && isBefore(d, now)
    }), color: '#EF4444' },
    { title: 'Para Hoje', items: activities.filter(a => {
      const d = safeDate(a.dueAt)
      return a.status === "OPEN" && d && isToday(d)
    }), color: '#FFB800' },
    { title: 'Amanhã', items: activities.filter(a => {
      const d = safeDate(a.dueAt)
      return a.status === "OPEN" && d && isTomorrow(d)
    }), color: '#F97316' },
    { title: 'Próximas', items: activities.filter(a => {
      const d = safeDate(a.dueAt)
      return a.status === "OPEN" && d && isAfter(startOfDay(d), startOfDay(new Date(now.getTime() + 86400000)))
    }), color: '#8B5CF6' },
    { title: 'Sem Data', items: activities.filter(a => a.status === "OPEN" && !safeDate(a.dueAt)), color: '#64748B' },
    { title: 'Concluídas', items: activities.filter(a => a.status === "DONE"), color: '#22C55E' },
  ].filter(g => g.items.length > 0)

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-[#0D0D0D] border border-white/5 rounded-[40px] border-dashed">
         <span className="material-symbols-outlined text-[64px] text-white/5 mb-6">inventory_2</span>
         <p className="text-secondary font-black uppercase tracking-[0.5em] text-[10px]">Silêncio por aqui...</p>
      </div>
    )
  }

  return (
    <div className="space-y-16 pb-20">
      {groups.map((group) => (
        <div key={group.title} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center gap-4 mb-8 ml-4">
            <div className="w-1.5 h-6 rounded-full shadow-lg" style={{ backgroundColor: group.color, boxShadow: `0 0 20px ${group.color}40` }} />
            <h3 className="text-[14px] font-black uppercase tracking-[0.4em] text-white/90 italic">{group.title}</h3>
            <span className="text-[10px] font-mono font-black text-secondary px-3 py-0.5 bg-white/5 border border-white/10 rounded-full">{group.items.length}</span>
          </div>

          <div className="space-y-4">
            {group.items.map((item, i) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex items-center gap-6 p-6 rounded-[32px] border transition-all duration-300 group relative overflow-hidden",
                  item.status === "DONE" 
                    ? "bg-black/40 border-white/5 opacity-50" 
                    : "bg-[#0D0D0D] border-white/5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-0.5"
                )}
              >
                {/* STATUS TOGGLE */}
                <button 
                  onClick={() => toggleMutation.mutate({ id: item.id, status: item.status === "OPEN" ? "DONE" : "OPEN" })}
                  className={cn(
                    "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 shrink-0",
                    item.status === "DONE" 
                      ? "bg-primary border-primary text-black" 
                      : "border-white/10 hover:border-primary/60 hover:bg-primary/5"
                  )}
                >
                  {item.status === "DONE" && <span className="material-symbols-outlined text-[18px] font-black">check</span>}
                  {item.status !== "DONE" && <div className="w-1.5 h-1.5 rounded-full bg-white/10 transition-all group-hover:bg-primary/40" />}
                </button>

                {/* ICON BLOCK */}
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shrink-0"
                  style={{ 
                    backgroundColor: `${TYPE_COLORS[item.tipo] || '#64748B'}15`, 
                    border: `1px solid ${TYPE_COLORS[item.tipo] || '#64748B'}30`,
                    boxShadow: `0 10px 30px -10px ${TYPE_COLORS[item.tipo] || '#64748B'}40`
                  }}
                >
                  <span className="material-symbols-outlined text-[24px] transition-all" style={{ color: TYPE_COLORS[item.tipo] || '#64748B' }}>
                    {TYPE_ICONS[item.tipo] || 'event'}
                  </span>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h4 className={cn(
                      "text-[16px] font-black text-white tracking-tight truncate uppercase leading-tight",
                      item.status === "DONE" && "text-secondary line-through"
                    )}>{item.titulo || "Sem Título"}</h4>
                    
                    {(() => {
                      const d = safeDate(item.dueAt)
                      if (d && isBefore(d, now) && item.status === "OPEN") {
                        return (
                          <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-[0.2em] border border-red-500/20">Atrasado</span>
                        )
                      }
                      return null
                    })()}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <p className="text-[12px] text-secondary font-bold truncate max-w-[500px] italic">
                      {item.descricao || "Sem detalhes adicionais..."}
                    </p>
                    
                    <div className="flex items-center gap-4 border-l border-white/5 pl-4 ml-2">
                      {item.contact && (
                        <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-tighter hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-[15px]">person</span>
                          {item.contact?.nome}
                        </div>
                      )}
                      {item.deal && (
                        <div className="flex items-center gap-2 text-[10px] text-[#A855F7] font-black uppercase tracking-tighter hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-[15px]">attach_money</span>
                          {item.deal?.titulo}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* INFO & ACTIONS */}
                <div className="flex items-center gap-8 shrink-0">
                   <div className="text-right border-r border-white/5 pr-8 hidden lg:block">
                      <div className="text-[12px] font-mono font-black text-white italic tracking-tighter">
                        {(() => {
                           const d = safeDate(item.dueAt)
                           return d ? format(d, "HH:mm") : '--:--'
                        })()}
                      </div>
                      <div className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mt-1">
                        {(() => {
                           const d = safeDate(item.dueAt)
                           if (!d) return 'Sem data'
                           if (isToday(d)) return 'Hoje'
                           if (isTomorrow(d)) return 'Amanhã'
                           return format(d, "dd/MM", { locale: ptBR })
                        })()}
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={() => onEdit(item)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 hover:border-primary/50 text-white transition-all hover:scale-110 active:scale-90"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Confirmar exclusão?")) deleteMutation.mutate(item.id)
                        }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 hover:border-red-500/50 text-white/50 hover:text-red-500 transition-all hover:scale-110 active:scale-90"
                        title="Deletar"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                   </div>
                </div>

                {/* AMBIENT LIGHT DECORATION */}
                {item.status !== "DONE" && (
                   <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
