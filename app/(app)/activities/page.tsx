"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckSquare, Phone, Calendar, FileText, MessageCircle, Mail, Plus, Search, Check, Clock, CheckCircle2, AlertTriangle, Zap, LayoutGrid, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function CRMMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "#2563eb"
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  iconColor?: string
}) {
  return (
    <div className="crm-metric-card animate-aether">
      <div className="crm-metric-icon-box" style={{ color: iconColor }}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-white/30">{title}</h4>
        <div className="text-[28px] font-black tracking-tight text-white">{value}</div>
        <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  )
}

interface Activity {
  id: string; tipo: string; status: "OPEN" | "DONE";
  titulo: string; descricao?: string | null; dueAt?: string | null; createdAt: string;
  contact?: { nome: string; sobrenome?: string | null } | null;
}

const typeConfig: Record<string, any> = {
  CALL: { icon: Phone, label: "LIGAÇÃO", color: "#60a5fa" },
  MEETING: { icon: Calendar, label: "REUNIÃO", color: "#a855f7" },
  TASK: { icon: CheckSquare, label: "TAREFA", color: "#f59e0b" },
  NOTE: { icon: FileText, label: "NOTA", color: "#94a3b8" },
  WHATSAPP: { icon: MessageCircle, label: "WHATSAPP", color: "#4ade80" },
  EMAIL: { icon: Mail, label: "EMAIL", color: "#f87171" },
}

export default function ActivitiesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "OPEN" | "DONE">("all")

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["activities", filter],
    queryFn: async () => {
      const p = new URLSearchParams(); if (filter !== "all") p.set("status", filter)
      const res = await fetch(`/api/activities?${p}`)
      return res.json()
    },
    staleTime: 15_000,
  })

  const validatedActivities = Array.isArray(activities) ? activities : []

  const toggleDone = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "OPEN" | "DONE" }) => {
      await fetch(`/api/activities/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    },
    onSuccess: () => { toast({ title: "Status Atualizado" }); queryClient.invalidateQueries({ queryKey: ["activities"] }) },
  })

  const filtered = validatedActivities.filter(a => a.titulo.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-aether space-y-10 pb-12">
      
      {/* CRM Global Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20">
              <CheckCircle size={20} />
           </div>
           <div>
              <h1 className="crm-header-title">Atividades</h1>
              <p className="crm-header-subtitle">Gestão de Tarefas e Agendamentos</p>
           </div>
        </div>

        <button className="btn-glow-blue ml-2">
           <Plus size={18} strokeWidth={3} /> Registrar
        </button>
      </header>

      {/* Unified Control Bar */}
      <div className="space-y-6">
         <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-blue-500 transition-colors" />
            <input 
              placeholder="Localizar atividade no fluxo..." 
              className="crm-search-input focus:outline-none focus:border-blue-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         <div className="h-[68px] bg-white/[0.02] border border-white/5 rounded-2xl px-6 flex items-center">
            <div className="flex items-center gap-2">
               {(["all", "OPEN", "DONE"] as const).map(p => (
                 <button 
                  key={p} 
                  onClick={() => setFilter(p)}
                  className={cn("filter-pill", filter === p ? "active" : "text-white/20 hover:text-white/40")}
                 >
                   {p === "all" ? "GERAL" : p === "OPEN" ? "PENDENTES" : "CONCLUÍDAS"} 
                   <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-md", filter === p ? "bg-white/20" : "bg-white/5")}>
                     {p === "all" ? validatedActivities.length : validatedActivities.filter(a => a.status === p).length}
                   </span>
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* KPI Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CRMMetricCard title="Total Pendentes" value={validatedActivities.filter(a => a.status === 'OPEN').length} subtitle="Ações Necessárias" icon={Clock} iconColor="#3b82f6" />
        <CRMMetricCard title="Calls Hoje" value={validatedActivities.filter(a => a.tipo === 'CALL').length} subtitle="Prospecção Ativa" icon={Phone} iconColor="#60a5fa" />
        <CRMMetricCard title="Finalizadas" value={validatedActivities.filter(a => a.status === 'DONE').length} subtitle="Eficiência Operacional" icon={CheckCircle2} iconColor="#10b981" />
        <CRMMetricCard title="Em Atraso" value="02" subtitle="Requer Atenção" icon={AlertTriangle} iconColor="#ef4444" />
      </div>

      {/* Reference Table UI */}
      <div className="aether-card bg-transparent border-none">
        <table className="w-full">
          <thead>
            <tr className="crm-table-header">
              <th className="text-left pl-0">Operação</th>
              <th className="text-center">Natureza</th>
              <th className="text-left">Protocolo</th>
              <th className="text-center">Status</th>
              <th className="text-right pr-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {isLoading ? (
               [...Array(5)].map((_, i) => <tr key={i} className="h-24 animate-pulse bg-white/5"><td colSpan={5} /></tr>)
            ) : filtered.length === 0 ? (
               <tr><td colSpan={5} className="text-center py-32 text-white/5 font-black uppercase tracking-widest text-[11px]">Nenhuma atividade localizada no cluster</td></tr>
            ) : filtered.map((act) => {
              const cfg = typeConfig[act.tipo] || typeConfig.TASK
              const Icon = cfg.icon
              return (
                <tr key={act.id} className="crm-table-row group transition-all">
                  <td className="pl-0">
                    <div className="flex flex-col">
                      <span className={cn("font-bold text-[15px] transition-all uppercase", act.status === 'DONE' ? "text-white/15 line-through" : "text-white/90 group-hover:text-blue-400")}>{act.titulo}</span>
                      <span className="text-[10px] uppercase font-bold text-white/10 tracking-widest mt-0.5">{act.descricao || "Sem Detalhes Adicionais"}</span>
                    </div>
                  </td>
                  <td className="text-center">
                     <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] font-black" style={{ color: cfg.color }}>
                        <Icon size={12} /> {cfg.label}
                     </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-[10px] font-black text-white/10">
                         {act.contact?.nome?.[0] || '—'}
                       </div>
                       <span className="text-[11px] font-bold text-white/20 uppercase">{act.contact?.nome || 'Monitoramento Geral'}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <Badge variant={act.status === "DONE" ? "ativa" : "novo"} className="text-[9px] uppercase font-black px-4 py-1 tracking-widest">{act.status === "DONE" ? "Sincronizada" : "Pendente"}</Badge>
                  </td>
                  <td className="text-right pr-4">
                    <button 
                      className={cn("h-11 w-11 flex items-center justify-center rounded-2xl border transition-all shadow-inner", 
                        act.status === 'OPEN' ? "border-white/5 bg-white/5 text-white/10 hover:text-blue-500 hover:border-blue-500/40" : "border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                      )}
                      onClick={() => toggleDone.mutate({ id: act.id, status: act.status === "OPEN" ? "DONE" : "OPEN" })}
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
