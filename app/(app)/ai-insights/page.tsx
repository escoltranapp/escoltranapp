"use client"

import { useState } from "react"
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
  AlertCircle,
  Save,
} from "lucide-react"

const mockAiStats = {
  totalQualifications: 234,
  avgScore: 72.5,
  highScoreLeads: 45,
  actionsTriggered: 189,
}

const mockLeadScores = [
  { name: "João Santos", score: 92, status: "Quente", action: "Ligar imediatamente" },
  { name: "Maria Silva", score: 78, status: "Morno", action: "Enviar proposta" },
  { name: "Pedro Costa", score: 65, status: "Morno", action: "Follow-up em 3 dias" },
  { name: "Ana Lima", score: 42, status: "Frio", action: "Nutrição de e-mail" },
  { name: "Carlos Ferreira", score: 88, status: "Quente", action: "Demo agendada" },
]

export default function AiInsightsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const form = useForm({
    defaultValues: {
      modelo: "gpt-4",
      temperatura: "0.7",
      maxTokens: "1000",
      tomComunicacao: "profissional",
      permitirEmojis: false,
      bantScoreMinimo: "0.6",
      bantMaxTentativas: "3",
      acaoMoverStage: true,
      acaoCriarAtividade: true,
      acaoNotificar: true,
      acaoAdicionarTag: false,
      promptSistema: "",
      scriptsAbertura: "",
      scriptsQualificacao: "",
      n8nWebhookUrl: "",
    },
  })

  const handleSave = async (data: Record<string, unknown>) => {
    setIsSaving(true)
    await new Promise((res) => setTimeout(res, 1000))
    toast({ title: "Configurações salvas!", description: "Agente de IA atualizado com sucesso." })
    setIsSaving(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">IA Insights</h1>
        <p className="text-muted-foreground text-sm">Configure e monitore o agente de qualificação por IA</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Qualificações", value: mockAiStats.totalQualifications, icon: Brain, color: "text-primary" },
          { label: "Score Médio", value: `${mockAiStats.avgScore}%`, icon: TrendingUp, color: "text-amber-400" },
          { label: "Leads Quentes", value: mockAiStats.highScoreLeads, icon: Zap, color: "text-green-400" },
          { label: "Ações Disparadas", value: mockAiStats.actionsTriggered, icon: CheckCircle, color: "text-blue-400" },
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
        })}
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
              <div className="space-y-4">
                {mockLeadScores.map((lead, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {lead.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{lead.name}</p>
                        <Badge
                          className={
                            lead.status === "Quente"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : lead.status === "Morno"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }
                        >
                          {lead.status}
                        </Badge>
                      </div>
                      <Progress value={lead.score} className="h-1.5 mb-1" />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3 text-primary" />
                        {lead.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config">
          <form onSubmit={form.handleSubmit(handleSave)}>
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
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                    <Input placeholder="https://n8n.seudominio.com/webhook/..." {...form.register("n8nWebhookUrl")} />
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
                    <Input type="number" defaultValue="60" min="0" max="100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Máximo de Tentativas</Label>
                    <Input type="number" defaultValue="3" min="1" max="10" />
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
              <Button type="submit" disabled={isSaving} className="escoltran-gradient-bg text-white">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </form>
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
                  <Textarea
                    placeholder={script.placeholder}
                    rows={5}
                    className="resize-none"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Button className="escoltran-gradient-bg text-white">
              <Save className="h-4 w-4 mr-2" />
              Salvar Scripts
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
