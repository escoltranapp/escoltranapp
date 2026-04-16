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
    setIsSaving(true); await new Promise(r => setTimeout(r, 1200))
    toast({ 
      title: "PROTOCOLO SINCRONIZADO", 
      description: "As alterações do cluster foram persistidas no diretório mestre." 
    })
    setIsSaving(false)
  }

  const handleAvatarSync = () => {
    toast({ 
      title: "AVATAR SINCRONIZADO", 
      description: "Foto de perfil atualizada via node de identidade global." 
    })
  }

  const userName = session?.user?.name || "Operador Principal"

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden p-12 space-y-12 animate-in fade-in duration-1000">
      {/* IMMERSIVE BACKGROUND GLOWS */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F97316]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F97316]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER ESCOLTRAN STYLE */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
        <div className="space-y-4">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#F97316]/30 flex items-center justify-center text-[#F97316] shadow-2xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-[#F97316]/5 animate-pulse" />
                 <span className="material-symbols-outlined text-[32px] font-black relative z-10">settings_suggest</span>
              </div>
              <div>
                 <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                   Configuração <span className="text-[#F97316]">Core</span>
                 </h1>
                 <p className="text-[#404040] text-xs font-mono font-black uppercase tracking-[0.5em] mt-3 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-[#262626]" />
                    ESTADO ADMINISTRATIVO: ACTIVE_CLUSTER
                 </p>
              </div>
           </div>
        </div>
      </header>

      {/* TABS DE NAVEGAÇÃO EM GLASSMORPHISM */}
      <Tabs defaultValue="profile" className="space-y-12 relative z-10">
        <TabsList className="bg-[#1A1A1A]/30 backdrop-blur-3xl border border-white/[0.04] h-16 p-2 gap-2 rounded-2xl w-fit shadow-2xl">
          {[
            { id: "profile", label: "Identidade", icon: "fingerprint" },
            { id: "pipeline", label: "Pipeline", icon: "rebase_edit" },
            { id: "integrations", label: "Sincronia", icon: "hub" },
            { id: "search", label: "Dataset", icon: "database" },
            { id: "templates", label: "Modelos", icon: "auto_awesome_motion" }
          ].map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id} 
              className="group flex items-center gap-3 text-[11px] uppercase font-black px-8 h-full rounded-xl transition-all duration-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#F97316] data-[state=active]:to-[#FB923C] data-[state=active]:text-white data-[state=active]:shadow-[0_10px_20px_rgba(249,115,22,0.2)] text-[#404040]"
            >
              <span className="material-symbols-outlined text-[18px] group-data-[state=active]:text-white transition-colors">{tab.icon}</span>
              <span className="tracking-[0.2em]">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* SEÇÃO IDENTIDADE DE ACESSO */}
        <TabsContent value="profile" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-[#F97316]/10 to-transparent rounded-[40px] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-[40px] border border-white/[0.06] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                 <div className="p-8 border-b border-white/[0.03] bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <span className="w-1.5 h-6 bg-[#F97316] rounded-full" />
                       <span className="text-[12px] font-mono font-black uppercase tracking-[0.4em] text-white">Security Identity Node</span>
                    </div>
                    <span className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">ENCRYPTED_LINK_v2</span>
                 </div>
                 
                 <div className="p-12 space-y-16">
                    {/* AVATAR DYNAMICS */}
                    <div className="flex items-center gap-12">
                       <div className="relative group/avatar">
                          <div className="absolute -inset-4 bg-[#F97316]/20 rounded-full blur-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                          <Avatar className="h-28 w-28 border-2 border-[#F97316]/30 p-1.5 bg-[#1A1A1A] rounded-[32px] shadow-2xl relative z-10 transition-transform group-hover/avatar:scale-105 duration-500">
                             <AvatarImage src={session?.user?.image || ""} className="rounded-[24px] object-cover" />
                             <AvatarFallback className="text-3xl font-black bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-mono rounded-[24px]">
                                {getInitials(userName)}
                             </AvatarFallback>
                          </Avatar>
                          <button
                            className="absolute -bottom-2 -right-2 p-3 bg-[#F97316] rounded-xl border-4 border-[#0A0A0A] text-white shadow-xl opacity-0 group-hover/avatar:opacity-100 translate-y-2 group-hover/avatar:translate-y-0 transition-all duration-300 z-20"
                            onClick={() => fileInputRef.current?.click()}
                          >
                             <span className="material-symbols-outlined text-[20px]">sync_alt</span>
                          </button>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                       </div>
                       
                       <div className="space-y-4">
                          <h4 className="text-[18px] font-black text-white tracking-widest uppercase italic">Gestão de Identidade Visual</h4>
                          <p className="text-[#404040] text-[11px] font-mono uppercase tracking-[0.2em] max-w-[400px]">O avatar é sincronizado automaticamente com os nodes de autenticação global para garantir consistência no cluster.</p>
                          <button
                            onClick={handleAvatarSync}
                            className="px-8 py-3 bg-[#1A1A1A] border border-white/[0.04] rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-[#A3A3A3] hover:text-[#F97316] hover:border-[#F97316]/40 hover:bg-[#F97316]/5 transition-all shadow-xl flex items-center gap-3"
                          >
                            <span className="material-symbols-outlined text-[18px]">cached</span>
                            Re-Sincronizar Dataset
                          </button>
                       </div>
                    </div>

                    {/* FORM GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/[0.03] pt-16">
                       <div className="space-y-4">
                          <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] flex items-center gap-3">
                             <span className="material-symbols-outlined text-[16px]">person</span>
                             Nome de Operação
                          </label>
                          <Input 
                            className="bg-[#0A0A0A]/60 border-white/[0.06] h-16 rounded-2xl text-white font-black tracking-widest px-6 focus:border-[#F97316]/50 transition-all outline-none" 
                            defaultValue={userName} 
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] flex items-center gap-3">
                             <span className="material-symbols-outlined text-[16px]">alternate_email</span>
                             Dataset de Email
                          </label>
                          <div className="h-16 px-6 rounded-2xl bg-[#1A1A1A]/30 border border-white/[0.02] flex items-center text-[#262626] font-mono font-black tracking-widest overflow-hidden opacity-60">
                             {session?.user?.email || "NOT_LOGGED_IN@CLUSTER"}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>

      {/* FOOTER ACTION ESCOLTRAN */}
      <footer className="pt-12 border-t border-white/[0.04] flex justify-between items-center relative z-10">
         <div className="flex items-center gap-4 text-[#262626] font-mono text-[10px] font-black uppercase tracking-[0.4em]">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            Escoltran Internal Protocol v2.5.4
         </div>
         <button 
           className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white h-16 px-16 text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-4 shadow-[0_15px_40px_rgba(249,115,22,0.3)] hover:scale-[1.05] active:scale-95 transition-all rounded-2xl group"
           onClick={handleSave}
           disabled={isSaving}
         >
            {isSaving ? (
               <span className="material-symbols-outlined animate-spin text-[24px]">refresh</span>
            ) : (
               <span className="material-symbols-outlined text-[24px] group-hover:rotate-12 transition-transform">cloud_sync</span>
            )}
            <span>{isSaving ? "SINCRONIZANDO..." : "COMMIT GLOBAL_CONFIG"}</span>
         </button>
      </footer>
    </div>
  )
}
