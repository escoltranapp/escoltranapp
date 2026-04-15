"use client"

import { useQuery } from "@tanstack/react-query"
import { Users, TrendingUp, DollarSign, Activity, Plus, Zap, ShieldCheck, MousePointer2, Sparkles, LayoutDashboard } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

// ─── Reusable Component: KPI Card Enterprise ───────────────────────
function KPICard({ 
  label, value, subtext, icon: Icon, trend, color = "var(--accent-primary)" 
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
    <div className="page-container animate-aether">
      
      {/* 1. HEADER DE PÁGINA */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <LayoutDashboard size={12} /> OPERATIONAL OVERVIEW
          </div>
          <h1 className="page-title-h1">Dashboard</h1>
          <p className="page-subtitle">Performance analítica e monitoramento de fluxo em tempo real</p>
        </div>
        <button className="btn-cta-primary flex items-center gap-2">
          <Plus size={18} /> Novo Registro
        </button>
      </header>

      {/* 2. KPI CARDS */}
      <div className="kpi-grid">
        <KPICard label="Total de Leads" value={stats?.totalLeads || "0"} subtext="+12.5% vs mês anterior" icon={Users} trend="+12%" color="#d4af37" />
        <KPICard label="Sincronização" value="98%" subtext="Integridade de dados cloud" icon={Zap} color="#d4af37" />
        <KPICard label="Volume Financeiro" value={stats?.totalValue ? formatCurrency(stats.totalValue) : 'R$ 0,00'} subtext="Crescimento contínuo de caixa" icon={DollarSign} color="#10b981" />
        <KPICard label="Conversão" value={`${stats?.conversionRate || 0}%`} subtext="Performance de funil global" icon={TrendingUp} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Gráfico Principal */}
        <div className="lg:col-span-8 kpi-card bg-[#111318] p-8">
          <div className="mb-10 flex items-center justify-between">
             <div>
               <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/30">Análise Comportamental</h3>
               <p className="text-[13px] text-white/60 mt-1">Aquisição por cluster temporal</p>
             </div>
             <div className="flex bg-white/5 p-1 rounded-lg gap-1 border border-white/5">
               {["7D", "30D", "90D"].map(f => (
                 <button key={f} className={cn("h-8 px-4 rounded-md text-[10px] uppercase font-bold transition-all", f === "30D" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50")}>{f}</button>
               ))}
             </div>
          </div>
          
          <div className="h-[280px] flex items-end justify-between gap-3 px-2">
             {[30, 45, 25, 60, 80, 50, 90, 100, 70, 85, 40, 55].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                   <div className="w-full bg-[#d4af37]/10 rounded-t-lg transition-all group-hover:bg-[#d4af37]/30 cursor-pointer border-x border-t border-blue-600/5" style={{ height: `${h}%` }} />
                   {h > 80 && <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#d4af37]">PEAK</div>}
                </div>
             ))}
          </div>
        </div>

        {/* Pulse Monitor */}
        <div className="lg:col-span-4 kpi-card p-0 overflow-hidden border-white/5">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/30">Pulse Monitor</h3>
            </div>
            <Activity size={18} className="text-[#d4af37] animate-pulse" />
          </div>

          <div className="p-6 space-y-4">
             {[
               { user: "H. Bariani", action: "Proposta Gerada", icon: MousePointer2, color: "#d4af37" },
               { user: "AI Engine", action: "Lead Qualificado", icon: Zap, color: "#a855f7" },
               { user: "Operational", action: "Nó Sincronizado", icon: ShieldCheck, color: "#10b981" },
             ].map((act, i) => (
               <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                  <div className="w-9 h-9 rounded-lg bg-[#0a0c10] border border-white/5 flex items-center justify-center" style={{ color: act.color }}>
                     <act.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-[12px] font-bold text-white uppercase truncate">{act.action}</p>
                     <p className="text-[10px] text-white/30 uppercase font-medium mt-0.5">{act.user}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
