"use client"

import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

interface RankingItem {
  name: string
  revenue: number
  leads: number
  deals: number
  won: number
  conversion: number
}

interface UTMTopRankingProps {
  title: string
  items: RankingItem[]
  icon?: any
}

export function UTMTopRanking({ title, items, icon: Icon = Trophy }: UTMTopRankingProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Icon className="w-4 h-4 text-[#F97316]" />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>

      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="text-center py-10 text-[#6B7280] text-xs">Nenhum dado encontrado</div>
        ) : (
          items.map((item, i) => (
            <div 
              key={i} 
              className={`group flex items-center justify-between p-3 rounded-xl border border-white/5 transition-all duration-300 hover:border-white/10 ${i === 0 ? 'bg-[#0A0A0A] border-blue-500/20' : 'bg-transparent'}`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black italic ${i === 0 ? 'text-blue-500' : 'text-[#6B7280]'}`}>
                    #{i + 1}
                  </span>
                  <span className="text-xs font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                    {item.name || "Desconhecido"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-medium h-5 px-1.5 text-[#6B7280]">
                    {item.leads} leads
                  </Badge>
                  <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-medium h-5 px-1.5 text-[#6B7280]">
                    {item.deals} deals
                  </Badge>
                  {item.won > 0 && (
                    <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-[9px] font-bold h-5 px-1.5 text-blue-400">
                      {item.won} ganhos
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xs font-black tracking-tight ${i === 0 ? 'text-blue-500' : 'text-[#F97316]'}`}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.revenue)}
                </div>
                <div className="text-[10px] text-[#6B7280] font-medium">
                  {item.conversion.toFixed(1)}% conv.
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
