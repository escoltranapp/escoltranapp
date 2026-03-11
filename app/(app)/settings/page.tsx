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
} from "lucide-react"
import { getInitials } from "@/lib/utils"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [showWebhook, setShowWebhook] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((res) => setTimeout(res, 800))
    toast({ title: "Configurações salvas!" })
    setIsSaving(false)
  }

  const userName = session?.user?.name || "Usuário"

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie sua conta e preferências</p>
      </div>

      <Tabs defaultValue="profile" orientation="horizontal">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-1.5 text-xs">
            <Kanban className="h-3.5 w-3.5" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1.5 text-xs">
            <Link className="h-3.5 w-3.5" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="leadsearch" className="flex items-center gap-1.5 text-xs">
            <Search className="h-3.5 w-3.5" />
            Busca Leads
          </TabsTrigger>
          <TabsTrigger value="disparo" className="flex items-center gap-1.5 text-xs">
            <Send className="h-3.5 w-3.5" />
            Disparo
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1.5 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Perfil do Usuário</CardTitle>
              <CardDescription>Gerencie suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="text-lg bg-primary/20 text-primary">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Alterar foto</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou GIF. Máx 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input defaultValue={session?.user?.name || ""} placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={session?.user?.email || ""} type="email" disabled />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Alterar Senha</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Senha Atual</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova Senha</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="escoltran-gradient-bg text-white">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Perfil"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Configuração do Pipeline</CardTitle>
              <CardDescription>Gerencie seus pipelines e estágios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Pipeline Principal</p>
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3 mr-1.5" />
                  Novo Pipeline
                </Button>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Prospecção", color: "#6b7280", deals: 8 },
                  { name: "Qualificação", color: "#f97316", deals: 5 },
                  { name: "Proposta", color: "#f59e0b", deals: 12 },
                  { name: "Negociação", color: "#8b5cf6", deals: 3 },
                  { name: "Fechamento", color: "#22c55e", deals: 7 },
                ].map((stage, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm flex-1">{stage.name}</span>
                    <Badge variant="secondary" className="text-xs">{stage.deals} deals</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3 mr-1.5" />
                Adicionar Estágio
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>Configure seus webhooks e integrações externas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">n8n</Badge>
                    Webhook Principal n8n
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type={showWebhook ? "text" : "password"}
                      placeholder="https://n8n.seudominio.com/webhook/..."
                    />
                    <Button variant="outline" size="icon" onClick={() => setShowWebhook(!showWebhook)}>
                      {showWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: "Webhook Disparo", placeholder: "URL para disparos" },
                    { label: "Webhook Cancelar Disparo", placeholder: "URL para cancelamentos" },
                    { label: "Webhook Status Disparo", placeholder: "URL para status" },
                  ].map((wh) => (
                    <div key={wh.label} className="space-y-2">
                      <Label>{wh.label}</Label>
                      <Input type="password" placeholder={wh.placeholder} />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="escoltran-gradient-bg text-white">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Integrações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Search Tab */}
        <TabsContent value="leadsearch">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Configuração Busca de Leads</CardTitle>
              <CardDescription>Configure webhooks para busca de leads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook Google Maps</Label>
                <Input type="password" placeholder="URL do webhook para busca Google Maps" />
              </div>
              <div className="space-y-2">
                <Label>Webhook CNPJ</Label>
                <Input type="password" placeholder="URL do webhook para busca CNPJ" />
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="escoltran-gradient-bg text-white">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disparo Tab */}
        <TabsContent value="disparo">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Configuração de Disparo</CardTitle>
              <CardDescription>Configure parâmetros de disparo em massa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Intervalo entre mensagens (segundos)</Label>
                  <Input type="number" defaultValue="5" min="1" max="60" />
                </div>
                <div className="space-y-2">
                  <Label>Máximo por hora</Label>
                  <Input type="number" defaultValue="200" min="1" max="1000" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Retry automático em falhas</p>
                  <p className="text-xs text-muted-foreground">Tentar novamente em caso de falha</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="escoltran-gradient-bg text-white">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Templates de Mensagem</CardTitle>
                  <CardDescription>Crie e gerencie templates para disparos</CardDescription>
                </div>
                <Button size="sm" className="escoltran-gradient-bg text-white">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Novo Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: "Boas-vindas", canal: "WHATSAPP", conteudo: "Olá {{nome}}, seja bem-vindo!" },
                  { nome: "Follow-up 1", canal: "WHATSAPP", conteudo: "Oi {{nome}}, como posso ajudar?" },
                  { nome: "Proposta", canal: "EMAIL", conteudo: "Prezado(a) {{nome}}, segue proposta..." },
                ].map((tpl, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{tpl.nome}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{tpl.canal}</Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{tpl.conteudo}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
