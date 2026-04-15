"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Building2, Phone, Globe, Plus, Download, CalendarDays, TrendingUp, UserPlus, AlertTriangle, ChevronDown, Zap } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatCurrency, cn } from "@/lib/utils"

// ─── Metric Card Component ──────────────────────────────────────────
function MetricCard({
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
    <div className="aether-card metric-card animate-aether" style={{ animationDelay: delay }}>
      <div className="metric-top">
        <div className="metric-label-group">
          <span className="metric-label">{title}</span>
          <span className="metric-value">{value.toString().padStart(2, '0')}</span>
        </div>
        <div className="metric-icon-wrap" style={{ color: color === 'gold' ? '#c9a227' : 'rgba(255,255,255,0.4)' }}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}

interface GoogleLead {
  id: string; nome: string; telefone?: string; endereco?: string; site?: string; rating?: number; reviews?: number; vicinity?: string; nicho?: string; cidade?: string;
}
interface CnpjLead {
  id: string; cnpj: string; nome: string; telefone?: string; cnae?: string; cidade?: string; uf?: string; situacao?: string;
}
interface StoredLead {
  id: string; nome: string; telefone?: string; endereco?: string; cidade?: string; uf?: string; nicho?: string; status: any; createdAt: string;
}
interface StoredCnpjLead {
  id: string; cnpj: string; nome: string; telefone?: string; cidade?: string; uf?: string; status: any; createdAt: string;
}

const states = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"]

export default function LeadSearchPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("google")
  const [googleResults, setGoogleResults] = useState<GoogleLead[]>([])
  const [cnpjResults, setCnpjResults] = useState<CnpjLead[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedGoogle, setSelectedGoogle] = useState<Set<number>>(new Set())
  const [selectedCnpj, setSelectedCnpj] = useState<Set<number>>(new Set())

  const googleForm = useForm({ defaultValues: { estado: "", cidade: "", nicho: "" } })
  const cnpjForm = useForm({ defaultValues: { estado: "", cidade: "", cnae: "" } })

  const { data: storedGoogle } = useQuery<{ leads: StoredLead[]; total: number; today: number; week: number }>({
    queryKey: ["leads-stored-google"],
    queryFn: async () => { const res = await fetch("/api/leads?type=google&limit=50"); return res.json() },
    staleTime: 30_000,
  })

  const { data: storedCnpj } = useQuery<{ leads: StoredCnpjLead[]; total: number; today: number; week: number }>({
    queryKey: ["leads-stored-cnpj"],
    queryFn: async () => { const res = await fetch("/api/leads?type=cnpj&limit=50"); return res.json() },
    staleTime: 30_000,
  })

  const saveLeads = useMutation({
    mutationFn: async ({ type, leads }: { type: string; leads: unknown[] }) => {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, leads }) })
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    onSuccess: (d) => { toast({ title: `${d.created} leads registrados.` }); queryClient.invalidateQueries({ queryKey: ["leads-stored-google"] }); queryClient.invalidateQueries({ queryKey: ["leads-stored-cnpj"] }) },
  })

  const convertLead = useMutation({
    mutationFn: async ({ leadId, leadCnpjId }: { leadId?: string; leadCnpjId?: string }) => {
      const res = await fetch("/api/leads/convert", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, leadCnpjId }) })
      return res.json()
    },
    onSuccess: () => { toast({ title: "Internalizado no CRM." }); queryClient.invalidateQueries({ queryKey: ["leads-stored-google"] }); queryClient.invalidateQueries({ queryKey: ["leads-stored-cnpj"] }) },
  })

  const onGoogleSearch = async (d: any) => {
    setIsSearching(true); setGoogleResults([]); setSelectedGoogle(new Set())
    try {
      const res = await fetch("/api/webhooks/n8n", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "busca_google", data: d }) })
      if (res.ok) { const r = await res.json(); if (Array.isArray(r?.leads)) { setGoogleResults(r.leads); toast({ title: `${r.leads.length} encontrados.` }); return } }
      toast({ title: "Verifique conexão", variant: "destructive" })
    } finally { setIsSearching(false) }
  }

  const onCnpjSearch = async (d: any) => {
    setIsSearching(true); setCnpjResults([]); setSelectedCnpj(new Set())
    try {
      const res = await fetch("/api/webhooks/n8n", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "busca_cnpj", data: d }) })
      if (res.ok) { const r = await res.json(); if (Array.isArray(r?.leads)) { setCnpjResults(r.leads); toast({ title: `${r.leads.length} encontrados.` }); return } }
      toast({ title: "Verifique conexão", variant: "destructive" })
    } finally { setIsSearching(false) }
  }

  return (
    <div className="animate-aether space-y-10 pb-10">
      
      {/* Header Section */}
      <header className="page-header flex-row items-end justify-between">
        <div className="space-y-4">
          <div className="header-badge">
            <span className="dot" />
            Extratores de Inteligência
          </div>
          <div>
            <h1 className="page-title">
              Busca de <span>Leads</span> ⚡
            </h1>
            <div className="page-subtitle">
              Prospecção Algorítmica <span className="sep" /> 
              Status: <span className="status">Pronto para Extração</span>
            </div>
          </div>
        </div>

        <button className="aether-btn-primary" onClick={() => setActiveTab(activeTab === "google" ? "cnpj" : "google")}>
          <Zap size={18} strokeWidth={3} />
          Alternar Motor
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Base Google" value={storedGoogle?.total ?? 0} icon={MapPin} delay="0.1s" />
        <MetricCard title="Base CNPJ" value={storedCnpj?.total ?? 0} icon={Building2} delay="0.2s" />
        <MetricCard title="Capturas Hoje" value={(storedGoogle?.today ?? 0) + (storedCnpj?.today ?? 0)} icon={CalendarDays} delay="0.3s" />
        <MetricCard title="Performance" value={(storedGoogle?.week ?? 0) + (storedCnpj?.week ?? 0)} icon={TrendingUp} delay="0.4s" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-black/40 border border-white/5 h-12 p-1 gap-2">
          <TabsTrigger value="google" className="text-[10px] uppercase font-black px-6"><MapPin className="mr-2" size={12} /> Google Maps</TabsTrigger>
          <TabsTrigger value="cnpj" className="text-[10px] uppercase font-black px-6"><Building2 className="mr-2" size={12} /> Base CNPJ</TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-8">
           <div className="aether-card">
              <div className="mb-6 flex items-center justify-between">
                 <span className="metric-label">Motores de Busca Google</span>
                 <p className="text-[11px] text-white/30 uppercase italic">Busca Geo-Segmentada</p>
              </div>
              <form onSubmit={googleForm.handleSubmit(onGoogleSearch)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                   <label className="aether-label">Nicho</label>
                   <Input className="aether-input" placeholder="Ex: Academias" {...googleForm.register("nicho")} />
                 </div>
                 <div className="md:col-span-3 flex justify-end">
                    <button type="submit" className="aether-btn-primary h-12" disabled={isSearching}>{isSearching ? "Escaneando..." : "Iniciar Extração"}</button>
                 </div>
              </form>
           </div>

           {googleResults.length > 0 && (
             <div className="aether-table-wrap animate-aether">
               <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                  <span className="text-gold font-black uppercase text-[11px] tracking-widest">Extração Concluída: {googleResults.length} Encontrados</span>
                  <button className="aether-btn-primary h-9 px-6 text-[10px]" onClick={() => saveLeads.mutate({ type: "google", leads: googleResults })}>Registrar Tudo</button>
               </div>
               <table className="aether-table w-full">
                 <thead><tr className="aether-table-header"><th>Razão / Nome</th><th>Contato</th><th>Cidade</th><th className="text-right">Ação</th></tr></thead>
                 <tbody>
                   {googleResults.map((lead, i) => (
                     <tr key={i}>
                       <td className="font-bold text-[13px]">{lead.nome}</td>
                       <td className="text-[11px] font-mono text-white/40">{lead.telefone || "—"}</td>
                       <td className="text-[11px] italic opacity-40">{lead.cidade || "—"}</td>
                       <td className="text-right"><Checkbox checked={selectedGoogle.has(i)} onCheckedChange={v => { const n = new Set(selectedGoogle); v ? n.add(i) : n.delete(i); setSelectedGoogle(n) }} /></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}

           {storedGoogle && googleResults.length === 0 && (
             <div className="aether-table-wrap">
               <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                  <span className="text-white/20 font-black uppercase text-[10px] tracking-widest">Histórico de Monitoramento</span>
               </div>
               <table className="aether-table w-full">
                 <thead><tr className="aether-table-header"><th>Entidade</th><th>Geo / Telefone</th><th>Segmento</th><th className="text-right">Ações</th></tr></thead>
                 <tbody>
                   {storedGoogle.leads.map(lead => (
                     <tr key={lead.id} className="group">
                       <td className="font-bold text-[13px]">{lead.nome}</td>
                       <td><div className="flex flex-col"><span className="text-[11px] font-mono text-white/50">{lead.telefone || "—"}</span><span className="text-[9px] italic opacity-30">{lead.cidade}/{lead.uf}</span></div></td>
                       <td><Badge variant="secondary" className="bg-white/5 text-[9px] uppercase px-2 py-0">{lead.nicho || 'Geral'}</Badge></td>
                       <td className="text-right">{lead.status === "ATIVO" ? <button className="aether-btn-secondary h-8 px-4 text-[9px]" onClick={() => convertLead.mutate({ leadId: lead.id })}>Importar</button> : <Badge variant="ativa">Internalizado</Badge>}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </TabsContent>
      </Tabs>
      
      {/* Disclaimer */}
      <div className="p-6 bg-gold/5 border border-gold/10 rounded-2xl flex items-center gap-6 opacity-60">
        <AlertTriangle className="text-gold" size={24} />
        <p className="text-[11px] uppercase tracking-widest font-black text-white/30 italic">Protocolo de Integração n8n: Extração via Webhook Ativa.</p>
      </div>

    </div>
  )
}
