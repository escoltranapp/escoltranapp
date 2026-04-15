"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Bot, Brain, Settings, Zap, MessageCircle, TrendingUp, CheckCircle, Save, Sparkles, Activity, Clock } from "lucide-react"

// ─── Metric Card Component ──────────────────────────────────────────
function MetricCard({
  title,
  value,
  icon: Icon,
  delay = "0s",
  color = "gold"
}: {
  title: string
  value: string | number
  icon: React.ElementType
  delay?: string
  color?: string
}) {
  return (
    <div className="aether-card metric-card animate-aether" style={{ animationDelay: delay }}>
      <div className="metric-top">
        <div className="metric-label-group">
          <span className="metric-label">{title}</span>
          <span className="metric-value">{value}</span>
        </div>
        <div className="metric-icon-wrap" style={{ color: color === 'gold' ? '#c9a227' : 'rgba(255,255,255,0.4)' }}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}

export default function AiInsightsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const { data: aiData, isLoading } = useQuery({
    queryKey: ["ai-stats"],
    queryFn: async () => {
      const res = await fetch("/api/ai/stats")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 60_000,
  })

  const form = useForm({
    defaultValues: {
      modelo: "gpt-4",
      tomComunicacao: "profissional",
      scriptsAbertura: "",
    },
  })

  const handleSave = async () => {
    setIsSaving(true); await new Promise(r => setTimeout(r, 800))
    toast({ title: "Orquestração Sincronizada." }); setIsSaving(false)
  }

  const scores: any[] = aiData?.scores || []

  return (
    <div className="animate-aether space-y-10 pb-10">
      
      {/* Header Section */}
      <header className="page-header flex-col lg:flex-row items-start justify-between gap-8">
        <div className="space-y-4">
          <div className="header-badge">
            <span className="dot" />
            IA Insights Cluster
          </div>
          <div>
            <h1 className="page-title">
              Orquestração <span>Neural</span> ✨
            </h1>
            <div className="page-subtitle">
              Agentes Autônomos <span className="sep" /> 
              Motor Ativo: <span className="status">GPT-4 PRO</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/5 border border-gold/10">
              <Sparkles className="text-gold animate-pulse" size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest text-gold/60">Processing Engine Active</span>
           </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Qualificações" value={aiData?.totalQualifications ?? 0} icon={Brain} delay="0.1s" />
        <MetricCard title="Efficiency Rate" value={`${aiData?.avgScore ?? 0}%`} icon={TrendingUp} delay="0.2s" />
        <MetricCard title="Vetor Hot Leads" value={aiData?.highScoreLeads ?? 0} icon={Zap} delay="0.3s" />
        <MetricCard title="Ações Autônomos" value={aiData?.actionsTriggered ?? 0} icon={CheckCircle} delay="0.4s" />
      </div>

      <Tabs defaultValue="scores" className="space-y-10">
        <TabsList className="bg-black/40 border border-white/5 h-12 p-1 gap-2">
          <TabsTrigger value="scores" className="text-[10px] uppercase font-black px-8">Lead Metrics</TabsTrigger>
          <TabsTrigger value="config" className="text-[10px] uppercase font-black px-8">Brain Parameters</TabsTrigger>
          <TabsTrigger value="scripts" className="text-[10px] uppercase font-black px-8">Scripts Cluster</TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-6">
           <div className="aether-table-wrap">
              <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <span className="text-white/20 font-black uppercase text-[10px] tracking-widest">BANT Analysis Output</span>
                <Clock size={16} className="text-white/10" />
              </div>
              <div className="p-6 space-y-4">
                {isLoading ? (
                  [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)
                ) : scores.length === 0 ? (
                  <div className="py-20 text-center opacity-20 font-mono text-xs uppercase tracking-widest">Waiting for neural inputs...</div>
                ) : scores.map((lead, i) => (
                  <div key={lead.id} className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-gold/30 transition-all">
                    <div className="w-14 h-14 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center text-xl font-black text-gold">{lead.score}</div>
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-4">
                         <span className="text-[13px] font-black uppercase tracking-tight">{lead.nome}</span>
                         <Badge variant={lead.temperatura === "Quente" ? "ativa" : "novo"} className="uppercase font-black text-[9px]">{lead.temperatura}</Badge>
                       </div>
                       <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                         <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${lead.score}%` }} />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="aether-card">
                 <div className="mb-8 flex items-center gap-2">
                   <Bot className="text-gold" size={16} />
                   <span className="metric-label">Neural Engine Parameters</span>
                 </div>
                 <div className="space-y-6">
                    <div>
                      <label className="aether-label">Model Selection</label>
                      <Select defaultValue="gpt-4">
                        <SelectTrigger className="aether-input"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-surface-overlay border-border-strong">
                          <SelectItem value="gpt-4" className="text-[10px] font-black uppercase">GPT-4 Quantum</SelectItem>
                          <SelectItem value="claud-3" className="text-[10px] font-black uppercase">Claude 3 Opus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                       <span className="text-[11px] font-black uppercase text-white/40">Autonomous Action Proxy</span>
                       <Switch defaultChecked />
                    </div>
                 </div>
              </div>

               <div className="aether-card">
                 <div className="mb-8 flex items-center gap-2">
                   <Settings className="text-gold" size={16} />
                   <span className="metric-label">Automation Thresholds</span>
                 </div>
                 <div className="space-y-6">
                    <div>
                      <label className="aether-label">Min BANT Score (%)</label>
                      <Input className="aether-input" type="number" defaultValue="60" />
                    </div>
                    <div className="space-y-4">
                       {[
                         { label: "Auto-Move Pipeline", on: true },
                         { label: "Trigger CRM Activity", on: true },
                         { label: "Neural Webhook Sync", on: false }
                       ].map(a => (
                         <div key={a.label} className="flex items-center justify-between p-2">
                           <span className="text-[11px] font-bold text-white/30 uppercase">{a.label}</span>
                           <Switch defaultChecked={a.on} />
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
           <div className="flex justify-end">
              <button className="aether-btn-primary px-12" onClick={handleSave}>{isSaving ? "Syncing..." : "Commit Configuration"}</button>
           </div>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Opening Protocol", val: "scriptsAbertura" },
                { title: "Qualification Logic", val: "logicQual" },
                { title: "Conversion Closure", val: "closePos" },
                { title: "Disqualification Loop", val: "closeNeg" }
              ].map(s => (
                <div key={s.title} className="aether-card p-0 overflow-hidden group">
                   <div className="p-4 border-b border-white/5 bg-white/[0.02] group-hover:bg-gold/5 transition-colors">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-gold transition-colors">{s.title}</span>
                   </div>
                   <Textarea className="border-none bg-transparent min-h-[160px] p-6 text-[13px] italic font-display focus-visible:ring-0" placeholder="Insira o script neuronal..." />
                </div>
              ))}
           </div>
           <div className="flex justify-end">
              <button className="aether-btn-primary px-12" onClick={handleSave}>Flash-Write Scripts</button>
           </div>
        </TabsContent>
      </Tabs>

    </div>
  )
}
