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
  MousePointer2
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function MetricCard({
  title,
  value,
  growth,
  icon: Icon,
  delay = "0s",
  color = "gold"
}: {
  title: string
  value: string | number
  growth: number
  icon: React.ElementType
  delay?: string
  color?: string
}) {
  const isPos = growth >= 0
  return (
    <div className="aether-card metric-card animate-aether" style={{ animationDelay: delay }}>
      <div className="metric-top">
        <div className="metric-label-group">
          <span className="metric-label">{title}</span>
          <span className="metric-value">{value}</span>
        </div>
        <div className="metric-icon-wrap" style={{ 
          color: color === 'gold' ? '#c9a227' : color,
          boxShadow: `0 0 20px ${color === 'gold' ? 'rgba(201, 162, 39, 0.1)' : 'rgba(255,255,255,0.05)'}`
        }}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div className="metric-footer">
        <span className={cn("metric-growth", isPos ? "pos" : "neg")}>
          {isPos ? "+" : ""}{growth}%
        </span>
        <span className="metric-growth-label">vs mês anterior</span>
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
        <div className="space-y-5">
          <div className="header-badge">
            <span className="dot" />
            Sistema Operacional Ativo
          </div>
          <div>
            <h1 className="page-title">
              Bom dia, <span>Henrique</span> ⚡
            </h1>
            <div className="page-subtitle">
              Painel de Controle AI <span className="sep" /> 
              Status: <span className="status font-black">Online & Sincronizado</span>
            </div>
          </div>
        </div>

        <button className="aether-btn-primary group">
          <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
          Nova Conversão
        </button>
      </header>

      {/* KPI Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Base Leads" value={stats?.totalLeads ?? 0} growth={12.5} icon={Users} delay="0.1s" />
        <MetricCard title="Novos Hoje" value={stats?.leadsToday ?? 0} growth={8.2} icon={Zap} delay="0.2s" />
        <MetricCard title="Conversões" value={`R$ ${stats?.totalValue ?? 0}`} growth={15.4} icon={DollarSign} delay="0.3s" />
        <MetricCard title="Taxa Conv." value={`${stats?.conversionRate ?? 0}%`} growth={-2.1} icon={TrendingUp} delay="0.4s" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Card */}
        <div className="lg:col-span-2 aether-card min-h-[420px] flex flex-col">
          <div className="mb-10 flex items-center justify-between">
             <div>
               <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Crescimento da Base</h3>
               <p className="text-[10px] text-white/20 uppercase font-bold mt-1 tracking-widest leading-none">Aquisição de novos leads p/ período</p>
             </div>
             <div className="flex gap-2">
               {["S7", "M1", "A1"].map(f => (
                 <button key={f} className={cn("h-8 px-4 border border-white/5 rounded-lg text-[10px] uppercase font-black transition-all hover:bg-white/5", f === "S7" && "bg-white/5 border-gold/30 text-gold")}>{f}</button>
               ))}
             </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-2">
             {[30, 45, 25, 60, 80, 50, 90, 100, 70, 85, 40, 55].map((h, i) => (
               <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-t-lg transition-all group-hover:bg-gold/40 group-hover:border-gold/50 cursor-pointer" 
                    style={{ height: `${h * 2}px`, animationDelay: `${i * 0.05}s` }}
                  />
                  <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-[8px] font-black text-white/10 group-hover:text-gold uppercase">{["Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr"][i % 7]}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Activity Monitor */}
        <div className="aether-card flex flex-col">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Monitor de Atividade</h3>
              <p className="text-[10px] text-white/20 uppercase font-bold mt-1 tracking-widest">Eventos neurais em tempo real</p>
            </div>
            <Activity size={18} className="text-gold opacity-40 animate-pulse" />
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                 {isLoading ? (
               [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)
             ) : (
               [
                 { user: "Henrique", action: "Pipeline movido para 'Proposta'", time: "2m atrás", icon: MousePointer2 },
                 { user: "System", action: "Lead 'João Silva' qualificado via IA", time: "15m atrás", icon: Brain },
                 { user: "Global", action: "Backup do cluster concluído", time: "1h atrás", icon: ShieldCheck },
                 { user: "Henrique", action: "Novo dashboard Aether ativo", time: "3h atrás", icon: Star },
               ].map((act, i) => {
                 const Icon = act.icon
                 return (
                   <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.05] group">
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                         <Icon size={16} />
                      </div>
                      <div>
                         <p className="text-[12px] font-black text-white/80">{act.action}</p>
                         <p className="text-[10px] text-white/20 uppercase font-black mt-0.5 tracking-widest">{act.user} <span className="mx-1">•</span> {act.time}</p>
                      </div>
                   </div>
                 )
               })
             )}
          </div>

          <button className="aether-btn-secondary w-full mt-8 border-white/5 hover:border-gold/20 flex items-center justify-center group overflow-hidden">
             <span className="relative z-10">Ver Logs de Auditoria</span>
             <div className="absolute inset-0 bg-gold/5 translate-y-full group-hover:translate-y-0 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  )
}

function Brain({ size }: { size: number }) {
  return <Zap size={size} /> // Placeholder for Brain icon
}
