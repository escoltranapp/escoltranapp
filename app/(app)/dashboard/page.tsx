"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  Users, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  Plus,
  Zap,
  Star,
  ShieldCheck,
  MousePointer2,
  LayoutGrid
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function MetricHeaderCard({
  title,
  value,
  icon: Icon,
  growth: Growth = 0
}: {
  title: string
  value: string | number
  icon: React.ElementType
  growth?: number
}) {
  return (
    <div className="aether-card metric-card-refined animate-aether">
      <div className="icon-wrap">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
           <span className="label text-white/20">{title}</span>
           {Growth !== 0 && (
             <span className={cn("text-[9px] font-black", Growth > 0 ? "text-green-400" : "text-red-400")}>
               {Growth > 0 ? "+" : ""}{Growth}%
             </span>
           )}
        </div>
        <span className="value">{value}</span>
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
    <div className="animate-aether space-y-12 pb-12">
      
      {/* Prime Header */}
      <header className="page-header flex-col md:flex-row items-start justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/5 w-fit">
             <LayoutGrid size={10} className="text-gold" />
             <span className="text-[9px] font-black uppercase tracking-widest text-gold/60">Controle Operacional</span>
          </div>
          <div>
            <h1 className="page-title">Bem-vindo, <span>Henrique</span> ⚡</h1>
            <div className="page-subtitle text-white/20 mt-2 font-bold uppercase tracking-widest text-[10px]">
              Painel de Controle Inteligente <span className="mx-2 opacity-10">•</span> 
              Status: <span className="text-gold">Sincronizado</span>
            </div>
          </div>
        </div>

        <button className="aether-btn-primary group h-14">
          <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
          Novo Registro
        </button>
      </header>

      {/* KPI Cluster */}
      <div className="metric-row">
        <MetricHeaderCard title="Base Leads" value={stats?.totalLeads ?? 0} growth={12.5} icon={Users} />
        <MetricHeaderCard title="Novos Hoje" value={stats?.leadsToday ?? 0} growth={8.2} icon={Zap} />
        <MetricHeaderCard title="Volume Financeiro" value={stats?.totalValue ? `R$ ${stats.totalValue}` : 'R$ 0,00'} growth={15.4} icon={DollarSign} />
        <MetricHeaderCard title="Taxa de Conversão" value={`${stats?.conversionRate ?? 0}%`} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Card */}
        <div className="lg:col-span-2 aether-card p-10 min-h-[460px] flex flex-col bg-white/[0.01]">
          <div className="mb-12 flex items-center justify-between">
             <div className="space-y-1">
               <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Projeção Comportamental</h3>
               <p className="text-[9px] text-white/10 uppercase font-black tracking-widest leading-none">Análise de aquisição por cluster temporal</p>
             </div>
             <div className="flex gap-2">
               {["S7", "M1", "A1"].map(f => (
                 <button key={f} className={cn("h-9 px-5 border border-white/5 rounded-xl text-[10px] uppercase font-black transition-all", f === "S7" ? "bg-gold text-black border-none" : "hover:bg-white/5 text-white/30")}>{f}</button>
               ))}
             </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-6 px-4 pb-2">
             {[30, 45, 25, 60, 80, 50, 90, 100, 70, 85, 40, 55].map((h, i) => (
               <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-t-xl transition-all group-hover:bg-gold/60 group-hover:border-gold/80 cursor-pointer shadow-[0_0_20px_rgba(201,162,39,0)] group-hover:shadow-[0_0_30px_rgba(201,162,39,0.3)]" 
                    style={{ height: `${h * 2.5}px`, animationDelay: `${i * 0.05}s` }}
                  />
                  <div className="absolute bottom-[-28px] left-1/2 -translate-x-1/2 text-[8px] font-black text-white/10 group-hover:text-gold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all">{["Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr"][i % 7]}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Activity Monitor */}
        <div className="aether-card p-0 bg-white/[0.01]">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Monitor Neural</h3>
              <p className="text-[9px] text-white/10 uppercase font-bold mt-1 tracking-widest">Logs de Sincronização</p>
            </div>
            <Activity size={18} className="text-gold animate-pulse" />
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
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
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
             <button className="aether-btn-secondary w-full border-white/5 hover:border-gold/20 flex items-center justify-center group overflow-hidden h-12">
                <span className="relative z-10 font-black uppercase text-[10px] tracking-widest">Logs em Tempo Real</span>
             </button>
          </div>
        </div>

      </div>

    </div>
  )
}
