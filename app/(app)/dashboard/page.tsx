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
  Legend,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

const mockMetrics = {
  totalContacts: 1247,
  contactsGrowth: 12.5,
  openDeals: 89,
  dealsGrowth: -3.2,
  pipelineValue: 458000,
  pipelineGrowth: 22.1,
  conversionRate: 18.4,
  conversionGrowth: 5.7,
}

const mockChartData = [
  { mes: "Jan", deals: 12, valor: 45000, contatos: 89 },
  { mes: "Fev", deals: 19, valor: 78000, contatos: 102 },
  { mes: "Mar", deals: 15, valor: 62000, contatos: 94 },
  { mes: "Abr", deals: 27, valor: 115000, contatos: 138 },
  { mes: "Mai", deals: 23, valor: 98000, contatos: 121 },
  { mes: "Jun", deals: 31, valor: 142000, contatos: 167 },
  { mes: "Jul", deals: 28, valor: 130000, contatos: 155 },
]

const mockUtmData = [
  { name: "Google Ads", value: 35, color: "#f97316" },
  { name: "Facebook", value: 28, color: "#f59e0b" },
  { name: "Orgânico", value: 20, color: "#ea580c" },
  { name: "Indicação", value: 12, color: "#dc2626" },
  { name: "Outros", value: 5, color: "#6b7280" },
]

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
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
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
  const { data: metrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/dashboard/metrics")
        if (res.ok) return res.json()
      } catch {
        // ignore
      }
      return mockMetrics
    },
  })

  const data = metrics || mockMetrics

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu CRM</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Contatos"
          value={data.totalContacts}
          growth={data.contactsGrowth}
          icon={Users}
        />
        <MetricCard
          title="Deals Abertos"
          value={data.openDeals}
          growth={data.dealsGrowth}
          icon={Kanban}
        />
        <MetricCard
          title="Valor do Pipeline"
          value={data.pipelineValue}
          growth={data.pipelineGrowth}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Taxa de Conversão"
          value={data.conversionRate}
          growth={data.conversionGrowth}
          icon={TrendingUp}
          format="percent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle>Performance de Vendas</CardTitle>
            <CardDescription>Deals fechados e valor gerado por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={mockChartData}>
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
                <XAxis
                  dataKey="mes"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#2a2a2a" }}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#2a2a2a" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#f2f2f2",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="contatos"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#colorContatos)"
                  name="Contatos"
                />
                <Area
                  type="monotone"
                  dataKey="deals"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#colorValor)"
                  name="Deals"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* UTM Widget */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Origens de Tráfego</CardTitle>
            <CardDescription>Distribuição por UTM Source</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mockUtmData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {mockUtmData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#f2f2f2",
                  }}
                  formatter={(value) => [`${value}%`, "Participação"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {mockUtmData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
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
          <div className="space-y-4">
            {[
              { action: "Novo lead cadastrado", detail: "Maria Silva — Google Ads", time: "2 min atrás", color: "bg-green-500" },
              { action: "Deal movido para Proposta", detail: "João Santos — R$ 15.000", time: "15 min atrás", color: "bg-primary" },
              { action: "Atividade concluída", detail: "Ligação com Pedro Costa", time: "1h atrás", color: "bg-blue-500" },
              { action: "Novo contato importado", detail: "Importação via webhook n8n", time: "2h atrás", color: "bg-amber-500" },
              { action: "Deal ganho!", detail: "Ana Oliveira — R$ 28.000", time: "3h atrás", color: "bg-green-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
