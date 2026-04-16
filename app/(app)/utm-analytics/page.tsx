"use client"

import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function UtmAnalyticsPage() {
  const chartData = [
     { source: "Google", hits: 450 },
     { source: "Facebook", hits: 320 },
     { source: "Direct", hits: 280 },
     { source: "LinkedIn", hits: 150 },
     { source: "Email", hits: 120 },
  ]

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">UTM Analytics</h1>
        <p className="text-[#6B7280] text-[15px] mt-2 font-bold tracking-tight">Rastreamento de origens e performance de canais de aquisição</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         {["Cliques Totais", "Meta Conversão", "Cost per Lead", "ROI Global"].map((l, i) => (
            <div key={i} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-lg">
               <div className="text-[10px] font-mono text-[#6B7280] uppercase tracking-[0.2em] font-black mb-1 italic">{l}</div>
               <div className="text-2xl font-black text-[#F97316] tracking-tighter font-mono">
                  {i === 2 ? "R$ 14,20" : i === 3 ? "4.2x" : i === 1 ? "12.4%" : "12.4k"}
               </div>
            </div>
         ))}
      </div>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-10 shadow-xl">
         <h3 className="text-lg font-bold text-white tracking-tight uppercase italic mb-10">Performance por Origem</h3>
         <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="source" stroke="#404040" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#404040" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid #262626", borderRadius: "12px", fontSize: "12px" }} 
                    itemStyle={{ color: "#F97316" }}
                  />
                  <Bar dataKey="hits" fill="#F97316" radius={[4, 4, 0, 0]} barSize={32} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  )
}
