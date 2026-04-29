"use client"

interface UTMFunnelProps {
  data: {
    sources: number
    leads: number
    deals: number
    won: number
  }
}

export function UTMFunnel({ data }: UTMFunnelProps) {
  const steps = [
    { label: "Fontes", value: data.sources, color: "bg-[#0070F3]", width: "100%" },
    { label: "Leads", value: data.leads, color: "bg-[#00C2FF]", width: "80%" },
    { label: "Deals", value: data.deals, color: "bg-[#00E5FF]", width: "60%" },
    { label: "Ganhos", value: data.won, color: "bg-[#2563EB]", width: "40%" },
  ]

  const leadToDeal = data.leads > 0 ? Math.round((data.deals / data.leads) * 100) : 0
  const dealToWon = data.deals > 0 ? Math.round((data.won / data.deals) * 100) : 0

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-white mb-8">Funil de Conversão</h3>
      
      <div className="flex flex-col items-center flex-1 relative gap-1">
        {steps.map((step, i) => (
          <div 
            key={i} 
            className="relative flex items-center justify-center transition-all duration-500"
            style={{ 
              width: step.width, 
              height: "60px",
              clipPath: i === 0 
                ? "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)" 
                : i === steps.length - 1
                ? "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)" // Reverted for bottom
                : "polygon(10% 0%, 90% 0%, 85% 100%, 15% 100%)" // Middle ones
            }}
          >
            {/* Actual Funnel Segment */}
            <div 
              className={`absolute inset-0 ${step.color} opacity-90 transition-all duration-700`}
              style={{
                clipPath: i === 0 
                  ? "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)" 
                  : i === 1
                  ? "polygon(12.5% 0%, 87.5% 0%, 83% 100%, 17% 100%)"
                  : i === 2
                  ? "polygon(25% 0%, 75% 0%, 70% 100%, 30% 100%)"
                  : "polygon(43% 0%, 57% 0%, 65% 100%, 35% 100%)"
              }}
            />
            
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[9px] font-bold text-white/80 uppercase tracking-tighter">{step.label}</span>
              <span className="text-sm font-black text-white leading-tight">{step.value}</span>
            </div>

            {/* Labels on the right */}
            <div className="absolute right-[-40px] text-right">
               <div className="text-[10px] font-bold text-white">{i + 1}</div>
               {i === 1 && <div className="text-[9px] text-[#6B7280]">{data.leads} leads</div>}
               {i === 2 && <div className="text-[9px] text-[#6B7280]">{data.deals} deals</div>}
               {i === 3 && <div className="text-[9px] text-[#6B7280]">{data.won} ganhos</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-around mt-12 px-8">
        <div className="text-center">
           <div className="text-xl font-black text-[#00C2FF]">{leadToDeal}%</div>
           <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-tight">Lead → Deal</div>
        </div>
        <div className="text-center">
           <div className="text-xl font-black text-[#00C2FF]">{dealToWon}%</div>
           <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-tight">Deal → Ganho</div>
        </div>
      </div>
    </div>
  )
}
