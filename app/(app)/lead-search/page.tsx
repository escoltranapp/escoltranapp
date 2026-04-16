"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

function KPICard({
  label, value, icon, trend, color = "#ffc880"
}: {
  label: string; value: string | number; icon: string; trend?: string; color?: string
}) {
  return (
    <div className="bg-surface-container border border-white/5 rounded-2xl p-6 hover:bg-surface-container-high transition-all group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
        </div>
        {trend && (
           <div className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-amber-500 bg-amber-500/10">
              {trend}
           </div>
        )}
      </div>
      <div className="space-y-1">
         <div className="text-2xl font-bold text-white tracking-tight font-mono">{value}</div>
         <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">{label}</div>
      </div>
    </div>
  )
}

const states = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"]

export default function LeadSearchPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("google")
  const [estado, setEstado] = useState("")
  const [cidade, setCidade] = useState("")
  const [segmento, setSegmento] = useState("")

  const { data: storedGoogle } = useQuery<any>({
    queryKey: ["leads-stored-google"],
    queryFn: async () => { const res = await fetch("/api/leads?type=google&limit=50"); return res.json() },
  })

  const { data: storedCnpj } = useQuery<any>({
    queryKey: ["leads-stored-cnpj"],
    queryFn: async () => { const res = await fetch("/api/leads?type=cnpj&limit=50"); return res.json() },
  })

  const validatedLeads = Array.isArray(storedGoogle?.leads) ? storedGoogle.leads : []

  const searchMutation = useMutation({
    mutationFn: async () => {
      if (!cidade.trim() && !estado) throw new Error("Informe ao menos o estado ou a cidade")
      const res = await fetch("/api/webhooks/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab, estado, cidade, segmento }),
      })
      if (!res.ok) throw new Error("Falha ao iniciar extração")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Extração iniciada!", description: "Os resultados serão carregados em instantes." })
      queryClient.invalidateQueries({ queryKey: ["leads-stored-google"] })
    },
    onError: (err: Error) => toast({ variant: "destructive", title: err.message }),
  })

  const importLead = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await fetch("/api/leads/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      })
      if (!res.ok) throw new Error("Falha ao importar lead")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Lead importado para o CRM!" })
      queryClient.invalidateQueries({ queryKey: ["leads-stored-google"] })
    },
    onError: (err: Error) => toast({ variant: "destructive", title: err.message }),
  })

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      
      {/* HEADER ESCOLTRAN */}
      <header className="mb-10">
        <h1 className="text-[32px] font-bold text-white tracking-tight">Busca de Leads</h1>
        <p className="text-slate-500 text-[14px] mt-1">Extração de inteligência e mapeamento de mercado local</p>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         <KPICard label="Base Google Maps" value={storedGoogle?.total || "1,2k"} icon="public" trend="Live Cluster" color="#ffc880" />
         <KPICard label="Dataset CNPJ" value={storedCnpj?.total || "840"} icon="corporate_fare" trend="Active Network" color="#adc6ff" />
         <KPICard label="Extrações Hoje" value="48" icon="bolt" trend="+12.5%" color="#f5a623" />
         <KPICard label="Performance" value="98.2%" icon="query_stats" trend="Optimized" color="#7ae982" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* FILTERS (LEFT) */}
         <div className="lg:col-span-4 bg-surface-container border border-white/5 rounded-2xl p-8 space-y-8">
            <h3 className="text-[15px] font-bold text-white tracking-tight">Parâmetros de Extração</h3>
            
            <div className="space-y-4">
               <div className="flex bg-surface-container-lowest p-1 rounded-xl w-full border border-white/5">
                 <button
                   onClick={() => setActiveTab("google")}
                   className={cn("flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                     activeTab === "google" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10" : "text-slate-500 hover:text-white")}
                 >
                   Maps Neural
                 </button>
                 <button
                   onClick={() => setActiveTab("cnpj")}
                   className={cn("flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                     activeTab === "cnpj" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10" : "text-slate-500 hover:text-white")}
                 >
                   Receita Cloud
                 </button>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Geolocalização (UF)</label>
                  <Select value={estado} onValueChange={setEstado}>
                     <SelectTrigger className="bg-surface-container-lowest border-white/5 h-11 rounded-xl text-white font-mono text-xs">
                       <SelectValue placeholder="Selecione UF" />
                     </SelectTrigger>
                     <SelectContent className="bg-surface-container-high border-white/10 text-white">
                       {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Polo Regional (Cidade)</label>
                  <input
                    placeholder="Ex: São Paulo"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    className="bg-surface-container-lowest border border-white/5 h-11 rounded-xl px-4 text-xs text-white focus:border-amber-500/40 outline-none w-full appearance-none transition-all"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Segmento / Nicho</label>
                  <input
                    placeholder="Ex: Farmácias"
                    value={segmento}
                    onChange={e => setSegmento(e.target.value)}
                    className="bg-surface-container-lowest border border-white/5 h-11 rounded-xl px-4 text-xs text-white focus:border-amber-500/40 outline-none w-full appearance-none transition-all"
                  />
               </div>
            </div>

            <button
               className="w-full h-12 bg-amber-500 text-black font-bold uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/10 disabled:opacity-40"
               onClick={() => searchMutation.mutate()}
               disabled={searchMutation.isPending}
            >
               {searchMutation.isPending ? (
                 <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
               ) : (
                 <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
               )}
               <span>Iniciar Extração</span>
            </button>
         </div>

         {/* RESULTS (RIGHT) */}
         <div className="lg:col-span-8 bg-surface-container border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
               <h3 className="text-[14px] font-bold text-white tracking-tight">Dataset de Capturas</h3>
               <div className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-widest">Cluster 01 • Sincronizado</div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-surface-container-low/50">
                        <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">Entidade Localizada</th>
                        <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">Geo / Contato</th>
                        <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">Segmento</th>
                        <th className="px-6 py-4 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">Operação</th>
                     </tr>
                  </thead>
                  <tbody>
                     {validatedLeads.length === 0 ? (
                        <tr>
                           <td colSpan={4} className="py-24 text-center">
                              <div className="flex flex-col items-center gap-4 opacity-20">
                                 <span className="material-symbols-outlined text-[64px]">dataset_linked</span>
                                 <div className="font-mono text-[11px] uppercase tracking-[0.2em] font-bold">Nenhum dado capturado no cluster</div>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        validatedLeads.map((lead: any) => (
                          <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors group">
                            <td className="px-6 py-5 border-b border-white/[0.03]">
                              <div className="font-bold text-white text-[14px]">{lead.nome}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">{lead.site || "Offline Node"}</div>
                            </td>
                            <td className="px-6 py-5 border-b border-white/[0.03]">
                              <div className="text-[12px] font-mono text-white/70 font-bold">{lead.telefone || "N/A"}</div>
                              <div className="text-[10px] text-slate-500 uppercase font-black mt-1 tracking-tighter">{lead.cidade} • {lead.uf}</div>
                            </td>
                            <td className="px-6 py-5 border-b border-white/[0.03]">
                              <div className="inline-flex px-2 py-1 bg-surface-container-high border border-white/5 rounded text-[10px] font-mono font-bold uppercase text-amber-500/60">
                                {lead.nicho || 'General'}
                              </div>
                            </td>
                            <td className="px-6 py-5 border-b border-white/[0.03] text-right">
                              <button
                                onClick={() => importLead.mutate(lead.id)}
                                disabled={importLead.isPending || lead.status === "CONTATADO"}
                                className={cn(
                                  "h-8 px-4 border rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                  lead.status === "CONTATADO"
                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                    : "bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-amber-500 hover:text-black hover:border-amber-500 shadow-xl"
                                )}
                              >
                                 {lead.status === "CONTATADO" ? "Importado" : "Importar"}
                              </button>
                            </td>
                          </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  )
}
