"use client"

import { useQuery } from "@tanstack/react-query"
import { CalendarDays, Clock, CheckCircle2, AlertCircle, Plus, Filter, Search, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Reusable Component: KPI Card Enterprise ───────────────────────
function KPICard({ 
  label, value, subtext, icon: Icon, trend, color = "var(--accent-blue)" 
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
  id: string; titulo: string; data: string; status: string; tipo: string;
}

export default function ActivitiesPage() {
  const { data: activities = [], isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await fetch("/api/activities")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 20_000,
  })

  return (
    <div className="page-container animate-aether">
      
      {/* 1. HEADER DE PÁGINA */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <CalendarDays size={12} /> OPERATIONAL LOG
          </div>
          <h1 className="page-title-h1">Atividades</h1>
          <p className="page-subtitle">Relatório cronológico de interações e tarefas pendentes</p>
        </div>
        <button className="btn-cta-primary flex items-center gap-2">
           <Plus size={18} /> Nova Atividade
        </button>
      </header>

      {/* 2. KPI CARDS */}
      <div className="kpi-grid">
         <KPICard label="Compromissos Hoje" value="12" subtext="Datasets prioritários" icon={CalendarDays} color="#3b82f6" />
         <KPICard label="Média de Resposta" value="14min" subtext="Time-to-action Flow" icon={Clock} color="#60a5fa" />
         <KPICard label="Concluídas" value="84" subtext="Eficiência de 92%" icon={CheckCircle2} trend="+4%" color="#10b981" />
         <KPICard label="Atrasos" value="02" subtext="Ações fora do SLA" icon={AlertCircle} color="#ef4444" />
      </div>

      {/* 3. TABELA ENTERPRISE */}
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
               ) : (activities || []).map((act) => (
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
                        <div className="text-[12px] font-bold text-white/60">{new Date(act.data).toLocaleDateString()}</div>
                        <div className="text-[10px] text-white/20 uppercase font-bold mt-1">Sincronizado</div>
                     </td>
                     <td className="text-right">
                        <div className={cn("status-badge ml-auto", 
                           act.status === 'DONE' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20")}>
                           <span className={cn("dot", act.status === 'DONE' ? "bg-green-500" : "bg-amber-500")} /> 
                           {act.status === 'DONE' ? 'Concluída' : 'Pendente'}
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  )
}
