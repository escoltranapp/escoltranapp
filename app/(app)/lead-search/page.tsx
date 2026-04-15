"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, MapPin, Building2, CalendarDays, TrendingUp, Zap, AlertTriangle, Download, Plus, Phone, Globe } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function MetricSearchCard({
  title,
  value,
  icon: Icon,
  delay = "0s",
  color = "gold"
}: {
  title: string
  value: number
  icon: React.ElementType
  delay?: string
  color?: string
}) {
  return (
    <div className="aether-card metric-card animate-aether" style={{ animationDelay: delay, padding: '24px' }}>
      <div className="metric-top">
        <div className="metric-label-group">
          <span className="metric-label" style={{ opacity: 0.3 }}>{title}</span>
          <span className="metric-value font-mono" style={{ fontSize: '1.75rem' }}>{value.toString().padStart(2, '0')}</span>
        </div>
        <div className="metric-icon-wrap" style={{ width: '44px', height: '44px', color: color === 'gold' ? '#c9a227' : color }}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}

const states = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"]

export default function LeadSearchPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("google")
  const [isSearching, setIsSearching] = useState(false)
  const [googleResults, setGoogleResults] = useState<any[]>([])

  const googleForm = useForm({ defaultValues: { estado: "", cidade: "", nicho: "" } })

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
          <div className="header-badge">
            <span className="dot" />
            Extratores de Inteligência Ativos
          </div>
          <div>
            <h1 className="page-title">
              Busca de <span>Leads</span> ⚡
            </h1>
            <div className="page-subtitle">
              Prospecção Algorítmica <span className="sep" /> 
              Status: <span className="status font-black">Pronto para Extração</span>
            </div>
          </div>
        </div>

        <button className="aether-btn-primary" onClick={() => setActiveTab(activeTab === "google" ? "cnpj" : "google")}>
          <TrendingUp size={20} strokeWidth={3} />
          Alternar Motor
        </button>
      </header>

      {/* KPI Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricSearchCard title="Base Google" value={storedGoogle?.total ?? 0} icon={MapPin} delay="0.1s" />
        <MetricSearchCard title="Base CNPJ" value={storedCnpj?.total ?? 0} icon={Building2} delay="0.2s" />
        <MetricSearchCard title="Capturas Hoje" value={(storedGoogle?.today ?? 0) + (storedCnpj?.today ?? 0)} icon={CalendarDays} delay="0.3s" />
        <MetricSearchCard title="Performance" value={(storedGoogle?.week ?? 0) + (storedCnpj?.week ?? 0)} icon={TrendingUp} delay="0.4s" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList className="bg-black/40 border border-white/5 h-14 p-1.5 gap-2 rounded-2xl w-fit">
          <TabsTrigger value="google" className="text-[10px] uppercase font-black px-10 h-full rounded-xl data-[state=active]:bg-gold data-[state=active]:text-black"><MapPin className="mr-3" size={14} /> Google Maps</TabsTrigger>
          <TabsTrigger value="cnpj" className="text-[10px] uppercase font-black px-10 h-full rounded-xl data-[state=active]:bg-gold data-[state=active]:text-black"><Building2 className="mr-3" size={14} /> Base CNPJ</TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-10">
           <div className="aether-card group">
              <div className="mb-10 flex items-center justify-between">
                 <div>
                   <span className="metric-label">Motor de Busca Google</span>
                   <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-2 leading-none italic">Escaneamento Baseado em Geolocalização e Nicho</p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-gold/5 flex items-center justify-center text-gold border border-gold/10 group-hover:scale-110 transition-transform">
                   <Zap size={20} className="animate-pulse" />
                 </div>
              </div>
              
              <form className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div>
                   <label className="aether-label">Estado (UF)</label>
                   <Select onValueChange={v => googleForm.setValue("estado", v)}>
                     <SelectTrigger className="aether-input"><SelectValue placeholder="UF" /></SelectTrigger>
                     <SelectContent className="bg-surface-overlay border-border-strong">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                   </Select>
                 </div>
                 <div>
                   <label className="aether-label">Cidade</label>
                   <Input className="aether-input" placeholder="Ex: Curitiba" {...googleForm.register("cidade")} />
                 </div>
                 <div>
                   <label className="aether-label">Nicho Operacional</label>
                   <Input className="aether-input" placeholder="Ex: Academias" {...googleForm.register("nicho")} />
                 </div>
                 <div className="md:col-span-3 flex justify-end">
                    <button type="submit" className="aether-btn-primary h-14 px-12" disabled={isSearching}>{isSearching ? "Escaneando Cluster..." : "Iniciar Extração"}</button>
                 </div>
              </form>
           </div>

           {/* Results Preview */}
           <div className="aether-table-wrap animate-aether">
             <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div>
                  <span className="text-gold font-black uppercase text-[11px] tracking-widest">Histórico de Monitoramento</span>
                  <p className="text-[9px] text-white/20 uppercase font-bold mt-1 tracking-widest leading-none">Últimos 50 leads capturados</p>
                </div>
                <button className="aether-btn-secondary h-11 px-6 text-[10px] border-white/5 hover:border-white/20 flex items-center gap-3">
                   <Download size={14} /> EXPORTAR CSV
                </button>
             </div>
             
             <table className="aether-table w-full">
               <thead>
                 <tr className="aether-table-header">
                   <th>Entidade</th>
                   <th>Geo / Contato</th>
                   <th className="hidden md:table-cell">Segmento</th>
                   <th className="text-right">Ação</th>
                 </tr>
               </thead>
               <tbody>
                 {(storedGoogle?.leads || []).map((lead: any) => (
                   <tr key={lead.id} className="group">
                     <td>
                        <div className="flex flex-col">
                           <span className="font-black text-[13px] uppercase group-hover:text-gold transition-colors">{lead.nome}</span>
                           <span className="text-[10px] uppercase font-black text-white/20 tracking-tight">{lead.site || "Sem Site"}</span>
                        </div>
                     </td>
                     <td>
                        <div className="flex flex-col">
                           <span className="text-[11px] font-mono font-bold text-white/40">{lead.telefone || "—"}</span>
                           <span className="text-[9px] italic opacity-30 mt-0.5">{lead.cidade}/{lead.uf}</span>
                        </div>
                     </td>
                     <td className="hidden md:table-cell">
                        <Badge variant="secondary" className="bg-white/5 text-[9px] uppercase px-3">{lead.nicho || 'Geral'}</Badge>
                     </td>
                     <td className="text-right">
                        <button className="h-9 px-4 rounded-xl border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-gold hover:border-gold/30 transition-all">Importar</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </TabsContent>
      </Tabs>
      
      {/* Prime Footer / Security */}
      <div className="p-8 bg-gold/5 border border-gold/10 rounded-3xl flex items-center gap-8 opacity-60 group hover:opacity-100 transition-opacity">
        <div className="w-14 h-14 rounded-2xl bg-black/40 border border-gold/10 flex items-center justify-center text-gold group-hover:rotate-12 transition-transform">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h5 className="text-[13px] font-black uppercase tracking-widest text-gold opacity-80">Protocolo de Integração n8n</h5>
          <p className="text-[11px] text-white/30 leading-relaxed mt-1 italic font-black uppercase tracking-widest">A extração depende da ativação dos fluxos via webhook. Verifique o status operacional nas configurações de cluster.</p>
        </div>
      </div>

    </div>
  )
}
