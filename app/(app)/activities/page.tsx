"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

function KPICard({
  label, value, icon, trend, color = "#ffc880"
}: {
  label: string; value: string | number; icon: string; trend?: string; color?: string
}) {
  return (
    <div className="bg-surface-container border border-white/5 rounded-2xl p-6 hover:bg-surface-container-high transition-all group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
        </div>
        {trend && (
           <div className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-amber-500 bg-amber-500/10">
              {trend}
           </div>
        )}
      </div>
      <div className="space-y-1">
         <div className="text-2xl font-bold text-white tracking-tight font-mono">{value}</div>
         <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">{label}</div>
      </div>
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
      if (!res.ok) throw new Error("Falha ao criar atividade")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Atividade criada!" })
      setShowNew(false)
      setForm(emptyForm)
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
    onError: (err: Error) => toast({ variant: "destructive", title: err.message }),
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
    onError: () => toast({ variant: "destructive", title: "Erro ao atualizar atividade" }),
  })

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      
      {/* HEADER ESCOLTRAN */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-[32px] font-bold text-white tracking-tight">Atividades</h1>
          <p className="text-slate-500 text-[14px] mt-1">Relatório cronológico de interações e tarefas operacionais</p>
        </div>
        
        <button
          onClick={() => setShowNew(true)}
          className="bg-amber-500 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-amber-500/10 text-[12px] uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[20px] font-bold">add_task</span>
          <span>Nova Atividade</span>
        </button>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         <KPICard label="Total Log" value={activities.length} icon="history" trend="Sincronizado" color="#ffc880" />
         <KPICard label="Ações Pendentes" value={open} icon="pending_actions" trend="Flow Active" color="#f5a623" />
         <KPICard label="Concluídas" value={done} icon="task_alt" trend="Success Rate" color="#7ae982" />
         <KPICard label="Críticos / SLA" value={activities.filter(a => a.status === "OPEN" && a.dueAt && new Date(a.dueAt) < new Date()).length} icon="notification_important" trend="Critical" color="#ffb4ab" />
      </div>

      {/* TABELA ESCOLTRAN */}
      <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden">
         <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">Event Log Cluster</div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-surface-container-low/50">
                     <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5 font-mono">Evento / Tarefa</th>
                     <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5 font-mono">Tipo</th>
                     <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5 font-mono">Data / Hora</th>
                     <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5 font-mono">Status Operacional</th>
                  </tr>
               </thead>
               <tbody>
                  {isLoading ? (
                     [...Array(6)].map((_, i) => <tr key={i} className="h-16 animate-pulse opacity-50 border-b border-white/5"><td colSpan={4} className="px-6 bg-surface-container-high/20" /></tr>)
                  ) : activities.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="py-24 text-center opacity-20">
                           <span className="material-symbols-outlined text-[64px]">history_edu</span>
                           <div className="font-mono text-[11px] uppercase tracking-widest font-bold mt-4">Dataset Operacional Vazio</div>
                        </td>
                     </tr>
                  ) : activities.map((act) => (
                     <tr key={act.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-5 border-b border-white/[0.03]">
                           <div className="font-bold text-white text-[14px]">{act.titulo}</div>
                           <div className="text-[10px] text-slate-500 uppercase font-mono mt-1 tracking-widest">Node-ID: {act.id.slice(0, 8)}</div>
                        </td>
                        <td className="px-6 py-5 border-b border-white/[0.03]">
                           <div className="inline-flex px-3 py-1 bg-surface-container-high border border-white/5 rounded text-[10px] font-bold uppercase text-slate-400 font-mono">
                              {act.tipo || 'General Log'}
                           </div>
                        </td>
                        <td className="px-6 py-5 border-b border-white/[0.03]">
                           <div className="text-[13px] font-mono text-white/70 font-bold">
                              {isClient && act.dueAt ? new Date(act.dueAt).toLocaleDateString("pt-BR") : "—"}
                           </div>
                        </td>
                        <td className="px-6 py-5 border-b border-white/[0.03] text-right">
                           <button
                             onClick={() => toggleStatus.mutate({ id: act.id, status: act.status })}
                             disabled={toggleStatus.isPending}
                             className={cn(
                               "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all",
                               act.status === 'DONE'
                                 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                 : "bg-surface-container-high text-slate-500 border border-white/5 hover:border-amber-500/50 hover:text-white"
                             )}
                           >
                              <div className={cn("w-2 h-2 rounded-full", act.status === 'DONE' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,166,35,0.4)]" : "bg-slate-700")} />
                              {act.status === 'DONE' ? 'Concluída' : 'Pendente'}
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* MODAL NOVA ATIVIDADE */}
      {showNew && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowNew(false)}>
           <div className="bg-surface-container border border-white/10 rounded-2xl p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-8 mb-6 uppercase tracking-tight">Registar Atividade</h2>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Título do Evento *</label>
                    <input
                      placeholder="Ex: Call de Qualificação"
                      value={form.titulo}
                      onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-xl h-11 px-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Tipo</label>
                       <select
                         value={form.tipo}
                         onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                         className="w-full bg-surface-container-lowest border border-white/10 rounded-xl h-11 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                       >
                         {tipoOptions.map(t => <option key={t} value={t} className="bg-surface-container-high">{t}</option>)}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Prazo (SLA)</label>
                       <input
                         type="datetime-local"
                         value={form.dueAt}
                         onChange={e => setForm(p => ({ ...p, dueAt: e.target.value }))}
                         className="w-full bg-surface-container-lowest border border-white/10 rounded-xl h-11 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Contexto Analítico</label>
                    <textarea
                      placeholder="Detalhes da interação..."
                      value={form.descricao}
                      onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                      rows={3}
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-4 text-sm text-white resize-none focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                 </div>
              </div>

              <div className="flex gap-4 mt-10">
                 <button onClick={() => setShowNew(false)} className="flex-1 h-12 bg-surface-container-high text-slate-400 font-bold py-3 rounded-xl text-[11px] uppercase tracking-widest">Abortar</button>
                 <button
                   onClick={() => createActivity.mutate()}
                   disabled={createActivity.isPending || !form.titulo.trim()}
                   className="flex-1 h-12 bg-amber-500 text-black font-bold py-3 rounded-xl text-[11px] uppercase tracking-widest shadow-lg shadow-amber-500/20 disabled:opacity-40"
                 >
                   Sincronizar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
