"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Building2, CalendarDays, TrendingUp, Zap, Globe, Sparkles, LayoutGrid, ArrowRight, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ─── Reusable Component: KPI Card Enterprise ───────────────────────
function KPICard({ 
  label, value, subtext, icon: Icon, trend, color = "var(--accent-blue)" 
}: { 
  label: string; value: string | number; subtext: string; icon: React.ElementType; trend?: string; color?: string 
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-container" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={20} />
      </div>
      <div className="kpi-label-row">
        <span className="kpi-label">{label}</span>
        {trend && (
           <span className={cn("kpi-trend", trend.includes('+') ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
              {trend}
           </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-subtext">{subtext}</div>
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

  // Safe data handling
  const validatedLeads = Array.isArray(storedGoogle?.leads) ? storedGoogle.leads : []

  return (
    <div className="page-container animate-aether">
      
      {/* 1. HEADER DE PÁGINA */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <Sparkles size={12} /> EXTRAÇÃO DE INTELIGÊNCIA
          </div>
          <h1 className="page-title-h1">Busca de Leads</h1>
          <p className="page-subtitle">Motor algorítmico · Status: <span className="text-white">Pronto para Extração</span></p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/5 text-green-500 text-[10px] font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> API ONLINE
           </div>
           <button className="btn-cta-primary h-11">Iniciar Nova Extração</button>
        </div>
      </header>

      {/* 2. KPI CARDS */}
      <div className="kpi-grid">
         <KPICard label="Base Google" value={storedGoogle?.total || "00"} subtext="Locais mapeados via Maps" icon={Globe} color="#3b82f6" />
         <KPICard label="Base CNPJ" value={storedCnpj?.total || "00"} subtext="Empresas Receita Federal" icon={Building2} color="#a855f7" />
         <KPICard label="Capturas Hoje" value={(storedGoogle?.today || 0) + (storedCnpj?.today || 0)} subtext="Novos leads processados" icon={Zap} trend="+12%" color="#f59e0b" />
         <KPICard label="Performance" value="98.2%" subtext="Dataset sincronizado" icon={TrendingUp} color="#10b981" />
      </div>

      {/* 3. PAINEL DE SELEÇÃO DE MOTOR */}
      <div className="flex flex-col gap-6">
         <h4 className="font-bold text-[11px] uppercase tracking-widest text-white/30 ml-1">Seleção de Motor Neural</h4>
         <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
            <button 
              onClick={() => setActiveTab("cnpj")}
              className={cn("h-11 px-8 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", 
                activeTab === "cnpj" ? "bg-blue-600 text-white shadow-lg" : "text-white/30 hover:text-white")}
            >
               Receita Federal Cloud
            </button>
            <button 
              onClick={() => setActiveTab("google")}
              className={cn("h-11 px-8 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", 
                activeTab === "google" ? "bg-blue-600 text-white shadow-lg" : "text-white/30 hover:text-white")}
            >
               Parâmetros Locais
            </button>
         </div>
      </div>

      {/* 4. PAINEL DE EXTRAÇÃO */}
      <div className="kpi-card bg-[#181c24] p-8 border-white/5 space-y-8">
         <div className="text-[11px] font-bold uppercase tracking-widest text-white/30">Parâmetros de Extração</div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Geolocalização</label>
               <Select>
                  <SelectTrigger className="bg-[#0a0c10] border-white/5 h-12 rounded-lg text-white/60"><SelectValue placeholder="Estado" /></SelectTrigger>
                  <SelectContent className="bg-bg-surface border-white/10">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
               </Select>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Polo Regional</label>
               <Input placeholder="Ex: São Paulo" className="bg-[#0a0c10] border-white/5 h-12 rounded-lg text-white" />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Segmento</label>
               <Input placeholder="Ex: Farmácias" className="bg-[#0a0c10] border-white/5 h-12 rounded-lg text-white" />
            </div>
         </div>
         <button className="btn-cta-primary w-full h-12 flex items-center justify-center gap-3">
            <Zap size={18} /> Iniciar Extração Neural
         </button>
      </div>

      {/* 5. TABELA DE CAPTURAS */}
      <div className="enterprise-table-wrapper">
         <div className="table-header-label">Capturas Recentes no Cluster</div>
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th>Entidade</th>
                  <th>Geo / Contato</th>
                  <th>Segmento</th>
                  <th className="text-right">Ação Operacional</th>
               </tr>
            </thead>
            <tbody>
               {validatedLeads.length === 0 ? (
                  <tr>
                     <td colSpan={4}>
                        <div className="empty-state-container">
                           <LayoutGrid className="empty-state-icon" />
                           <div className="empty-state-title">Nenhuma captura neste cluster</div>
                           <div className="empty-state-sub">Ajuste os parâmetros acima e inicie a extração</div>
                        </div>
                     </td>
                  </tr>
               ) : (
                  validatedLeads.map((lead: any) => (
                    <tr key={lead.id} className="enterprise-table-row">
                      <td>
                        <div className="font-bold text-white/90">{lead.nome}</div>
                        <div className="text-[10px] text-white/20 uppercase font-bold mt-1 tracking-widest">{lead.site || "Sem Site"}</div>
                      </td>
                      <td>
                        <div className="text-[12px] font-bold text-white/60">{lead.telefone || "N/A"}</div>
                        <div className="text-[10px] text-white/20 uppercase font-bold mt-1">{lead.cidade} / {lead.uf}</div>
                      </td>
                      <td>
                        <div className="inline-flex px-3 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] font-bold uppercase text-white/40">
                          {lead.nicho || 'Geral'}
                        </div>
                      </td>
                      <td className="text-right">
                        <button className="h-9 px-5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold uppercase text-white/30 hover:text-white hover:bg-white/10 transition-all">Importar</button>
                      </td>
                    </tr>
                  ))
               )}
            </tbody>
         </table>
      </div>
    </div>
  )
}
