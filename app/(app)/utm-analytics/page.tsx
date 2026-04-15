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
import { TrendingUp, MousePointer, DollarSign, Target, Users, Activity, BarChart3, PieChartIcon } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

import { ArrowUpRight, ArrowDownRight, Activity as ActivityIndicator } from "lucide-react"

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
  value: any
  growth: number
  icon: React.ElementType
  format?: "number" | "currency" | "percent"
  delay?: string
  color?: string
}) {
  const isPositive = growth >= 0
  const formatted =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
      ? `${value}`
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
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none group-hover:opacity-20 transition-opacity">
          <Icon className="h-16 w-16 text-white rotate-12" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 relative z-10">
        <span className={cn("text-[10px] font-bold text-white/20 uppercase tracking-widest italic")}>Dataset Sincronizado</span>
      </div>
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
    <div className="max-w-[1600px] mx-auto space-y-12 pb-12 px-2 sm:px-6 lg:px-10 flex flex-col h-full overflow-hidden font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-entrance">
        <div className="space-y-4">
          <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent text-[10px] font-bold py-1 px-3 rounded-full flex items-center w-fit gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            INTELIGÊNCIA DE RASTREAMENTO
          </Badge>
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-3">
              UTM <span className="text-accent underline decoration-accent/20 underline-offset-8 transition-all hover:decoration-accent/50 cursor-default">Analytics</span> 🛰️
            </h1>
            <p className="text-sm font-medium text-white/40 mt-3 flex items-center gap-2">
              MONITORAMENTO DE CANAIS <span className="h-1 w-1 rounded-full bg-white/20" /> ATRIBUIÇÃO <span className="h-1 w-1 rounded-full bg-white/20" /> STATUS: <span className="text-accent/60">ANALISANDO</span>
            </p>
          </div>
        </div>

        <PieChartIcon className="h-12 w-12 text-white/5" />
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <MetricCard
              title="Volumetria Leads"
              value={data?.totalLeads ?? 0}
              growth={0}
              icon={Users}
              color="info"
              delay="100ms"
            />
            <MetricCard
              title="Mês Vigente"
              value={data?.newThisMonth ?? 0}
              growth={0}
              icon={TrendingUp}
              color="success"
              delay="200ms"
            />
            <MetricCard
              title="Conversão Global"
              value={data?.conversionRate ?? 0}
              growth={0}
              icon={Target}
              color="warning"
              format="percent"
              delay="300ms"
            />
            <MetricCard
              title="Dataset Revenue"
              value={data?.totalRevenue ?? 0}
              growth={0}
              icon={DollarSign}
              color="accent"
              format="currency"
              delay="400ms"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por fonte */}
        <Card className="bg-surface border-border-subtle overflow-hidden">
          <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-text-muted">Marketing Mix</CardTitle>
              <CardDescription className="text-[10px] font-display italic text-accent/60">Distribuição por canal de origem</CardDescription>
            </div>
            <PieChartIcon className="h-4 w-4 text-text-muted opacity-20" />
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="h-32 w-32 rounded-full border-4 border-white/5 border-t-accent animate-spin" />
              </div>
            ) : data?.sources && data.sources.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={data.sources}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="name"
                      stroke="none"
                    >
                      {data.sources.map((entry: { color: string }, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#121212", border: "1px solid #333", borderRadius: "8px", color: "#f2f2f2", fontSize: "12px", fontFamily: "monospace" }}
                      itemStyle={{ color: "#E0B050" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-6 pt-6 border-t border-border-subtle">
                  {data.sources.map((item: { name: string; color: string; count: number; value: number }) => (
                    <div key={item.name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-black uppercase tracking-tight text-text-muted group-hover:text-text-primary transition-colors truncate max-w-[100px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-text-muted opacity-40">{item.count}</span>
                        <span className="font-bold text-accent">{item.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-text-muted opacity-20 gap-3">
                <MousePointer className="h-10 w-10" />
                <p className="text-xs font-mono uppercase tracking-[0.2em]">Dataset Origin: Empty</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funil de conversão */}
        <Card className="bg-surface border-border-subtle overflow-hidden">
          <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-text-muted">Conversion Pipeline</CardTitle>
              <CardDescription className="text-[10px] font-display italic text-accent/60">Taxa de retenção entre estágios</CardDescription>
            </div>
            <BarChart3 className="h-4 w-4 text-text-muted opacity-20" />
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4 pt-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 rounded bg-white/5 animate-pulse" style={{ width: `${100 - i * 15}%` }} />
                ))}
              </div>
            ) : data?.funnel && data.funnel.length > 0 ? (
              <div className="space-y-4 pt-2">
                {data.funnel.map((stage: { stage: string; value: number; color: string }, i: number) => {
                  const maxVal = data.funnel[0]?.value || 1
                  const pct = maxVal > 0 ? (stage.value / maxVal) * 100 : 0
                  const dropOff = i > 0 && data.funnel[i - 1]?.value > 0
                    ? `${((stage.value / data.funnel[i - 1].value) * 100).toFixed(0)}%`
                    : null

                  return (
                    <div key={stage.stage} className="space-y-2 group">
                      <div className="flex items-center justify-between text-[11px] font-black font-mono uppercase tracking-widest text-text-muted">
                        <span className="group-hover:text-text-primary transition-colors">{stage.stage}</span>
                        <span className="text-text-primary">{stage.value.toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="relative h-10 rounded-lg bg-black/40 border border-border-subtle flex items-center overflow-hidden">
                        <div
                          className="h-full rounded-r-lg flex items-center px-4 transition-all duration-1000 ease-out border-r-2 border-white/20"
                          style={{ width: `${Math.max(pct, 12)}%`, backgroundColor: stage.color, opacity: 0.7 }}
                        />
                        {dropOff && (
                          <div className="absolute right-3 text-[10px] font-bold font-mono text-accent">
                            {dropOff} <span className="text-[8px] opacity-40 font-black uppercase ml-1">Retenção</span>
                          </div>
                        )}
                        <Activity className="absolute left-3 h-3 w-3 text-white/20 group-hover:text-white/40 transition-colors" />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-text-muted opacity-20 gap-3">
                <TrendingUp className="h-10 w-10" />
                <p className="text-xs font-mono uppercase tracking-[0.2em]">Pipeline Monitor: Offline</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
