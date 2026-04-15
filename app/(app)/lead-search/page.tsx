"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Building2, CalendarDays, TrendingUp, Zap, AlertTriangle, Download, Plus, Phone, Globe, LayoutGrid, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function MetricHeaderCard({
  title,
  value,
  icon: Icon,
  color = "gold"
}: {
  title: string
  value: string | number
  icon: React.ElementType
  color?: string
}) {
  return (
    <div className="aether-card metric-card-refined animate-aether">
      <div className="icon-wrap">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <span className="label text-white/20">{title}</span>
        <span className="value">{value}</span>
      </div>
    </div>
  )
}

const states = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"]

export default function LeadSearchPage() {
  const [activeTab, setActiveTab] = useState("google")
  const [isSearching, setIsSearching] = useState(false)

  const { data: storedGoogle } = useQuery<any>({
    queryKey: ["leads-stored-google"],
    queryFn: async () => { const res = await fetch("/api/leads?type=google&limit=50"); return res.json() },
  })

  const { data: storedCnpj } = useQuery<any>({
    queryKey: ["leads-stored-cnpj"],
    queryFn: async () => { const res = await fetch("/api/leads?type=cnpj&limit=50"); return res.json() },
  })

  return (
    <div className="animate-aether space-y-12 pb-12">
      
      {/* Prime Header */}
      <header className="page-header flex-col lg:flex-row items-start justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/5 w-fit">
             <LayoutGrid size={10} className="text-gold" />
             <span className="text-[9px] font-black uppercase tracking-widest text-gold/60">Extração de Inteligência</span>
          </div>
          <div>
            <h1 className="page-title">Busca de <span>Leads</span></h1>
            <div className="page-subtitle text-white/20 mt-2 font-bold uppercase tracking-widest text-[10px]">
              Motor Algorítmico <span className="mx-2 opacity-10">•</span> 
              Status: <span className="text-gold font-black">Pronto para Extração</span>
            </div>
          </div>
        </div>

        <button className="aether-btn-primary h-12 px-8 flex items-center gap-3" onClick={() => setActiveTab(activeTab === "google" ? "cnpj" : "google")}>
          <TrendingUp size={16} strokeWidth={3} /> Alternar Motor
        </button>
      </header>

      {/* KPI Cluster */}
      <div className="metric-row">
        <MetricHeaderCard title="Base Google" value={storedGoogle?.total?.toString().padStart(2, '0') || "00"} icon={MapPin} />
        <MetricHeaderCard title="Base CNPJ" value={storedCnpj?.total?.toString().padStart(2, '0') || "00"} icon={Building2} />
        <MetricHeaderCard title="Capturas Hoje" value={((storedGoogle?.today || 0) + (storedCnpj?.today || 0)).toString().padStart(2, '0')} icon={CalendarDays} />
        <MetricHeaderCard title="Performance" value={(storedGoogle?.week || 0) + (storedCnpj?.week || 0)} icon={TrendingUp} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList className="bg-black/40 border border-white/5 h-14 p-1 rounded-2xl gap-2 w-fit">
          <TabsTrigger value="google" className="h-full px-8 gap-3 data-[state=active]:bg-gold data-[state=active]:text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
            <Globe size={14} /> Google Maps Engine
          </TabsTrigger>
          <TabsTrigger value="cnpj" className="h-full px-8 gap-3 data-[state=active]:bg-gold data-[state=active]:text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
            <Building2 size={14} /> Receita Federal Cloud
          </TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-12">
            
            {/* Search Engine UI */}
            <div className="aether-card bg-white/[0.01]">
               <div className="p-10 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                        <Sparkles size={18} />
                     </div>
                     <span className="text-[12px] font-black uppercase tracking-widest text-white/80">Parâmetros de Extração Local</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/30">API Status: Online</span>
                  </div>
               </div>
               
               <div className="p-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Geolocalização</label>
                      <Select>
                        <SelectTrigger className="aether-input h-14 bg-black border-white/5"><SelectValue placeholder="Selecione o Estado" /></SelectTrigger>
                        <SelectContent className="bg-black border-white/10">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Polo Regional</label>
                      <Input placeholder="Cidade alvo..." className="aether-input h-14 bg-black border-white/5" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Segmento Industrial</label>
                      <Input placeholder="Busca semântica..." className="aether-input h-14 bg-black border-white/5" />
                    </div>
                  </div>

                  <div className="mt-12 flex justify-end">
                    <button className="aether-btn-primary h-14 px-12 gap-4 flex items-center text-[12px]">
                      {isSearching ? <Zap className="animate-spin" size={18} /> : <Search size={18} strokeWidth={3} />}
                      Iniciar Extração Neural
                    </button>
                  </div>
               </div>
            </div>

            {/* Results Layer */}
            <div className="aether-table-wrap bg-white/[0.01]">
              <div className="p-10 border-b border-white/5">
                 <h3 className="text-[12px] font-black uppercase tracking-widest text-white/40">Capturas Recentes no Cluster</h3>
              </div>
              
              <table className="aether-table w-full">
                <thead>
                  <tr className="aether-table-header">
                    <th className="pl-10">Entidade</th>
                    <th>Geo / Contato</th>
                    <th className="hidden md:table-cell">Segmento</th>
                    <th className="text-right pr-10">Ação Operacional</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(storedGoogle?.leads) ? storedGoogle.leads : []).map((lead: any) => (
                    <tr key={lead.id} className="group border-b border-white/[0.01] hover:bg-white/[0.01] transition-colors">
                      <td className="pl-10 py-6">
                         <div className="flex flex-col">
                            <span className="font-black text-[13px] uppercase tracking-tight text-white/80 group-hover:text-gold transition-colors">{lead.nome}</span>
                            <span className="text-[9px] uppercase font-black text-white/10 tracking-widest mt-1">{lead.site || "Sem Site Externo"}</span>
                         </div>
                      </td>
                      <td>
                         <div className="flex flex-col">
                            <span className="text-[11px] font-mono font-black text-white/30 group-hover:text-white transition-colors">{lead.telefone || "Contatar via Site"}</span>
                            <span className="text-[9px] font-bold text-white/10 uppercase tracking-tight mt-1">{lead.cidade || "Global"} / {lead.uf || "HQ"}</span>
                         </div>
                      </td>
                      <td className="hidden md:table-cell">
                         <Badge variant="secondary" className="bg-white/5 text-[9px] uppercase font-black px-4 py-1 border-white/5">{lead.nicho || 'Geral'}</Badge>
                      </td>
                      <td className="text-right pr-10">
                         <button className="h-10 px-6 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-all">Importar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </TabsContent>
      </Tabs>

    </div>
  )
}
