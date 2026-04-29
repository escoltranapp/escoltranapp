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
    { label: "Fontes", value: data.sources.length, sub: "Canais", color: "bg-[#0070F3]", width: "w-[400px]", topWidth: "100%", botWidth: "80%" },
    { label: "Leads", value: data.leads, sub: "Contatos", color: "bg-[#00C2FF]", width: "w-[320px]", topWidth: "100%", botWidth: "75%" },
    { label: "Deals", value: data.deals, sub: "Oportunidades", color: "bg-[#00E5FF]", width: "w-[240px]", topWidth: "100%", botWidth: "65%" },
    { label: "Ganhos", value: data.won, sub: "Conversões", color: "bg-[#2563EB]", width: "w-[156px]", topWidth: "100%", botWidth: "100%" },
  ]

  return (
    <div className="flex flex-col items-center py-10 relative">
      <div className="flex flex-col items-center w-full max-w-[500px]">
        {stages.map((stage, i) => {
          const percentage = i === 0 ? 100 : stages[i-1].value > 0 ? Math.round((stage.value / stages[i-1].value) * 100) : 0
          
          return (
            <div key={stage.label} className="relative flex flex-col items-center group w-full">
              {/* Conversion Percentage on the side */}
              {i > 0 && (
                <div className="absolute left-[calc(50%+220px)] top-[-10px] text-right">
                  <div className="text-[14px] font-black text-white leading-none">{stage.value}</div>
                  <div className="text-[10px] font-bold text-[#6B7280]">{percentage}%</div>
                </div>
              )}
              {i === 0 && (
                <div className="absolute left-[calc(50%+220px)] top-[20px] text-right text-[14px] font-black text-white">
                  {stage.value}
                </div>
              )}

              <motion.div 
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={`${stage.width} h-[70px] ${stage.color} relative flex flex-col items-center justify-center border-t border-white/20`}
                style={{
                  clipPath: i === stages.length - 1 
                    ? "none" 
                    : `polygon(0% 0%, 100% 0%, ${(100 + Number(stage.botWidth.replace('%','')))/2}% 100%, ${(100 - Number(stage.botWidth.replace('%','')))/2}% 100%)`
                }}
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-white/80">{stage.label}</span>
                <span className="text-xl font-black text-white leading-none mt-1">{stage.value}</span>
              </motion.div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-20 mt-16 w-full max-w-[600px] border-t border-white/5 pt-10">
        <div className="text-center">
          <div className="text-4xl font-black text-[#00C2FF] tracking-tighter">
            {data.leads > 0 ? Math.round((data.deals / data.leads) * 100) : 0}%
          </div>
          <div className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest mt-1">Lead → Deal</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-black text-[#00E5FF] tracking-tighter">
            {data.deals > 0 ? Math.round((data.won / data.deals) * 100) : 0}%
          </div>
          <div className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest mt-1">Deal → Ganho</div>
        </div>
      </div>
    </div>
  )
}
