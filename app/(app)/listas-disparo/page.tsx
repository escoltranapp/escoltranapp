"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Send, Plus, Play, Pause, StopCircle, Users, CheckCircle, XCircle, Clock, Trash2, Activity, TrendingUp, Sparkles, LayoutGrid, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

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

interface Lista {
  id: string; nome: string; status: string; totalLeads: number; enviados: number; falhos: number; createdAt: string;
}

export default function ListasDisparoPage() {
  const [showNew, setShowNew] = useState(false)

  const { data: listas = [], isLoading } = useQuery<Lista[]>({
    queryKey: ["listas-disparo"],
    queryFn: async () => {
      const res = await fetch("/api/listas-disparo")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 15_000,
  })

  const totalEnviados = listas.reduce((sum, l) => sum + l.enviados, 0)
  const totalLeads = listas.reduce((sum, l) => sum + l.totalLeads, 0)
  const taxaSucesso = totalLeads > 0 ? ((totalEnviados / totalLeads) * 100).toFixed(1) : "0"
  const emProgresso = listas.filter((l) => l.status === "EM_PROCESSAMENTO").length

  return (
    <div className="page-container animate-aether">
      
      {/* 1. HEADER DE PÁGINA */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <Send size={12} /> PROTOCOLOS DE COMUNICAÇÃO
          </div>
          <h1 className="page-title-h1">Disparo em Massa</h1>
          <p className="page-subtitle">Orquestração de campanhas massivas e automação de fluxos de saída</p>
        </div>
        <button className="btn-cta-primary flex items-center gap-2" onClick={() => setShowNew(true)}>
           <Plus size={18} /> Nova Lista
        </button>
      </header>

      {/* 2. KPI CARDS (Hierarquia Corrigida) */}
      <div className="kpi-grid">
         <KPICard label="Campanhas" value={listas.length} subtext="Dataset de disparos ativos" icon={Send} color="#3b82f6" />
         <KPICard label="Disparando" value={emProgresso} subtext="Execuções em tempo real" icon={Activity} color="#10b981" />
         <KPICard label="Total Leads" value={totalLeads} subtext="Contatos atingidos no cluster" icon={Users} color="#f59e0b" />
         <KPICard label="Taxa Flow" value={`${taxaSucesso}%`} subtext="Eficiência de entrega global" icon={TrendingUp} color="#a855f7" />
      </div>

      {/* 3. TABELA DE CAMPANHAS */}
      <div className="enterprise-table-wrapper">
         <div className="table-header-label">Campaign Overview</div>
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th>Campanha</th>
                  <th>Fase</th>
                  <th>Execution Pulse</th>
                  <th className="text-center">Volumetria</th>
                  <th className="text-right">Ações</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  [...Array(3)].map((_, i) => <tr key={i} className="h-16 animate-pulse bg-white/5"><td colSpan={5} /></tr>)
               ) : listas.length === 0 ? (
                  <tr>
                     <td colSpan={5}>
                        <div className="empty-state-container">
                           <Rocket className="empty-state-icon" style={{ opacity: 0.1 }} />
                           <div className="empty-state-title">Nenhuma campanha orquestrada</div>
                           <div className="empty-state-sub">Crie sua primeira lista de disparos para iniciar a operação</div>
                           <button className="btn-cta-primary mt-6 bg-white/10 hover:bg-white/20 text-white" onClick={() => setShowNew(true)}>Criar primeira lista</button>
                        </div>
                     </td>
                  </tr>
               ) : (
                  listas.map((lista) => {
                    const progress = lista.totalLeads > 0 ? ((lista.enviados + lista.falhos) / lista.totalLeads) * 100 : 0
                    return (
                      <tr key={lista.id} className="enterprise-table-row">
                        <td>
                          <div className="font-bold text-white/90">{lista.nome}</div>
                          <div className="text-[10px] text-white/20 uppercase font-black mt-1">ID: {lista.id.slice(0, 8)}</div>
                        </td>
                        <td>
                          <div className={cn("status-badge", 
                             lista.status === 'CONCLUIDA' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20")}>
                             <span className={cn("dot", lista.status === 'CONCLUIDA' ? "bg-green-500" : "bg-blue-500")} /> {lista.status}
                          </div>
                        </td>
                        <td className="w-48">
                           <div className="flex flex-col gap-2">
                              <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase">
                                 <span>{progress.toFixed(0)}%</span>
                                 <span>{lista.enviados} / {lista.totalLeads}</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="text-center font-mono text-[12px] text-white/40">{lista.totalLeads}</td>
                        <td className="text-right">
                           <div className="flex justify-end gap-2">
                              <button className="p-2 text-white/20 hover:text-white"><Activity size={16} /></button>
                              <button className="p-2 text-white/20 hover:text-red-500"><Trash2 size={16} /></button>
                           </div>
                        </td>
                      </tr>
                    )
                  })
               )}
            </tbody>
         </table>
      </div>
    </div>
  )
}
