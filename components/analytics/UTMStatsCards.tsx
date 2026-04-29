"use client"

import { Card } from "@/components/ui/card"
import { Users, Briefcase, Calculator, TrendingUp, DollarSign } from "lucide-react"

interface Stat {
  label: string
  value: string | number
  subValue?: string
  icon: any
}

interface UTMStatsCardsProps {
  stats: {
    leads: number
    deals: number
    pipelineValue: number
    conversionRate: number
    revenue: number
  }
}

export function UTMStatsCards({ stats }: UTMStatsCardsProps) {
  const items: Stat[] = [
    {
      label: "Leads",
      value: stats.leads,
      subValue: "Contatos com UTM",
      icon: Users,
    },
    {
      label: "Deals Criados",
      value: stats.deals,
      subValue: "Oportunidades abertas",
      icon: Briefcase,
    },
    {
      label: "Em Pipeline",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(stats.pipelineValue),
      subValue: "R$ 0 em valor", // In the screenshot it says R$ 580.000 em valor, but I'll use real data
      icon: Calculator,
    },
    {
      label: "Taxa de Conversão",
      value: `${stats.conversionRate.toFixed(1)}%`,
      subValue: "Lead → Deal ganho",
      icon: TrendingUp,
    },
    {
      label: "Receita",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(stats.revenue),
      subValue: "Deals ganhos",
      icon: DollarSign,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {items.map((item, i) => (
        <Card key={i} className="bg-[#0A0A0A] border-white/5 p-4 flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#6B7280] font-bold">{item.label}</span>
            <item.icon className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
          </div>
          <div className="mt-1">
            <div className="text-xl font-bold text-white tracking-tight">{item.value}</div>
            <div className="text-[11px] text-[#6B7280] font-medium">{item.subValue}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}
