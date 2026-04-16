"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Building2, Zap, Globe, Sparkles, LayoutGrid, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

function KPICard({
  label, value, subtext, icon: Icon, trend, color = "var(--accent-primary)"
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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Falha ao iniciar extração")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Extração iniciada!", description: "Os resultados serão carregados em instantes." })
      queryClient.invalidateQueries({ queryKey: ["leads-stored-google"] })
      queryClient.invalidateQueries({ queryKey: ["leads-stored-cnpj"] })
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: err.message })
    },
  })

  const importLead = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await fetch("/api/leads/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Falha ao importar lead")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Lead importado para o CRM!" })
      queryClient.invalidateQueries({ queryKey: ["leads-stored-google"] })
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: err.message })
    },
  })

  return (
    <div className="page-container animate-aether">

      {/* HEADER */}
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
           <button
             className="btn-cta-primary h-11"
             onClick={() => document.getElementById("extraction-panel")?.scrollIntoView({ behavior: "smooth" })}
           >
             Iniciar Nova Extração
           </button>
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="kpi-grid">
         <KPICard label="Base Google" value={storedGoogle?.total || "00"} subtext="Locais mapeados via Maps" icon={Globe} color="#d4af37" />
         <KPICard label="Base CNPJ" value={storedCnpj?.total || "00"} subtext="Empresas Receita Federal" icon={Building2} color="#a855f7" />
         <KPICard label="Capturas Hoje" value={(storedGoogle?.today || 0) + (storedCnpj?.today || 0)} subtext="Novos leads processados" icon={Zap} trend="+12%" color="#f59e0b" />
         <KPICard label="Performance" value="98.2%" subtext="Dataset sincronizado" icon={TrendingUp} color="#10b981" />
      </div>

      <div className="flex flex-col gap-8">
         <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-white/20 ml-2">Seleção de Motor Neural</h4>
         <div className="flex bg-white/[0.03] p-2 rounded-[22px] w-fit border border-white/5 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("cnpj")}
              className={cn("h-12 px-10 rounded-[16px] text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === "cnpj" ? "bg-[#d4af37] text-white shadow-[0_8px_20px_rgba(212,175,55,0.3)]" : "text-white/30 hover:text-white")}
            >
               Receita Federal Cloud
            </button>
            <button
              onClick={() => setActiveTab("google")}
              className={cn("h-12 px-10 rounded-[16px] text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === "google" ? "bg-[#d4af37] text-white shadow-[0_8px_20px_rgba(212,175,55,0.3)]" : "text-white/30 hover:text-white")}
            >
               Parâmetros Locais
            </button>
         </div>
      </div>

      {/* PAINEL DE EXTRAÇÃO */}
      <div id="extraction-panel" className="kpi-card bg-[#181c24] p-8 border-white/5 space-y-8">
         <div className="text-[11px] font-bold uppercase tracking-widest text-white/30">Parâmetros de Extração</div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Geolocalização</label>
               <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger className="bg-[#0a0c10] border-white/5 h-12 rounded-lg text-white/60">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-surface border-white/10">
                    {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Polo Regional</label>
               <Input
                 placeholder="Ex: São Paulo"
                 value={cidade}
                 onChange={e => setCidade(e.target.value)}
                 className="bg-[#0a0c10] border-white/5 h-12 rounded-lg text-white"
               />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Segmento</label>
               <Input
                 placeholder="Ex: Farmácias"
                 value={segmento}
                 onChange={e => setSegmento(e.target.value)}
                 className="bg-[#0a0c10] border-white/5 h-12 rounded-lg text-white"
               />
            </div>
         </div>
         <button
           className="btn-cta-primary w-full h-12 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
           onClick={() => searchMutation.mutate()}
           disabled={searchMutation.isPending}
         >
            {searchMutation.isPending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Extraindo...</>
            ) : (
              <><Zap size={18} /> Iniciar Extração Neural</>
            )}
         </button>
      </div>

      {/* TABELA DE CAPTURAS */}
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
                        <button
                          onClick={() => importLead.mutate(lead.id)}
                          disabled={importLead.isPending || lead.status === "CONTATADO"}
                          className={cn(
                            "h-9 px-5 border rounded-lg text-[10px] font-bold uppercase transition-all",
                            lead.status === "CONTATADO"
                              ? "bg-green-500/10 border-green-500/20 text-green-500 cursor-default"
                              : "bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10"
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
  )
}
