"use client"

import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AiInsightsPage() {
  return (
    <div className="animate-in fade-in duration-700 pb-24">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">IA Insights</h1>
        <p className="text-[#6B7280] text-[15px] mt-2 font-bold tracking-tight">Análise neural preditiva e qualificação algorítmica de leads</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         {["Qualificações", "Efficiency Rate", "Hot Leads", "Ações Autônomas"].map((l, i) => (
            <div key={i} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 shadow-lg">
               <div className="text-[10px] font-mono text-[#6B7280] uppercase tracking-[0.2em] font-black mb-1 italic">{l}</div>
               <div className="text-2xl font-black text-[#F97316] tracking-tighter font-mono">
                  {i === 1 ? "94%" : i === 2 ? "12" : i === 3 ? "42" : "148"}
               </div>
            </div>
         ))}
      </div>

      <Tabs defaultValue="bant" className="space-y-8">
        <div className="bg-[#1A1A1A] p-1 rounded-xl w-fit border border-[#262626]">
          <TabsList className="bg-transparent h-10 gap-1">
            <TabsTrigger value="bant" className="text-[10px] uppercase font-black px-6 h-full rounded-lg data-[state=active]:bg-[#F97316] data-[state=active]:text-white transition-all tracking-widest">BANT Output</TabsTrigger>
            <TabsTrigger value="params" className="text-[10px] uppercase font-black px-6 h-full rounded-lg data-[state=active]:bg-[#F97316] data-[state=active]:text-white transition-all tracking-widest">Parameters</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="bant">
           <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/[0.04] flex items-center justify-between bg-[#0A0A0A]">
                 <span className="text-[11px] font-mono font-black uppercase tracking-[0.2em] text-[#6B7280]">Neural Analysis Pipeline</span>
                 <div className="flex items-center gap-2 text-[#F97316]/50 text-[10px] font-mono uppercase font-black tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" /> Live Node
                 </div>
              </div>
              <div className="min-h-[400px] flex flex-col items-center justify-center p-12 bg-[#0A0A0A]/40 opacity-20">
                 <span className="material-symbols-outlined text-[64px]">psychology</span>
                 <div className="font-mono text-[11px] uppercase font-black tracking-[0.2em] mt-6 italic">Waiting for Neural Inputs...</div>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
