"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useUTMAnalytics } from "@/hooks/useUTMAnalytics"
import { BarChart2, ArrowUpRight } from "lucide-react"

export function UTMWidget() {
  const { data, isLoading } = useUTMAnalytics()

  if (isLoading) return <div className="h-[250px] w-full rounded-2xl bg-white/5 animate-pulse" />

  const summary = data?.summary
  const campaigns = data?.topCampaigns?.slice(0, 3) ?? []

  return (
    <Card className="bg-[#0A0A0A] border-white/5 overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] flex items-center gap-2">
          <BarChart2 className="w-3 h-3" /> UTM Analytics
        </CardTitle>
        <Link href="/utm-analytics" className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
          Ver tudo <ArrowUpRight className="w-2.5 h-2.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-tighter text-[#6B7280]">Leads</p>
            <p className="text-xl font-black text-white">{summary?.totalContacts ?? 0}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-tighter text-[#6B7280]">Deals</p>
            <p className="text-xl font-black text-white">{summary?.totalDeals ?? 0}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-tighter text-[#6B7280]">Receita</p>
            <p className="text-xl font-black text-emerald-500">
              R$ {(summary?.totalRevenue ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-tighter text-[#6B7280]">Conv.</p>
            <p className="text-xl font-black text-blue-500">
              {(summary?.conversionRate ?? 0).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/5 pt-4">
          {campaigns.map((c) => (
            <div key={c.campaign} className="flex justify-between items-center text-[10px]">
              <span className="truncate max-w-[140px] text-[#6B7280] font-bold uppercase">{c.campaign}</span>
              <span className="font-black text-white tracking-tight">R$ {c.revenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
