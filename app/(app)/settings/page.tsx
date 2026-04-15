"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { User, Kanban, Link, Search, Send, MessageSquare, Save, Plus, Trash2, Eye, EyeOff, Settings, ShieldCheck, Zap } from "lucide-react"
import { getInitials, cn } from "@/lib/utils"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [showWebhook, setShowWebhook] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true); await new Promise(r => setTimeout(r, 800))
    toast({ title: "Protocolos Sincronizados." }); setIsSaving(false)
  }

  const userName = session?.user?.name || "Operador"

  return (
    <div className="animate-aether space-y-10 pb-10">
      
      {/* Header Section */}
      <header className="page-header flex-col lg:flex-row items-start justify-between gap-8">
        <div className="space-y-4">
          <div className="header-badge">
            <span className="dot" />
            Configurações do Cluster
          </div>
          <div>
            <h1 className="page-title">
              Painel de <span>Controle</span> ⚙️
            </h1>
            <div className="page-subtitle">
              Gestão de Sistema <span className="sep" /> 
              Status: <span className="status">Modo Administrativo</span>
            </div>
          </div>
        </div>

        <button className="aether-btn-primary" onClick={handleSave}>
          <Save size={18} strokeWidth={3} />
          Commit Global
        </button>
      </header>

      <Tabs defaultValue="profile" className="space-y-10">
        <TabsList className="bg-black/40 border border-white/5 h-12 p-1 gap-1 overflow-x-auto">
          {[
            { id: "profile", label: "Perfil", icon: User },
            { id: "pipeline", label: "Pipeline", icon: Kanban },
            { id: "integrations", label: "Clusters", icon: Link },
            { id: "leadsearch", label: "Search", icon: Search },
            { id: "templates", label: "Templates", icon: MessageSquare },
          ].map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-[9px] uppercase font-black px-6 gap-2">
              <tab.icon size={12} /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
           <div className="aether-card p-0">
              <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                 <span className="metric-label">Identidade de Acesso</span>
                 <ShieldCheck size={16} className="text-white/10" />
              </div>
              <div className="p-10 space-y-10">
                 <div className="flex items-center gap-10">
                    <Avatar className="h-24 w-24 border-2 border-gold/20 p-1 bg-black/40">
                       <AvatarImage src={session?.user?.image || ""} className="rounded-full" />
                       <AvatarFallback className="text-2xl font-black bg-white/5 text-gold">{getInitials(userName)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-4">
                       <button className="aether-btn-secondary h-10">Sincronizar Avatar</button>
                       <p className="text-[10px] text-white/20 uppercase tracking-widest font-black italic">Protocolo Visual de Identidade</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                       <label className="aether-label">Nome Completo</label>
                       <Input className="aether-input" defaultValue={userName} />
                    </div>
                    <div>
                       <label className="aether-label">System Email (ReadOnly)</label>
                       <Input className="aether-input opacity-40 grayscale" defaultValue={session?.user?.email || ""} disabled />
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
           <div className="aether-card p-0">
             <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <span className="metric-label">Arquitetura de Conversão</span>
                <button className="aether-btn-secondary h-8 px-4 text-[9px] border-gold/20 text-gold">+ Nova Lógica</button>
             </div>
             <div className="p-8 space-y-4">
               {[
                 { name: "Prospecção", color: "#6b7280", count: 8 },
                 { name: "Qualificação", color: "#c9a227", count: 5 },
                 { name: "Proposta", color: "#fbbf24", count: 12 },
                 { name: "Fechamento", color: "#22c55e", count: 7 }
               ].map(s => (
                 <div key={s.name} className="flex items-center gap-6 p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-gold/20 transition-all">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}40` }} />
                    <span className="text-xs font-black uppercase tracking-tight flex-1">{s.name}</span>
                    <Badge className="bg-black/40 border-white/5 text-[9px] font-mono opacity-50">{s.count} ENTRIES</Badge>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="text-white/20 hover:text-white"><Settings size={14} /></button>
                       <button className="text-white/20 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
           <div className="aether-card">
              <div className="mb-8 flex items-center gap-2">
                 <Zap size={14} className="text-gold" />
                 <span className="metric-label">Neural Webhooks & Clusters</span>
              </div>
              <div className="space-y-8">
                 <div>
                    <label className="aether-label">Master Engine Webhook (n8n)</label>
                    <div className="relative">
                       <Input className="aether-input pr-12 font-mono text-xs" type={showWebhook ? "text" : "password"} defaultValue="https://n8n.escoltran.ai/webhook/..." />
                       <button onClick={() => setShowWebhook(!showWebhook)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-gold">{showWebhook ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {["Emission Gateway", "Status Monitor", "Analytics Relay", "Data Ingest"].map(l => (
                      <div key={l}>
                        <label className="aether-label text-white/40">{l}</label>
                        <Input className="aether-input opacity-60 text-xs font-mono" type="password" placeholder="Configuração de Hardware..." />
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
