"use client"

import { useQuery } from "@tanstack/react-query"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, MousePointer, DollarSign, Target, Users, Activity, PieChartIcon, Sparkles } from "lucide-react"
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

export default function UtmAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["utm-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/utm-analytics")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 60_000,
  })

  return (
    <div className="page-container animate-aether">
      
      {/* 1. HEADER DE PÁGINA */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <Target size={12} /> INTELIGÊNCIA DE RASTREAMENTO
          </div>
          <h1 className="page-title-h1">UTM Analytics</h1>
          <p className="page-subtitle">Monitoramento de canais · Atribuição · Status: <span className="text-white">Analisando</span></p>
        </div>
      </header>

      {/* 2. KPI CARDS */}
      <div className="kpi-grid">
         <KPICard label="Volumetria Leads" value={data?.totalLeads || 0} subtext="Dataset total capturado" icon={Users} color="#d4af37" />
         <KPICard label="Mês Vigente" value={data?.newThisMonth || 0} subtext="Performance período atual" icon={TrendingUp} color="#10b981" />
         <KPICard label="Conversão Global" value={`${data?.conversionRate || 0}%`} subtext="Média de qualificação BANT" icon={Target} color="#f59e0b" />
         <KPICard label="Dataset Revenue" value={formatCurrency(data?.totalRevenue || 0)} subtext="Previsão de receita em cluster" icon={DollarSign} color="#a855f7" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* 3. MARKETING MIX (Gráfico de Pizza) */}
         <div className="kpi-card p-0 overflow-hidden border-white/5">
            <div className="table-header-label mb-0 border-b border-white/5">Marketing Mix</div>
            <div className="p-8">
               {data?.sources ? (
                 <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.sources} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="count" stroke="none">
                          {data.sources.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/[0.04]">
                     {data.sources.map((item: any) => (
                        <div key={item.name} className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                              <span className="text-[10px] font-bold uppercase text-white/40 tracking-tight">{item.name}</span>
                           </div>
                           <span className="text-[11px] font-bold text-white/80">{item.value}%</span>
                        </div>
                     ))}
                  </div>
                 </>
               ) : (
                  <div className="h-64 flex flex-col items-center justify-center opacity-10">
                    <PieChartIcon className="w-12 h-12" />
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-4">No Channel Data</span>
                  </div>
               )}
            </div>
         </div>

         {/* 4. CONVERSION PIPELINE (Barras Horizontais) */}
         <div className="kpi-card p-0 overflow-hidden border-white/5">
            <div className="table-header-label mb-0 border-b border-white/5">Conversion Pipeline</div>
            <div className="p-8 space-y-6">
               {(data?.funnel || []).map((stage: any, i: number) => {
                  const maxVal = data.funnel[0]?.value || 1
                  const pct = (stage.value / maxVal) * 100
                  return (
                    <div key={stage.stage} className="space-y-3">
                       <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-white/30">
                          <span>{stage.stage}</span>
                          <span className="text-white/60">{stage.value.toLocaleString()}</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, background: stage.color, opacity: 0.6 }} />
                          </div>
                          <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] font-bold text-[#d4af37]">
                             {pct.toFixed(0)}%
                          </span>
                       </div>
                    </div>
                  )
               })}
            </div>
         </div>

      </div>
    </div>
  )
}
