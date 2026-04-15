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
  ArrowUpRight
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"

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
    <div className="animate-aether space-y-10 pb-12">
      
      {/* CRM Global Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20">
              <LayoutDashboard size={20} />
           </div>
           <div>
              <h1 className="crm-header-title">Overview</h1>
              <p className="crm-header-subtitle">Performance e Gestão Estratégica</p>
           </div>
        </div>

        <button className="btn-glow-blue ml-2">
          <Plus size={18} strokeWidth={3} /> Novo Registro
        </button>
      </header>

      {/* KPI Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CRMMetricCard title="Base Leads" value={stats?.totalLeads ?? 0} subtitle="+12.5% vs mês anterior" icon={Users} iconColor="#3b82f6" />
        <CRMMetricCard title="Novos Hoje" value={stats?.leadsToday ?? 0} subtitle="Sincronização Ativa" icon={Zap} iconColor="#60a5fa" />
        <CRMMetricCard title="Volume Financeiro" value={stats?.totalValue ? `R$ ${stats.totalValue}` : 'R$ 0,00'} subtitle="Crescimento Contínuo" icon={DollarSign} iconColor="#10b981" />
        <CRMMetricCard title="Taxa de Conversão" value={`${stats?.conversionRate ?? 0}%`} subtitle="Performance Neural" icon={TrendingUp} iconColor="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Card */}
        <div className="lg:col-span-2 crm-metric-card p-10 min-h-[460px] flex flex-col bg-white/[0.01]">
          <div className="mb-12 flex items-center justify-between">
             <div className="space-y-1">
               <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Projeção Comportamental</h3>
               <p className="text-[9px] text-white/10 uppercase font-black tracking-widest leading-none">Análise de aquisição por cluster temporal</p>
             </div>
             <div className="flex gap-2">
               {["S7", "M1", "A1"].map(f => (
                 <button key={f} className={cn("h-9 px-5 border border-white/5 rounded-xl text-[10px] uppercase font-black transition-all", f === "S7" ? "bg-blue-600 text-white border-none shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "hover:bg-white/5 text-white/30")}>{f}</button>
               ))}
             </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-6 px-4 pb-2">
             {[30, 45, 25, 60, 80, 50, 90, 100, 70, 85, 40, 55].map((h, i) => (
               <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-t-xl transition-all group-hover:bg-blue-600/60 group-hover:border-blue-500/80 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]" 
                    style={{ height: `${h * 2.5}px`, animationDelay: `${i * 0.05}s` }}
                  />
                  <div className="absolute bottom-[-28px] left-1/2 -translate-x-1/2 text-[8px] font-black text-white/10 group-hover:text-blue-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all">{["Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr"][i % 7]}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Activity Monitor */}
        <div className="crm-metric-card p-0 bg-white/[0.01]">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Monitor Neural</h3>
              <p className="text-[9px] text-white/10 uppercase font-bold mt-1 tracking-widest">Logs de Sincronização</p>
            </div>
            <Activity size={18} className="text-blue-500 animate-pulse" />
          </div>

          <div className="p-4 space-y-4 max-h-[360px] overflow-y-auto scrollbar-hide">
             {isLoading ? (
               [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)
             ) : (
               [
                 { user: "Henrique", action: "Pipeline: Proposta Gerada", time: "2m", icon: MousePointer2 },
                 { user: "System", action: "Lead Qualificado via IA", time: "15m", icon: Zap },
                 { user: "Global", action: "Backup Operacional", time: "1h", icon: ShieldCheck },
                 { user: "Henrique", action: "Dashboard Aether Ativo", time: "3h", icon: Star },
               ].map((act, i) => {
                 const Icon = act.icon
                 return (
                   <div key={i} className="flex gap-4 p-5 rounded-2xl border border-white/[0.02] bg-white/[0.01] transition-all hover:bg-white/[0.03] group">
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                         <Icon size={16} />
                      </div>
                      <div className="flex-1">
                         <p className="text-[11px] font-black text-white/80 uppercase tracking-tight">{act.action}</p>
                         <p className="text-[9px] text-white/10 uppercase font-black mt-0.5 tracking-widest">{act.user} <span className="mx-1 opacity-20">•</span> {act.time} atrás</p>
                      </div>
                   </div>
                 )
               })
             )}
          </div>

          <div className="p-8 pt-4">
             <button className="h-12 w-full border border-white/5 bg-white/5 text-[10px] uppercase font-black tracking-widest text-white/30 rounded-xl hover:bg-white/10 transition-all">
                Logs em Tempo Real
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}
