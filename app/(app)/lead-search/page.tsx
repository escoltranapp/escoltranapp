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
  const [citySearchTerm, setCitySearchTerm] = useState("")
  const [displayLimit, setDisplayLimit] = useState(10)

  const { data: allCities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ["cities", searchData.estado],
    queryFn: async () => {
      if (!searchData.estado) return []
      const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${searchData.estado}/municipios?orderBy=nome`)
      if (!res.ok) return []
      const data = await res.json()
      return data.map((c: any) => c.nome)
    },
    enabled: !!searchData.estado,
    staleTime: 1000 * 60 * 60 // 1 hora de cache
  })

  const filteredCities = allCities.filter((city: string) => 
    city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .includes(citySearchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  )

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
        // Toast removido conforme solicitação
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
    queryKey: ["recent-google-leads", displayLimit],
    queryFn: async () => {
      const res = await fetch(`/api/leads/recent?limit=${displayLimit}`)
      if (!res.ok) throw new Error("Falha ao buscar leads")
      return res.json()
    },
    refetchInterval: 5000 
  })

  const { data: stats } = useQuery({
    queryKey: ["lead-stats"],
    queryFn: async () => {
      const res = await fetch("/api/leads/stats")
      if (!res.ok) return null
      return res.json()
    },
    refetchInterval: 10000
  })

  const cnpjLeads: any[] = []

  const formatAddress = (addr: any) => {
    if (!addr) return "ENDEREÇO NÃO DISPONÍVEL"
    
    let obj = addr
    if (typeof addr === 'string') {
      try {
        obj = JSON.parse(addr)
      } catch {
        return addr.toUpperCase()
      }
    }

    const parts = []
    if (obj.logradouro || obj.LOGRADOURO) parts.push(obj.logradouro || obj.LOGRADOURO)
    if (obj.bairro || obj.BAIRRO) parts.push(obj.bairro || obj.BAIRRO)
    if (obj.cidade || obj.CIDADE) parts.push(obj.cidade || obj.CIDADE)
    if (obj.estado || obj.ESTADO) parts.push(obj.estado || obj.ESTADO)

    return parts.length > 0 ? parts.join(", ").toUpperCase() : "ENDEREÇO NÃO FORMATADO"
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-32">
      
      {/* IMMERSIVE AETHER BACKGROUND */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F97316]/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* HEADER ESCOLTRAN STYLE */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-2">
           <h1 className="text-3xl font-black text-white italic tracking-tight uppercase leading-none">
             Busca de <span className="text-[#F97316]">Leads</span>
           </h1>
           <div className="flex items-center gap-4">
              <div className="h-px w-20 bg-gradient-to-r from-[#F97316] to-transparent" />
              <p className="text-[#404040] font-mono font-black text-[11px] uppercase tracking-[0.3em]">
                Encontre leads para alavancar seu negócio
              </p>
           </div>
        </div>

        <div className="flex bg-[#0A0A0A] p-1.5 rounded-2xl border border-white/5 relative group">
           <div className={`absolute inset-y-1.5 w-[140px] bg-[#F97316] rounded-xl transition-all duration-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] ${activeMode === 'cnpj' ? 'translate-x-[140px]' : 'translate-x-0'}`} />
           <button 
              onClick={() => setActiveMode("google")}
              className={`relative z-10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 w-[140px] ${activeMode === 'google' ? 'text-white' : 'text-[#404040]'}`}
           >
              Busca Google
           </button>
           <button 
              onClick={() => setActiveMode("cnpj")}
              className={`relative z-10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 w-[140px] ${activeMode === 'cnpj' ? 'text-white' : 'text-[#404040]'}`}
           >
              Busca CNPJ
           </button>
        </div>
      </header>

      <section className="relative z-10 space-y-6">
        {/* BUSCA FORM */}
        <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl p-6 shadow-xl relative group overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F97316]/30 to-transparent" />
             
             <div className="flex items-center gap-4 mb-6">
                <span className="material-symbols-outlined text-[#F97316] text-[20px] animate-pulse">
                   {activeMode === "google" ? "public" : "database"}
                </span>
                <h3 className="text-[11px] font-mono font-black uppercase tracking-widest text-white">
                  {activeMode === "google" ? "BUSCAR LEADS NO GOOGLE MAPS" : "BUSCAR EMPRESAS POR CNPJ"}
                </h3>
             </div>

             {activeMode === "google" ? (
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-2">
                         <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">ESTADO</label>
                          <Select onValueChange={(val) => setSearchData(s => ({...s, estado: val, cidade: ""}))}>
                             <SelectTrigger className="bg-[#0A0A0A]/60 border-white/[0.06] h-11 rounded-xl text-white font-black tracking-widest px-4 text-[11px]">
                                <SelectValue placeholder="Selecione o Estado" />
                             </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0A] border-white/10 text-white max-h-[300px]">
                               {brazilianStates.map(s => <SelectItem key={s.value} value={s.value} className="focus:bg-[#F97316]">{s.label}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">CIDADE</label>
                        <div className="flex gap-2">
                           <Select 
                              disabled={!searchData.estado}
                              onValueChange={(val) => {
                                 if (val === "custom") {
                                    setSearchData(s => ({...s, cidade: ""}))
                                 } else {
                                    setSearchData(s => ({...s, cidade: val}))
                                    setCustomCity("")
                                 }
                              }}
                           >
                              <SelectTrigger className="bg-[#0A0A0A]/60 border-white/[0.06] h-11 rounded-xl text-white font-black tracking-widest px-4 disabled:opacity-20 flex-1 text-[11px]">
                                 <SelectValue placeholder={searchData.estado ? (isLoadingCities ? "Sincronizando..." : "Selecione") : "Estado..."} />
                              </SelectTrigger>
                              <SelectContent className="bg-[#0A0A0A] border-white/10 text-white max-h-[400px] p-0 overflow-hidden flex flex-col">
                                 <div className="p-3 sticky top-0 bg-[#0A0A0A] z-10 border-b border-white/5">
                                    <input 
                                       placeholder="PESQUISAR CIDADE..."
                                       className="w-full h-10 bg-[#1A1A1A] border border-white/5 rounded-lg px-4 text-[10px] font-mono font-black text-white focus:border-[#F97316]/50 outline-none"
                                       value={citySearchTerm}
                                       onChange={(e) => setCitySearchTerm(e.target.value)}
                                       onKeyDown={(e) => e.stopPropagation()}
                                       onPointerDown={(e) => e.stopPropagation()}
                                    />
                                 </div>
                                 <div className="overflow-y-auto max-h-[300px]">
                                    {isLoadingCities ? (
                                       <div className="p-8 text-center animate-pulse">
                                          <span className="text-[10px] font-mono text-[#F97316] uppercase tracking-[0.3em]">Sincronizando IBGE...</span>
                                       </div>
                                    ) : filteredCities.length === 0 ? (
                                       <div className="p-8 text-center">
                                          <span className="text-[10px] font-mono text-[#404040] uppercase tracking-[0.3em]">Nenhuma cidade encontrada</span>
                                       </div>
                                    ) : (
                                       filteredCities.slice(0, 50).map((c: string) => (
                                          <SelectItem key={c} value={c} className="focus:bg-[#F97316]">{c}</SelectItem>
                                       ))
                                    )}
                                    <SelectItem value="custom" className="focus:bg-[#F97316] text-[#F97316] font-black italic border-t border-white/5">+ OUTRA CIDADE</SelectItem>
                                 </div>
                              </SelectContent>
                           </Select>
                           
                           {(!searchData.cidade || searchData.cidade === "custom") && searchData.estado && (
                              <input 
                                 placeholder="OU DIGITE..."
                                 value={customCity}
                                 onChange={(e) => setCustomCity(e.target.value)}
                                 className="bg-[#0A0A0A]/60 border border-white/[0.06] h-11 rounded-xl text-white font-black text-[10px] tracking-widest px-4 focus:outline-none focus:border-[#F97316]/50 transition-colors w-[150px] uppercase"
                              />
                           )}
                        </div>
                     </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">NICHO DE MERCADO</label>
                         <Select onValueChange={(val) => setSearchData(s => ({...s, nicho: val}))}>
                            <SelectTrigger className="bg-[#0A0A0A]/60 border-white/[0.06] h-11 rounded-xl text-white font-black tracking-widest px-4 text-[11px]">
                               <SelectValue placeholder="Selecione o Nicho" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0A] border-white/10 text-white max-h-[400px]">
                               {businessNiches.map(n => (
                                  <SelectItem key={n.value} value={n.label} className="focus:bg-[#F97316]">
                                     <span className="font-black tracking-tighter uppercase">{n.label}</span>
                                  </SelectItem>
                               ))}
                            </SelectContent>
                         </Select>
                      </div>
                   </div>

                   <button 
                     onClick={handleSearch}
                     disabled={isSearching}
                     className="w-full h-12 bg-[#F97316] text-white rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#F97316]/90 transition-all hover:scale-[1.01] hover:shadow-[0_10px_20px_rgba(249,115,22,0.2)] disabled:opacity-50 disabled:scale-100 text-[11px]"
                   >
                     {isSearching ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Minerando dados...</span>
                        </>
                     ) : (
                        <>
                          <span className="material-symbols-outlined">search</span>
                          <span>Buscar Leads no Google</span>
                        </>
                     )}
                   </button>
                </div>
             ) : (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">ESTADO</label>
                         <Select onValueChange={(val) => setSearchData(s => ({...s, estado: val}))}>
                            <SelectTrigger className="bg-[#0A0A0A]/60 border-white/[0.06] h-11 rounded-xl text-white font-black tracking-widest px-4">
                               <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0A] border-white/10 text-white">
                               {brazilianStates.map(s => <SelectItem key={s.value} value={s.value} className="focus:bg-[#F97316]">{s.value}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>

                      <div className="md:col-span-3 space-y-2">
                         <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">CÓDIGO CNAE OU NOME DO SETOR</label>
                         <input 
                           type="text" 
                           placeholder="EX: 4711302 OU COMÉRCIO VAREJISTA..."
                           className="w-full h-11 bg-[#0A0A0A]/60 border border-white/[0.06] rounded-xl text-white font-black tracking-widest px-4 focus:outline-none focus:border-[#F97316]/50 transition-colors uppercase text-[11px]"
                         />
                      </div>
                   </div>

                   <button className="w-full h-12 bg-white text-black rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/90 transition-all hover:scale-[1.01] hover:shadow-[0_10px_20px_rgba(255,255,255,0.1)] text-[11px]">
                      <span className="material-symbols-outlined">analytics</span>
                      <span>Consultar Base Receita</span>
                   </button>
                </div>
             )}
        </div>

        {/* STATS PREVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: "Total Google", value: stats?.totalGoogle || 0, icon: "public", color: "#F97316" },
             { label: "Leads Hoje", value: stats?.leadsHoje || 0, icon: "calendar_today", color: "#22C55E" },
             { label: "Conversões", value: stats?.conversoes || 0, icon: "trending_up", color: "#A855F7" },
             { label: "Na Semana", value: stats?.naSemana || 0, icon: "event", color: "#3B82F6" }
           ].map((stat, i) => (
              <div key={i} className="bg-[#0D0D0D] border border-white/[0.03] p-6 rounded-[24px] flex flex-col items-center justify-center gap-4 group hover:border-[#F97316]/20 transition-all">
                 <div className="h-10 w-10 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center group-hover:bg-[#F97316]/10 transition-all">
                    <span className="material-symbols-outlined text-[18px]" style={{ color: stat.color }}>{stat.icon}</span>
                 </div>
                 <div className="text-center space-y-0.5">
                    <div className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</div>
                    <div className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.2em]">{stat.label}</div>
                 </div>
              </div>
           ))}
        </div>

        {/* RECENT LEADS - AETHER STYLE */}
        <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-[32px] p-8 space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="h-10 w-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#F97316] text-[20px]">history</span>
                 </div>
                 <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Últimos Leads Extraídos</h2>
              </div>
              <button className="h-14 w-14 rounded-2xl bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-[#404040] hover:text-[#F97316] transition-all group">
                 <span className="material-symbols-outlined group-hover:scale-110 transition-transform">filter_list</span>
              </button>
           </div>

           <div className="space-y-6">
            {activeMode === "google" ? (
               <div className="space-y-4">
                  {isLoadingRecent && displayLimit === 10 ? (
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
                        <div key={lead.id} className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-[#1A1A1A]/20 border border-white/[0.03] rounded-2xl hover:bg-[#1A1A1A]/40 transition-all hover:translate-x-1 gap-4">
                           <div className="flex items-center gap-5 flex-1 min-w-0">
                              <div className="h-10 w-10 rounded-xl bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-[#404040] group-hover:text-[#F97316] group-hover:border-[#F97316]/30 transition-all flex-shrink-0">
                                 <span className="material-symbols-outlined text-[18px]">business</span>
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                 <h4 className="text-[14px] font-black text-white uppercase italic tracking-tight leading-none group-hover:text-[#F97316] transition-colors truncate">
                                    {lead.empresa || lead.nome}
                                 </h4>
                                 <div className="flex flex-wrap gap-3 items-center">
                                    <p className="text-[#F97316] font-mono font-bold text-[10px] tracking-wider leading-none">
                                       {lead.telefone || "SEM TELEFONE"}
                                    </p>
                                    <span className="text-[#404040] text-[10px]">•</span>
                                    <p className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-wider truncate max-w-[500px]">
                                       {formatAddress(lead.endereco)}
                                    </p>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0">
                              <div className="text-left md:text-right space-y-1">
                                 <div className="text-[9px] font-mono font-bold text-[#F97316] uppercase tracking-wider">{lead.etapaFunil}</div>
                                 <div className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">
                                    {new Date(lead.updatedAt).toLocaleDateString('pt-BR')} às {new Date(lead.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                 </div>
                              </div>
                              <button 
                                 onClick={() => {
                                   setIsNewContactOpen(true)
                                 }}
                                 className="h-10 w-10 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#404040] hover:text-[#F97316] hover:border-[#F97316]/30 transition-all group/btn"
                                 title="Importar como Contato"
                               >
                                  <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">person_add</span>
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
                        <tr className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-wider border-b border-white/5">
                           <th className="pb-4 text-left pl-4">CNPJ</th>
                           <th className="pb-4 text-left">EMPRESA</th>
                           <th className="pb-4 text-left">TELEFONE / E-MAIL</th>
                           <th className="pb-4 text-left">SITUAÇÃO / CIDADE</th>
                           <th className="pb-4 text-right pr-4">AÇÕES</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/[0.02]">
                        {cnpjLeads.map((lead, i) => (
                           <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                              <td className="py-5 pl-4">
                                 <div className="text-[11px] font-mono font-bold text-[#F97316]">{lead.cnpj}</div>
                              </td>
                              <td className="py-5">
                                 <div className="text-[13px] font-black text-white uppercase italic tracking-tight">{lead.empresa}</div>
                              </td>
                              <td className="py-5">
                                 <div className="space-y-1">
                                    <div className="text-[11px] font-mono font-bold text-white">{lead.telefone}</div>
                                    <div className="text-[10px] font-mono text-[#6B7280]">{lead.email}</div>
                                 </div>
                              </td>
                              <td className="py-5">
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                       <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                       <div className="text-[9px] font-mono font-bold text-emerald-500 uppercase">{lead.situacao}</div>
                                    </div>
                                    <div className="text-[9px] font-mono text-[#6B7280] uppercase">{lead.cidade}</div>
                                 </div>
                              </td>
                              <td className="py-5 pr-4 text-right">
                                 <button className="h-9 px-4 bg-[#1A1A1A] border border-white/5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3] hover:text-[#F97316] hover:border-[#F97316]/30 transition-all">
                                    Extrair Sócios
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

           <button 
              onClick={() => {
                setDisplayLimit(prev => prev + 10)
              }}
              disabled={isLoadingRecent}
              className="w-full py-6 text-[10px] font-mono font-bold text-[#6B7280] hover:text-[#F97316] uppercase tracking-widest transition-all border-t border-white/5 hover:bg-[#F97316]/5 disabled:opacity-50 group flex items-center justify-center gap-3"
           >
              {isLoadingRecent && displayLimit > 10 ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#F97316]/30 border-t-[#F97316] rounded-full animate-spin" />
                  <span>SINCRONIZANDO...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">expand_more</span>
                  CARREGAR MAIS REGISTROS DO DIRETÓRIO
                </>
              )}
           </button>
        </div>
      </div>
    </section>

      <NewContactDialog 
        open={isNewContactOpen}
        onOpenChange={setIsNewContactOpen}
      />
    </div>
  )
}
