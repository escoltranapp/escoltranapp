"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Users,
  Kanban,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { formatCurrency, cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// ─── Skeleton loader ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-elevated h-[120px] animate-pulse" />
  )
}

import { useSession } from "next-auth/react"

// ─── Metric card ────────────────────────────────────────────────────
function MetricCard({
  title,
  value,
  growth,
  icon: Icon,
  format = "number",
  delay = "0ms",
  color = "accent"
}: {
  title: string
  value: number
  growth: number
  icon: React.ElementType
  format?: "number" | "currency" | "percent"
  delay?: string
  color?: string
}) {
  const isPositive = growth > 0
  const formatted =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
      ? `${value.toFixed(1)}%`
      : value.toLocaleString("pt-BR")

  const colorClasses: Record<string, string> = {
    accent: "text-accent bg-accent/10 border-accent/20",
    success: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    info: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  }

  return (
    <Card 
      className="bg-[#111114] border-white/5 rounded-[22px] p-6 group animate-entrance relative overflow-hidden"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex gap-4 items-center">
          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border", colorClasses[color] || colorClasses.accent)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-0.5">{title}</p>
            <h3 className="text-2xl font-black text-white tracking-tight">{formatted}</h3>
          </div>
        </div>
        
        {/* Ghost Sparkline decoration */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none group-hover:opacity-20 transition-opacity">
          <Activity className="h-16 w-16 text-white rotate-12" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 relative z-10">
        <span className={cn("text-[10px] font-black uppercase flex items-center gap-0.5", isPositive ? "text-emerald-400" : "text-red-400")}>
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(growth).toFixed(1)}%
        </span>
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">vs mês anterior</span>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(" ")[0] || "Usuário"

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

  const { data: utmData, isLoading: utmLoading } = useQuery({
    queryKey: ["utm-analytics-basic"],
    queryFn: async () => {
      const res = await fetch("/api/utm-analytics")
      if (!res.ok) throw new Error("Falha ao carregar UTM analytics")
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
    <div className="max-w-[1600px] mx-auto space-y-12 pb-12 px-2 sm:px-6 lg:px-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-entrance">
        <div className="space-y-4">
          <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent text-[10px] font-bold py-1 px-3 rounded-full flex items-center w-fit gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            SISTEMA OPERACIONAL ATIVO
          </Badge>
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-3">
              Bom dia, <span className="text-accent underline decoration-accent/20 underline-offset-8 transition-all hover:decoration-accent/50 cursor-default">{firstName}</span> ⚡
            </h1>
            <p className="text-sm font-medium text-white/40 mt-3 flex items-center gap-2">
              PAINEL DE CONTROLE AI <span className="h-1 w-1 rounded-full bg-white/20" /> STATUS OPERACIONAL: <span className="text-accent/60">ONLINE</span>
            </p>
          </div>
        </div>

        <Button className="bg-accent hover:bg-accent/90 text-black h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-accent/10 group transition-all">
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
          Iniciar Nova Conversão
        </Button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : metrics ? (
          <>
            <MetricCard
              title="Base Leads"
              value={metrics.totalContacts}
              growth={metrics.contactsGrowth}
              icon={Users}
              color="info"
              delay="100ms"
            />
            <MetricCard
              title="Novos Hoje"
              value={metrics.openDeals}
              growth={metrics.dealsGrowth}
              icon={Plus}
              color="success"
              delay="200ms"
            />
            <MetricCard
              title="Conversões"
              value={metrics.pipelineValue}
              growth={metrics.pipelineGrowth}
              icon={TrendingUp}
              color="warning"
              format="currency"
              delay="300ms"
            />
            <MetricCard
              title="Taxa Conv."
              value={metrics.conversionRate}
              growth={metrics.conversionGrowth}
              icon={Activity}
              color="accent"
              format="percent"
              delay="400ms"
            />
          </>
        ) : (
          <div className="col-span-4 text-center text-text-muted py-12 border border-dashed border-white/10 rounded-3xl">
            Nenhum dado analítico disponível ainda.
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-entrance" style={{ animationDelay: '500ms' }}>
        {/* Performance Chart Card */}
        <Card className="lg:col-span-2 bg-[#111114] border-white/5 rounded-[24px] overflow-hidden p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-white">Crescimento da Base</h4>
                <p className="text-[10px] font-medium text-white/30 uppercase">Aquisição de novos leads por período</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 p-1 rounded-xl">
              <Button variant="ghost" className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 rounded-lg">Últimos 7 dias</Button>
              <Button variant="ghost" className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider text-white/30 hover:text-white/60">30 dias</Button>
            </div>
          </div>

          <div className="h-[300px] w-full">
            {chartLoading ? (
              <div className="w-full h-full bg-white/[0.02] animate-pulse rounded-2xl" />
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E0B050" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#E0B050" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} opacity={0.03} />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fill: "#666", fontSize: 10, fontWeight: 700 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: "#666", fontSize: 10, fontWeight: 700 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#111114", 
                      border: "1px solid rgba(255,255,255,0.1)", 
                      borderRadius: "12px", 
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="deals" 
                    stroke="#E0B050" 
                    strokeWidth={3} 
                    fill="url(#colorMain)" 
                    name="Conversões" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 border border-dashed border-white/5 rounded-2xl">
                Aguardando dados...
              </div>
            )}
          </div>
        </Card>

        {/* Side Metrics Card (Inspired by "Origem dos Leads") */}
        <Card className="bg-[#111114] border-white/5 rounded-[24px] p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-info" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-white">Origem dos Leads</h4>
          </div>

          <div className="flex-1 space-y-6">
            {utmLoading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-8 w-full bg-white/5 animate-pulse rounded-lg" />)
            ) : utmData?.sources?.map((item: any) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-white/40">{item.name}</span>
                  <span className="text-white">{item.value * 10}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all duration-1000" 
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="mt-8 w-full border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 h-10 rounded-xl">
             Ver Analytics Completo
          </Button>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-[#111114] border-white/5 rounded-[24px] p-8 animate-entrance" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-white">Monitor de Atividade</h4>
            <p className="text-[10px] font-medium text-white/30 uppercase italic">Eventos neurais em tempo real</p>
          </div>
          <Activity className="h-4 w-4 text-accent animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {activityLoading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-12 w-full bg-white/5 animate-pulse rounded-xl" />)
          ) : activityFeed?.slice(0, 6).map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-4 group cursor-default p-3 hover:bg-white/[0.02] rounded-2xl transition-all">
              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", item.color)} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-4">
                  <p className="text-xs font-bold text-white/90 truncate">{item.action}</p>
                  <span className="text-[10px] font-mono text-white/20 whitespace-nowrap">{item.time}</span>
                </div>
                <p className="text-[11px] text-white/30 truncate mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
