"use client"

import { useQuery } from "@tanstack/react-query"
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus,
  Filter,
  Users,
  Search,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Metric Card Enterprise-Grade ──────────────────────────
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
    <div className="crm-metric-card">
      <div className="crm-metric-icon-box" style={{ color: iconColor, backgroundColor: `${iconColor}15` }}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="space-y-0.5">
        <h4 className="label-upper">{title}</h4>
        <div className="value-main">{value}</div>
        <p className="sub-context">{subtitle}</p>
      </div>
    </div>
  )
}

interface ActivityItem {
  id: string; titulo: string; data: string; status: string; tipo: string;
  contact?: { nome: string };
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

  const validatedActivities = Array.isArray(activities) ? activities : []

  return (
    <div className="animate-aether space-y-7">
      
      {/* Page Header (Regra 8) */}
      <header className="flex items-center justify-between">
        <div>
           <div className="page-header-context flex items-center gap-2">
              <Sparkles size={10} /> OPERATIONAL LOG
           </div>
           <h1 className="page-title-h1">Atividades</h1>
           <p className="page-subtitle-desc">Relatório cronológico de interações e tarefas pendentes</p>
        </div>

        <button className="btn-cta-primary flex items-center gap-2">
          <Plus size={18} /> Nova Atividade
        </button>
      </header>

      {/* KPI Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CRMMetricCard title="Compromissos Hoje" value="12" subtitle="3 reuniões críticas" icon={CalendarDays} iconColor="#3b82f6" />
        <CRMMetricCard title="Média de Resposta" value="14m" subtitle="Time-to-close estável" icon={Clock} iconColor="#60a5fa" />
        <CRMMetricCard title="Concluídas" value="84" subtitle="Eficiência de 92%" icon={CheckCircle2} iconColor="#10b981" />
        <CRMMetricCard title="Atrasos" value="02" subtitle="Risco de churn baixo" icon={AlertCircle} iconColor="#ef4444" />
      </div>

      {/* Control Layer */}
      <div className="flex bg-white/5 border border-white/10 p-2 rounded-xl gap-2">
         <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
            <input placeholder="Filtrar eventos..." className="w-full bg-transparent h-10 pl-9 pr-4 text-[13px] border-none focus:outline-none" />
         </div>
         <button className="h-10 px-4 flex items-center gap-2 text-[11px] font-bold uppercase text-white/40 hover:text-white transition-all">
            <Filter size={14} /> Filtros Avançados
         </button>
      </div>

      {/* Enterprise Table (Regra 6) */}
      <div className="crm-metric-card p-0 overflow-hidden border-none shadow-2xl">
        <table className="w-full">
          <thead>
            <tr className="crm-table-header">
              <th className="text-left pl-7">Evento / Tarefa</th>
              <th className="text-left">Responsável / Lead</th>
              <th className="text-center">Tipo</th>
              <th className="text-center">Data / Hora</th>
              <th className="text-right pr-7">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {isLoading ? (
               [...Array(6)].map((_, i) => <tr key={i} className="h-16 animate-pulse bg-white/5"><td colSpan={5} /></tr>)
            ) : validatedActivities.map((act) => (
              <tr key={act.id} className="crm-table-row group">
                <td className="pl-7">
                   <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-white group-hover:text-blue-400 transition-colors uppercase">{act.titulo}</span>
                      <span className="text-[11px] font-medium text-white/30 uppercase tracking-tight">{act.tipo} Interno</span>
                   </div>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="crm-avatar bg-white/5 text-white/40">
                      {act.contact?.nome?.[0] || "U"}
                    </div>
                    <span className="text-[13px] font-medium text-white/60">{act.contact?.nome || "Sistema"}</span>
                  </div>
                </td>
                <td className="text-center">
                   <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{act.tipo}</span>
                </td>
                <td className="text-center">
                   <span className="text-[12px] font-bold text-white/60">{new Date(act.data).toLocaleDateString()}</span>
                </td>
                <td className="text-right pr-7">
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
