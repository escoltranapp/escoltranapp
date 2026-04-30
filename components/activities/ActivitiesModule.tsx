"use client"

import { Component, type ReactNode, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { isToday } from "date-fns"
import { ActivityList } from "@/components/activities/ActivityList"
import { ActivityCalendar } from "@/components/activities/ActivityCalendar"
import { ActivityDialog } from "@/components/activities/ActivityDialog"

// ─── Real React Error Boundary (must be a class component) ──────────────────
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, message: "" }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message ?? "Erro desconhecido" }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 bg-red-950/20 border border-red-500/50 rounded-3xl text-center">
          <h2 className="text-xl font-black text-red-500 uppercase tracking-tighter mb-4">
            Falha no Módulo de Atividades
          </h2>
          <p className="text-xs font-mono text-red-400/70 break-all">{this.state.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-500 text-white font-black text-[10px] uppercase rounded-lg"
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

type ViewMode = "list" | "calendar"

// ─── Main Module (client-only, no SSR) ──────────────────────────────────────
// ─── Main Module (client-only, no SSR) ──────────────────────────────────────
function ActivitiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("OPEN")
  const [typeFilter, setTypeFilter] = useState("ALL")

  // Detect query params changes
  useEffect(() => {
    if (!searchParams) return
    const s = searchParams.get("status")
    const t = searchParams.get("type")
    const isNew = searchParams.get("new") === "true"
    
    if (s) setStatusFilter(s)
    if (t) setTypeFilter(t)
    if (isNew) setIsDialogOpen(true)
  }, [searchParams])

  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ["activities", statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter)
      const res = await fetch(`/api/activities${params.toString() ? `?${params.toString()}` : ""}`)
      if (!res.ok) return []
      const data = await res.json()
      if (!Array.isArray(data)) return []
      if (typeFilter && typeFilter !== "ALL") {
        return data.filter((a: any) => a?.tipo === typeFilter)
      }
      return data
    },
  })

  const activities = Array.isArray(activitiesData) ? activitiesData : []
  
  const todayCount = activities.filter(a => {
    const d = a.dueAt ? new Date(a.dueAt) : null
    return a.status === "OPEN" && d && isToday(d)
  }).length

  const pendingCount = activities.filter(a => a.status === "OPEN").length

  const openNew = () => {
    setEditingActivity(null)
    setIsDialogOpen(true)
  }

  const openEdit = (activity: any) => {
    setEditingActivity(activity)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* HEADER - NEW DESIGN FROM SCREENSHOT */}
      <div className="px-10 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white tracking-tight">Atividades</h1>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-[#F97316]/20 text-[#F97316] text-[10px] font-black uppercase tracking-wider border border-[#F97316]/20">
                {todayCount} para hoje
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 text-secondary text-[10px] font-black uppercase tracking-wider border border-white/5">
                {pendingCount} pendentes
              </div>
            </div>
          </div>

          <button
            onClick={openNew}
            className="bg-[#F97316] hover:bg-[#FB923C] text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nova Atividade
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="relative group">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#1A1A1A] border border-white/5 rounded-xl px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-[#F97316]/50 transition-all appearance-none pr-12 min-w-[150px]"
                >
                  <option value="OPEN">Pendentes</option>
                  <option value="DONE">Concluídas</option>
                  <option value="ALL">Todas</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">expand_more</span>
             </div>

             <div className="relative group">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-[#1A1A1A] border border-white/5 rounded-xl px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-[#F97316]/50 transition-all appearance-none pr-12 min-w-[150px]"
                >
                  <option value="ALL">Todos</option>
                  <option value="CALL">Ligações</option>
                  <option value="MEETING">Reuniões</option>
                  <option value="TASK">Tarefas</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="NOTE">Notas</option>
                  <option value="EMAIL">Email</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">expand_more</span>
             </div>
          </div>

          <div className="flex p-1 bg-[#1A1A1A] border border-white/5 rounded-xl">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                viewMode === "list" ? "bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20" : "text-secondary hover:text-white"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                viewMode === "calendar" ? "bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20" : "text-secondary hover:text-white"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-10 custom-scrollbar space-y-8 pb-10">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#F97316]/20 border-t-[#F97316] rounded-full animate-spin" />
          </div>
        ) : viewMode === "list" ? (
          <ActivityList activities={activities} onEdit={openEdit} />
        ) : (
          <ActivityCalendar activities={activities} onEdit={openEdit} />
        )}
      </div>

      <ActivityDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingActivity(null)
            if (
              searchParams?.get("new") ||
              searchParams?.get("contact_id") ||
              searchParams?.get("deal_id")
            ) {
              router.replace("/activities")
            }
          }
        }}
        activity={editingActivity}
      />
    </div>
  )
}

export default function ActivitiesModule() {
  return (
    <ErrorBoundary>
      <ActivitiesContent />
    </ErrorBoundary>
  )
}
