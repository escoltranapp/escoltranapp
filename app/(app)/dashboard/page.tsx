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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

// ─── Metric card ────────────────────────────────────────────────────
function MetricCard({
  title,
  value,
  growth,
  icon: Icon,
  format = "number",
  delay = "0ms"
}: {
  title: string
  value: number
  growth: number
  icon: React.ElementType
  format?: "number" | "currency" | "percent"
  delay?: string
}) {
  const isPositive = growth > 0
  const formatted =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
      ? `${value.toFixed(1)}%`
      : value.toLocaleString("pt-BR")

  return (
    <Card 
      className="bg-surface hover:bg-surface-elevated transition-all duration-300 border-border-subtle group animate-entrance"
      style={{ animationDelay: delay }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted group-hover:text-accent transition-colors">
          {title}
        </span>
        <div className="h-8 w-8 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center group-hover:border-accent/40 transition-all">
          <Icon className="h-4 w-4 text-text-secondary group-hover:text-accent group-hover:scale-110 transition-all" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black font-sans text-text-primary tracking-tighter mb-2">
          {formatted}
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant={isPositive ? "ativa" : "inativa"} className="h-5 px-1.5 text-[10px]">
            {isPositive ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />}
            {Math.abs(growth).toFixed(1)}%
          </Badge>
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">vs mês ant.</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
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
      if (!res.ok) throw new Error("Falha ao carregar gráfico")
      return res.json()
    },
    staleTime: 60_000,
  })

  const { data: utmData, isLoading: utmLoading } = useQuery({
    queryKey: ["utm-overview"],
    queryFn: async () => {
      const res = await fetch("/api/utm-analytics")
      if (!res.ok) throw new Error("Falha ao carregar UTM")
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
    staleTime: 15_000,
    refetchInterval: 30_000,
  })

  return (
    <div className="space-y-8 pb-8 font-sans">
      <div className="animate-entrance">
        <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">Visão Geral</h1>
        <p className="text-sm font-display italic text-accent opacity-80">Métricas de performance e inteligência Escoltran</p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              title="Total de Contatos"
              value={metrics.totalContacts}
              growth={metrics.contactsGrowth}
              icon={Users}
              delay="100ms"
            />
            <MetricCard
              title="Pipeline Ativo"
              value={metrics.openDeals}
              growth={metrics.dealsGrowth}
              icon={Kanban}
              delay="200ms"
            />
            <MetricCard
              title="Valor em Aberto"
              value={metrics.pipelineValue}
              growth={metrics.pipelineGrowth}
              icon={DollarSign}
              format="currency"
              delay="300ms"
            />
            <MetricCard
              title="Taxa de Conversão"
              value={metrics.conversionRate}
              growth={metrics.conversionGrowth}
              icon={TrendingUp}
              format="percent"
              delay="400ms"
            />
          </>
        ) : (
          <div className="col-span-4 text-center text-text-muted py-12 glass rounded-xl border-dashed border-border-default">
            Nenhum dado analítico disponível ainda.
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-entrance" style={{ animationDelay: '500ms' }}>
        {/* Performance Chart */}
        <Card className="lg:col-span-2 bg-surface hover:bg-surface border-border-subtle overflow-hidden">
          <CardHeader className="border-b border-border-subtle bg-white/[0.01]">
            <CardTitle className="text-[13px] font-black font-mono uppercase tracking-[0.1em] text-text-primary">Performance Comercial</CardTitle>
            <CardDescription className="text-xs font-mono text-text-muted uppercase">Análise histórica de conversões</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            {chartLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-full h-full bg-surface-elevated/50 animate-pulse rounded-md" />
              </div>
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E0B050" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#E0B050" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorContatos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.05} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fill: "#666", fontSize: 10, fontWeight: 700, fontFamily: "monospace" }} 
                    axisLine={false}
                    tickLine={false}
                    className="uppercase"
                  />
                  <YAxis 
                    tick={{ fill: "#666", fontSize: 10, fontWeight: 700, fontFamily: "monospace" }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#0d0d0d", 
                      border: "1px solid #333", 
                      borderRadius: "6px", 
                      fontSize: "12px",
                      fontFamily: "monospace",
                      fontWeight: "bold"
                    }}
                    itemStyle={{ color: "#E0B050" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="contatos" 
                    stroke="#ffffff" 
                    strokeWidth={1} 
                    strokeOpacity={0.2}
                    fill="url(#colorContatos)" 
                    name="Leads"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="deals" 
                    stroke="#E0B050" 
                    strokeWidth={2} 
                    fill="url(#colorDeals)" 
                    name="Deals Fechados" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-text-muted gap-4">
                <Kanban className="h-10 w-10 opacity-20" />
                <p className="text-xs font-mono uppercase tracking-widest">Aguardando dados históricos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* UTM Sources Widget */}
        <Card className="bg-surface hover:bg-surface border-border-subtle overflow-hidden">
          <CardHeader className="border-b border-border-subtle bg-white/[0.01]">
            <CardTitle className="text-[13px] font-black font-mono uppercase tracking-[0.1em] text-text-primary">Fontes de Atração</CardTitle>
            <CardDescription className="text-xs font-mono text-text-muted uppercase">Distribuição por Canal</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {utmLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="h-32 w-32 rounded-full border-2 border-border-subtle animate-pulse" />
              </div>
            ) : utmData?.sources && utmData.sources.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={utmData.sources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {utmData.sources.map((entry: { color: string }, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0d0d0d", border: "1px solid #333", borderRadius: "6px" }}
                      formatter={(value) => [`${value}%`, "Share"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4 px-2">
                  {utmData.sources.slice(0, 4).map((item: { name: string; color: string; value: number }) => (
                    <div key={item.name} className="flex items-center justify-between text-[11px] font-mono font-bold uppercase">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: item.color }} />
                        <span className="text-text-muted truncate max-w-[140px] tracking-tight">{item.name}</span>
                      </div>
                      <span className="text-text-primary">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-text-muted gap-4">
                <TrendingUp className="h-10 w-10 opacity-20" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-center">Sem dados de UTM vinculados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="bg-surface hover:bg-surface border-border-subtle overflow-hidden animate-entrance" style={{ animationDelay: '600ms' }}>
        <CardHeader className="border-b border-border-subtle bg-white/[0.01] flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[13px] font-black font-mono uppercase tracking-[0.1em] text-text-primary">Monitor de Atividade</CardTitle>
            <CardDescription className="text-xs font-mono text-text-muted uppercase">Eventos em tempo real no Escoltran</CardDescription>
          </div>
          <Activity className="h-4 w-4 text-accent animate-pulse" />
        </CardHeader>
        <CardContent className="pt-6">
          {activityLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 bg-border-subtle animate-pulse shrink-0" />
                  <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : activityFeed && activityFeed.length > 0 ? (
            <div className="space-y-6">
              {activityFeed.slice(0, 6).map(
                (item: { action: string; detail: string; time: string; color: string }, i: number) => (
                  <div key={i} className="flex items-start gap-4 group cursor-default">
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0 transition-shadow duration-300", 
                      item.color, 
                      "group-hover:shadow-[0_0_8px_currentColor]")} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[13px] font-bold text-text-primary group-hover:text-accent transition-colors">{item.action}</p>
                        <span className="text-[10px] font-mono text-text-muted font-bold whitespace-nowrap uppercase tracking-tighter opacity-70">{item.time}</span>
                      </div>
                      <p className="text-[11px] font-sans text-text-muted italic mt-0.5 line-clamp-1">{item.detail}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted border border-dashed border-border-subtle rounded-lg">
              <Users className="h-10 w-10 opacity-10 mb-2" />
              <p className="text-[10px] font-mono uppercase tracking-widest">Sem log de eventos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
