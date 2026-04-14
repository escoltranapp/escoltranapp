"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Users,
  Kanban,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
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
import { formatCurrency } from "@/lib/utils"

// ─── Skeleton loader ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-7 w-24 rounded bg-muted animate-pulse mb-2" />
        <div className="h-3 w-32 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  )
}

// ─── Metric card ────────────────────────────────────────────────────
function MetricCard({
  title,
  value,
  growth,
  icon: Icon,
  format = "number",
}: {
  title: string
  value: number
  growth: number
  icon: React.ElementType
  format?: "number" | "currency" | "percent"
}) {
  const isPositive = growth > 0
  const formatted =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
      ? `${value.toFixed(1)}%`
      : value.toLocaleString("pt-BR")

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{formatted}</div>
        <div
          className={`flex items-center gap-1 text-xs mt-1 ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(growth).toFixed(1)}% vs mês anterior
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu CRM</p>
      </div>

      {/* Metric Cards */}
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
            />
            <MetricCard
              title="Deals Abertos"
              value={metrics.openDeals}
              growth={metrics.dealsGrowth}
              icon={Kanban}
            />
            <MetricCard
              title="Valor do Pipeline"
              value={metrics.pipelineValue}
              growth={metrics.pipelineGrowth}
              icon={DollarSign}
              format="currency"
            />
            <MetricCard
              title="Taxa de Conversão"
              value={metrics.conversionRate}
              growth={metrics.conversionGrowth}
              icon={TrendingUp}
              format="percent"
            />
          </>
        ) : (
          <div className="col-span-4 text-center text-muted-foreground py-8">
            Nenhum dado disponível ainda. Comece cadastrando contatos e deals.
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle>Performance de Vendas</CardTitle>
            <CardDescription>Deals fechados e contatos por mês</CardDescription>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="space-y-3 w-full px-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                  ))}
                </div>
              </div>
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorContatos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="mes" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={{ stroke: "#2a2a2a" }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={{ stroke: "#2a2a2a" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#f2f2f2" }}
                  />
                  <Area type="monotone" dataKey="contatos" stroke="#f59e0b" strokeWidth={2} fill="url(#colorContatos)" name="Contatos" />
                  <Area type="monotone" dataKey="deals" stroke="#f97316" strokeWidth={2} fill="url(#colorValor)" name="Deals Fechados" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Kanban className="h-8 w-8 opacity-30" />
                <p className="text-sm">Nenhum dado de vendas ainda</p>
                <p className="text-xs">Feche deals para ver a performance aqui</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* UTM Widget */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Origens de Tráfego</CardTitle>
            <CardDescription>Distribuição por canal de origem</CardDescription>
          </CardHeader>
          <CardContent>
            {utmLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="h-32 w-32 rounded-full border-4 border-muted animate-pulse" />
              </div>
            ) : utmData?.sources && utmData.sources.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={utmData.sources}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {utmData.sources.map((entry: { color: string }, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#f2f2f2" }}
                      formatter={(value) => [`${value}%`, "Participação"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {utmData.sources.slice(0, 5).map((item: { name: string; color: string; value: number }) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <TrendingUp className="h-8 w-8 opacity-30" />
                <p className="text-sm">Sem dados de origem ainda</p>
                <p className="text-xs">Defina o canal ao cadastrar contatos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas ações no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-36 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : activityFeed && activityFeed.length > 0 ? (
            <div className="space-y-4">
              {activityFeed.map(
                (item: { action: string; detail: string; time: string; color: string }, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <Users className="h-8 w-8 opacity-30" />
              <p className="text-sm">Nenhuma atividade recente</p>
              <p className="text-xs">As ações do sistema aparecerão aqui</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
