"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, Clock, CheckCircle2, AlertCircle, Plus, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

function KPICard({
  label, value, subtext, icon: Icon, trend, color = "var(--accent-primary)"
}: {
  label: string; value: string | number; subtext: string; icon: React.ElementType; trend?: string; color?: string
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-container" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={20} />
      </div>
      <div className="kpi-label-row">
        <span className="kpi-label">{label}</span>
        {trend && (
           <span className={cn("kpi-trend", trend.includes('+') ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
              {trend}
           </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-subtext">{subtext}</div>
    </div>
  )
}

interface ActivityItem {
  id: string; titulo: string; descricao?: string; dueAt?: string; status: string; tipo: string;
}

const tipoOptions = ["CALL", "MEETING", "TASK", "NOTE", "WHATSAPP", "EMAIL"]
const emptyForm = { titulo: "", tipo: "TASK", descricao: "", dueAt: "" }

export default function ActivitiesPage() {
  const queryClient = useQueryClient()
  const [isClient, setIsClient] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { setIsClient(true) }, [])

  const { data: activitiesData, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await fetch("/api/activities")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 20_000,
  })

  const activities = Array.isArray(activitiesData) ? activitiesData : []
  const done = activities.filter(a => a.status === "DONE").length
  const open = activities.filter(a => a.status === "OPEN").length

  const createActivity = useMutation({
    mutationFn: async () => {
      if (!form.titulo.trim()) throw new Error("Título é obrigatório")
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          tipo: form.tipo,
          descricao: form.descricao || undefined,
          dueAt: form.dueAt || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Falha ao criar atividade")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Atividade criada!" })
      setShowNew(false)
      setForm(emptyForm)
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: err.message })
    },
  })

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "DONE" ? "OPEN" : "DONE"
      const res = await fetch(`/api/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro ao atualizar atividade" })
    },
  })

  return (
    <div className="page-container animate-aether">

      {/* HEADER */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <CalendarDays size={12} /> OPERATIONAL LOG
          </div>
          <h1 className="page-title-h1">Atividades</h1>
          <p className="page-subtitle">Relatório cronológico de interações e tarefas pendentes</p>
        </div>
        <button className="btn-cta-primary flex items-center gap-2" onClick={() => setShowNew(true)}>
           <Plus size={18} /> Nova Atividade
        </button>
      </header>

      {/* KPI CARDS */}
      <div className="kpi-grid">
         <KPICard label="Total" value={activities.length} subtext="Todas as atividades" icon={CalendarDays} color="#d4af37" />
         <KPICard label="Pendentes" value={open} subtext="Ações abertas" icon={Clock} color="#f59e0b" />
         <KPICard label="Concluídas" value={done} subtext="Finalizadas com sucesso" icon={CheckCircle2} trend={activities.length > 0 ? `+${Math.round((done / activities.length) * 100)}%` : ""} color="#10b981" />
         <KPICard label="Atrasos" value={activities.filter(a => a.status === "OPEN" && a.dueAt && new Date(a.dueAt) < new Date()).length} subtext="Fora do SLA" icon={AlertCircle} color="#ef4444" />
      </div>

      {/* TABELA */}
      <div className="enterprise-table-wrapper">
         <div className="table-header-label">Event Log Cluster</div>
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th>Evento / Tarefa</th>
                  <th>Tipo</th>
                  <th>Data / Hora</th>
                  <th className="text-right">Status</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  [...Array(6)].map((_, i) => <tr key={i} className="h-16 animate-pulse bg-white/5"><td colSpan={4} /></tr>)
               ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-white/20 text-sm">
                      Nenhuma atividade registrada. Crie a primeira acima.
                    </td>
                  </tr>
               ) : activities.map((act) => (
                  <tr key={act.id} className="enterprise-table-row">
                     <td>
                        <div className="font-bold text-white/90">{act.titulo}</div>
                        <div className="text-[10px] text-white/20 uppercase font-black mt-1">ID: {act.id.slice(0, 8)}</div>
                     </td>
                     <td>
                        <div className="inline-flex px-3 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] font-bold uppercase text-white/40">
                           {act.tipo || 'Log'}
                        </div>
                     </td>
                     <td>
                        <div className="text-[12px] font-bold text-white/60">
                           {isClient && act.dueAt ? new Date(act.dueAt).toLocaleDateString("pt-BR") : "—"}
                        </div>
                     </td>
                     <td className="text-right">
                        <button
                          onClick={() => toggleStatus.mutate({ id: act.id, status: act.status })}
                          disabled={toggleStatus.isPending}
                          className={cn(
                            "status-badge ml-auto flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity",
                            act.status === 'DONE'
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          )}
                        >
                           <span className={cn("dot", act.status === 'DONE' ? "bg-green-500" : "bg-amber-500")} />
                           {act.status === 'DONE' ? 'Concluída' : 'Pendente'}
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* MODAL NOVA ATIVIDADE */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-white">Nova Atividade</h2>
              <button onClick={() => setShowNew(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Título *</label>
                <input
                  placeholder="Ex: Ligar para o cliente"
                  value={form.titulo}
                  onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                  className="w-full bg-[#0a0c10] border border-white/5 rounded-lg h-10 px-3 text-[13px] text-white focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                  className="w-full bg-[#0a0c10] border border-white/5 rounded-lg h-10 px-3 text-[13px] text-white focus:outline-none focus:border-[#d4af37]/50"
                >
                  {tipoOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Data / Hora</label>
                <input
                  type="datetime-local"
                  value={form.dueAt}
                  onChange={e => setForm(p => ({ ...p, dueAt: e.target.value }))}
                  className="w-full bg-[#0a0c10] border border-white/5 rounded-lg h-10 px-3 text-[13px] text-white focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Descrição</label>
                <textarea
                  placeholder="Detalhes adicionais..."
                  value={form.descricao}
                  onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#0a0c10] border border-white/5 rounded-lg p-3 text-[13px] text-white resize-none focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowNew(false)} className="h-10 px-6 bg-white/5 border border-white/5 rounded-lg text-[11px] font-bold uppercase text-white/40 hover:text-white transition-all">
                Cancelar
              </button>
              <button
                onClick={() => createActivity.mutate()}
                disabled={createActivity.isPending || !form.titulo.trim()}
                className="h-10 px-6 btn-cta-primary text-[11px] font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {createActivity.isPending ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
