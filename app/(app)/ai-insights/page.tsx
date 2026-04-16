"use client"

import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export default function AiInsightsPage() {
  const { data: aiData, isLoading } = useQuery({
    queryKey: ["ai-stats"],
    queryFn: async () => {
      const res = await fetch("/api/ai/stats")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 60_000,
  })

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      
      {/* HEADER ESCOLTRAN */}
      <header className="mb-10">
        <h1 className="text-[32px] font-bold text-white tracking-tight">IA Insights</h1>
        <p className="text-slate-500 text-[14px] mt-1">Orquestração neural e análise preditiva de BANT</p>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         <KPICard label="Qualificações" value={aiData?.totalQualifications || "148"} icon="psychology" trend="Active Engine" color="#adc6ff" />
         <KPICard label="Efficiency Rate" value={`${aiData?.avgScore || 94}%`} icon="query_stats" trend="Optimized" color="#7ae982" />
         <KPICard label="Hot Leads" value={aiData?.highScoreLeads || "12"} icon="bolt" trend="+5.2%" color="#f5a623" />
         <KPICard label="Autonoma" value={aiData?.actionsTriggered || "42"} icon="smart_toy" trend="Triggered" color="#ffc880" />
      </div>

      <Tabs defaultValue="scores" className="space-y-8">
        <TabsList className="bg-surface-container border border-white/5 h-11 p-1 gap-1 rounded-xl w-fit">
          <TabsTrigger value="scores" className="text-[10px] uppercase font-bold px-8 h-full rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all">Lead Metrics</TabsTrigger>
          <TabsTrigger value="config" className="text-[10px] uppercase font-bold px-8 h-full rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all">Brain Parameters</TabsTrigger>
          <TabsTrigger value="scripts" className="text-[10px] uppercase font-bold px-8 h-full rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all">Scripts Cluster</TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-6">
           <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <span className="text-[12px] font-bold text-white tracking-tight">BANT Analysis Output</span>
                <div className="flex items-center gap-2 text-amber-500/50 text-[10px] font-mono uppercase font-black tracking-widest leading-none">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Live Analysis
                </div>
              </div>
              <div className="min-h-[440px] flex flex-col items-center justify-center p-12 bg-surface-lowest/50">
                 {isLoading ? (
                    <div className="flex flex-col items-center gap-6">
                       <span className="material-symbols-outlined text-[48px] text-amber-500 animate-spin">refresh</span>
                       <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-600">Synthesizing Neural Inputs...</span>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center gap-6 text-center opacity-20">
                       <span className="material-symbols-outlined text-[64px]">psychology</span>
                       <div className="space-y-2">
                          <div className="font-mono text-[11px] uppercase font-bold tracking-[0.2em]">Neural Output Syncing...</div>
                          <div className="text-[13px] text-slate-400 max-w-sm">O fluxo de análise BANT será exibido assim que novos leads entrarem no cluster</div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
