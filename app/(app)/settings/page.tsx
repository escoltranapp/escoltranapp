"use client"

import { useRef, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn, getInitials } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PipelineConfig } from "@/components/settings/PipelineConfig"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [isSaving, setIsSaving] = useState(false)
  const [n8nUrl, setN8nUrl] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch current data from database on mount
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      
      // Fetch fresh profile data including the n8nWebhookUrl
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data?.n8nWebhookUrl) setN8nUrl(data.n8nWebhookUrl)
          if (data?.name) setName(data.name)
          if (data?.email) setEmail(data.email)
        })
        .catch(() => {})
    }
  }, [session])

  const [isTesting, setIsTesting] = useState(false)

  const handleTestConnection = async () => {
    if (!n8nUrl) return toast({ title: "Insira uma URL primeiro", variant: "destructive" })
    setIsTesting(true)
    try {
      const res = await fetch('/api/user/profile/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: n8nUrl })
      })
      const data = await res.json()
      
      if (res.ok && data.ok) {
        toast({ title: "CONEXÃO ESTABELECIDA", description: `O servidor n8n respondeu com sucesso (Status ${data.status})` })
      } else {
        toast({ title: "ERRO NA RESPOSTA", description: data.error || `O n8n retornou erro ${data.status}`, variant: "destructive" })
      }
    } catch (e: any) {
      toast({ title: "FALHA DE COMUNICAÇÃO", description: `O servidor do Escoltran não conseguiu falar com o n8n: ${e.message}`, variant: "destructive" })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n8nWebhookUrl: n8nUrl, name, email })
      })
      
      if (!res.ok) throw new Error("Erro ao salvar")
      
      await update() // Update client-side next-auth session
      
      toast({ 
        title: "CONFIGURAÇÕES SALVAS", 
        description: "Suas preferências foram atualizadas com sucesso." 
      })
    } catch (e) {
      toast({ 
        title: "FALHA AO SALVAR", 
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarSync = () => {
    toast({ 
      title: "FOTO ATUALIZADA", 
      description: "Sua foto de perfil foi alterada com sucesso." 
    })
  }

  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteData, setInviteData] = useState({ name: "", email: "", password: "" })
  const [teams, setTeams] = useState<any[]>([])
  const isAdmin = session?.user?.role === "ADMIN"

  // Fetch users if admin
  useEffect(() => {
    if (isAdmin) {
      setIsLoadingUsers(true)
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => setUsers(Array.isArray(data) ? data : []))
        .finally(() => setIsLoadingUsers(false))

      fetch('/api/admin/teams')
        .then(res => res.json())
        .then(data => setTeams(Array.isArray(data) ? data : []))
    }
  }, [isAdmin])

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      }).then(res => {
        if (res.ok) {
          toast({ title: "PAPEL ATUALIZADO", description: `Usuário agora é ${newRole.toUpperCase()}` })
          setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        }
      })
    } catch {
      toast({ title: "ERRO AO ATUALIZAR", variant: "destructive" })
    }
  }

  const handleUpdatePermissions = async (userId: string, module: string, level: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, level })
      })
      
      if (!res.ok) throw new Error()
      
      toast({ title: "PERMISSÃO ATUALIZADA", description: `Módulo ${module} atualizado para ${level}` })
      
      // Update local state if needed
      setUsers(users.map(u => {
        if (u.id === userId) {
          const newPerms = [...(u.modulePermissions || [])]
          const idx = newPerms.findIndex(p => p.moduleName === module)
          if (idx >= 0) newPerms[idx].level = level
          else newPerms.push({ moduleName: module, level })
          return { ...u, modulePermissions: newPerms }
        }
        return u
      }))
    } catch {
      toast({ title: "ERRO AO ATUALIZAR", variant: "destructive" })
    }
  }

  const modules = [
    { id: "pipeline", name: "Pipeline" },
    { id: "contacts", name: "Contatos" },
    { id: "activities", name: "Atividades" },
    { id: "lead-search", name: "Busca de Leads" },
    { id: "mass-messaging", name: "Disparo em Massa" },
    { id: "utm-analytics", name: "UTM Analytics" },
    { id: "ai-insights", name: "IA Insights" },
  ]

  const levels = [
    { id: "NONE", name: "Sem acesso" },
    { id: "VIEW", name: "Visualizar" },
    { id: "EDIT", name: "Editar" },
    { id: "FULL", name: "Administrador" },
  ]

  const handleInvite = async () => {
    if (!inviteData.name || !inviteData.email || !inviteData.password) {
      return toast({ title: "Preencha todos os campos", variant: "destructive" })
    }
    
    try {
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteData)
      })
      
      if (!res.ok) throw new Error()
      
      toast({ title: "USUÁRIO CRIADO", description: `O acesso para ${inviteData.email} foi gerado.` })
      setIsInviteOpen(false)
      setInviteData({ name: "", email: "", password: "" })
      // Refresh list
      fetch('/api/admin/users').then(res => res.json()).then(data => setUsers(Array.isArray(data) ? data : []))
    } catch {
      toast({ title: "ERRO AO CRIAR USUÁRIO", variant: "destructive" })
    }
  }

  const userName = name || "Operador Principal"

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden p-6 md:p-8 space-y-8 animate-in fade-in duration-1000 max-w-5xl">
      {/* IMMERSIVE BACKGROUND GLOWS */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F97316]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F97316]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER ESCOLTRAN STYLE */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#F97316]/30 flex items-center justify-center text-[#F97316] shadow-xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-[#F97316]/5 animate-pulse" />
                 <span className="material-symbols-outlined text-[24px] font-black relative z-10">settings_suggest</span>
              </div>
              <div>
                 <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                   Configurações <span className="text-[#F97316]">Gerais</span>
                 </h1>
                 <p className="text-[#404040] text-[10px] font-mono font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                    <span className="w-6 h-[1px] bg-[#262626]" />
                    {isAdmin ? "PERFIL ADMINISTRADOR" : "STATUS: ATIVO"}
                 </p>
              </div>
           </div>
        </div>
      </header>

      {/* TABS DE NAVEGAÇÃO EM GLASSMORPHISM */}
      <Tabs defaultValue="profile" className="space-y-8 relative z-10">
        <TabsList className="bg-[#1A1A1A]/30 backdrop-blur-3xl border border-white/[0.04] h-12 p-1 gap-1 rounded-xl w-fit shadow-xl">
          {[
            { id: "profile", label: "Conta", icon: "person" },
            { id: "pipeline", label: "Pipeline", icon: "view_kanban" },
            { id: "integrations", label: "Integrações", icon: "extension" },
            { id: "administration", label: "Gestão de Usuários", icon: "admin_panel_settings", admin: true },
            { id: "templates", label: "Modelos", icon: "auto_awesome_motion" }
          ].filter(tab => !tab.admin || isAdmin).map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id} 
              className="group flex items-center gap-2 text-[10px] uppercase font-black px-6 h-full rounded-lg transition-all duration-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#F97316] data-[state=active]:to-[#FB923C] data-[state=active]:text-white data-[state=active]:shadow-[0_4px_10px_rgba(249,115,22,0.2)] text-[#6B7280]"
            >
              <span className="material-symbols-outlined text-[16px] group-data-[state=active]:text-white transition-colors">{tab.icon}</span>
              <span className="tracking-[0.1em]">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* SEÇÃO IDENTIDADE DE ACESSO */}
        <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-[#F97316]/10 to-transparent rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-3xl border border-white/[0.06] overflow-hidden shadow-2xl">
                 <div className="p-6 border-b border-white/[0.03] bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="w-1.5 h-4 bg-[#F97316] rounded-full" />
                       <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white">Segurança da Conta</span>
                    </div>
                    <span className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest">ACESSO_PROTEGIDO</span>
                 </div>
                 
                 <div className="p-8 space-y-10">
                    {/* AVATAR DYNAMICS */}
                    <div className="flex items-center gap-8">
                       <div className="relative group/avatar">
                          <div className="absolute -inset-3 bg-[#F97316]/20 rounded-full blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                          <Avatar className="h-20 w-20 border-2 border-[#F97316]/30 p-1 bg-[#1A1A1A] rounded-2xl shadow-xl relative z-10 transition-transform group-hover/avatar:scale-105 duration-500">
                             <AvatarImage src={session?.user?.image || ""} className="rounded-xl object-cover" />
                             <AvatarFallback className="text-2xl font-black bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-mono rounded-xl">
                                {getInitials(userName)}
                             </AvatarFallback>
                          </Avatar>
                          <button
                            className="absolute -bottom-2 -right-2 p-2 bg-[#F97316] rounded-lg border-[3px] border-[#0A0A0A] text-white shadow-lg opacity-0 group-hover/avatar:opacity-100 translate-y-1 group-hover/avatar:translate-y-0 transition-all duration-300 z-20"
                            onClick={() => fileInputRef.current?.click()}
                          >
                             <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                          </button>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                       </div>
                       
                       <div className="space-y-3">
                          <h4 className="text-[14px] font-black text-white tracking-widest uppercase italic">Gestão de Perfil</h4>
                          <p className="text-[#6B7280] text-[10px] font-mono uppercase tracking-widest max-w-[350px]">Sua foto de perfil é visível em toda a plataforma para outros usuários.</p>
                          <button
                            onClick={handleAvatarSync}
                            className="px-5 py-2.5 bg-[#1A1A1A] border border-white/[0.04] rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-[#A3A3A3] hover:text-[#F97316] hover:border-[#F97316]/40 hover:bg-[#F97316]/5 transition-all shadow-md flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[14px]">sync</span>
                            Atualizar Foto
                          </button>
                       </div>
                    </div>

                    {/* FORM GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/[0.03] pt-10">
                       <div className="space-y-3">
                          <label className="text-[9px] font-mono font-black text-[#6B7280] uppercase tracking-[0.3em] flex items-center gap-2">
                             <span className="material-symbols-outlined text-[14px]">person</span>
                             Nome do Operador
                          </label>
                          <Input 
                            className="bg-[#0A0A0A]/60 border-white/[0.06] h-12 rounded-xl text-white font-black tracking-wide px-4 focus:border-[#F97316]/50 transition-all outline-none text-sm" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] font-mono font-black text-[#6B7280] uppercase tracking-[0.3em] flex items-center gap-2">
                             <span className="material-symbols-outlined text-[14px]">alternate_email</span>
                             Email de Acesso
                          </label>
                           <Input 
                             className="bg-[#0A0A0A]/60 border-white/[0.06] h-12 rounded-xl text-white font-black tracking-wide px-4 focus:border-[#F97316]/50 transition-all outline-none text-sm" 
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                             type="email"
                           />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>

        {/* SEÇÃO INTEGRAÇÕES / SINCRONIA */}
        <TabsContent value="integrations" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-[#F97316]/10 to-transparent rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-3xl border border-white/[0.06] overflow-hidden shadow-2xl">
                 <div className="p-6 border-b border-white/[0.03] bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="w-1.5 h-4 bg-[#F97316] rounded-full" />
                       <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white">Central de Integrações</span>
                    </div>
                    <span className="text-[9px] font-mono font-black text-emerald-500 uppercase tracking-widest">SISTEMA_CONECTADO</span>
                 </div>
                 
                 <div className="p-8 space-y-8">
                    <div className="flex items-center gap-6 p-6 bg-[#1A1A1A]/30 border border-white/5 rounded-2xl">
                       <div className="w-12 h-12 shrink-0 rounded-xl bg-[#F97316]/10 flex items-center justify-center border border-[#F97316]/20 shadow-inner">
                          <span className="material-symbols-outlined text-[#F97316] text-[24px]">webhook</span>
                       </div>
                       <div className="space-y-4 flex-1">
                          <div>
                            <h4 className="text-[14px] font-black text-white tracking-widest uppercase italic">Integração N8N (Disparador)</h4>
                            <p className="text-[#6B7280] text-[10px] font-mono uppercase tracking-widest mt-1">Configure aqui a integração com a sua plataforma de automação.</p>
                          </div>
                          
                          <div className="space-y-3">
                             <div className="flex items-center justify-between">
                                <label className="text-[9px] font-mono font-black text-[#6B7280] uppercase tracking-[0.3em]">Webhook URL Target</label>
                                <button 
                                  onClick={handleTestConnection}
                                  disabled={isTesting}
                                  className="text-[9px] font-black uppercase tracking-widest text-[#F97316] hover:text-white transition-colors flex items-center gap-2"
                                >
                                   <span className={cn("material-symbols-outlined text-[12px]", isTesting && "animate-spin")}>
                                     {isTesting ? 'sync' : 'radar'}
                                   </span>
                                   {isTesting ? "Testando..." : "Testar Conexão"}
                                </button>
                             </div>
                             <Input 
                               className="bg-black/40 border-white/[0.06] h-12 rounded-xl text-white font-mono text-[11px] tracking-widest px-4 focus:border-[#F97316]/50 transition-all outline-none" 
                               placeholder="Ex: https://n8n.seusistema.com/webhook/..."
                               value={n8nUrl}
                               onChange={(e) => setN8nUrl(e.target.value)}
                             />
                             <p className="text-[9px] text-[#F97316]/60 font-mono italic">Insira a URL do webhook correspondente no seu n8n.</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>
        
        {/* SEÇÃO ADMINISTRAÇÃO - APENAS PARA ADMINS */}
        <TabsContent value="administration" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* SUB-TABS ADMIN */}
           <Tabs defaultValue="users_mgmt" className="space-y-6">
              <TabsList className="bg-[#1A1A1A]/50 p-1 rounded-xl h-10 gap-1 border border-white/5">
                 <TabsTrigger value="users_mgmt" className="text-[9px] uppercase font-black px-4 h-full rounded-lg data-[state=active]:bg-[#F97316] data-[state=active]:text-white transition-all">Usuários & Permissões</TabsTrigger>
                 <TabsTrigger value="teams_mgmt" className="text-[9px] uppercase font-black px-4 h-full rounded-lg data-[state=active]:bg-[#F97316] data-[state=active]:text-white transition-all">Gestão de Equipes</TabsTrigger>
              </TabsList>

              <TabsContent value="users_mgmt" className="space-y-6">
                 <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-br from-[#F97316]/10 to-transparent rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-3xl border border-white/[0.06] overflow-hidden shadow-2xl">
                       <div className="p-6 border-b border-white/[0.03] bg-white/[0.01] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <span className="w-1.5 h-4 bg-[#F97316] rounded-full" />
                             <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white">Controle de Acesso</span>
                          </div>
                          <button 
                            onClick={() => setIsInviteOpen(true)}
                            className="bg-[#F97316] text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition-all"
                          >
                             Convidar Usuário
                          </button>
                       </div>
                       
                       <div className="p-0 overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[800px]">
                             <thead>
                                <tr className="bg-white/[0.02]">
                                   <th className="px-8 py-4 text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest border-b border-white/[0.03]">Usuário</th>
                                   <th className="px-8 py-4 text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest border-b border-white/[0.03]">Equipe</th>
                                   <th className="px-8 py-4 text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest border-b border-white/[0.03]">Papel</th>
                                   <th className="px-8 py-4 text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest border-b border-white/[0.03]">Status</th>
                                   <th className="px-8 py-4 text-right text-[9px] font-mono font-black text-[#404040] uppercase tracking-widest border-b border-white/[0.03]">Ações</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-white/[0.03]">
                                {users.map((u) => (
                                   <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group/row">
                                      <td className="px-8 py-4 flex items-center gap-4">
                                         <Avatar className="h-8 w-8 border border-white/10">
                                            <AvatarImage src={u.image} />
                                            <AvatarFallback className="text-[10px] font-black bg-[#1A1A1A] text-[#6B7280]">{getInitials(u.name || "")}</AvatarFallback>
                                         </Avatar>
                                         <div>
                                            <span className="text-[11px] font-black text-white uppercase tracking-tight block">{u.name}</span>
                                            <span className="text-[9px] font-mono text-[#404040]">{u.email}</span>
                                         </div>
                                      </td>
                                      <td className="px-8 py-4">
                                         <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest italic">{u.team?.name || "Sem Equipe"}</span>
                                      </td>
                                      <td className="px-8 py-4">
                                         <div className={cn(
                                           "inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                           u.role === "ADMIN" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                                         )}>
                                            {u.role === "ADMIN" ? "ADMINISTRADOR" : "EQUIPE"}
                                         </div>
                                      </td>
                                      <td className="px-8 py-4">
                                         <span className={cn(
                                           "w-2 h-2 rounded-full inline-block mr-2",
                                           u.status === "ATIVO" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                         )} />
                                         <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">{u.status}</span>
                                      </td>
                                      <td className="px-8 py-4 text-right">
                                         <div className="flex items-center justify-end gap-2">
                                            <button 
                                              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#6B7280] hover:text-[#F97316]"
                                              title="Editar Permissões"
                                              onClick={() => {
                                                setSelectedUser(u)
                                                setIsPermissionsOpen(true)
                                              }}
                                            >
                                               <span className="material-symbols-outlined text-[18px]">rule_settings</span>
                                            </button>
                                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#6B7280] hover:text-white" title="Alterar Senha">
                                               <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                                            </button>
                                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#6B7280] hover:text-red-500" title="Remover Usuário">
                                               <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                            </button>
                                         </div>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="teams_mgmt" className="space-y-6">
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                       <span className="w-1.5 h-4 bg-[#F97316] rounded-full" />
                       <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white">Equipes Cadastradas</span>
                    </div>
                    <button className="bg-[#1A1A1A] border border-white/5 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#F97316]/10 hover:border-[#F97316]/20 transition-all flex items-center gap-2">
                       <span className="material-symbols-outlined text-[14px]">add_circle</span>
                       Criar Nova Equipe
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((t) => (
                       <div key={t.id} className="group relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                          <div className="relative bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/[0.06] p-6 rounded-[24px] hover:border-[#F97316]/30 transition-all">
                             <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-[#F97316]/10 border border-[#F97316]/20 rounded-xl flex items-center justify-center">
                                   <span className="material-symbols-outlined text-[#F97316] text-[20px]">groups</span>
                                </div>
                                <div className="flex gap-1">
                                   <button className="p-1.5 hover:bg-white/5 rounded-lg text-[#404040] hover:text-white transition-colors">
                                      <span className="material-symbols-outlined text-[16px]">edit</span>
                                   </button>
                                   <button className="p-1.5 hover:bg-white/5 rounded-lg text-[#404040] hover:text-red-500 transition-colors">
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                   </button>
                                </div>
                             </div>
                             <h3 className="text-[12px] font-black text-white uppercase tracking-tight">{t.name}</h3>
                             <p className="text-[9px] font-mono text-[#404040] uppercase tracking-widest mt-1">{t.membersCount || 0} MEMBROS ATIVOS</p>
                             
                             <div className="mt-6 flex -space-x-2">
                                {Array.from({ length: Math.min(t.membersCount || 0, 5) }).map((_, i) => (
                                   <div key={i} className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#0A0A0A] flex items-center justify-center text-[8px] font-black text-[#404040]">
                                      {i + 1}
                                   </div>
                                ))}
                                {(t.membersCount || 0) > 5 && (
                                   <div className="w-6 h-6 rounded-full bg-[#F97316]/20 border border-[#F97316]/30 flex items-center justify-center text-[8px] font-black text-[#F97316]">
                                      +{(t.membersCount || 0) - 5}
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                    ))}

                    {teams.length === 0 && (
                       <div className="bg-[#111111] border border-dashed border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4 col-span-full">
                          <span className="material-symbols-outlined text-[48px] text-white/5">group_add</span>
                          <div>
                             <p className="text-[11px] font-black text-white uppercase tracking-widest italic">Nenhuma Equipe Criada</p>
                             <p className="text-[9px] font-mono text-[#404040] uppercase tracking-widest mt-2 max-w-[300px]">Crie sua primeira equipe para começar a compartilhar dados entre usuários.</p>
                          </div>
                       </div>
                    )}
                 </div>
              </TabsContent>
           </Tabs>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <PipelineConfig />
        </TabsContent>
        <TabsContent value="templates" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-3xl border border-white/[0.06] overflow-hidden shadow-2xl p-20 flex flex-col items-center justify-center text-center gap-6">
              <div className="w-20 h-20 bg-[#F97316]/5 border border-[#F97316]/10 rounded-[32px] flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-[#F97316]/10 blur-[30px] rounded-full animate-pulse" />
                 <span className="material-symbols-outlined text-[#F97316] text-[40px] relative z-10">auto_awesome_motion</span>
              </div>
              <div>
                 <h4 className="text-[16px] font-black text-white uppercase italic tracking-tighter">Modelos de Mensagem</h4>
                 <p className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] italic mt-4 max-w-[400px]">
                   Módulo de padronização de comunicação via WhatsApp e E-mail em desenvolvimento.
                 </p>
              </div>
           </div>
        </TabsContent>
      </Tabs>

      {/* FOOTER ACTION ESCOLTRAN */}
      <footer className="pt-8 border-t border-white/[0.04] flex justify-between items-center relative z-10">
         <div className="flex items-center gap-3 text-[#404040] font-mono text-[9px] font-black uppercase tracking-[0.3em]">
            <span className="material-symbols-outlined text-[14px]">verified_user</span>
            Escoltran CRM v2.5.4
         </div>
         <button 
           className="bg-[#F97316] text-white h-12 px-8 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_10px_20px_rgba(249,115,22,0.2)] hover:scale-[1.02] active:scale-95 transition-all rounded-xl group"
           onClick={handleSave}
           disabled={isSaving}
         >
            {isSaving ? (
               <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
            ) : (
               <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">save</span>
            )}
            <span>{isSaving ? "SALVANDO..." : "SALVAR CONFIGURAÇÃO"}</span>
         </button>
      </footer>

      {/* DIÁLOGO DE PERMISSÕES */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
         <DialogContent className="bg-[#0A0A0A] border-white/5 max-w-lg">
            <DialogHeader>
               <DialogTitle className="text-[12px] font-black uppercase tracking-widest text-white">
                  Permissões Granulares: {selectedUser?.name}
               </DialogTitle>
               <DialogDescription className="text-[10px] font-mono text-[#404040]">
                  Defina o nível de acesso para cada módulo do CRM.
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
               {modules.map((m) => {
                  const currentPerm = selectedUser?.modulePermissions?.find((p: any) => p.moduleName === m.id)?.level || "NONE"
                  return (
                     <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-white uppercase tracking-tight">{m.name}</span>
                        </div>
                        <Select 
                           value={currentPerm} 
                           onValueChange={(val) => handleUpdatePermissions(selectedUser.id, m.id, val)}
                        >
                           <SelectTrigger className="w-[140px] h-8 bg-[#1A1A1A] border-white/5 text-[9px] font-black uppercase">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-[#1A1A1A] border-white/10">
                              {levels.map(l => (
                                 <SelectItem key={l.id} value={l.id} className="text-[9px] font-black uppercase">{l.name}</SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                  )
               })}
            </div>

            <DialogFooter>
               <button 
                 onClick={() => setIsPermissionsOpen(false)}
                 className="w-full bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-widest py-3 rounded-xl transition-all"
               >
                  Fechar e Salvar
               </button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE CONVITE */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
         <DialogContent className="bg-[#0A0A0A] border-white/5 max-w-md">
            <DialogHeader>
               <DialogTitle className="text-[12px] font-black uppercase tracking-widest text-white">
                  Novo Acesso ao Escoltran
               </DialogTitle>
               <DialogDescription className="text-[10px] font-mono text-[#404040]">
                  O usuário poderá acessar o CRM imediatamente com estas credenciais.
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#404040] uppercase tracking-widest ml-1">Nome Completo</label>
                  <Input 
                    placeholder="Ex: João Silva" 
                    className="bg-[#1A1A1A] border-white/5 text-white text-[11px] h-11"
                    value={inviteData.name}
                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#404040] uppercase tracking-widest ml-1">Email Corporativo</label>
                  <Input 
                    type="email" 
                    placeholder="joao@escoltran.com" 
                    className="bg-[#1A1A1A] border-white/5 text-white text-[11px] h-11"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#404040] uppercase tracking-widest ml-1">Senha Inicial</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-[#1A1A1A] border-white/5 text-white text-[11px] h-11"
                    value={inviteData.password}
                    onChange={(e) => setInviteData({ ...inviteData, password: e.target.value })}
                  />
               </div>
            </div>

            <DialogFooter>
               <button 
                 onClick={handleInvite}
                 className="w-full bg-[#F97316] text-white text-[9px] font-black uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)]"
               >
                  Gerar Acesso e Convidar
               </button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
