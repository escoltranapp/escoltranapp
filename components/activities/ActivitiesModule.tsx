"use client"

import { Component, type ReactNode, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ActivityList } from "@/components/activities/ActivityList"
import { ActivityCalendar } from "@/components/activities/ActivityCalendar"
import { ActivityDialog } from "@/components/activities/ActivityDialog"
import { ActivityKPIs } from "@/components/activities/ActivityKPIs"

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
function ActivitiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("OPEN")
  const [typeFilter, setTypeFilter] = useState("ALL")

  // Read query params once on mount
  useEffect(() => {
    if (!searchParams) return
    const s = searchParams.get("status")
    const t = searchParams.get("type")
    if (s) setStatusFilter(s)
    if (t) setTypeFilter(t)
    if (searchParams.get("new") === "true") setIsDialogOpen(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* HEADER */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#0D0D0D]">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-1">
            <span className="text-primary underline decoration-primary/30">Módulo</span> Atividades
          </h1>
          <p className="text-[10px] font-mono text-secondary uppercase tracking-[0.4em] font-black">
            Operacional CRM &amp; Follow-ups
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-background border border-border rounded-xl">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === "list"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-secondary hover:text-foreground"
              )}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === "calendar"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-secondary hover:text-foreground"
              )}
            >
              Calendário
            </button>
          </div>

          <button
            onClick={openNew}
            className="bg-primary text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nova Atividade
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-surface/30">
        <div className="flex items-center gap-4">
          {(["OPEN", "DONE", "ALL"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all border",
                statusFilter === s
                  ? "bg-white text-black border-white"
                  : "text-secondary border-white/5 hover:border-white/20"
              )}
            >
              {s === "OPEN" ? "Pendentes" : s === "DONE" ? "Concluídas" : "Todas"}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-background border border-border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-secondary outline-none focus:border-primary transition-all"
        >
          <option value="ALL">Todos os Tipos</option>
          <option value="CALL">Ligações</option>
          <option value="MEETING">Reuniões</option>
          <option value="TASK">Tarefas</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="NOTE">Notas</option>
          <option value="EMAIL">Email</option>
        </select>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12">
        <ActivityKPIs activities={activities} />

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
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
