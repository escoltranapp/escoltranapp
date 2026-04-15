"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import {
  Bot,
  Brain,
  Settings,
  Zap,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  Save,
  Cpu,
  Sparkles,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

function SkeletonCard() {
  return (
    <Card className="bg-surface border-border-subtle">
      <CardContent className="p-4 space-y-3">
        <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
        <div className="h-7 w-16 rounded bg-white/5 animate-pulse" />
      </CardContent>
    </Card>
  )
}

export default function AiInsightsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const { data: aiData, isLoading } = useQuery({
    queryKey: ["ai-stats"],
    queryFn: async () => {
      const res = await fetch("/api/ai/stats")
      if (!res.ok) throw new Error("Falha ao carregar stats de IA")
      return res.json()
    },
    staleTime: 60_000,
  })

  const form = useForm({
    defaultValues: {
      modelo: "gpt-4",
      tomComunicacao: "profissional",
      permitirEmojis: false,
      bantScoreMinimo: "60",
      bantMaxTentativas: "3",
      acaoMoverStage: true,
      acaoCriarAtividade: true,
      acaoNotificar: true,
      acaoAdicionarTag: false,
      scriptsAbertura: "",
      scriptsQualificacao: "",
      scriptsFechamentoPos: "",
      scriptsFechamentoNeg: "",
      n8nWebhookUrl: "",
    },
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((res) => setTimeout(res, 800))
    toast({ title: "Configurações sincronizadas!", description: "Núcleo de inteligência atualizado." })
    setIsSaving(false)
  }

  const scores: { id: string; nome: string; score: number; temperatura: string }[] =
    aiData?.scores || []

  return (
    <div className="space-y-6 pb-8 animate-entrance">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter leading-none">IA Insights</h1>
          <p className="text-sm font-display italic text-accent opacity-80 mt-1">Orquestração de agentes e análise preditiva BANT</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          <span className="text-[10px] font-black font-mono uppercase tracking-widest text-accent">Active Engine: GPT-4</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          [
            { label: "Qualificações", value: aiData?.totalQualifications ?? 0, icon: Brain, color: "text-accent" },
            { label: "Efficiency Rate", value: `${aiData?.avgScore ?? 0}%`, icon: TrendingUp, color: "text-success" },
            { label: "Vetor Hot Leads", value: aiData?.highScoreLeads ?? 0, icon: Zap, color: "text-info" },
            { label: "Ações Autônomas", value: aiData?.actionsTriggered ?? 0, icon: CheckCircle, color: "text-white" },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-surface border-border-subtle group hover:border-border-default transition-all animate-entrance" style={{ animationDelay: `${i * 100}ms` }}>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted opacity-60">{stat.label}</p>
                    <Icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <p className="text-2xl font-black font-sans leading-none">{stat.value}</p>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Tabs defaultValue="scores" className="space-y-6">
        <TabsList className="bg-black/40 border border-border-subtle p-1 h-12">
          <TabsTrigger value="scores" className="px-6 data-[state=active]:bg-accent data-[state=active]:text-black text-[11px] font-black font-mono uppercase tracking-[0.1em]">Lead Metrics</TabsTrigger>
          <TabsTrigger value="config" className="px-6 data-[state=active]:bg-accent data-[state=active]:text-black text-[11px] font-black font-mono uppercase tracking-[0.1em]">AI Core Config</TabsTrigger>
          <TabsTrigger value="scripts" className="px-6 data-[state=active]:bg-accent data-[state=active]:text-black text-[11px] font-black font-mono uppercase tracking-[0.1em]">Dialogue Scripts</TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="animate-entrance">
          <Card className="bg-surface border-border-subtle overflow-hidden">
            <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-text-muted">BANT Analysis Output</CardTitle>
                <CardDescription className="text-[10px] font-display italic text-accent/60">Análise em tempo real do pipeline de qualificação</CardDescription>
              </div>
              <Activity className="h-4 w-4 text-text-muted opacity-20" />
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-border-subtle rounded-xl animate-pulse">
                      <div className="w-12 h-12 rounded-lg bg-white/5" />
                      <div className="flex-1 space-y-3">
                        <div className="h-3 w-40 rounded bg-white/5" />
                        <div className="h-1.5 w-full rounded bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : scores.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-text-muted opacity-20 gap-4">
                  <Cpu className="h-12 w-12" />
                  <p className="text-sm font-mono uppercase tracking-widest text-center px-12">Waiting for first lead qualification cycle</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {scores.map((lead, i) => (
                    <div key={lead.id} className="flex items-center gap-4 p-4 bg-white/[0.01] border border-border-subtle rounded-xl hover:border-border-default transition-all animate-entrance" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="w-12 h-12 shrink-0 rounded-lg bg-surface-elevated flex items-center justify-center text-lg font-black text-white border border-border-subtle">
                        {lead.score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[13px] font-black text-text-primary uppercase tracking-tight">{lead.nome}</p>
                          <Badge variant={lead.temperatura === "Quente" ? "ativa" : lead.temperatura === "Morno" ? "novo" : "inativa"}>
                            {lead.temperatura}
                          </Badge>
                        </div>
                        <div className="relative h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-0 bg-accent transition-all duration-1000 ease-out border-r border-white/20"
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6 animate-entrance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-surface border-border-subtle overflow-hidden">
              <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4">
                <CardTitle className="text-[11px] font-black font-mono uppercase tracking-widest flex items-center gap-2 text-text-muted">
                  <Bot className="h-3.5 w-3.5 text-accent" /> Brain Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Engine Selection</Label>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger className="h-11 bg-black/20 border-border-subtle"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-surface-overlay border-border-strong">
                      <SelectItem value="gpt-4" className="font-mono text-xs font-bold uppercase">GPT-4 (Recommended)</SelectItem>
                      <SelectItem value="gpt-4-turbo" className="font-mono text-xs font-bold uppercase">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo" className="font-mono text-xs font-bold uppercase">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Communicational Tone</Label>
                  <Select defaultValue="profissional">
                    <SelectTrigger className="h-11 bg-black/20 border-border-subtle"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-surface-overlay border-border-strong">
                      <SelectItem value="profissional" className="font-mono text-xs font-bold uppercase">Profissional</SelectItem>
                      <SelectItem value="amigavel" className="font-mono text-xs font-bold uppercase">Amigável</SelectItem>
                      <SelectItem value="formal" className="font-mono text-xs font-bold uppercase">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-border-subtle">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Emoji Semantic Interaction</Label>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Neural Webhook (n8n)</Label>
                  <Input
                    placeholder="https://n8n.escoltran.ai/webhook/..."
                    className="h-11 bg-black/20 border-border-subtle font-mono text-[10px]"
                    {...form.register("n8nWebhookUrl")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border-subtle overflow-hidden">
              <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4">
                <CardTitle className="text-[11px] font-black font-mono uppercase tracking-widest flex items-center gap-2 text-text-muted">
                  <Settings className="h-3.5 w-3.5 text-accent" /> Thresholds & Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Min BANT Score (%)</Label>
                    <Input type="number" className="h-11 bg-black/20 border-border-subtle" defaultValue="60" min="0" max="100" {...form.register("bantScoreMinimo")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Interaction Limit</Label>
                    <Input type="number" className="h-11 bg-black/20 border-border-subtle" defaultValue="3" min="1" max="10" {...form.register("bantMaxTentativas")} />
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-4">Autonomous Flows</p>
                  {[
                    { label: "Pipeline Stage Auto-Move", key: "acaoMoverStage", defaultChecked: true },
                    { label: "Trigger CRM Activity", key: "acaoCriarAtividade", defaultChecked: true },
                    { label: "Direct Sales Alert", key: "acaoNotificar", defaultChecked: true },
                    { label: "Auto Semantic Tagging", key: "acaoAdicionarTag", defaultChecked: false },
                  ].map((action) => (
                    <div key={action.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                      <Label className="text-[11px] font-medium text-text-muted group-hover:text-text-primary transition-colors">{action.label}</Label>
                      <Switch defaultChecked={action.defaultChecked} className="scale-75 origin-right" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button disabled={isSaving} className="px-10" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Synchronizing Brain..." : "Commit Configuration"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6 animate-entrance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { key: "scriptsAbertura", title: "Opening Protocol", placeholder: "Initial greeting and context setting..." },
              { key: "scriptsQualificacao", title: "Qualification Engine", placeholder: "Core BANT discovery questions..." },
              { key: "scriptsFechamentoPos", title: "Closure (Positive)", placeholder: "Conversion and next steps..." },
              { key: "scriptsFechamentoNeg", title: "Closure (Negative)", placeholder: "Nurturing or disqualification pitch..." },
            ].map((script) => (
              <Card key={script.key} className="bg-surface border-border-subtle overflow-hidden group">
                <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4">
                  <CardTitle className="text-[11px] font-black font-mono uppercase tracking-widest flex items-center gap-2 text-text-muted group-hover:text-accent transition-colors">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {script.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Textarea
                    placeholder={script.placeholder}
                    className="border-none bg-transparent placeholder:text-text-muted/20 min-h-[160px] p-4 text-[13px] font-display leading-relaxed resize-none focus-visible:ring-0"
                    {...form.register(script.key as any)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end">
            <Button className="px-10" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Flash-writing Scripts..." : "Update Logic Cluster"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
