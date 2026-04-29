"use client"

import { motion } from "framer-motion"

interface UTMFunnelChartProps {
  data: {
    sources: string[]
    leads: number
    deals: number
    won: number
  }
}

export function UTMFunnelChart({ data }: UTMFunnelChartProps) {
  const stages = [
    { label: "Fontes", value: data.sources.length, sub: "Canais", color: "from-[#0070F3] to-[#0051B3]", width: "100%" },
    { label: "Leads", value: data.leads, sub: "Contatos", color: "from-[#00C2FF] to-[#0099CC]", width: "85%" },
    { label: "Deals", value: data.deals, sub: "Oportunidades", color: "from-[#00E5FF] to-[#00B2CC]", width: "70%" },
    { label: "Ganhos", value: data.won, sub: "Conversões", color: "from-[#2563EB] to-[#1D4ED8]", width: "55%" },
  ]

  return (
    <div className="flex flex-col gap-2 py-4 px-4">
      {stages.map((stage, i) => {
        const percentage = i === 0 ? 100 : stages[i-1].value > 0 ? Math.round((stage.value / stages[i-1].value) * 100) : 0
        
        return (
          <div key={stage.label} className="flex items-center gap-4 group">
            <div className="w-12 text-right">
              {i > 0 && (
                <span className="text-[10px] font-black text-[#6B7280]">{percentage}%</span>
              )}
            </div>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: stage.width }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className={`h-14 bg-gradient-to-r ${stage.color} rounded-md relative flex items-center justify-between px-6 shadow-lg shadow-black/20 overflow-hidden group-hover:brightness-110 transition-all cursor-default`}
              style={{
                clipPath: i === 0 
                  ? "polygon(0% 0%, 100% 0%, 98% 100%, 2% 100%)" 
                  : i === stages.length - 1
                  ? "polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)"
                  : "polygon(2% 0%, 98% 0%, 96% 100%, 4% 100%)"
              }}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-tighter text-white/70">{stage.label}</span>
                <span className="text-lg font-black text-white">{stage.value}</span>
              </div>
              <span className="text-[10px] font-bold text-white/50 italic">{stage.sub}</span>
            </motion.div>
          </div>
        )
      })}

      <div className="flex justify-around mt-10">
        <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-xs font-black text-[#6B7280] uppercase tracking-widest mb-1">Lead → Deal</div>
          <div className="text-2xl font-black text-blue-500">
            {data.leads > 0 ? Math.round((data.deals / data.leads) * 100) : 0}%
          </div>
        </div>
        <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-xs font-black text-[#6B7280] uppercase tracking-widest mb-1">Deal → Ganho</div>
          <div className="text-2xl font-black text-blue-500">
            {data.deals > 0 ? Math.round((data.won / data.deals) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  )
}
