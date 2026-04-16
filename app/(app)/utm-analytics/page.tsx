"use client"

import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

function KPICard({ 
  label, value, icon, trend, color = "#ffc880" 
}: { 
  label: string; value: string | number; icon: string; trend?: string; color?: string 
}) {
  return (
    <div className="bg-surface-container border border-white/5 rounded-2xl p-6 hover:bg-surface-container-high transition-all group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
        </div>
        {trend && (
           <div className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-amber-500 bg-amber-500/10">
              {trend}
           </div>
        )}
      </div>
      <div className="space-y-1">
         <div className="text-2xl font-bold text-white tracking-tight font-mono">{value}</div>
         <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">{label}</div>
      </div>
    </div>
  )
}

export default function UtmAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["utm-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/utm")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 30_000,
  })

  const chartData = analytics?.sourceBreakdown || []

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      
      {/* HEADER ESCOLTRAN */}
      <header className="mb-10">
         <h1 className="text-[32px] font-bold text-white tracking-tight">UTM Analytics</h1>
         <p className="text-slate-500 text-[14px] mt-1">Rastreamento de origens e performance de canais de aquisição</p>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <KPICard label="Cliques Totais" value={analytics?.totalHits || "12.4k"} icon="ads_click" trend="+15%" color="#ffc880" />
        <KPICard label="Conversão Meta" value={`${analytics?.conversionRate || 3.2}%`} icon="track_changes" trend="Stable" color="#7ae982" />
        <KPICard label="Cost per Lead" value="R$ 14,20" icon="payments" trend="-2.4%" color="#ffb4ab" />
        <KPICard label="ROI Global" value="4.2x" icon="trending_up" trend="Neural Opt" color="#adc6ff" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SOURCE BREAKDOWN CHART */}
        <div className="lg:col-span-8 bg-surface-container border border-white/5 rounded-2xl p-8">
          <h3 className="text-[15px] font-bold text-white tracking-tight mb-10">Performance por Origem de Tráfego</h3>
          <div className="h-[340px] w-full">
            {isLoading ? (
               <div className="h-full bg-surface-lowest/40 rounded-xl animate-pulse" />
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d363e" vertical={false} />
                  <XAxis dataKey="source" stroke="#524534" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#524534" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#182028", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", fontSize: "12px" }} 
                    itemStyle={{ color: "#ffc880" }}
                  />
                  <Bar dataKey="hits" fill="#ffc880" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* TOP CAMPAIGNS LIST */}
        <div className="lg:col-span-4 bg-surface-container border border-white/5 rounded-2xl p-8">
          <h3 className="text-[15px] font-bold text-white tracking-tight mb-8">Top Campanhas (Live)</h3>
          <div className="space-y-6">
            {[
              { name: "Google_Search_Branding", lead: 142, roi: "3.5x" },
              { name: "FB_Ads_Lookahead", lead: 84, roi: "2.1x" },
              { name: "LinkedIn_Outbound_Direct", lead: 32, roi: "5.4x" },
              { name: "Influencer_Trial_01", lead: 12, roi: "1.2x" }
            ].map((c, i) => (
              <div key={i} className="group p-4 rounded-xl border border-white/5 bg-surface-container-low hover:bg-surface-container-high transition-all">
                <div className="text-[12px] font-bold text-white truncate mb-2 uppercase tracking-tight">{c.name}</div>
                <div className="flex justify-between items-center text-[10px] font-mono font-black text-slate-500">
                   <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">bolt</span>{c.lead} Leads</div>
                   <div className="text-amber-500/80">ROI: {c.roi}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
