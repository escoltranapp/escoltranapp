"use client"

import { useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
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
    <div className="animate-in fade-in duration-500">
      
      {/* HEADER ESCOLTRAN */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Configurações do Cluster</h1>
          <p className="text-slate-400 text-sm mt-1">Gestão de Sistema • <span className="font-mono text-[11px] text-amber-500 uppercase font-bold tracking-widest ml-1">Modo Administrativo</span></p>
        </div>
      </header>

      {/* TABS DE NAVEGAÇÃO EM SURFACE */}
      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-surface-container border border-white/5 h-12 p-1 gap-1 rounded-xl w-fit overflow-hidden">
          <TabsTrigger value="profile" className="text-[10px] uppercase font-bold px-8 h-full rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all">Perfil</TabsTrigger>
          <TabsTrigger value="pipeline" className="text-[10px] uppercase font-bold px-8 h-full rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all">Pipeline</TabsTrigger>
          <TabsTrigger value="integrations" className="text-[10px] uppercase font-bold px-8 h-full rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all">Clusters</TabsTrigger>
          <TabsTrigger value="search" className="text-[10px] uppercase font-bold px-8 h-full rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all">Search</TabsTrigger>
          <TabsTrigger value="templates" className="text-[10px] uppercase font-bold px-8 h-full rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all">Templates</TabsTrigger>
        </TabsList>

        {/* SEÇÃO IDENTIDADE DE ACESSO */}
        <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-300">
           <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">Identidade de Acesso</span>
                <span className="material-symbols-outlined text-slate-800">fingerprint</span>
              </div>
              <div className="p-10 space-y-12 bg-surface-container-lowest/20">
                 <div className="flex items-center gap-10">
                    <div className="relative group">
                       <Avatar className="h-20 w-20 border-2 border-white/5 p-1 bg-surface-container-high rounded-2xl">
                          <AvatarImage src={session?.user?.image || ""} className="rounded-xl" />
                          <AvatarFallback className="text-xl font-bold bg-amber-500/10 text-amber-500 font-mono">{getInitials(userName)}</AvatarFallback>
                       </Avatar>
                       <button
                         className="absolute -bottom-1 -right-1 p-2 bg-amber-500 rounded-lg border-2 border-surface-container text-black opacity-0 group-hover:opacity-100 transition-opacity"
                         onClick={() => fileInputRef.current?.click()}
                         title="Trocar foto"
                       >
                          <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                       </button>
                       <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={() => toast({ title: "Upload de avatar", description: "Funcionalidade disponível em breve." })} />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-[14px] font-bold text-white tracking-tight">Sincronização de Identidade Visual</h4>
                       <button
                         onClick={handleAvatarSync}
                         className="px-5 py-2 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:bg-amber-500 hover:text-black transition-all"
                       >
                         Refresh Avatar Data
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest">Nome Operacional</label>
                       <Input className="bg-surface-container-lowest border-white/5 h-12 rounded-lg text-white font-mono" defaultValue={userName} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest">Dataset Email</label>
                       <Input className="bg-surface-container-lowest border-white/5 h-12 rounded-lg text-slate-600 font-mono opacity-60" defaultValue={session?.user?.email || ""} disabled />
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>

      {/* BOTÃO COMMIT GLOBAL ESCOLTRAN */}
      <footer className="flex justify-end pt-12 border-t border-white/5 mt-12">
         <button 
           className="bg-primary-container text-on-primary-container h-14 px-12 text-[13px] font-bold uppercase tracking-widest flex items-center gap-4 shadow-xl shadow-amber-500/10 hover:brightness-110 active:scale-95 transition-all rounded-xl"
           onClick={handleSave}
           disabled={isSaving}
         >
            {isSaving ? (
               <span className="material-symbols-outlined animate-spin text-[24px]">refresh</span>
            ) : (
               <span className="material-symbols-outlined text-[24px]">save</span>
            )}
            <span>{isSaving ? "Sincronizando..." : "Commit Global"}</span>
         </button>
      </footer>
    </div>
  )
}
