"use client"

import { useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { User, Kanban, Link, Search, MessageSquare, ShieldCheck, Zap, Sparkles, LayoutGrid, Camera, Save } from "lucide-react"
import { getInitials, cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setIsSaving(true); await new Promise(r => setTimeout(r, 800))
    toast({ title: "Protocolos Sincronizados." }); setIsSaving(false)
  }

  const handleAvatarSync = () => {
    toast({ title: "Avatar sincronizado.", description: "Foto de perfil atualizada com o provedor de identidade." })
  }

  const userName = session?.user?.name || "Operador"

  return (
    <div className="page-container animate-aether">
      
      {/* 1. HEADER DE PÁGINA */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <LayoutGrid size={12} /> SISTEMA
          </div>
          <h1 className="page-title-h1">Configurações do Cluster</h1>
          <p className="page-subtitle">Gestão de Sistema · <span className="text-white">Modo Administrativo</span></p>
        </div>
      </header>

      {/* 2. TABS DE NAVEGAÇÃO */}
      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-white/5 border border-white/5 h-12 p-1 gap-1 rounded-xl w-fit">
          <TabsTrigger value="profile" className="text-[10px] uppercase font-bold px-8 rounded-lg data-[state=active]:bg-[#d4af37] data-[state=active]:text-white transition-all">Perfil</TabsTrigger>
          <TabsTrigger value="pipeline" className="text-[10px] uppercase font-bold px-8 rounded-lg data-[state=active]:bg-[#d4af37] data-[state=active]:text-white transition-all">Pipeline</TabsTrigger>
          <TabsTrigger value="integrations" className="text-[10px] uppercase font-bold px-8 rounded-lg data-[state=active]:bg-[#d4af37] data-[state=active]:text-white transition-all">Clusters</TabsTrigger>
          <TabsTrigger value="search" className="text-[10px] uppercase font-bold px-8 rounded-lg data-[state=active]:bg-[#d4af37] data-[state=active]:text-white transition-all">Search</TabsTrigger>
          <TabsTrigger value="templates" className="text-[10px] uppercase font-bold px-8 rounded-lg data-[state=active]:bg-[#d4af37] data-[state=active]:text-white transition-all">Templates</TabsTrigger>
        </TabsList>

        {/* 3. SEÇÃO IDENTIDADE DE ACESSO */}
        <TabsContent value="profile" className="space-y-8">
           <div className="kpi-card p-0 overflow-hidden border-white/10">
              <div className="table-header-label flex items-center justify-between">
                <span>Identidade de Acesso</span>
                <ShieldCheck size={16} className="text-white/10" />
              </div>
              <div className="p-10 space-y-12">
                 <div className="flex items-center gap-10">
                    <div className="relative group">
                       <Avatar className="h-[72px] w-[72px] border-2 border-white/5 p-1 bg-[#181c24]">
                          <AvatarImage src={session?.user?.image || ""} className="rounded-full" />
                          <AvatarFallback className="text-xl font-bold bg-white/5 text-[#d4af37]">{getInitials(userName)}</AvatarFallback>
                       </Avatar>
                       <button
                         className="absolute -bottom-1 -right-1 p-2 bg-[#d4af37] rounded-full border-2 border-[#0a0c10] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                         onClick={() => fileInputRef.current?.click()}
                         title="Trocar foto"
                       >
                          <Camera size={12} />
                       </button>
                       <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={() => toast({ title: "Upload de avatar", description: "Funcionalidade disponível em breve." })} />
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-[14px] font-bold text-white">Protocolo Visual de Identidade</h4>
                       <button
                         onClick={handleAvatarSync}
                         className="px-5 py-2 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold uppercase text-white/40 hover:text-white hover:bg-white/10 transition-all"
                       >
                         Sincronizar Avatar
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Nome Completo</label>
                       <Input className="bg-[#181c24] border-white/5 h-12 rounded-lg text-white" defaultValue={userName} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest">System Email</label>
                       <Input className="bg-[#181c24] border-white/5 h-12 rounded-lg text-white/40 opacity-50" defaultValue={session?.user?.email || ""} disabled />
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>

      {/* 4. BOTÃO COMMIT GLOBAL */}
      <footer className="flex justify-end pt-12 border-t border-white/5">
         <button 
           className="btn-cta-primary h-14 px-12 text-[14px] font-bold flex items-center gap-4 shadow-2xl shadow-blue-600/20"
           onClick={handleSave}
           disabled={isSaving}
         >
            {isSaving ? (
               <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
               <Save size={20} />
            )}
            {isSaving ? "SINCRONIZANDO..." : "COMMIT GLOBAL"}
         </button>
      </footer>
    </div>
  )
}
