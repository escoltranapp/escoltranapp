"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, MousePointer, DollarSign, Target, Users } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

function SkeletonCard() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-2">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="h-7 w-16 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  )
}

export default function UtmAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["utm-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/utm-analytics")
      if (!res.ok) throw new Error("Falha ao carregar UTM analytics")
      return res.json()
    },
    staleTime: 60_000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">UTM Analytics</h1>
        <p className="text-muted-foreground">Rastreamento de origens e conversões</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          [
            {
              label: "Total de Leads",
              value: (data?.totalLeads || 0).toLocaleString("pt-BR"),
              icon: Users,
              color: "text-primary",
            },
            {
              label: "Novos Este Mês",
              value: (data?.newThisMonth || 0).toLocaleString("pt-BR"),
              icon: TrendingUp,
              color: "text-green-400",
            },
            {
              label: "Taxa de Conversão",
              value: `${data?.conversionRate || "0"}%`,
              icon: Target,
              color: "text-blue-400",
            },
            {
              label: "Receita Total",
              value: formatCurrency(data?.totalRevenue || 0),
              icon: DollarSign,
              color: "text-amber-400",
            },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribuição por fonte */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Distribuição por Canal</CardTitle>
            <CardDescription>Contatos por canal de origem</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="h-32 w-32 rounded-full border-4 border-muted animate-pulse" />
              </div>
            ) : data?.sources && data.sources.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.sources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="name"
                    >
                      {data.sources.map((entry: { color: string }, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#f2f2f2" }}
                      formatter={(value, name) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {data.sources.map((item: { name: string; color: string; count: number; value: number }) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground truncate max-w-[160px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">{item.count} leads</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <MousePointer className="h-8 w-8 opacity-30" />
                <p className="text-sm">Sem dados de origem ainda</p>
                <p className="text-xs">Defina o canal ao cadastrar contatos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funil de conversão */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>Da prospecção ao fechamento</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 mt-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 rounded bg-muted animate-pulse" style={{ width: `${100 - i * 15}%` }} />
                ))}
              </div>
            ) : data?.funnel && data.funnel.length > 0 ? (
              <div className="space-y-3 mt-4">
                {data.funnel.map((stage: { stage: string; value: number; color: string }, i: number) => {
                  const maxVal = data.funnel[0]?.value || 1
                  const pct = maxVal > 0 ? (stage.value / maxVal) * 100 : 0
                  return (
                    <div key={stage.stage} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{stage.stage}</span>
                        <span className="font-medium">{stage.value.toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="h-7 rounded-md overflow-hidden bg-muted">
                        <div
                          className="h-full rounded-md flex items-center px-3 text-xs text-white font-medium transition-all"
                          style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: stage.color }}
                        >
                          {i > 0 && data.funnel[i - 1]?.value > 0
                            ? `${((stage.value / data.funnel[i - 1].value) * 100).toFixed(0)}%`
                            : ""}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <TrendingUp className="h-8 w-8 opacity-30" />
                <p className="text-sm">Sem dados de funil ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
