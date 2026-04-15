"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Plus,
  Zap,
  Star,
  ShieldCheck,
  MousePointer2,
  LayoutDashboard,
  ArrowUpRight,
  TrendingDown,
  BarChart3,
  Sparkles
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"

// ─── Metric Card Enterprise-Grade (Regra 1) ──────────────────────────
function CRMMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "#2563eb",
  trend = "up"
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  iconColor?: string
  trend?: "up" | "down"
}) {
  return (
    <div className="crm-metric-card">
      <div className="crm-metric-icon-box" style={{ color: iconColor, backgroundColor: `${iconColor}15` }}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="space-y-0.5">
        <h4 className="label-upper">{title}</h4>
        <div className="flex items-baseline gap-3">
           <div className="value-main">{value}</div>
           <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1", trend === 'up' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
              {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />} 12%
           </div>
        </div>
        <p className="sub-context">{subtitle}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 30_000,
  })

  return (
    <div className="animate-aether space-y-7">
      
      {/* Page Header (Regra 8) */}
      <header className="flex items-center justify-between">
        <div>
           <div className="page-header-context flex items-center gap-2">
              <Sparkles size={10} /> OPERATIONAL OVERVIEW
           </div>
           <h1 className="page-title-h1">Dashboard</h1>
           <p className="page-subtitle-desc">Performance analítica e monitoramento de fluxo em tempo real</p>
        </div>

        <button className="btn-cta-primary flex items-center gap-2">
          <Plus size={18} /> Novo Registro
        </button>
      </header>

      {/* KPI Cluster (Regra 3 - Gap 16px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CRMMetricCard title="Total de Leads" value={stats?.totalLeads ?? "0"} subtitle="+12.5% vs mês anterior" icon={Users} iconColor="#3b82f6" />
        <CRMMetricCard title="Sincronização" value="98%" subtitle="Integridade de dados cloud" icon={Zap} iconColor="#60a5fa" />
        <CRMMetricCard title="Volume Financeiro" value={stats?.totalValue ? `R$ ${stats.totalValue}` : 'R$ 0,00'} subtitle="Crescimento contínuo de caixa" icon={DollarSign} iconColor="#10b981" />
        <CRMMetricCard title="Conversão" value={`${stats?.conversionRate ?? 0}%`} subtitle="Performance de funil" icon={TrendingUp} iconColor="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Main Chart Card */}
        <div className="lg:col-span-8 crm-metric-card p-8">
          <div className="mb-10 flex items-center justify-between">
             <div>
               <h3 className="text-[13px] font-bold uppercase tracking-widest text-white/90">Análise Comportamental</h3>
               <p className="text-[11px] text-white/40 uppercase font-medium mt-1">Aquisição por cluster temporal</p>
             </div>
             <div className="flex bg-white/5 p-1 rounded-lg gap-1">
               {["7D", "30D", "90D"].map(f => (
                 <button key={f} className={cn("h-8 px-4 rounded-md text-[10px] uppercase font-bold transition-all", f === "30D" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50")}>{f}</button>
               ))}
             </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-2 h-[260px]">
             {[30, 45, 25, 60, 80, 50, 90, 100, 70, 85, 40, 55].map((h, i) => (
               <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-white/5 rounded-t-lg transition-all group-hover:bg-blue-500/50 cursor-pointer" 
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-[9px] font-bold text-white/20 uppercase">{["O", "N", "D", "J", "F", "M", "A"][i % 7]}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Pulse Monitor */}
        <div className="lg:col-span-4 crm-metric-card p-0 overflow-hidden">
          <div className="p-7 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-widest">Pulse Monitor</h3>
              <p className="text-[10px] text-white/30 uppercase mt-0.5">Eventos em tempo real</p>
            </div>
            <Activity size={18} className="text-blue-500 animate-pulse" />
          </div>

          <div className="p-5 space-y-4">
             {isLoading ? (
               [...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />)
             ) : (
               [
                 { user: "H. Bariani", action: "Proposta Gerada", time: "02m", icon: MousePointer2, color: "#3b82f6" },
                 { user: "AI Engine", action: "Lead Qualificado", time: "12m", icon: Zap, color: "#a855f7" },
                 { user: "Operational", action: "Nó Sincronizado", time: "45m", icon: ShieldCheck, color: "#10b981" },
               ].map((act, i) => {
                 const Icon = act.icon
                 return (
                   <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all group">
                      <div className="w-9 h-9 rounded-lg bg-black border border-white/5 flex items-center justify-center text-blue-500 group-hover:scale-105" style={{ color: act.color }}>
                         <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[12px] font-bold text-white/80 uppercase truncate">{act.action}</p>
                         <p className="text-[10px] text-white/30 uppercase font-medium mt-0.5">
                            {act.user} <span className="mx-1 opacity-20">•</span> {act.time}
                         </p>
                      </div>
                   </div>
                 )
               })
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
