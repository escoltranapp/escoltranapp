"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { formatCurrency, cn } from "@/lib/utils"
import { NewContactDialog } from "@/components/contacts/NewContactDialog"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { brazilianStates, mainCitiesByState } from "@/lib/geo-data"
import { businessNiches } from "@/lib/niches"

function KPICard({ label, value, icon, color = "#F97316" }: { label: string; value: string | number; icon: string; color?: string }) {
  return (
    <div className="relative group overflow-hidden">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
      <div className="relative bg-[#1A1A1A]/40 backdrop-blur-3xl border border-white/[0.04] rounded-[32px] p-8 hover:bg-[#1A1A1A]/60 transition-all shadow-2xl flex flex-col items-center text-center h-full group/card">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-xl mb-6"
          style={{ 
            backgroundColor: `${color}10`,
            borderColor: `${color}30`,
            boxShadow: `0 0 20px ${color}10`
          }}
        >
          <span className="material-symbols-outlined text-[28px]" style={{ color }}>{icon}</span>
        </div>
        <div className="text-3xl font-black text-white tracking-tighter font-mono mb-2">{value}</div>
        <div className="text-[9px] font-mono text-[#404040] uppercase tracking-[0.4em] font-black italic">{label}</div>
      </div>
    </div>
  )
}

export default function LeadSearchPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const [activeMode, setActiveMode] = useState<"google" | "cnpj">("google")
  const [searchData, setSearchData] = useState({
    estado: "",
    cidade: "",
    nicho: "",
    cnpj: ""
  })
  const [isNewContactOpen, setIsNewContactOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [customCity, setCustomCity] = useState("")

  const handleSearch = async () => {
    const finalCity = customCity || searchData.cidade
    
    if (!searchData.estado || !finalCity || !searchData.nicho) {
      toast({ title: "ERRO DE PARÂMETRO", description: "Preencha todos os campos para iniciar o crawler.", variant: "destructive" })
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch("/api/leads/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: brazilianStates.find(s => s.value === searchData.estado)?.label || searchData.estado,
          cidade: finalCity,
          nicho: searchData.nicho
        })
      })

      if (res.ok) {
        toast({ title: "CRAWLER INICIADO 🚀", description: "O agente de extração foi disparado. Os dados aparecerão em instantes." })
      } else {
        const errorData = await res.text()
        throw new Error(errorData)
      }
    } catch (e: any) {
      toast({ 
        title: "ERRO NA AUTOMAÇÃO", 
        description: e.message || "Não foi possível conectar com o broker do N8N.", 
        variant: "destructive" 
      })
    } finally {
      setIsSearching(false)
    }
  }

  const { data: recentLeads = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ["recent-google-leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads/recent")
      if (!res.ok) throw new Error("Falha ao buscar leads")
      return res.json()
    },
    refetchInterval: 5000 // Atualiza a cada 5 segundos para ver os novos leads chegando
  })

  const cnpjLeads = [
    { cnpj: "46.403.379/0001-81", empresa: "SHEGO LENE E ANN...", telefone: "(64) 9320-3707", email: "xmlleneanne@gmai...", situacao: "ATIVA", cidade: "SANTA HELENA DE GOIAS/GO" },
    { cnpj: "13.590.585/0001-99", empresa: "NETFLIX ENTRETE...", telefone: "(11) 4228-6851", email: "corporatebrazil@net...", situacao: "ATIVA", cidade: "SAO PAULO/SP" },
    { cnpj: "33.683.111/0001-07", empresa: "SERVIÇO FEDERAL ...", telefone: "(61) 2021-8000", email: "secretaria.diretoria@...", situacao: "ATIVA", cidade: "BRASILIA/DF" }
  ]


  const cnpjLeads = [
    { cnpj: "46.403.379/0001-81", empresa: "SHEGO LENE E ANN...", telefone: "(64) 9320-3707", email: "xmlleneanne@gmai...", situacao: "ATIVA", cidade: "SANTA HELENA DE GOIAS/GO" },
    { cnpj: "13.590.585/0001-99", empresa: "NETFLIX ENTRETE...", telefone: "(11) 4228-6851", email: "corporatebrazil@net...", situacao: "ATIVA", cidade: "SAO PAULO/SP" },
    { cnpj: "33.683.111/0001-07", empresa: "SERVIÇO FEDERAL ...", telefone: "(61) 2021-8000", email: "secretaria.diretoria@...", situacao: "ATIVA", cidade: "BRASILIA/DF" }
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden p-12 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-32">
      
      {/* IMMERSIVE AETHER BACKGROUND */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F97316]/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* HEADER ESCOLTRAN STYLE */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
        <div className="space-y-4">
           <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
             Busca de <span className="text-[#F97316]">Leads</span>
           </h1>
           <p className="text-[#404040] text-xs font-mono font-black uppercase tracking-[0.5em] mt-3 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#262626]" />
              ENCONTRE LEADS PARA ALAVANCAR SEU NEGÓCIO
           </p>
        </div>

        <div className="flex bg-[#1A1A1A]/40 backdrop-blur-3xl border border-white/[0.04] p-2 rounded-2xl shadow-2xl">
          <button 
            onClick={() => setActiveMode("google")}
            className={cn(
              "px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all",
              activeMode === "google" 
                ? "bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white shadow-[0_10px_20px_rgba(249,115,22,0.2)]" 
                : "text-[#404040] hover:text-white"
            )}
          >
            Busca Google
          </button>
          <button 
            onClick={() => setActiveMode("cnpj")}
            className={cn(
              "px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all",
              activeMode === "cnpj" 
                ? "bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white shadow-[0_10px_20px_rgba(249,115,22,0.2)]" 
                : "text-[#404040] hover:text-white"
            )}
          >
            Busca CNPJ
          </button>
        </div>
      </header>

      {/* SEARCH PANEL */}
      <div className="relative group z-10">
         <div className="absolute -inset-1 bg-gradient-to-br from-[#F97316]/10 to-transparent rounded-[40px] blur-3xl opacity-20 transition-opacity" />
         <div className="relative bg-[#1A1A1A]/40 backdrop-blur-3xl rounded-[40px] border border-white/[0.06] p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
            
            <div className="flex items-center gap-4 mb-10 border-b border-white/[0.03] pb-6">
               <span className="material-symbols-outlined text-[#F97316] text-[24px]">
                 {activeMode === "google" ? "public" : "badge"}
               </span>
               <h3 className="text-[14px] font-mono font-black uppercase tracking-[0.4em] text-white">
                 {activeMode === "google" ? "BUSCAR LEADS NO GOOGLE MAPS" : "BUSCAR EMPRESAS POR CNPJ"}
               </h3>
            </div>

            {activeMode === "google" ? (
               <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-3">
                        <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] pl-1">ESTADO</label>
                        <Select onValueChange={(val) => setSearchData(s => ({...s, estado: val, cidade: ""}))}>
                           <SelectTrigger className="bg-[#0A0A0A]/60 border-white/[0.06] h-14 rounded-xl text-white font-black tracking-widest px-6">
                              <SelectValue placeholder="Selecione o Estado" />
                           </SelectTrigger>
                           <SelectContent className="bg-[#0A0A0A] border-white/10 text-white max-h-[300px]">
                              {brazilianStates.map(s => <SelectItem key={s.value} value={s.value} className="focus:bg-[#F97316]">{s.label}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] pl-1">CIDADE</label>
                        <div className="flex gap-2">
                           <Select onValueChange={(val) => {
                              if (val === "custom") {
                                 setSearchData(s => ({...s, cidade: ""}))
                              } else {
                                 setSearchData(s => ({...s, cidade: val}))
                                 setCustomCity("")
                              }
                           }}>
                              <SelectTrigger className="bg-[#0A0A0A]/60 border-white/[0.06] h-14 rounded-xl text-white font-black tracking-widest px-6 disabled:opacity-20 flex-1">
                                 <SelectValue placeholder={searchData.estado ? "Selecione a Cidade" : "Aguardando Estado..."} />
                              </SelectTrigger>
                              <SelectContent className="bg-[#0A0A0A] border-white/10 text-white max-h-[300px]">
                                 {citiesForState.map(c => <SelectItem key={c} value={c} className="focus:bg-[#F97316]">{c}</SelectItem>)}
                                 <SelectItem value="custom" className="focus:bg-[#F97316] text-[#F97316] font-black italic">+ OUTRA CIDADE</SelectItem>
                              </SelectContent>
                           </Select>
                           
                           {(!searchData.cidade || citiesForState.length === 0 || searchData.cidade === "custom") && searchData.estado && (
                              <input 
                                 placeholder="Digite a cidade..."
                                 value={customCity}
                                 onChange={(e) => setCustomCity(e.target.value)}
                                 className="bg-[#0A0A0A]/60 border border-white/[0.06] h-14 rounded-xl text-white font-black tracking-widest px-6 focus:outline-none focus:border-[#F97316]/50 transition-colors w-[200px]"
                              />
                           )}
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] pl-1">NICHO DE MERCADO</label>
                        <Select onValueChange={(val) => setSearchData(s => ({...s, nicho: val}))}>
                           <SelectTrigger className="bg-[#0A0A0A]/60 border-white/[0.06] h-14 rounded-xl text-white font-black tracking-widest px-6">
                              <SelectValue placeholder="Selecione o Nicho" />
                           </SelectTrigger>
                           <SelectContent className="bg-[#0A0A0A] border-white/10 text-white max-h-[400px]">
                              {businessNiches.map(n => (
                                 <SelectItem key={n.value} value={n.label} className="focus:bg-[#F97316]">
                                    <div className="flex flex-col">
                                       <span className="font-black tracking-tighter">{n.label}</span>
                                       <span className="text-[8px] opacity-40 uppercase tracking-widest">{n.category}</span>
                                    </div>
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>

                  </div>

                  <button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white h-16 rounded-2xl text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_15px_40px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
                  >
                     {isSearching ? (
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                     ) : (
                        <span className="material-symbols-outlined text-[24px] group-hover:rotate-90 transition-transform">search</span>
                     )}
                     {isSearching ? "ORQUESTRANDO BUSCA..." : "BUSCAR LEADS NO GOOGLE"}
                  </button>
               </div>
            ) : (
               <div className="flex gap-6">
                  <div className="group/input relative flex-1">
                     <div className="absolute -inset-0.5 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-sm" />
                     <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#262626]">search</span>
                        <input 
                           placeholder="00.000.000/0000-00"
                           className="w-full bg-[#0A0A0A]/60 border border-white/[0.06] rounded-2xl pl-16 pr-6 h-16 text-white font-black tracking-[0.2em] focus:outline-none focus:border-[#F97316]/50 transition-all placeholder:text-[#262626]"
                        />
                     </div>
                  </div>
                  <button className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white px-12 h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:scale-[1.05] transition-all flex items-center gap-4 group">
                     <span className="material-symbols-outlined text-[20px] group-hover:scale-125 transition-transform">rocket_launch</span>
                     INICIAR BUSCA DE CNPJ
                  </button>
               </div>
            )}
         </div>
      </div>

      {/* KPI STATS - BASED ON IMAGE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        <KPICard label="TOTAL GOOGLE" value="4.950" icon="public" />
        <KPICard label="LEADS HOJE" value="12" icon="today" color="#22C55E" />
        <KPICard label="CONVERSÕES" value="158" icon="trending_up" color="#A855F7" />
        <KPICard label="NA SEMANA" value="78" icon="calendar_month" color="#3B82F6" />
      </div>

      {/* RESULTS LIST / TABLE */}
      <div className="relative group z-10 transition-all duration-1000">
         <div className="absolute -inset-1 bg-gradient-to-br from-white/5 to-transparent rounded-[40px] blur-3xl opacity-10 transition-opacity" />
         <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/[0.06] rounded-[40px] p-12 shadow-2xl space-y-10">
            <div className="flex items-center justify-between border-b border-white/[0.03] pb-8">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
                    <span className="material-symbols-outlined text-[22px]">history</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                    {activeMode === "google" ? "Últimos Leads Extraídos" : "Cluster de Dados CNPJ"}
                  </h3>
                  {activeMode === "cnpj" && (
                    <span className="bg-[#F97316]/10 text-[#F97316] px-3 py-1 rounded-full text-[10px] font-mono font-black border border-[#F97316]/20 ml-4 italic">
                      {cnpjLeads.length} ENTIDADES
                    </span>
                  )}
               </div>

               <div className="flex items-center gap-4">
                   <button className="p-3 bg-white/[0.03] rounded-xl border border-white/5 text-[#404040] hover:text-white transition-all">
                      <span className="material-symbols-outlined">filter_list</span>
                   </button>
               </div>
            </div>

            {activeMode === "google" ? (
               <div className="space-y-4">
                  {isLoadingRecent ? (
                     <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-2 border-[#F97316]/20 border-t-[#F97316] rounded-full animate-spin" />
                        <p className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.5em]">Sincronizando com o Broker...</p>
                     </div>
                  ) : recentLeads.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <span className="material-symbols-outlined text-[40px] text-[#262626]">database_off</span>
                        <p className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.5em]">Nenhum lead minerado ainda</p>
                     </div>
                  ) : (
                     recentLeads.map((lead: any) => (
                        <div key={lead.id} className="group flex flex-col md:flex-row md:items-center justify-between p-8 bg-[#1A1A1A]/20 border border-white/[0.03] rounded-[32px] hover:bg-[#1A1A1A]/40 transition-all hover:translate-x-2 gap-6">
                           <div className="flex items-center gap-8">
                              <div className="h-12 w-12 rounded-2xl bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-[#404040] group-hover:text-[#F97316] group-hover:border-[#F97316]/30 transition-all">
                                 <span className="material-symbols-outlined">business</span>
                              </div>
                              <div className="space-y-2">
                                 <h4 className="text-[17px] font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-[#F97316] transition-colors">
                                    {lead.empresa || lead.nome}
                                 </h4>
                                 <p className="text-[#F97316] font-mono font-black text-[12px] tracking-widest">
                                    {lead.telefone || "SEM TELEFONE"}
                                 </p>
                              </div>
                           </div>
                           
                           <div className="flex items-center justify-between md:justify-end gap-12">
                              <div className="text-left md:text-right space-y-1">
                                 <div className="text-[10px] font-mono font-black text-[#F97316] uppercase tracking-widest">{lead.etapaFunil}</div>
                                 <div className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">
                                    {new Date(lead.updatedAt).toLocaleDateString('pt-BR')} às {new Date(lead.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                 </div>
                              </div>
                              <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#0A0A0A] border border-white/5 text-[#404040] hover:text-[#F97316] transition-all">
                                 <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="border-b border-white/[0.03]">
                           {["CNPJ", "EMPRESA", "TELEFONE", "E-MAIL", "SITUAÇÃO", "CIDADE/ESTADO"].map((h) => (
                              <th key={h} className="text-left py-6 px-4 text-[9px] font-mono font-black text-[#404040] uppercase tracking-[0.3em]">{h}</th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/[0.02]">
                        {cnpjLeads.map((lead, i) => (
                           <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                              <td className="py-6 px-4 text-[11px] font-mono font-black text-[#F97316] tracking-widest">{lead.cnpj}</td>
                              <td className="py-6 px-4 text-[13px] font-black text-white uppercase italic tracking-tighter">{lead.empresa}</td>
                              <td className="py-6 px-4 text-[11px] font-mono font-black text-[#A3A3A3]">{lead.telefone}</td>
                              <td className="py-6 px-4 text-[11px] font-mono font-black text-[#404040] italic group-hover:text-[#A3A3A3] transition-colors">{lead.email}</td>
                              <td className="py-6 px-4">
                                 <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-black tracking-widest uppercase">
                                    {lead.situacao}
                                 </span>
                              </td>
                              <td className="py-6 px-4 text-[11px] font-black text-[#404040] uppercase tracking-tight">{lead.cidade}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            <div className="flex justify-center pt-8 border-t border-white/[0.03]">
               <button className="text-[11px] font-mono font-black text-[#404040] hover:text-[#F97316] transition-colors uppercase tracking-[0.5em] italic">Carregar mais registros do diretório</button>
            </div>
         </div>
      </div>

      <NewContactDialog 
        open={isNewContactOpen}
        onOpenChange={setIsNewContactOpen}
      />
    </div>
  )
}
