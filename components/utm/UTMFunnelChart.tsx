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
    { label: "Fontes", value: data.sources.length, sub: "Canais", color: "from-[#EA580C] to-[#9A3412]", width: "100%" },
    { label: "Leads", value: data.leads, sub: "Contatos", color: "from-[#F97316] to-[#C2410C]", width: "85%" },
    { label: "Deals", value: data.deals, sub: "Oportunidades", color: "from-[#FB923C] to-[#EA580C]", width: "70%" },
    { label: "Ganhos", value: data.won, sub: "Conversões", color: "from-[#FDBA74] to-[#F97316]", width: "55%" },
  ]

  return (
    <div className="flex flex-col gap-3 py-6 px-4">
      {stages.map((stage, i) => {
        const percentage = i === 0 ? 100 : stages[i-1].value > 0 ? Math.round((stage.value / stages[i-1].value) * 100) : 0
        
        return (
          <div key={stage.label} className="flex items-center gap-6 group">
            <div className="w-14 text-right shrink-0">
              {i > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-[#F97316] leading-none">{percentage}%</span>
                  <span className="text-[7px] font-bold text-[#404040] uppercase tracking-tighter">Conv.</span>
                </div>
              )}
            </div>
            
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: stage.width, opacity: 1 }}
              transition={{ duration: 1.2, delay: i * 0.15, ease: "circOut" }}
              className={`h-16 bg-gradient-to-br ${stage.color} rounded-xl relative flex items-center justify-between px-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden group-hover:scale-[1.02] transition-all cursor-default border border-white/10`}
              style={{
                clipPath: i === 0 
                  ? "polygon(0% 0%, 100% 0%, 97% 100%, 3% 100%)" 
                  : i === stages.length - 1
                  ? "polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)"
                  : "polygon(3% 0%, 97% 0%, 95% 100%, 5% 100%)"
              }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -left-10 top-0 w-24 h-full bg-white/10 skew-x-[-20deg] blur-xl group-hover:left-[110%] transition-all duration-1000 ease-in-out" />
              
              <div className="flex flex-col relative z-10">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-0.5">{stage.label}</span>
                <span className="text-xl font-black text-white italic tracking-tighter leading-none">{stage.value}</span>
              </div>
              <span className="text-[9px] font-black text-white/40 italic uppercase tracking-widest relative z-10">{stage.sub}</span>
            </motion.div>
          </div>
        )
      })}

      <div className="flex justify-around mt-12 gap-6">
        <div className="flex-1 text-center p-6 rounded-[24px] bg-[#1A1A1A]/40 border border-white/[0.04] relative overflow-hidden group/card hover:border-[#F97316]/30 transition-all">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#F97316]/50 to-transparent" />
          <div className="text-[9px] font-black text-[#404040] uppercase tracking-[0.2em] mb-2">Lead → Deal</div>
          <div className="text-3xl font-black text-white italic tracking-tighter group-hover/card:text-[#F97316] transition-colors">
            {data.leads > 0 ? Math.round((data.deals / data.leads) * 100) : 0}%
          </div>
          <div className="mt-1 h-1 w-12 bg-[#F97316]/20 rounded-full mx-auto overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (data.deals / data.leads) * 100)}%` }}
              className="h-full bg-[#F97316]"
            />
          </div>
        </div>

        <div className="flex-1 text-center p-6 rounded-[24px] bg-[#1A1A1A]/40 border border-white/[0.04] relative overflow-hidden group/card hover:border-[#F97316]/30 transition-all">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#F97316]/50 to-transparent" />
          <div className="text-[9px] font-black text-[#404040] uppercase tracking-[0.2em] mb-2">Deal → Ganho</div>
          <div className="text-3xl font-black text-white italic tracking-tighter group-hover/card:text-[#F97316] transition-colors">
            {data.deals > 0 ? Math.round((data.won / data.deals) * 100) : 0}%
          </div>
          <div className="mt-1 h-1 w-12 bg-[#F97316]/20 rounded-full mx-auto overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (data.won / data.deals) * 100)}%` }}
              className="h-full bg-[#F97316]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
