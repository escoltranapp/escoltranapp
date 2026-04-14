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
} from "lucide-react"

function SkeletonCard() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-2">
        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
        <div className="h-6 w-14 rounded bg-muted animate-pulse" />
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
    // TODO: persist to /api/ai/config when implemented
    await new Promise((res) => setTimeout(res, 500))
    toast({ title: "Configurações salvas!", description: "Agente de IA atualizado com sucesso." })
    setIsSaving(false)
  }

  const scores: { id: string; nome: string; score: number; temperatura: string }[] =
    aiData?.scores || []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">IA Insights</h1>
        <p className="text-muted-foreground text-sm">Configure e monitore o agente de qualificação por IA</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          [
            { label: "Qualificações", value: aiData?.totalQualifications ?? 0, icon: Brain, color: "text-primary" },
            { label: "Score Médio", value: `${aiData?.avgScore ?? 0}%`, icon: TrendingUp, color: "text-amber-400" },
            { label: "Leads Quentes", value: aiData?.highScoreLeads ?? 0, icon: Zap, color: "text-green-400" },
            { label: "Ações Disparadas", value: aiData?.actionsTriggered ?? 0, icon: CheckCircle, color: "text-blue-400" },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Tabs defaultValue="scores">
        <TabsList>
          <TabsTrigger value="scores">Lead Scores</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
        </TabsList>

        {/* Lead Scores Tab */}
        <TabsContent value="scores">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Scores dos Leads</CardTitle>
              <CardDescription>Análise de qualificação por IA (BANT)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 rounded bg-muted" />
                        <div className="h-2 w-full rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : scores.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Brain className="h-8 w-8 opacity-30" />
                  <p className="text-sm">Nenhum lead qualificado por IA ainda</p>
                  <p className="text-xs">Inicie uma sessão de qualificação no Pipeline</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scores.map((lead) => (
                    <div key={lead.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {lead.score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{lead.nome}</p>
                          <Badge
                            className={
                              lead.temperatura === "Quente"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : lead.temperatura === "Morno"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            }
                          >
                            {lead.temperatura}
                          </Badge>
                        </div>
                        <Progress value={lead.score} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  Modelo de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tom de Comunicação</Label>
                  <Select defaultValue="profissional">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profissional">Profissional</SelectItem>
                      <SelectItem value="amigavel">Amigável</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Permitir Emojis</Label>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>Webhook n8n</Label>
                  <Input
                    placeholder="https://n8n.seudominio.com/webhook/..."
                    {...form.register("n8nWebhookUrl")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  BANT Scoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Score Mínimo (%)</Label>
                  <Input type="number" defaultValue="60" min="0" max="100" {...form.register("bantScoreMinimo")} />
                </div>
                <div className="space-y-2">
                  <Label>Máximo de Tentativas</Label>
                  <Input type="number" defaultValue="3" min="1" max="10" {...form.register("bantMaxTentativas")} />
                </div>
                <div className="space-y-3 pt-2">
                  <p className="text-sm font-medium">Ações Automáticas</p>
                  {[
                    { label: "Mover Stage", key: "acaoMoverStage", defaultChecked: true },
                    { label: "Criar Atividade", key: "acaoCriarAtividade", defaultChecked: true },
                    { label: "Notificar Vendedor", key: "acaoNotificar", defaultChecked: true },
                    { label: "Adicionar Tag", key: "acaoAdicionarTag", defaultChecked: false },
                  ].map((action) => (
                    <div key={action.key} className="flex items-center justify-between">
                      <Label className="font-normal">{action.label}</Label>
                      <Switch defaultChecked={action.defaultChecked} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4">
            <Button disabled={isSaving} className="escoltran-gradient-bg text-white" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </TabsContent>

        {/* Scripts Tab */}
        <TabsContent value="scripts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { key: "scriptsAbertura", title: "Script de Abertura", placeholder: "Ex: Olá, tudo bem? Estou entrando em contato pois..." },
              { key: "scriptsQualificacao", title: "Script de Qualificação", placeholder: "Ex: Para entender melhor sua necessidade, poderia me informar..." },
              { key: "scriptsFechamentoPos", title: "Script de Fechamento Positivo", placeholder: "Ex: Ótimo! Vou preparar o contrato e enviar para..." },
              { key: "scriptsFechamentoNeg", title: "Script de Fechamento Negativo", placeholder: "Ex: Entendo, sem problemas. Caso queira retomar..." },
            ].map((script) => (
              <Card key={script.key} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    {script.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea placeholder={script.placeholder} rows={5} className="resize-none" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Button className="escoltran-gradient-bg text-white" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Scripts"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
