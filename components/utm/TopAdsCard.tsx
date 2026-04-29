"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layout, Target } from "lucide-react"

interface TopAdsCardProps {
  data: any[]
}

export function TopAdsCard({ data }: TopAdsCardProps) {
  return (
    <Card className="bg-[#0A0A0A] border-white/5 h-full">
      <CardHeader className="flex flex-row items-center gap-2 pb-6">
        <Target className="w-4 h-4 text-orange-500" />
        <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Top Anúncios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((row, i) => (
          <div key={row.name} className={`group p-4 rounded-2xl border transition-all duration-300 ${i === 0 ? 'bg-orange-500/5 border-orange-500/20 shadow-lg shadow-orange-500/5' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="text-xs font-black text-white group-hover:text-orange-400 transition-colors truncate">
                   {row.name}
                </span>
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-tighter truncate">
                  {row.adset || "Sem Campanha"}
                </span>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-sm font-black tracking-tight ${i === 0 ? 'text-orange-400' : 'text-white/80'}`}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(row.revenue)}
                </div>
                {row.pipeline_value > 0 && (
                  <div className="text-[9px] font-bold text-[#6B7280] uppercase">
                    + {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(row.pipeline_value)} pipe
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-black uppercase h-5 text-[#6B7280]">
                {row.leads} leads
              </Badge>
              <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-black uppercase h-5 text-[#6B7280]">
                {row.deals} deals
              </Badge>
              <Badge variant="outline" className={`text-[9px] font-black uppercase h-5 ${i === 0 ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-white/10 border-white/20 text-white/50'}`}>
                {row.won} ganhos
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
