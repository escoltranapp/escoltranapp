"use client"

import { useState, useEffect, Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ActivityList } from "@/components/activities/ActivityList"
import { ActivityCalendar } from "@/components/activities/ActivityCalendar"
import { ActivityDialog } from "@/components/activities/ActivityDialog"
import { ActivityKPIs } from "@/components/activities/ActivityKPIs"

type ViewMode = 'list' | 'calendar'

function ActivitiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")

  // Check query params to open dialog
  useEffect(() => {
    if (searchParams.get("new") === "true" || searchParams.get("contact_id") || searchParams.get("deal_id")) {
      setIsDialogOpen(true)
    }
  }, [searchParams])

  const { data: activities = [], isLoading, refetch } = useQuery({
    queryKey: ["activities", statusFilter, typeFilter],
    queryFn: async () => {
      let url = "/api/activities"
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.append("status", statusFilter)
      const res = await fetch(`${url}${params.toString() ? `?${params.toString()}` : ''}`)
      if (!res.ok) throw new Error("Erro ao carregar atividades")
      let data = await res.json()
      
      if (typeFilter !== "ALL") {
        data = data.filter((a: any) => a.tipo === typeFilter)
      }
      return data
    }
  })

  const openNew = () => {
    setEditingActivity(null)
    setIsDialogOpen(true)
  }

  const openEdit = (activity: any) => {
    setEditingActivity(activity)
    setIsDialogOpen(true)
  }

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter italic uppercase underline decoration-primary/30">Painel de Atividades Operacionais</h1>
          <p className="text-secondary text-[15px] mt-2 font-bold tracking-tight">Timeline Escoltran: Gestão de compromissos e produtividade</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-surface border border-border p-1 rounded-xl flex gap-1">
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-secondary hover:text-foreground"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                viewMode === 'calendar' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-secondary hover:text-foreground"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </button>
          </div>

          <button 
            onClick={openNew}
            className="bg-gradient-to-br from-primary to-orange-400 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20 text-[11px] uppercase tracking-[0.2em]"
          >
            <span className="material-symbols-outlined text-[20px]">add_task</span>
            <span>Novo Registro</span>
          </button>
        </div>
      </header>

      <ActivityKPIs activities={activities} />

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 flex gap-2">
           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="bg-surface border border-border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 text-foreground appearance-none min-w-[150px]"
           >
              <option value="ALL">Todos os Estados</option>
              <option value="OPEN">Pendentes</option>
              <option value="DONE">Concluídas</option>
           </select>

           <select 
             value={typeFilter}
             onChange={(e) => setTypeFilter(e.target.value)}
             className="bg-surface border border-border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 text-foreground appearance-none min-w-[150px]"
           >
              <option value="ALL">Todos os Tipos</option>
              <option value="CALL">Ligações</option>
              <option value="MEETING">Reuniões</option>
              <option value="TASK">Tarefas</option>
              <option value="NOTE">Notas</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">Emails</option>
           </select>
        </div>

        <button 
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl border border-border bg-surface text-secondary hover:text-primary transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <span className={cn("material-symbols-outlined text-[18px]", isLoading && "animate-spin")}>sync</span>
          Sincronizar
        </button>
      </div>

      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <ActivityList activities={activities} onEdit={openEdit} />
          ) : (
            <ActivityCalendar activities={activities} onEdit={openEdit} />
          )}
        </>
      )}

      <ActivityDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingActivity(null)
            if (searchParams.get("new") || searchParams.get("contact_id") || searchParams.get("deal_id")) {
                router.replace('/activities')
            }
          }
        }}
        activity={editingActivity}
      />
    </div>
  )
}

export default function ActivitiesPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <ActivitiesContent />
    </Suspense>
  )
}
