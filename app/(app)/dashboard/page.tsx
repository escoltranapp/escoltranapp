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

// ─── Metric Card High-Fidelity ───────────────────────────────────────
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
    <div className="crm-metric-card animate-aether group">
      <div className="crm-metric-icon-box" style={{ color: iconColor }}>
        <Icon size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-500" />
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">{title}</h4>
        <div className="flex items-baseline gap-3">
           <div className="text-[36px] font-black tracking-tighter text-white leading-none">{value}</div>
           <div className={cn("text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1", trend === 'up' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
              {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />} 12%
           </div>
        </div>
        <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mt-2">{subtitle}</p>
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
    <div className="animate-aether space-y-12">
      
      {/* Prime Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-blue-500 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]">
              <LayoutDashboard size={24} strokeWidth={2.5} />
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Operational Status: Healthy</span>
              </div>
              <h1 className="crm-header-title">Executive Overview</h1>
              <p className="crm-header-subtitle">Performance Analítica e Monitoramento Neural</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Fluxo Financeiro Mensal</span>
              <span className="text-[14px] font-black text-white/80">R$ 1.240.500,00</span>
           </div>
           <button className="btn-glow-blue">
              <Plus size={20} strokeWidth={3} /> Nova Oportunidade
           </button>
        </div>
      </header>

      {/* KPI Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <CRMMetricCard title="Market Share" value={stats?.totalLeads ?? "00"} subtitle="Contatos Capturados Hoje" icon={Users} iconColor="#3b82f6" />
        <CRMMetricCard title="Sync Activity" value="98%" subtitle="Taxa de Integridade Cloud" icon={Zap} iconColor="#60a5fa" />
        <CRMMetricCard title="Revenue Stream" value={stats?.totalValue ? `R$ ${stats.totalValue}` : 'R$ 0,00'} subtitle="Volume em Negociação" icon={DollarSign} iconColor="#10b981" />
        <CRMMetricCard title="Conversion Rate" value={`${stats?.conversionRate ?? 0}%`} subtitle="Leads → Faturamento" icon={TrendingUp} iconColor="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Chart Card (Expanded & Focused) */}
        <div className="lg:col-span-8 crm-metric-card p-10 min-h-[520px] flex flex-col bg-white/[0.01]">
          <div className="mb-14 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                   <BarChart3 size={18} />
                </div>
                <div>
                   <h3 className="text-[13px] font-black uppercase tracking-widest text-white/90">Dinâmica Temporal de Vendas</h3>
                   <p className="text-[10px] text-white/10 uppercase font-bold mt-1 tracking-widest">Métrica Neural de Engajamento</p>
                </div>
             </div>
             <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 gap-1">
               {["7D", "30D", "90D"].map(f => (
                 <button key={f} className={cn("h-10 px-6 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all", f === "30D" ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "text-white/20 hover:text-white/40")}>{f}</button>
               ))}
             </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-4 px-6 pb-4">
             {[20, 35, 15, 40, 55, 30, 65, 80, 50, 75, 90, 100].map((h, i) => (
               <div key={i} className="flex-1 group relative">
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-all rounded-t-2xl -m-2 mb-0" />
                  <div 
                    className="w-full bg-white/[0.02] border border-white/5 rounded-t-2xl transition-all duration-700 ease-out group-hover:bg-blue-600 group-hover:border-blue-400 cursor-pointer shadow-[0_0_40px_rgba(37,99,235,0)] group-hover:shadow-[0_0_50px_rgba(37,99,235,0.4)] relative" 
                    style={{ height: `${h * 3.2}px`, animationDelay: `${i * 0.08}s` }}
                  >
                     <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">{h * 12}k</div>
                  </div>
               </div>
             ))}
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-white/10 px-2">
             {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(m => (
               <span key={m} className="text-[9px] font-black uppercase tracking-tighter">{m}</span>
             ))}
          </div>
        </div>

        {/* Neural Monitor (Side Bar) */}
        <div className="lg:col-span-4 crm-metric-card p-0 bg-white/[0.01]">
          <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                  <Sparkles size={18} />
               </div>
               <div>
                 <h3 className="text-[13px] font-black uppercase tracking-widest text-white/90">Pulse Monitor</h3>
                 <p className="text-[9px] text-white/10 uppercase font-black mt-1 tracking-widest">Real-time Events</p>
               </div>
            </div>
            <Activity size={18} className="text-blue-500 animate-pulse" />
          </div>

          <div className="p-6 space-y-6 max-h-[420px] overflow-y-auto scrollbar-hide">
             {isLoading ? (
               [...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)
             ) : (
               [
                 { user: "Henrique Bariani", action: "Pipeline: Proposta Gerada", time: "02m", icon: MousePointer2, color: "#3b82f6" },
                 { user: "AI Engine", action: "Lead Qualificado Automatizado", time: "12m", icon: Zap, color: "#a855f7" },
                 { user: "Operational", action: "Nó de Sincronização Estável", time: "45m", icon: ShieldCheck, color: "#10b981" },
                 { user: "Global Hub", action: "Evento Comercial Detectado", time: "01h", icon: Star, color: "#f59e0b" },
                 { user: "System", action: "Otimização de Cache Concluída", time: "03h", icon: Sparkles, color: "#3b82f6" },
               ].map((act, i) => {
                 const Icon = act.icon
                 return (
                   <div key={i} className="flex gap-5 p-6 rounded-3xl border border-white/[0.03] bg-white/[0.01] transition-all hover:bg-white/[0.04] group cursor-pointer relative overflow-hidden">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-blue-500/0 group-hover:bg-blue-500 transition-all" />
                      <div className="w-11 h-11 rounded-2xl bg-black border border-white/5 flex items-center justify-center transition-transform group-hover:scale-105" style={{ color: act.color }}>
                         <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[12px] font-black text-white/80 uppercase tracking-tight truncate">{act.action}</p>
                         <p className="text-[9px] text-white/10 uppercase font-black mt-1.5 tracking-widest">
                            <span className="text-white/30">{act.user}</span> <span className="mx-1 opacity-20">•</span> {act.time}
                         </p>
                      </div>
                   </div>
                 )
               })
             )}
          </div>

          <div className="p-8">
             <button className="h-14 w-full border border-white/5 bg-white/5 text-[11px] uppercase font-black tracking-widest text-white/30 rounded-2xl hover:bg-white/10 transition-all hover:text-white">
                Ver Console Operacional
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}
