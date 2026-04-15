"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Brain, Settings, Zap, TrendingUp, CheckCircle, Sparkles, Activity, Clock, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Reusable Component: KPI Card Enterprise ───────────────────────
function KPICard({ 
  label, value, subtext, icon: Icon, trend, color = "var(--accent-primary)" 
}: { 
  label: string; value: string | number; subtext: string; icon: React.ElementType; trend?: string; color?: string 
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-container" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={20} />
      </div>
      <div className="kpi-label-row">
        <span className="kpi-label">{label}</span>
        {trend && (
           <span className={cn("kpi-trend", trend.includes('+') ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
              {trend}
           </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-subtext">{subtext}</div>
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
    <div className="page-container animate-aether">
      
      {/* 1. HEADER DE PÁGINA */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <Sparkles size={12} /> ORQUESTRAÇÃO NEURAL
          </div>
          <h1 className="page-title-h1">IA Insights</h1>
          <p className="page-subtitle">Agentes Autônomos · Motor Ativo: <span className="text-white">GPT-4 PRO</span></p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> PROCESSING ENGINE ACTIVE
           </div>
        </div>
      </header>

      {/* 2. KPI CARDS */}
      <div className="kpi-grid">
         <KPICard label="Qualificações" value={aiData?.totalQualifications || "00"} subtext="Leads processados hoje" icon={Brain} color="#a855f7" />
         <KPICard label="Efficiency Rate" value={`${aiData?.avgScore || 0}%`} subtext="Precisão algorítmica" icon={TrendingUp} color="#10b981" />
         <KPICard label="Vetor Hot Leads" value={aiData?.highScoreLeads || "00"} subtext="Alta propensão de compra" icon={Zap} color="#f59e0b" />
         <KPICard label="Ações Autônomas" value={aiData?.actionsTriggered || "00"} subtext="Triggers de automação" icon={CheckCircle} color="#d4af37" />
      </div>

      {/* 3. TABS DE NAVEGAÇÃO */}
      <Tabs defaultValue="scores" className="space-y-8">
        <TabsList className="bg-white/5 border border-white/5 h-12 p-1 gap-1 rounded-xl w-fit">
          <TabsTrigger value="scores" className="text-[10px] uppercase font-bold px-8 rounded-lg data-[state=active]:bg-[#d4af37] data-[state=active]:text-white transition-all">Lead Metrics</TabsTrigger>
          <TabsTrigger value="config" className="text-[10px] uppercase font-bold px-8 rounded-lg data-[state=active]:bg-[#d4af37] data-[state=active]:text-white transition-all">Brain Parameters</TabsTrigger>
          <TabsTrigger value="scripts" className="text-[10px] uppercase font-bold px-8 rounded-lg data-[state=active]:bg-[#d4af37] data-[state=active]:text-white transition-all">Scripts Cluster</TabsTrigger>
        </TabsList>

        {/* 4. ÁREA DE OUTPUT */}
        <TabsContent value="scores" className="space-y-6">
           <div className="kpi-card p-0 overflow-hidden border-white/10">
              <div className="table-header-label flex items-center justify-between">
                <span>BANT Analysis Output</span>
                <div className="flex items-center gap-2 text-white/20">
                   <Activity size={14} className="animate-pulse" /> Live Analysis
                </div>
              </div>
              <div className="min-h-[400px] flex flex-col items-center justify-center p-12">
                 {isLoading ? (
                    <div className="flex flex-col items-center gap-6">
                       <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                       <span className="text-[11px] font-bold uppercase tracking-widest text-white/20">Synthesizing Neural Inputs...</span>
                    </div>
                 ) : (
                    <div className="empty-state-container">
                       <Brain className="empty-state-icon" style={{ opacity: 0.1 }} />
                       <div className="empty-state-title">Waiting for Neural Inputs...</div>
                       <div className="empty-state-sub">O fluxo de análise BANT será exibido assim que novos leads entrarem no cluster</div>
                    </div>
                 )}
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
