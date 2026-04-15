"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Plus,
  Zap,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency, cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

// ─── Metric Card Component ──────────────────────────────────────────
function MetricCard({
  title,
  value,
  growth,
  icon: Icon,
  format = "number",
  delay = "0s",
}: {
  title: string
  value: number
  growth: number
  icon: React.ElementType
  format?: "number" | "currency" | "percent"
  delay?: string
}) {
  const isPositive = growth >= 0
  const formatted =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
      ? `${value.toFixed(1)}%`
      : value.toLocaleString("pt-BR")

  return (
    <div className="aether-card metric-card animate-aether" style={{ animationDelay: delay }}>
      <div className="metric-top">
        <div className="metric-label-group">
          <span className="metric-label">{title}</span>
          <span className="metric-value">{formatted}</span>
        </div>
        <div className="metric-icon-wrap">
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div className="metric-footer">
        <span className={cn("metric-growth", isPositive ? "pos" : "neg")}>
          {isPositive ? "+" : ""}{growth}%
        </span>
        <span className="metric-growth-label">vs mês anterior</span>
      </div>
      
      {/* Decorative background pulse */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-white">
        <Icon size={120} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(" ")[0] || "Explorador"

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/metrics")
      if (!res.ok) throw new Error("Falha ao carregar métricas")
      return res.json()
    },
    staleTime: 30_000,
  })

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["dashboard-chart"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/chart")
      if (!res.ok) throw new Error("Falha ao carregar dados do gráfico")
      return res.json()
    },
    staleTime: 60_000,
  })

  const { data: activityFeed, isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/activity")
      if (!res.ok) throw new Error("Falha ao carregar atividade")
      return res.json()
    },
    staleTime: 10_000,
  })

  return (
    <div className="animate-aether space-y-10 pb-20">
      
      {/* Header Aether Style */}
      <header className="page-header flex-row items-end justify-between">
        <div className="space-y-4">
          <div className="header-badge">
            <span className="dot" />
            Sistema Operacional Ativo
          </div>
          <div>
            <h1 className="page-title">
              Bom dia, <span>{firstName}</span> ⚡
            </h1>
            <div className="page-subtitle">
              Painel de Controle AI <span className="sep" /> 
              Status Operacional: <span className="status">Online</span>
            </div>
          </div>
        </div>

        <button className="aether-btn-primary">
          <Plus size={18} strokeWidth={3} />
          Nova Conversão
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="aether-card h-32 animate-pulse bg-white/5" />
          ))
        ) : metrics ? (
          <>
            <MetricCard title="Base Leads" value={metrics.totalContacts} growth={metrics.contactsGrowth} icon={Users} delay="0.1s" />
            <MetricCard title="Novos Hoje" value={metrics.openDeals} growth={metrics.dealsGrowth} icon={Zap} delay="0.2s" />
            <MetricCard title="Conversões" value={metrics.pipelineValue} growth={metrics.pipelineGrowth} icon={DollarSign} format="currency" delay="0.3s" />
            <MetricCard title="Taxa Conv." value={metrics.conversionRate} growth={metrics.conversionGrowth} icon={TrendingUp} format="percent" delay="0.4s" />
          </>
        ) : null}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Card */}
        <div className="lg:col-span-2 aether-card p-0 flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <span className="metric-label">Crescimento da Base</span>
              <p className="text-[11px] text-white/30 uppercase mt-1">Aquisição de novos leads p/ período</p>
            </div>
            <div className="flex gap-2">
              <button className="aether-btn-secondary h-8 px-4 text-[9px]">S7</button>
              <button className="aether-btn-secondary h-8 px-4 text-[9px] bg-white/5 border-white/10">M1</button>
            </div>
          </div>
          
          <div className="p-6 h-[340px] w-full">
            {chartLoading ? (
               <div className="w-full h-full bg-white/5 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c9a227" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#c9a227" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} opacity={0.03} />
                  <XAxis dataKey="mes" tick={{ fill: "#666", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#666", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#111114", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
                  <Area type="monotone" dataKey="deals" stroke="#c9a227" strokeWidth={3} fill="url(#colorMain)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity Feed Card */}
        <div className="aether-card p-0 flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <span className="metric-label">Monitor de Atividade</span>
              <p className="text-[11px] text-white/30 uppercase mt-1">Eventos neurais em tempo real</p>
            </div>
            <Activity size={16} className="text-gold animate-pulse" />
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-1">
            {activityLoading ? (
              [...Array(6)].map((_, i) => <div key={i} className="h-12 bg-white/5 animate-pulse rounded-lg m-2" />)
            ) : activityFeed?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-white/[0.02] group">
                <div className={cn("w-1.5 h-1.5 rounded-full", item.color || "bg-gold")} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-white/90 truncate">{item.action}</span>
                    <span className="text-[9px] font-mono text-white/20">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-white/30 truncate mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-white/5">
            <button className="aether-btn-secondary w-full">Ver Logs de Auditoria</button>
          </div>
        </div>

      </div>
    </div>
  )
}
