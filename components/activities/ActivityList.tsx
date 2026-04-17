"use client"

import { format, isToday, isTomorrow, isBefore, isAfter, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
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
  MEETING: '#8B5CF6',
  TASK: '#F59E0B',
  NOTE: '#6B7280',
  WHATSAPP: '#22C55E',
  EMAIL: '#EC4899',
}

export function ActivityList({ activities, onEdit }: ActivityListProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Erro ao atualizar status")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/activities/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao excluir")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      toast({ title: "Atividade excluída" })
    }
  })

  const now = startOfDay(new Date())
  
  const groups = [
    { title: 'Atrasadas', items: activities.filter(a => a.status === "OPEN" && a.dueAt && isBefore(new Date(a.dueAt), now)), color: '#EF4444' },
    { title: 'Para Hoje', items: activities.filter(a => a.status === "OPEN" && a.dueAt && isToday(new Date(a.dueAt))), color: '#3B82F6' },
    { title: 'Amanhã', items: activities.filter(a => a.status === "OPEN" && a.dueAt && isTomorrow(new Date(a.dueAt))), color: '#F59E0B' },
    { title: 'Próximas', items: activities.filter(a => a.status === "OPEN" && a.dueAt && isAfter(startOfDay(new Date(a.dueAt)), startOfDay(new Date(now.getTime() + 86400000)))), color: '#8B5CF6' },
    { title: 'Sem Data', items: activities.filter(a => a.status === "OPEN" && !a.dueAt), color: '#6B7280' },
    { title: 'Concluídas', items: activities.filter(a => a.status === "DONE"), color: '#22C55E' },
  ].filter(g => g.items.length > 0)

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-surface border border-border rounded-[32px] border-dashed">
         <span className="material-symbols-outlined text-[48px] text-secondary mb-4 opacity-20">inventory_2</span>
         <p className="text-secondary font-black uppercase tracking-widest text-[11px]">Nenhuma atividade registrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <div key={group.title} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 mb-6 ml-2">
            <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: group.color }} />
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-foreground italic">{group.title}</h3>
            <span className="text-[10px] font-mono text-secondary px-2 border border-border rounded-full">{group.items.length}</span>
          </div>

          <div className="bg-surface border border-border rounded-[28px] overflow-hidden shadow-2xl">
            {group.items.map((item, i) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex items-center gap-6 p-6 border-b border-border hover:bg-foreground/[0.02] transition-all group",
                  i === group.items.length - 1 && "border-b-0",
                  item.status === "DONE" && "opacity-60"
                )}
              >
                {/* STATUS CHECKBOX */}
                <button 
                  onClick={() => toggleMutation.mutate({ id: item.id, status: item.status === "OPEN" ? "DONE" : "OPEN" })}
                  className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    item.status === "DONE" 
                      ? "bg-primary border-primary text-white" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {item.status === "DONE" && <span className="material-symbols-outlined text-[16px] font-black">check</span>}
                </button>

                {/* ICON */}
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${TYPE_COLORS[item.tipo]}15`, border: `1px solid ${TYPE_COLORS[item.tipo]}30` }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ color: TYPE_COLORS[item.tipo] }}>
                    {TYPE_ICONS[item.tipo]}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className={cn(
                      "text-[14px] font-bold text-foreground truncate italic",
                      item.status === "DONE" && "line-through"
                    )}>{item.titulo}</h4>
                    {item.dueAt && isBefore(new Date(item.dueAt), now) && item.status === "OPEN" && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[8px] font-black font-mono uppercase tracking-widest border border-red-500/20">Atrasado</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-[11px] text-secondary font-medium truncate max-w-[400px]">
                      {item.descricao || "Sem descrição..."}
                    </p>
                    {item.contact && (
                      <div className="flex items-center gap-1 text-[10px] text-primary font-black uppercase tracking-tighter">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        {item.contact.nome}
                      </div>
                    )}
                    {item.deal && (
                      <div className="flex items-center gap-1 text-[10px] text-[#A855F7] font-black uppercase tracking-tighter">
                        <span className="material-symbols-outlined text-[14px]">attach_money</span>
                        {item.deal.titulo}
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2">
                   <div className="text-right mr-4 hidden md:block">
                      <div className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest">
                        {item.dueAt ? format(new Date(item.dueAt), "HH:mm") : '--:--'}
                      </div>
                      <div className="text-[9px] font-bold text-secondary uppercase tracking-tighter">
                        {item.dueAt ? format(new Date(item.dueAt), "dd MMM", { locale: ptBR }) : 'Sem data'}
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border hover:border-primary/50 text-secondary hover:text-primary transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Deseja excluir esta atividade?")) deleteMutation.mutate(item.id)
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border hover:border-red-500/50 text-secondary hover:text-red-500 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
