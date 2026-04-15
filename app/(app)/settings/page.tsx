"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import {
  User,
  Kanban,
  Link,
  Search,
  Send,
  MessageSquare,
  Bot,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { getInitials, cn } from "@/lib/utils"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [showWebhook, setShowWebhook] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((res) => setTimeout(res, 800))
    toast({ title: "Configurações sincronizadas!", description: "Dados gravados no cluster de produção." })
    setIsSaving(false)
  }

  const userName = session?.user?.name || "Usuário"

  return (
    <div className="space-y-6 pb-12 animate-entrance">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter leading-none">Configurações</h1>
          <p className="text-sm font-display italic text-accent opacity-80 mt-1">Gestão de perfil, pipelines e clusters de integração</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-black/40 border border-border-subtle p-1 h-12 flex-wrap sm:flex-nowrap overflow-x-auto gap-1">
          {[
            { id: "profile", label: "Perfil", icon: User },
            { id: "pipeline", label: "Pipeline", icon: Kanban },
            { id: "integrations", label: "Clusters", icon: Link },
            { id: "leadsearch", label: "Search Engine", icon: Search },
            { id: "disparo", label: "Transmissão", icon: Send },
            { id: "templates", label: "Templates", icon: MessageSquare },
          ].map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex-1 px-4 sm:px-6 data-[state=active]:bg-accent data-[state=active]:text-black text-[10px] font-black font-mono uppercase tracking-[0.1em] gap-2 whitespace-nowrap">
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="animate-entrance">
          <Card className="bg-surface border-border-subtle overflow-hidden">
            <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-text-muted">Master Identity</CardTitle>
                <CardDescription className="text-[10px] font-display italic text-accent/60">Controle de credenciais e perfil público</CardDescription>
              </div>
              <ShieldCheck className="h-4 w-4 text-text-muted opacity-20" />
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-accent/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  <Avatar className="h-20 w-20 border-2 border-border-subtle relative">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="text-xl font-black bg-surface-elevated text-accent">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest px-4 border-border-subtle bg-black/20">Sincronizar Avatar</Button>
                  <p className="text-[10px] font-display italic text-text-muted opacity-40">Processar nova imagem de identidade (Max 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black font-mono uppercase tracking-widest text-text-muted">Full Name / Alias</Label>
                  <Input defaultValue={session?.user?.name || ""} placeholder="Seu nome" className="h-11 bg-black/20 border-border-subtle" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black font-mono uppercase tracking-widest text-text-muted opacity-40">System Email (ReadOnly)</Label>
                  <Input defaultValue={session?.user?.email || ""} type="email" disabled className="h-11 bg-black/10 border-border-subtle text-text-muted opacity-50 cursor-not-allowed" />
                </div>
              </div>

              <div className="pt-6 border-t border-border-subtle">
                <h3 className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-accent mb-6">Security Layer</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black font-mono uppercase tracking-widest text-text-muted">Current Secret Key</Label>
                    <Input type="password" placeholder="••••••••" className="h-11 bg-black/20 border-border-subtle" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black font-mono uppercase tracking-widest text-text-muted">New Authentication Token</Label>
                    <Input type="password" placeholder="••••••••" className="h-11 bg-black/20 border-border-subtle" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="px-10">
                  <Save className="h-3.5 w-3.5 mr-2" />
                  {isSaving ? "Syncing..." : "Update Identity"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="animate-entrance">
          <Card className="bg-surface border-border-subtle overflow-hidden">
            <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-text-muted">Pipeline Architect</CardTitle>
                <CardDescription className="text-[10px] font-display italic text-accent/60">Estrutura de estágios de conversão</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest px-3 border-accent/20 bg-accent/5 text-accent hover:bg-accent/10">
                <Plus className="h-3 w-3 mr-2" /> New Logic Pipeline
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                {[
                  { name: "Prospecção", color: "#6b7280", deals: 8 },
                  { name: "Qualificação", color: "#f97316", deals: 5 },
                  { name: "Proposta", color: "#f59e0b", deals: 12 },
                  { name: "Negociação", color: "#8b5cf6", deals: 3 },
                  { name: "Fechamento", color: "#22c55e", deals: 7 },
                ].map((stage, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.01] border border-border-subtle rounded-xl group hover:border-border-default transition-all">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color, boxShadow: `0 0 10px ${stage.color}40` }} />
                    <span className="text-xs font-black uppercase tracking-tight flex-1">{stage.name}</span>
                    <Badge variant="outline" className="text-[9px] font-bold font-mono px-3 border-border-subtle bg-black/20 opacity-60">
                      {stage.deals} ENTRIES
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-white transition-colors">
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-error/40 hover:text-error transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full border-dashed border-border-subtle bg-transparent text-[10px] font-black uppercase tracking-[0.2em] py-8 h-auto hover:bg-white/[0.02]">
                <Plus className="h-4 w-4 mr-2" /> Add Pipeline Terminal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="animate-entrance">
          <Card className="bg-surface border-border-subtle overflow-hidden">
            <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4">
              <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-text-muted">Neural Clusters</CardTitle>
              <CardDescription className="text-[10px] font-display italic text-accent/60">Configuração de Webhooks e API Tokens</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black font-mono uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <Zap className="h-3 w-3 text-accent" /> Master Webhook (n8n Engine)
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showWebhook ? "text" : "password"}
                        placeholder="https://n8n.cloud.escoltran.ai/webhook/..."
                        className="h-11 bg-black/20 border-border-subtle font-mono text-xs pr-12"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowWebhook(!showWebhook)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent transition-colors"
                      >
                        {showWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button variant="outline" className="h-11 px-6 border-border-subtle">Rotate Token</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  {[
                    { label: "Emission Gateway", placeholder: "https://gateway.api/v1/disparo" },
                    { label: "Cancellation Terminal", placeholder: "https://gateway.api/v1/stop" },
                    { label: "Status Monitor Relay", placeholder: "https://gateway.api/v1/status" },
                    { label: "Analytics Ingest", placeholder: "https://gateway.api/v1/logs" },
                  ].map((wh) => (
                    <div key={wh.label} className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60">{wh.label}</Label>
                      <Input type="password" placeholder={wh.placeholder} className="h-11 bg-black/20 border-border-subtle font-mono text-[10px]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="px-10">
                  <Save className="h-3.5 w-3.5 mr-2" />
                  {isSaving ? "Processing..." : "Commit Cluster Data"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="animate-entrance">
          <Card className="bg-surface border-border-subtle overflow-hidden">
            <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-text-muted">Dialogue Blueprints</CardTitle>
                <CardDescription className="text-[10px] font-display italic text-accent/60">Modelos de comunicação automatizada</CardDescription>
              </div>
              <Button size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest px-3">
                <Plus className="h-3 w-3 mr-2" /> Build Template
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { nome: "Boas-vindas", canal: "WHATSAPP", conteudo: "Olá {{nome}}, seja bem-vindo ao ecossistema Escoltran." },
                  { nome: "Follow-up Alpha", canal: "WHATSAPP", conteudo: "Identificamos sua interação. Como podemos otimizar seu processo?" },
                  { nome: "Proposta Executiva", canal: "EMAIL", conteudo: "Prezado(a) {{nome}}, os KPIs projetados estão anexados..." },
                ].map((tpl, i) => (
                  <div key={i} className="p-4 bg-white/[0.01] border border-border-subtle rounded-xl group hover:border-border-default transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-black uppercase tracking-widest text-text-primary">{tpl.nome}</p>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[8px] font-black font-mono px-2 border-accent/20 text-accent bg-accent/5">
                          {tpl.canal}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-error opacity-20 hover:opacity-100 transition-opacity">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-[11px] font-display text-text-muted leading-relaxed italic line-clamp-2">"{tpl.conteudo}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fallback for other tabs - Minimal styling */}
        {["leadsearch", "disparo"].map((tabId) => (
          <TabsContent key={tabId} value={tabId} className="animate-entrance">
            <Card className="bg-surface border-border-subtle overflow-hidden">
              <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4">
                <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-text-muted">{tabId.replace('search', ' search').toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent className="p-12 flex flex-col items-center justify-center gap-4 text-text-muted opacity-40">
                <Settings className="h-10 w-10 animate-spin-slow" />
                <p className="text-[10px] font-black font-mono tracking-widest uppercase text-center">Protocol section in maintenance mode</p>
                <p className="text-[9px] font-display italic">Consulte a documentação técnica do Aether System</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
