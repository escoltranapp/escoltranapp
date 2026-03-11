"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, MousePointer, DollarSign, Target } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const utmSourceData = [
  { name: "Google Ads", value: 35, color: "#f97316", leads: 428, converted: 78, revenue: 245000 },
  { name: "Facebook", value: 28, color: "#f59e0b", leads: 342, converted: 54, revenue: 168000 },
  { name: "Orgânico", value: 20, color: "#ea580c", leads: 245, converted: 62, revenue: 198000 },
  { name: "Indicação", value: 12, color: "#dc2626", leads: 147, converted: 38, revenue: 125000 },
  { name: "Email", value: 5, color: "#6b7280", leads: 61, converted: 12, revenue: 42000 },
]

const funnelData = [
  { stage: "Visitantes", count: 12500 },
  { stage: "Leads", count: 1223 },
  { stage: "Qualificados", count: 456 },
  { stage: "Propostas", count: 198 },
  { stage: "Fechados", count: 89 },
]

const timelineData = [
  { semana: "S1", google: 45, facebook: 32, organico: 28, outros: 15 },
  { semana: "S2", google: 62, facebook: 41, organico: 35, outros: 18 },
  { semana: "S3", google: 38, facebook: 55, organico: 42, outros: 22 },
  { semana: "S4", google: 71, facebook: 48, organico: 38, outros: 20 },
  { semana: "S5", google: 83, facebook: 60, organico: 45, outros: 25 },
  { semana: "S6", google: 65, facebook: 52, organico: 50, outros: 28 },
]

const campaignData = [
  { campaign: "Black Friday 2024", source: "Google Ads", leads: 189, cpl: 12.5, converted: 34, revenue: 98000 },
  { campaign: "Lançamento Produto", source: "Facebook", leads: 145, cpl: 18.2, converted: 22, revenue: 64000 },
  { campaign: "Remarketing Q4", source: "Google Ads", leads: 98, cpl: 8.9, converted: 28, revenue: 87000 },
  { campaign: "Instagram Stories", source: "Facebook", leads: 87, cpl: 22.1, converted: 15, revenue: 45000 },
  { campaign: "Email Newsletter", source: "Email", leads: 61, cpl: 3.2, converted: 12, revenue: 38000 },
]

export default function UtmAnalyticsPage() {
  const totalLeads = utmSourceData.reduce((sum, d) => sum + d.leads, 0)
  const totalConverted = utmSourceData.reduce((sum, d) => sum + d.converted, 0)
  const totalRevenue = utmSourceData.reduce((sum, d) => sum + d.revenue, 0)
  const avgConversion = ((totalConverted / totalLeads) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">UTM Analytics</h1>
        <p className="text-muted-foreground text-sm">Análise de tráfego e conversão por origem</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Leads", value: totalLeads.toLocaleString("pt-BR"), icon: MousePointer, color: "text-primary" },
          { label: "Convertidos", value: totalConverted.toLocaleString("pt-BR"), icon: Target, color: "text-green-400" },
          { label: "Taxa de Conversão", value: `${avgConversion}%`, icon: TrendingUp, color: "text-amber-400" },
          { label: "Receita Total", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-blue-400" },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <p className="text-xl font-bold">{kpi.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Distribuição por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={utmSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {utmSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#f2f2f2" }}
                  formatter={(value) => [`${value}%`, "Participação"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {utmSourceData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.leads} leads</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Leads por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="semana" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "#2a2a2a" }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "#2a2a2a" }} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#f2f2f2" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="google" stroke="#f97316" strokeWidth={2} dot={false} name="Google Ads" />
                <Line type="monotone" dataKey="facebook" stroke="#f59e0b" strokeWidth={2} dot={false} name="Facebook" />
                <Line type="monotone" dataKey="organico" stroke="#22c55e" strokeWidth={2} dot={false} name="Orgânico" />
                <Line type="monotone" dataKey="outros" stroke="#6b7280" strokeWidth={2} dot={false} name="Outros" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Funnel */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Funil de Conversão</CardTitle>
          <CardDescription>Taxa de conversão em cada etapa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnelData.map((item, i) => {
              const maxCount = funnelData[0].count
              const pct = ((item.count / maxCount) * 100).toFixed(1)
              const convRate = i > 0 ? ((item.count / funnelData[i - 1].count) * 100).toFixed(1) : null

              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.stage}</span>
                    <div className="flex items-center gap-3">
                      {convRate && (
                        <span className="text-xs text-muted-foreground">→ {convRate}%</span>
                      )}
                      <span className="font-bold">{item.count.toLocaleString("pt-BR")}</span>
                    </div>
                  </div>
                  <div className="h-6 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full escoltran-gradient-bg rounded transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Performance por Campanha</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right hidden sm:table-cell">CPL</TableHead>
                <TableHead className="text-right hidden md:table-cell">Convertidos</TableHead>
                <TableHead className="text-right">Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignData.map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">{c.campaign}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{c.source}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">{c.leads}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-sm text-muted-foreground">
                    R$ {c.cpl.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell text-sm">
                    <span className="text-green-400">{c.converted}</span>
                    <span className="text-muted-foreground text-xs ml-1">
                      ({((c.converted / c.leads) * 100).toFixed(1)}%)
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary text-sm">
                    {formatCurrency(c.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
